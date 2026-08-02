// src/context/LanguageContext.tsx
import React, { createContext, useContext, useState } from 'react';

import es from '../i18n/locales/es.json';
import en from '../i18n/locales/en.json';
import it from '../i18n/locales/it.json';

type Language = 'es' | 'en' | 'it';

const translations: Record<Language, any> = { es, en, it };

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const t = (key: string, defaultValue: string = ''): string => {
    const keys = key.split('.');
    let result: any = translations[language];

    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        return defaultValue || key;
      }
    }
    return typeof result === 'string' ? result : defaultValue || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de un LanguageProvider');
  }
  return context;
};