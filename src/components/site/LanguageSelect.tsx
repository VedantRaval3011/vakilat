"use client";

import { ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { languages } from "@/lib/content";
import type { LocaleCode } from "@/lib/i18n/messages";

export function LanguageSelect() {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("lang.select")}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 items-center gap-2 rounded-lg border border-accent/70 px-4 text-sm font-semibold text-accent transition hover:bg-accent/10"
      >
        <Globe className="size-5 text-muted" />
        {locale}
        <ChevronDown className={`size-4 text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute right-0 top-13 z-50 max-h-80 w-48 overflow-auto rounded-xl border border-border bg-surface p-1.5 shadow-2xl">
          {languages.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => {
                  setLocale(l.code as LocaleCode);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-surface-2 ${
                  l.code === locale ? "text-accent" : ""
                }`}
              >
                <span>{l.native}</span>
                <span className="text-xs text-muted">{l.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
