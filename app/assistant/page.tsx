'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  ShieldAlert, 
  RefreshCw, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { AirQualityResponse } from '@/lib/air-quality-service';
import LocationSearch from '@/components/LocationSearch';
import { useLocation } from '@/context/LocationContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

const PRESET_QUESTIONS = [
  'Is it suitable to go running now?',
  'What is causing today’s poor air quality?',
  'Is my morning commute advisable by bike or metro?',
  'What precautions should children and schools take?',
  'What should I do when PM2.5 levels suddenly spike?',
  'What are some high-impact sustainable alternatives for daily commute?',
];

export default function AssistantPage() {
  const { currentLocation } = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `### Welcome to AirWise Environmental AI Assistant\n\nI am connected to your live location sensors and CPCB air quality calculations. Ask me anything about:\n- Safe outdoor activity and exercise timing\n- Health precautions for children and asthma sensitivities\n- Environmental causes of current pollution\n- Sustainable low-carbon alternatives\n\nHow can I help you plan your day?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [airData, setAirData] = useState<AirQualityResponse | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadEnv() {
      try {
        const query = `lat=${currentLocation.latitude}&lon=${currentLocation.longitude}&name=${encodeURIComponent(currentLocation.name)}`;
        const res = await fetch(`/api/air-quality?${query}`);
        const data = await res.json();
        if (data.success) {
          setAirData(data.data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadEnv();
  }, [currentLocation]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: textToSend },
    ];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const envContext = {
        locationName: airData?.location.name || 'Delhi Anand Vihar',
        aqi: airData?.current.aqi,
        indicativeAqi: airData?.current.indicativeAqi,
        category: airData?.current.category,
        dominantPollutant: airData?.current.dominantPollutant,
        dominantSubIndex: airData?.current.dominantSubIndex,
        pm25: airData?.current.subIndices.pm25.value,
        pm10: airData?.current.subIndices.pm10.value,
        no2: airData?.current.subIndices.no2.value,
        so2: airData?.current.subIndices.so2.value,
        co: airData?.current.subIndices.co.value,
        o3: airData?.current.subIndices.o3.value,
        source: airData?.source,
        dataSourceType: airData?.dataSourceType,
      };

      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          environmentalContext: envContext,
          userProfile: {
            sensitivity: 'Healthy adult',
            morningExercise: 'Outdoor runner',
            commuteMode: 'Metro',
          },
        }),
      });

      const resData = await res.json();
      if (resData.reply) {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: resData.reply,
            model: resData.model,
          },
        ]);
      } else {
        throw new Error('No reply received from intelligence server.');
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'I encountered an issue processing your question. Please ensure network connectivity and retry.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#39414B] p-5 rounded-[12px] border border-[#677580] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[12px] bg-[#F9FAFF] p-1.5 flex items-center justify-center border border-[#97A7B6] shadow-xs shrink-0">
            <Image
              src="/airwise-logo-icon.png"
              alt="AIRWISE AI — Breathe Smarter. Move Safer. Live Greener."
              width={42}
              height={42}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#F9FAFF] bg-[#296AE1] px-2.5 py-0.5 rounded-[6.4px]">
                <Sparkles className="w-3.5 h-3.5 text-[#4BA9FF]" />
                Verified Gemini AI Assistant
              </span>
            </div>
            <h2 className="text-[22px] sm:text-[24px] font-bold text-[#F9FAFF] tracking-tight mt-1 leading-[28px] sm:leading-[32.4px]">
              Personal Environmental Advisory
            </h2>
            <p className="text-[12px] text-[#D0D2D7] mt-0.5 leading-[17.28px]">
              Grounded strictly in verified CPCB readings and public health advisories.
            </p>
          </div>
        </div>

        {/* Location Context Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[10px] font-bold text-[#D0D2D7] uppercase tracking-wider">
            Context:
          </span>
          <LocationSearch />
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat History and Input Box */}
        <div className="lg:col-span-8 bg-[#39414B] rounded-[12px] border border-[#677580] flex flex-col h-[650px] overflow-hidden">
          {/* Active Sensor Context Bar */}
          <div className="px-5 py-3 bg-[#23272B] border-b border-[#677580] flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4BA9FF]"></span>
              <span className="font-semibold text-[#F9FAFF]">
                {airData?.location.name || 'Loading location...'}
              </span>
              <span className="text-[#677580]">•</span>
              <span className="font-bold text-[#4BA9FF]">
                AQI {airData?.current.indicativeAqi ?? airData?.current.aqi ?? '...'} ({airData?.current.category ?? '...'})
              </span>
            </div>
            <div className="text-[10px] text-[#D0D2D7] font-medium">
              Dominant: <strong>{airData?.current.dominantPollutant?.toUpperCase() || 'PM2.5'}</strong>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#23272B]">
            {messages.map((m, i) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={i}
                  className={`flex gap-3 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-[6.8px] flex items-center justify-center shrink-0 ${
                      isAssistant
                        ? 'bg-[#F9FAFF] p-0.5 border border-[#97A7B6] shadow-xs'
                        : 'bg-[#555555] text-[#F9FAFF]'
                    }`}
                  >
                    {isAssistant ? (
                      <Image
                        src="/airwise-logo-icon.png"
                        alt="AIRWISE AI — Breathe Smarter. Move Safer. Live Greener."
                        width={26}
                        height={26}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-[10.88px] px-4 py-3 text-[12px] leading-[17.28px] ${
                      isAssistant
                        ? 'bg-[#39414B] border border-[#677580] text-[#F9FAFF]'
                        : 'bg-[#296AE1] text-[#F9FAFF] font-medium'
                    }`}
                  >
                    <div className="whitespace-pre-line prose prose-invert prose-sm max-w-none">
                      {m.content}
                    </div>

                    {m.model && (
                      <div className="mt-2 pt-2 border-t border-[#677580] text-[8px] text-[#CCD3D7] flex items-center justify-between">
                        <span>Powered by {m.model}</span>
                        <span>CPCB Verified Boundary</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[6.8px] bg-[#F9FAFF] p-0.5 border border-[#97A7B6] shadow-xs flex items-center justify-center shrink-0 animate-pulse">
                  <Image
                    src="/airwise-logo-icon.png"
                    alt="AIRWISE AI — Breathe Smarter. Move Safer. Live Greener."
                    width={26}
                    height={26}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="bg-[#39414B] border border-[#677580] px-4 py-3 rounded-[10.88px] text-[10px] text-[#D0D2D7] flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#4BA9FF]" />
                  <span>Synthesizing environmental intelligence...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 bg-[#39414B] border-t border-[#677580]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about outdoor runs, masks, commute safety, or air causes..."
                disabled={loading}
                className="aqi-input flex-1"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="aqi-btn-primary"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Prompt Suggestions & Public Health Framework */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#39414B] p-5 rounded-[12px] border border-[#677580]">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-[#4BA9FF]" />
              <h3 className="text-[12px] font-bold text-[#F9FAFF] uppercase tracking-wider">
                Common Inquiries
              </h3>
            </div>
            <div className="space-y-2">
              {PRESET_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-[6.8px] text-[10px] font-semibold text-[#D0D2D7] bg-[#23272B] hover:bg-[#555555] hover:text-[#F9FAFF] border border-[#677580] transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="line-clamp-2">{q}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#4BA9FF] transition-opacity shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#23272B] p-5 rounded-[12px] border border-[#677580] text-[10px] text-[#D0D2D7] space-y-2">
            <div className="flex items-center gap-2 text-[#F9FAFF] font-bold">
              <ShieldAlert className="w-4 h-4 text-[#EA8C34]" />
              <span>Public Health Framework</span>
            </div>
            <p className="leading-[15.2px]">
              AIRWISE AI offers general public health risk awareness based on official CPCB index ranges.
            </p>
            <p className="leading-[15.2px] text-[#CCD3D7]">
              This does not constitute personal medical diagnosis. Individuals experiencing respiratory distress should consult medical practitioners.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
