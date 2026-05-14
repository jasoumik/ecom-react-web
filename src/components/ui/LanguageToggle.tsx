"use client";

import { useLanguage } from "@/lib/language-context";

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
      className={`font-bold text-sm transition-colors ${className}`}
      aria-label="Toggle Language"
    >
      {language === 'en' ? 'BN' : 'EN'}
    </button>
  );
}
