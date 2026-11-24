import { NextRequest, NextResponse } from 'next/server';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, environmentalContext, userProfile } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required.' },
        { status: 400 }
      );
    }

    const latestUserMessage = messages[messages.length - 1].content;
    const apiKey = process.env.GEMINI_API_KEY;

    // Structured system prompt incorporating verified data boundaries and safety
    const contextPrompt = `
You are the AIRWISE AI Personal Environmental Intelligence Assistant.
Your mission is to help urban citizens make smart, safe, and sustainable daily decisions regarding air pollution.

CURRENT VERIFIED ENVIRONMENTAL CONTEXT (From Sensors & CPCB Engine):
- Location: ${environmentalContext?.locationName || 'Urban Center, India'}
- Indian National AQI: ${environmentalContext?.aqi ?? 'Data Unavailable'} (${environmentalContext?.category || 'Unknown'})
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
        userProfile
      );
      return NextResponse.json({
        reply: ruleBasedReply,
        model: 'AirWise Rule-Based Environmental Engine (No API key configured)',
        isFallback: true,
      });
    }

    // Call Google Gemini API (gemini-1.5-flash or gemini-2.5-flash)
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const conversationHistory = messages.map((m: ChatMessage) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
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
          temperature: 0.4,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Gemini API request failed, using intelligent rule engine:', errText);
      const fallbackReply = generateRuleBasedResponse(
        latestUserMessage,
        environmentalContext,
        userProfile
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
      'I was unable to generate an analysis. Please try again.';

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

/**
 * High-quality deterministic environmental advisor when API key is unconfigured
 */
function generateRuleBasedResponse(
  query: string,
  env: any,
  profile: any
): string {
  const q = query.toLowerCase();
  const aqi = env?.aqi ?? 160;
  const cat = env?.category || 'Moderate';
  const dominant = env?.dominantPollutant?.toUpperCase() || 'PM2.5';
  const pm25 = env?.pm25 ?? 75;

  if (q.includes('running') || q.includes('exercise') || q.includes('jog') || q.includes('workout')) {
    if (aqi <= 100) {
      return `### Outdoor Exercise Advisory: Safe to Run\n\n- **Current Air Quality:** **${aqi} (${cat})**\n- **Recommendation:** You can proceed with outdoor workouts without concern. Atmospheric dispersion is favorable.\n- **Best Window:** Morning or late afternoon.\n- **Sustainability Tip:** Jogging in green parks or tree-lined avenues lowers your immediate particulate exposure even further.`;
    } else if (aqi <= 200) {
      return `### Outdoor Exercise Advisory: Exercise Caution\n\n- **Current Air Quality:** **${aqi} (${cat})** with **${dominant}** at **${pm25} µg/m³**.\n- **Recommendation:** Light-to-moderate outdoor activities are permissible for healthy individuals. If you are sensitive, asthmatic, or feel throat tickles, move your workout indoors.\n- **Timing:** Early afternoon (1:00 PM – 4:00 PM) typically has better solar mixing than early morning or late night.\n- **Protection:** Avoid running along congested arterial roadways.`;
    } else {
      return `### Outdoor Exercise Advisory: Move Indoors Immediately\n\n- **Current Air Quality:** **${aqi} (${cat})** - Unhealthy Levels.\n- **Recommendation:** Strictly avoid vigorous outdoor cardio. High breathing volume will draw elevated ${dominant} deep into alveolar lung tissues.\n- **Alternative:** Indoor treadmill, yoga, bodyweight training, or gym workouts with HEPA air filtration.\n- **Commute:** If you must step outside, wear a well-fitted certified **N95/FFP2 respirator**.`;
    }
  }

  if (q.includes('commute') || q.includes('travel') || q.includes('metro') || q.includes('bus')) {
    return `### Commute & Exposure Protection Plan\n\n- **Current AQI:** **${aqi} (${cat})**\n- **Commute Mode Advice:** Use electric public transit or air-conditioned Metro lines whenever possible. Metro cabins filter recirculated air significantly better than open three-wheelers or two-wheelers.\n- **Active Travel:** If cycling or walking along traffic corridors today, wear an **N95 mask** to filter out combustion particles and road brake dust.\n- **Eco-Action:** Switching from single-occupancy petrol cars to metro saves approx **1.8 kg CO2e** per 10 km journey!`;
  }

  if (q.includes('child') || q.includes('kid') || q.includes('school') || q.includes('elderly')) {
    return `### Health Protection for Children & Vulnerable Groups\n\n- **Current Status:** **${aqi} (${cat})**\n- **Why Children Are More Vulnerable:** Children breathe more air per kilogram of body weight than adults, and their lungs are still developing.\n- **Key Precautions:**\n  1. Restrict outdoor physical education (P.E.) sports during high pollution periods (>200 AQI).\n  2. Ensure classrooms or bedrooms keep windows closed during morning thermal inversion hours.\n  3. Encourage adequate hydration to support mucosal barrier defenses.\n  4. For children with childhood asthma, ensure emergency inhalers are accessible.`;
  }

  if (q.includes('cause') || q.includes('why') || q.includes('reason') || q.includes('factor')) {
    return `### Atmospheric & Emission Breakdown for ${env?.locationName || 'Region'}\n\n- **Dominant Pollutant:** **${dominant}** (Sub-index: ${env?.dominantSubIndex || aqi})\n- **Key Contributing Sources:**\n  1. **Vehicular Emissions:** Tailpipe exhaust from diesel freight and stop-and-go urban traffic.\n  2. **Suspended Road Dust:** Mechanically kicked up by heavy vehicular movement on unpaved shoulders.\n  3. **Meteorological Inversion:** Low nocturnal boundary layer height traps ground-level emissions near the surface.\n  4. **Biomass & Waste Burning:** Localized open burning of garden clippings or municipal solid waste.`;
  }

  // General environmental guidance
  return `### AirWise Environmental Intelligence Summary\n\n- **Location:** ${env?.locationName || 'Selected City'}\n- **Indian AQI:** **${aqi}** — **${cat}**\n- **Dominant Stressor:** **${dominant}** at **${pm25} µg/m³**\n\n**Immediate Recommendations:**\n1. **Ventilation:** Best to keep windows closed during early morning rush hours.\n2. **Outdoor Activity:** ${cat === 'Good' || cat === 'Satisfactory' ? 'Safe for all normal routines.' : 'Moderate or sensitive individuals should take frequent breaks and avoid high-traffic corridors.'}\n3. **Sustainable Action:** Choose electric bus or metro for your next journey to curb ambient urban emissions.`;
}
