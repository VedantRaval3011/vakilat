import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Eyebrow } from "@/components/SectionHeading";
import { brand } from "@/lib/content";
import { ScrollStory } from "./ScrollStory";

function GooglePlayBadge() {
  return (
    <a
      href="https://play.google.com/store"
      target="_blank"
      rel="noreferrer"
      aria-label="Download on Google Play Store"
      className="flex h-15 items-center gap-3 rounded-xl border border-border bg-zinc-50 px-6 text-zinc-900 transition hover:bg-white"
    >
      <svg viewBox="0 0 24 24" className="size-8" aria-hidden>
        <path fill="#34A853" d="M3.6 1.8 13.8 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1Z" />
        <path fill="#FBBC04" d="m17.2 15.4-3.4-3.4 3.4-3.4 3.9 2.2c1.1.6 1.1 1.8 0 2.4l-3.9 2.2Z" />
        <path fill="#EA4335" d="M13.8 12 3.6 22.2c.4.2.9.2 1.4-.1l12.2-6.7L13.8 12Z" />
        <path fill="#4285F4" d="M13.8 12 17.2 8.6 5 1.9c-.5-.3-1-.3-1.4-.1L13.8 12Z" />
      </svg>
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] font-semibold uppercase">Get it on</span>
        <span className="text-xl font-semibold">Google Play</span>
      </span>
    </a>
  );
}

export function Hero() {
  return (
    <section aria-label="Product Hero Section" className="relative">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-7 px-5 pb-20 pt-16 text-center md:pt-24">
        <Eyebrow>Built for Indian law</Eyebrow>
        <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl">
          Indian law, researched
          <br />
          <span className="text-gradient-accent">with AI</span> in minutes
        </h1>
        <p className="max-w-3xl text-lg text-muted md:text-2xl">
          One research desk to search judgments, read Acts, draft documents, translate filings and
          sharpen your arguments.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-5">
          <Link
            href={brand.signUpHref}
            className="flex h-15 items-center gap-3 rounded-xl bg-zinc-50 px-10 text-lg font-semibold text-zinc-900 transition hover:bg-white"
          >
            Create free account <ArrowRight className="size-5" />
          </Link>
          <GooglePlayBadge />
        </div>
        <p className="mt-6 text-sm text-muted/80">
          Built with practising advocates from district courts to the Supreme Court
        </p>
      </div>
      <ScrollStory />
    </section>
  );
}
