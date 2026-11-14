"use client";

import { Maximize, Menu, Minimize } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { useT } from "@/components/i18n/LocaleProvider";
import { LanguageSelect } from "@/components/site/LanguageSelect";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { quickBar } from "@/lib/modules";
import { routes } from "@/lib/navigation";
import type { MessageKey } from "@/lib/i18n/messages";

const quickLabelKey: Record<string, MessageKey> = {
  home: "quick.dashboard",
  vidhi: "quick.vidhi",
  "draft-studio": "quick.draftStudio",
  "moot-practice": "quick.mootPractice",
  glossary: "quick.glossary",
  translate: "quick.translate",
  history: "quick.history",
  notes: "quick.notes",
  saved: "quick.saved",
  hearings: "quick.hearings",
};

function subscribeFullscreen(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

function FullscreenToggle() {
  const t = useT();
  const full = useSyncExternalStore(subscribeFullscreen, () => !!document.fullscreenElement, () => false);
  return (
    <button
      type="button"
      onClick={() => (full ? document.exitFullscreen() : document.documentElement.requestFullscreen())}
      aria-label={full ? t("fullscreen.exit") : t("fullscreen.enter")}
      className="hidden size-11 place-items-center rounded-full bg-surface-2 transition hover:bg-border sm:grid"
    >
      {full ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
    </button>
  );
}

export function Topbar({ onOpenMenu, userMenu }: { onOpenMenu: () => void; userMenu: ReactNode }) {
  const pathname = usePathname();
  const t = useT();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label={t("nav.openMenu")}
        className="grid size-10 place-items-center rounded-lg text-muted hover:bg-surface-2 lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      <Logo href={routes.dashboard} compact className="lg:hidden" />

      <nav aria-label="Quick access" className="hidden min-w-0 items-center gap-1 md:flex">
        {quickBar.map((m) => {
          const active = pathname === m.href || (m.href !== routes.dashboard && pathname.startsWith(`${m.href}/`));
          const Icon = m.icon;
          const label = t(quickLabelKey[m.key] ?? "quick.dashboard");
          return (
            <Link
              key={m.key}
              href={m.href}
              aria-label={label}
              className={`group relative grid size-10 shrink-0 place-items-center rounded-lg transition ${
                active ? "bg-accent/12 text-accent" : "text-muted hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <Icon className="size-[19px]" />
              <span className="pointer-events-none absolute top-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground opacity-0 shadow-lg transition group-hover:opacity-100">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden sm:block">
          <LanguageSelect />
        </div>
        <FullscreenToggle />
        <ThemeToggle />
        {userMenu}
      </div>
    </header>
  );
}
