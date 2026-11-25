'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import en from '@/locales/en.json';
import kn from '@/locales/kn.json';
import hi from '@/locales/hi.json';
import ta from '@/locales/ta.json';
import bn from '@/locales/bn.json';
import mr from '@/locales/mr.json';

export type SupportedLanguage = 'en' | 'kn' | 'hi' | 'ta' | 'bn' | 'mr';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN' },
];

const dictionaries: Record<SupportedLanguage, any> = {
  en,
  kn,
  hi,
  ta,
  bn,
  mr,
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  languages: LanguageMeta[];
  currentLanguageMeta: LanguageMeta;
  speechCode: string;
  t: (key: string, defaultVal?: string) => string;
  isHydrated: boolean;
}

const STORAGE_KEY = 'airwise_selected_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function resolveNestedKey(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
      if (saved && (saved === 'en' || saved === 'kn' || saved === 'hi' || saved === 'ta' || saved === 'bn' || saved === 'mr')) {
        setLanguageState(saved);
      }
    } catch (e) {
      console.warn('Unable to load saved language:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Unable to persist language:', e);
    }
  };

  const currentLanguageMeta = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const speechCode = currentLanguageMeta.speechCode;

  const t = (key: string, defaultVal?: string): string => {
    const activeDict = dictionaries[language];
    const localized = resolveNestedKey(activeDict, key);
    if (localized) return localized;

    // Fallback to English dictionary
    const fallback = resolveNestedKey(dictionaries.en, key);
    if (fallback) return fallback;

    return defaultVal || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageMeta,
        speechCode,
        t,
        isHydrated,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
