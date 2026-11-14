"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  catalogs,
  defaultLocale,
  htmlLang,
  isLocaleCode,
  LOCALE_COOKIE,
  LOCALE_STORAGE,
  translate,
  type LocaleCode,
  type MessageKey,
} from "@/lib/i18n/messages";

type LocaleContextValue = {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: (key: MessageKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const READY_KEY = "__vakilatLocaleReady";
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function readStored(): LocaleCode {
  if (typeof window === "undefined") return defaultLocale;
  try {
    const fromStorage = localStorage.getItem(LOCALE_STORAGE);
    if (fromStorage && isLocaleCode(fromStorage)) return fromStorage;
  } catch {
    /* ignore */
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const fromCookie = match?.[1] ? decodeURIComponent(match[1]) : "";
  if (fromCookie && isLocaleCode(fromCookie)) return fromCookie;
  return defaultLocale;
}

function clientReady() {
  return typeof window !== "undefined" && Boolean((window as unknown as Record<string, boolean>)[READY_KEY]);
}

function getSnapshot(): LocaleCode {
  // Keep SSR and first client paint on English so hydration matches.
  if (!clientReady()) return defaultLocale;
  return readStored();
}

function getServerSnapshot(): LocaleCode {
  return defaultLocale;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function persist(code: LocaleCode) {
  try {
    localStorage.setItem(LOCALE_STORAGE, code);
  } catch {
    /* ignore */
  }
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(code)}; path=/; max-age=${maxAge}; samesite=lax`;
  document.documentElement.lang = htmlLang[code];
  emit();
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    (window as unknown as Record<string, boolean>)[READY_KEY] = true;
    document.documentElement.lang = htmlLang[readStored()];
    emit();
  }, []);

  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = useCallback((code: LocaleCode) => {
    if (!(code in catalogs)) return;
    persist(code);
  }, []);

  const t = useCallback((key: MessageKey) => translate(locale, key), [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useT() {
  return useLocale().t;
}
