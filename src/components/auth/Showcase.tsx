"use client";

import { BookOpenText, Languages, MessageSquareQuote, ScrollText } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { brand } from "@/lib/content";

const slides = [
  {
    icon: MessageSquareQuote,
    title: `Ask ${brand.assistant}`,
    body: "Plain-language questions, answers that cite the judgments and sections behind them.",
  },
  {
    icon: BookOpenText,
    title: "Every Act, one search",
    body: "Central and State Acts, the Constitution and the new criminal codes, cross-linked.",
  },
  {
    icon: ScrollText,
    title: "Drafts in minutes",
    body: "Start notices, petitions and agreements from vetted templates and refine with AI.",
  },
  {
    icon: Languages,
    title: "Work in your language",
    body: "Search, chat and translate across English and major Indian languages.",
  },
];

export function Showcase() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % slides.length), 4500);
    return () => clearInterval(id);
  }, []);

  const slide = slides[i];

  return (
    <aside className="relative hidden overflow-hidden border-r border-border bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 size-96 rounded-full bg-cyan-700/20 blur-3xl" />

      <p className="relative text-xs font-bold uppercase tracking-[0.25em] text-muted">
        Your legal research desk
      </p>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col gap-5"
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-accent/15 text-accent">
              <slide.icon className="size-7" />
            </span>
            <h2 className="font-display text-4xl font-bold leading-tight">{slide.title}</h2>
            <p className="max-w-md text-lg text-muted">{slide.body}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-10 flex gap-2">
          {slides.map((s, n) => (
            <button
              key={s.title}
              type="button"
              aria-label={`Show highlight ${n + 1}`}
              onClick={() => setI(n)}
              className={`h-1.5 rounded-full transition-all ${n === i ? "w-8 bg-accent" : "w-4 bg-border"}`}
            />
          ))}
        </div>
      </div>

      <p className="relative text-sm text-muted">
        By continuing you agree to the{" "}
        <Link href="/legal/terms" className="text-foreground underline-offset-4 hover:underline">
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link href="/legal/privacy" className="text-foreground underline-offset-4 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </aside>
  );
}
