import Link from "next/link";
import { Logo } from "@/components/Logo";
import { footerColumns } from "@/lib/content";
import { LanguageSelect } from "./LanguageSelect";

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com", path: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.2 1.5-2.2 3V21h-4V9Z" },
  { label: "Instagram", href: "https://www.instagram.com", path: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4ZM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM12 2c-2.7 0-3 0-4.1.1C4.3 2.2 2.2 4.3 2.1 7.9 2 9 2 9.3 2 12s0 3 .1 4.1c.1 3.6 2.2 5.7 5.8 5.8 1.1.1 1.4.1 4.1.1s3 0 4.1-.1c3.6-.1 5.7-2.2 5.8-5.8.1-1.1.1-1.4.1-4.1s0-3-.1-4.1c-.1-3.6-2.2-5.7-5.8-5.8C15 2 14.7 2 12 2Z" },
  { label: "YouTube", href: "https://www.youtube.com", path: "M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15V9l5.8 3-5.8 3Z" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-5 pt-20">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.3fr_2fr]">
        <div className="flex flex-col gap-6">
          <Logo />
          <p className="max-w-sm text-muted">
            An AI research desk for Indian law that brings judgments, Acts and multilingual legal tools
            together in one place.
          </p>
          <div className="flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="grid size-10 place-items-center rounded-lg border border-border text-muted transition hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted">{col.title}</h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm transition hover:text-accent">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-7xl flex-col gap-4 rounded-2xl border border-border bg-surface p-6 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-bold uppercase tracking-[0.15em]">Get the weekly law brief</p>
        <form className="flex w-full gap-2 md:w-auto" action="#">
          <input
            type="email"
            required
            placeholder="your@email.com"
            className="h-11 flex-1 rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-accent md:w-72"
          />
          <button
            type="submit"
            className="h-11 rounded-lg bg-foreground px-5 text-sm font-semibold text-background"
          >
            Subscribe
          </button>
        </form>
      </div>

      <p className="mx-auto mt-10 max-w-7xl text-xs leading-relaxed text-muted">
        Disclaimer: Vakilat is an AI legal research and assistance platform that provides
        informational support only. It does not constitute legal advice. Always exercise independent
        professional judgment and verify outputs before relying on them.
      </p>

      <div className="mx-auto mt-8 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-border py-8 text-sm text-muted md:flex-row">
        <p>© 2026 Vakilat. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <Link href="/legal/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/legal/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/legal/cookies" className="hover:text-foreground">Cookies</Link>
          <Link href="/legal/refunds" className="hover:text-foreground">Refunds</Link>
          <LanguageSelect />
        </div>
      </div>
    </footer>
  );
}
