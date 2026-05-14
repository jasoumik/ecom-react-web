"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

type Language = "en" | "bn";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const storedLang = localStorage.getItem("language") as Language;
    if (storedLang) {
      setLanguage(storedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string, replacements?: Record<string, string>) => {
    // @ts-ignore
    let translatedText = translations[language]?.[key] || key; // Fallback to key if not found
    if (replacements) {
      for (const rKey in replacements) {
        translatedText = translatedText.replace(`{${rKey}}`, replacements[rKey]);
      }
    }
    return translatedText;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
