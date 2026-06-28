import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import en from '@/locales/en';

export type Language = 'en' | 'es' | 'zh' | 'hi' | 'ar' | 'fr' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const SUPPORTED: Language[] = ['en', 'es', 'zh', 'hi', 'ar', 'fr', 'pt'];

// Synchronous English (always available). Other locales are lazy-loaded on demand
// to keep the initial bundle small.
const loaders: Record<Exclude<Language, 'en'>, () => Promise<{ default: Record<string, string> }>> = {
  es: () => import('@/locales/es'),
  zh: () => import('@/locales/zh'),
  hi: () => import('@/locales/hi'),
  ar: () => import('@/locales/ar'),
  fr: () => import('@/locales/fr'),
  pt: () => import('@/locales/pt'),
};

const cache: Partial<Record<Language, Record<string, string>>> = { en };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('univista-language');
      if (saved && SUPPORTED.includes(saved as Language)) return saved as Language;
      const browserLang = navigator.language.split('-')[0];
      if (SUPPORTED.includes(browserLang as Language)) return browserLang as Language;
    }
    return 'en';
  });
  const [, force] = useState(0);

  useEffect(() => {
    localStorage.setItem('univista-language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    if (language !== 'en' && !cache[language]) {
      loaders[language as Exclude<Language, 'en'>]()
        .then((m) => {
          cache[language] = m.default;
          force((n) => n + 1);
        })
        .catch(() => {
          // Silent fallback to English
        });
    }
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);

  const t = (key: string): string => {
    return cache[language]?.[key] ?? en[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  zh: '中文',
  hi: 'हिंदी',
  ar: 'العربية',
  fr: 'Français',
  pt: 'Português',
};
