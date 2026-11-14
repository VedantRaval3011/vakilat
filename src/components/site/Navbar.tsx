"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { brand, moreItems, navItems } from "@/lib/content";
import { LanguageSelect } from "./LanguageSelect";
import { ThemeToggle } from "./ThemeToggle";
import { Ticker } from "./Ticker";

export function Navbar({ showTicker = true }: { showTicker?: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-border bg-background/95 backdrop-blur">
        <nav
          aria-label="Main"
          className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5"
        >
          <Logo />

          <ul className="hidden items-center gap-1 rounded-xl bg-surface p-1 lg:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-lg px-5 py-2.5 text-[15px] font-medium transition ${
                      active ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((o) => !o)}
                aria-expanded={moreOpen}
                className="flex items-center gap-1 rounded-lg px-5 py-2.5 text-[15px] font-medium text-muted transition hover:text-foreground"
              >
                More <ChevronDown className="size-4" />
              </button>
              {moreOpen && (
                <ul className="absolute left-0 top-12 w-44 rounded-xl border border-border bg-surface p-1.5 shadow-2xl">
                  {moreItems.map((m) => (
                    <li key={m.href}>
                      <Link
                        href={m.href}
                        onClick={() => setMoreOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
                      >
                        {m.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <LanguageSelect />
            <ThemeToggle />
            <Link
              href={brand.signInHref}
              className="hidden h-11 items-center rounded-lg bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 lg:flex"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="grid size-11 place-items-center rounded-lg border border-border lg:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="border-t border-border px-5 pb-5 lg:hidden">
            <ul className="flex flex-col py-3">
              {[...navItems, ...moreItems].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-3 text-base font-medium hover:bg-surface"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={brand.signInHref}
              className="flex h-12 items-center justify-center rounded-lg bg-foreground font-semibold text-background"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
      {showTicker && <Ticker />}
    </header>
  );
}
