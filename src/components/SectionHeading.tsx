import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
      <Sparkles className="size-4 text-accent" aria-hidden />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
}) {
  return (
    <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">{title}</h2>
      {subtitle && <p className="text-lg text-muted md:text-xl">{subtitle}</p>}
    </Reveal>
  );
}
