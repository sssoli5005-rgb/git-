import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { LANGUAGES, translations, type Dict, type LangCode } from "./translations";

const STORAGE_KEY = "ekhtaberha.lang";

interface LanguageContextValue {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: Dict;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // SSR/prerender and first client render agree on the default (Arabic, RTL).
  // A saved language is applied after hydration to avoid a hydration mismatch.
  const [lang, setLangState] = useState<LangCode>("ar");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES.some((l) => l.code === saved)) {
        setLangState(saved as LangCode);
      }
    } catch {
      // Storage unavailable (private mode / sandbox) — keep the default.
    }
  }, []);

  useEffect(() => {
    const meta = LANGUAGES.find((l) => l.code === lang);
    if (!meta) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;
  }, [lang]);

  const setLang = (next: LangCode) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable — the choice applies to this visit only.
    }
  };

  const dir = (LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr") as "rtl" | "ltr";

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang as keyof typeof translations] ?? translations.en, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
