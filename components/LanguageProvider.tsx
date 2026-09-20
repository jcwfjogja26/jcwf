"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Language,
  translations,
} from "@/lib/i18n";

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (typeof translations)[Language];
};

const LanguageContext =
  createContext<LanguageContextType | null>(null);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>("id");

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem("jcwf-language");

    if (
      savedLanguage === "id" ||
      savedLanguage === "en"
    ) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (
    newLanguage: Language
  ) => {
    setLanguageState(newLanguage);

    localStorage.setItem(
      "jcwf-language",
      newLanguage
    );
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (context === null) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}