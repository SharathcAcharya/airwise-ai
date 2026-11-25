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
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  Square,
  Globe
} from 'lucide-react';
import { AirQualityResponse } from '@/lib/air-quality-service';
import LocationSearch from '@/components/LocationSearch';
import { useLocation } from '@/context/LocationContext';
import { useLanguage } from '@/context/LanguageContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

const REGIONAL_PRESETS: Record<string, string[]> = {
  en: [
    'Is it suitable to go running now?',
    'What is causing today’s poor air quality?',
    'Is my morning commute advisable by bike or metro?',
    'What precautions should children and schools take?',
    'What should I do when PM2.5 levels suddenly spike?',
    'What are some high-impact sustainable alternatives for daily commute?',
  ],
  kn: [
    'ಈಗ ಹೊರಾಂಗಣದಲ್ಲಿ ಓಡಲು ವಾಯು ಗುಣಮಟ್ಟ ಸೂಕ್ತವಾಗಿದೆಯೇ?',
    'ಇಂದಿನ ವಾಯು ಮಾಲಿನ್ಯಕ್ಕೆ ಮುಖ್ಯ ಕಾರಣಗಳೇನು?',
    'ಕಚೇರಿ ಪ್ರಯಾಣಕ್ಕೆ ಬೈಕ್ ಸೂಕ್ತವೇ ಅಥವಾ ಮೆಟ್ರೋವೇ?',
    'ಮಕ್ಕಳು ಮತ್ತು ಶಾಲೆಗಳು ಯಾವ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸಬೇಕು?',
    'PM2.5 ಮಟ್ಟ ಹೆಚ್ಚಾದಾಗ ಯಾವ ಮಾಸ್ಕ್ ಧರಿಸಬೇಕು?',
    'ವಾಹನ ಮಾಲಿನ್ಯ ಕಡಿಮೆ ಮಾಡಲು ಸುಸ್ಥಿರ ಮಾರ್ಗಗಳೇನು?',
  ],
  hi: [
    'क्या अभी बाहर दौड़ने जाना सुरक्षित है?',
    'आज की खराब वायु गुणवत्ता का मुख्य कारण क्या है?',
    'सुबह की यात्रा के लिए बाइक बेहतर है या मेट्रो?',
    'बच्चों और स्कूलों को क्या सावधानियां बरतनी चाहिए?',
    'PM2.5 का स्तर अचानक बढ़ने पर मुझे क्या करना चाहिए?',
    'दैनिक यात्रा के लिए हरित और टिकाऊ विकल्प क्या हैं?',
  ],
  ta: [
    'இப்போது வெளியில் ஓட காற்றுத் தரம் பாதுகாப்பானதா?',
    'இன்றைய காற்று மாசுபாட்டிற்கு முக்கிய காரணங்கள் என்ன?',
    'காலை பயணத்திற்கு பைக் நல்லதா அல்லது மெட்ரோவா?',
    'குழந்தைகளும் பள்ளிகளும் என்ன முன்னெச்சரிக்கை எடுக்க வேண்டும்?',
    'PM2.5 அளவு அதிகரிக்கும் போது என்ன செய்ய வேண்டும்?',
    'சுற்றுச்சூழல் நட்பு பயண முறைகள் யாவை?',
  ],
  bn: [
    'এখন বাইরে দৌড়াতে যাওয়া কি নিরাপদ?',
    'আজকের বায়ু দূষণের মূল কারণগুলি কী কী?',
    'সকালের যাতায়াতের জন্য বাইক ভালো না মেট্রো?',
    'বাচ্চাদের এবং স্কুলের কী সতর্কতা নেওয়া উচিত?',
    'PM2.5 হঠাৎ বৃদ্ধি পেলে কী মাস্ক ব্যবহার করবেন?',
    'দৈনন্দিন যাতায়াতের পরিবেশবান্ধব বিকল্প কী?',
  ],
  mr: [
    'आता बाहेर धावणे सुरक्षित आहे का?',
    'आजच्या हवेच्या प्रदूषणाची मुख्य कारणे कोणती?',
    'सकाळच्या प्रवासासाठी बाईक योग्य आहे की मेट्रो?',
    'लहान मुले आणि शाळांनी काय काळजी घ्यावी?',
    'PM2.5 वाढल्यावर काय उपाययोजना कराव्यात?',
    'प्रदूषण कमी करण्यासाठी कोणते हरित पर्याय आहेत?',
  ],
};

export default function AssistantPage() {
  const { currentLocation } = useLocation();
  const { language, speechCode, currentLanguageMeta, t } = useLanguage();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `### Welcome to AirWise Environmental AI Assistant\n\nI am connected to Copernicus CAMS atmospheric models (~40 km resolution) and CPCB linear sub-index calculations for your selected location. Ask me anything about:\n- Safe outdoor activity and exercise timing\n- Health precautions for children and asthma sensitivities\n- Environmental causes of current pollution\n- Sustainable low-carbon alternatives\n\nHow can I help you plan your day?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [airData, setAirData] = useState<AirQualityResponse | null>(null);

  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Speech Recognition support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = speechCode;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0]?.[0]?.transcript;
          if (transcript) {
            setInput(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [speechCode]);

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

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use keyboard input.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = speechCode;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  const handleSpeak = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner audio reading
    const cleanText = text
      .replace(/###|\*\*|\*|#/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = speechCode;
    utterance.rate = 0.95;

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setSpeakingMsgId(null);
    };

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    if (speakingMsgId) {
      window.speechSynthesis?.cancel();
      setSpeakingMsgId(null);
    }

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const envContext = {
        locationName: airData?.location.name || currentLocation.name,
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
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          environmentalContext: envContext,
          language,
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
            id: `asst-${Date.now()}`,
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
          id: `asst-err-${Date.now()}`,
          role: 'assistant',
          content: 'I encountered an issue processing your question. Please ensure network connectivity and retry.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const activePresets = REGIONAL_PRESETS[language] || REGIONAL_PRESETS.en;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#39414B] p-5 rounded-[12px] border border-[#677580] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[12px] bg-[#F9FAFF] p-1.5 flex items-center justify-center border border-[#97A7B6] shadow-xs shrink-0">
            <Image
              src="/airwise-logo-icon.png"
              alt="AIRWISE AI"
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
                {t('assistant.title', 'Regional AI Environmental Assistant')}
              </span>
              <span className="text-[10px] font-bold bg-[#209040] text-[#F9FAFF] px-2 py-0.5 rounded-[6.4px] flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {currentLanguageMeta.nativeName} ({currentLanguageMeta.name})
              </span>
            </div>
            <h2 className="text-[22px] sm:text-[24px] font-bold text-[#F9FAFF] tracking-tight mt-1 leading-[28px] sm:leading-[32.4px]">
              Personal Environmental & Voice Advisory
            </h2>
            <p className="text-[12px] text-[#D0D2D7] mt-0.5 leading-[17.28px]">
              {t('assistant.subtitle', 'Grounded environmental intelligence powered by Google Gemini 1.5 and CPCB protocols.')}
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
                {airData?.location.name || currentLocation.name}
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
            {messages.map((m) => {
              const isAssistant = m.role === 'assistant';
              const isSpeaking = speakingMsgId === m.id;
              return (
                <div
                  key={m.id}
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
                        alt="AIRWISE AI"
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

                    {isAssistant && (
                      <div className="mt-2 pt-2 border-t border-[#677580] text-[9px] text-[#CCD3D7] flex items-center justify-between">
                        <span>{m.model || 'AirWise AI'}</span>
                        <button
                          onClick={() => handleSpeak(m.id, m.content)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-[4px] font-semibold transition-colors ${
                            isSpeaking
                              ? 'bg-[#E5484D] text-[#F9FAFF]'
                              : 'bg-[#23272B] text-[#4BA9FF] hover:bg-[#555555]'
                          }`}
                          aria-label={isSpeaking ? 'Stop speech' : 'Read aloud'}
                        >
                          {isSpeaking ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              <span>{t('assistant.stopSpeaking', 'Stop')}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>{t('assistant.readAloud', 'Listen')}</span>
                            </>
                          )}
                        </button>
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
                    alt="AIRWISE AI"
                    width={26}
                    height={26}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="bg-[#39414B] border border-[#677580] px-4 py-3 rounded-[10.88px] text-[10px] text-[#D0D2D7] flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#4BA9FF]" />
                  <span>Synthesizing environmental intelligence in {currentLanguageMeta.nativeName}...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Voice Input Listening Banner */}
          {isListening && (
            <div className="px-4 py-2 bg-[#209040] text-[#F9FAFF] text-[11px] font-bold flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 animate-bounce" />
                <span>{t('assistant.listening', 'Listening... Speak now')} ({currentLanguageMeta.nativeName})</span>
              </div>
              <button
                onClick={toggleListening}
                className="text-[10px] underline hover:text-[#CCD3D7]"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Input Box */}
          <div className="p-4 bg-[#39414B] border-t border-[#677580]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleListening}
                disabled={loading}
                className={`p-2.5 rounded-[6.8px] border transition-colors ${
                  isListening
                    ? 'bg-[#E5484D] text-[#F9FAFF] border-[#E5484D] animate-pulse'
                    : 'bg-[#23272B] text-[#4BA9FF] border-[#677580] hover:bg-[#555555]'
                }`}
                title={isListening ? 'Stop listening' : `Voice input in ${currentLanguageMeta.nativeName}`}
                aria-label="Voice input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('assistant.placeholder', 'Ask in your preferred language (e.g. running safety, masks, causes)...')}
                disabled={loading}
                className="aqi-input flex-1 text-[12px]"
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
                {t('assistant.quickPrompts', 'Recommended Inquiries')} ({currentLanguageMeta.nativeName})
              </h3>
            </div>
            <div className="space-y-2">
              {activePresets.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-[6.8px] text-[10.5px] font-semibold text-[#D0D2D7] bg-[#23272B] hover:bg-[#555555] hover:text-[#F9FAFF] border border-[#677580] transition-colors flex items-center justify-between group cursor-pointer"
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
