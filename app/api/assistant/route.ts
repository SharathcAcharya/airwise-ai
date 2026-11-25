import { NextRequest, NextResponse } from 'next/server';
import { generateRuleBasedResponse } from '@/lib/assistant-engine';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Simple in-memory sliding window rate-limiter (per-IP, 30 requests/minute)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Bounded memory management: clean expired records if cache grows
  if (rateLimitMap.size > 500) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (entry.count >= 30) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before sending more messages.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { messages, environmentalContext, userProfile, language } = body;
    const userLanguage = typeof language === 'string' ? language.toLowerCase() : 'en';

    // Strict input validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty.' },
        { status: 400 }
      );
    }

    const latestUserMessage = messages[messages.length - 1]?.content;
    if (typeof latestUserMessage !== 'string' || latestUserMessage.trim().length === 0) {
      return NextResponse.json(
        { error: 'User message cannot be empty.' },
        { status: 400 }
      );
    }

    if (latestUserMessage.length > 1000) {
      return NextResponse.json(
        { error: 'Message exceeds maximum allowable length of 1000 characters.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Structured system prompt incorporating verified data boundaries and safety
    const contextPrompt = `
You are the AIRWISE AI Personal Environmental Intelligence Assistant.
Your mission is to help urban citizens make smart, safe, and sustainable daily decisions regarding air pollution.

CURRENT VERIFIED ENVIRONMENTAL CONTEXT (From Sensors & CPCB Engine):
- Location: ${environmentalContext?.locationName || 'Urban Center, India'}
- Indian National AQI: ${environmentalContext?.aqi ?? environmentalContext?.indicativeAqi ?? 'Data Unavailable'} (${environmentalContext?.category || 'Unknown'})
- Dominant Pollutant: ${environmentalContext?.dominantPollutant?.toUpperCase() || 'N/A'}
- PM2.5: ${environmentalContext?.pm25 ?? 'N/A'} µg/m³
- PM10: ${environmentalContext?.pm10 ?? 'N/A'} µg/m³
- NO2: ${environmentalContext?.no2 ?? 'N/A'} µg/m³
- SO2: ${environmentalContext?.so2 ?? 'N/A'} µg/m³
- CO: ${environmentalContext?.co ?? 'N/A'} mg/m³
- Ozone (O3): ${environmentalContext?.o3 ?? 'N/A'} µg/m³
- Data Source: ${environmentalContext?.source || 'Verified Monitoring'} (${environmentalContext?.dataSourceType || 'model-estimate'})

USER PREFERENCES & SENSITIVITY PROFILE:
- Sensitivity: ${userProfile?.sensitivity || 'Standard adult'}
- Morning Exercise: ${userProfile?.morningExercise || 'Outdoor jogger'}
- Commute Mode: ${userProfile?.commuteMode || 'Metro / Public transit'}

LANGUAGE INSTRUCTION:
The user selected language code is "${userLanguage}" (e.g. 'kn' for Kannada, 'hi' for Hindi, 'ta' for Tamil, 'bn' for Bengali, 'mr' for Marathi, 'en' for English).
If the user writes or requests answers in a regional Indian language, or if "${userLanguage}" is not 'en', generate your response fluently and naturally in that language's authentic script (ಕನ್ನಡ, हिन्दी, தமிழ், বাংলা, मराठी), while preserving factual numbers, units (µg/m³, mg/m³), and CPCB categories.

CRITICAL GUIDELINES:
1. Ground your answers strictly in the verified readings provided above. Do NOT invent alternate or conflicting pollution numbers.
2. Provide practical, empathetic, actionable advice (e.g. ideal exercise windows, mask recommendations like N95 for Poor/Very Poor, indoor ventilation, air purifier HEPA guidance, eco-friendly transit).
3. Do NOT provide medical diagnosis or individual clinical treatment. Always provide general public-health guidance and remind users to consult physicians for personal medical conditions.
4. If asked about causes of pollution, discuss realistic regional factors (vehicular exhaust, biomass/stubble burning, construction dust, thermal inversion) without claiming unverified speculative blame.
5. Format your response cleanly with bullet points and bold highlights for readability.
`.trim();

    if (!apiKey) {
      // Graceful server-side fallback rule-based intelligence when GEMINI_API_KEY is not set in environment
      const ruleBasedReply = generateRuleBasedResponse(
        latestUserMessage,
        environmentalContext,
        userProfile,
        userLanguage
      );
      return NextResponse.json({
        reply: ruleBasedReply,
        model: 'AirWise Rule-Based Environmental Engine (No API key configured)',
        isFallback: true,
      });
    }

    // Call Google Gemini API (gemini-1.5-flash)
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const conversationHistory = messages.slice(-8).map((m: ChatMessage) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content.slice(0, 1000) }],
    }));

    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: contextPrompt }],
        },
        contents: conversationHistory,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Gemini API request failed, using intelligent rule engine fallback:', errText);
      const fallbackReply = generateRuleBasedResponse(
        latestUserMessage,
        environmentalContext,
        userProfile,
        userLanguage
      );
      return NextResponse.json({
        reply: fallbackReply,
        model: 'AirWise Rule-Based Fallback',
        isFallback: true,
      });
    }

    const geminiData = await response.json();
    const candidateText =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I was unable to generate an environmental analysis. Please try again.';

    return NextResponse.json({
      reply: candidateText,
      model: 'Google Gemini 1.5 Flash',
      isFallback: false,
    });
  } catch (err) {
    console.error('Error in /api/assistant route:', err);
    return NextResponse.json(
      { error: 'Internal assistant error' },
      { status: 500 }
    );
  }
}
