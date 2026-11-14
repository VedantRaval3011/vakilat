"use client";

import { Crown, History, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/(auth)/actions";
import { useT } from "@/components/i18n/LocaleProvider";
import { routes } from "@/lib/navigation";
import type { MessageKey } from "@/lib/i18n/messages";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

export function UserMenu({
  name,
  email,
  profession,
  photo,
}: {
  name: string;
  email: string;
  profession: string;
  photo?: string | null;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const links: { nameKey: MessageKey; href: string; icon: typeof Settings }[] = [
    { nameKey: "account.settings", href: routes.settings, icon: Settings },
    { nameKey: "quick.history", href: routes.history, icon: History },
    { nameKey: "nav.goPro", href: routes.plans, icon: Crown },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("account.menu")}
        aria-expanded={open}
        className="grid size-11 place-items-center overflow-hidden rounded-full bg-accent font-display text-sm font-bold text-black ring-offset-2 ring-offset-background transition hover:ring-2 hover:ring-accent/60"
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="size-full object-cover" />
        ) : (
          initials(name)
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-13 z-50 w-64 rounded-xl border border-border bg-surface p-1.5 shadow-2xl">
          <div className="border-b border-border px-3 pb-3 pt-2">
            <p className="truncate font-semibold">{name}</p>
            <p className="truncate text-xs text-muted">{email}</p>
            <p className="mt-1.5 inline-block rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">{profession}</p>
          </div>
          <ul className="py-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
                >
                  <l.icon className="size-4 text-muted" /> {t(l.nameKey)}
                </Link>
              </li>
            ))}
          </ul>
          <form action={signOut} className="border-t border-border pt-1">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="size-4" /> {t("account.signOut")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
