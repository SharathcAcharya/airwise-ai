'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  ShieldAlert, 
  RefreshCw, 
  HelpCircle,
  Activity,
  ArrowRight
} from 'lucide-react';
import { POPULAR_LOCATIONS, AirQualityResponse } from '@/lib/air-quality-service';

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
  'What should I do if PM2.5 levels suddenly spike?',
  'What are some high-impact sustainable alternatives for daily commute?',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `### Welcome to AirWise Environmental AI Assistant\n\nI am connected to your live location sensors and CPCB air quality calculations. Ask me anything about:\n- Safe outdoor activity and exercise timing\n- Health precautions for children and asthma sensitivities\n- Environmental causes of current pollution\n- Sustainable low-carbon alternatives\n\nHow can I help you plan your day?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [airData, setAirData] = useState<AirQualityResponse | null>(null);
  const [selectedLoc, setSelectedLoc] = useState('delhi-anand-vihar');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch current environment context
  useEffect(() => {
    async function loadEnv() {
      try {
        const res = await fetch(`/api/air-quality?locId=${selectedLoc}`);
        const data = await res.json();
        if (data.success) {
          setAirData(data.data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadEnv();
  }, [selectedLoc]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Verified Gemini AI Assistant
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Personal Environmental Advisory
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Grounded strictly in verified CPCB readings and public health advisories.
          </p>
        </div>

        {/* Location Context Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Context:
          </label>
          <select
            value={selectedLoc}
            onChange={(e) => setSelectedLoc(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 cursor-pointer focus:ring-2 focus:ring-emerald-500"
          >
            {POPULAR_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat History and Input Box */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Active Sensor Context Bar */}
          <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-slate-700">
                {airData?.location.name || 'Loading location...'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-bold text-slate-900">
                AQI {airData?.current.aqi ?? '...'} ({airData?.current.category ?? '...'})
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Dominant: <strong>{airData?.current.dominantPollutant?.toUpperCase() || 'PM2.5'}</strong>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m, i) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={i}
                  className={`flex gap-3 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isAssistant
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-800 text-white'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-50 border border-slate-200/80 text-slate-800 shadow-xs'
                        : 'bg-emerald-800 text-white font-medium shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1">
                      {m.content}
                    </div>

                    {m.model && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 flex items-center justify-between">
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
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Synthesizing environmental intelligence...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white border-t border-slate-200">
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
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Prompt Suggestions & Safety Framework Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Prompts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Common Inquiries
              </h3>
            </div>
            <div className="space-y-2">
              {PRESET_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200 border border-slate-100 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="line-clamp-2">{q}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Safety & Medical Disclaimer Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Public Health Framework</span>
            </div>
            <p className="leading-relaxed">
              AIRWISE AI offers general public health risk awareness and activity mitigation guidance based on official CPCB index ranges.
            </p>
            <p className="leading-relaxed text-slate-500">
              This does not constitute personal medical diagnosis. Individuals experiencing respiratory distress should consult medical practitioners immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
