"use client";

import { BookOpen, ExternalLink, Gavel, Landmark, ScrollText, X } from "lucide-react";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import type { Source } from "@/lib/vidhi/sources";

const groups: { kind: Source["kind"]; title: string; icon: ReactNode }[] = [
  { kind: "section", title: "Sections", icon: <ScrollText className="size-4" /> },
  { kind: "article", title: "Constitution", icon: <Landmark className="size-4" /> },
  { kind: "act", title: "Other Acts", icon: <BookOpen className="size-4" /> },
  { kind: "case", title: "Judgments", icon: <Gavel className="size-4" /> },
];

function label(s: Source) {
  switch (s.kind) {
    case "section":
      return { main: `Section ${s.section} ${s.code}`, sub: s.title };
    case "article":
      return { main: `Article ${s.number}`, sub: s.heading };
    case "act":
      return { main: s.name, sub: undefined };
    case "case":
      return { main: s.name, sub: undefined };
  }
}

function Item({ source }: { source: Source }) {
  const { main, sub } = label(source);
  const external = source.href?.startsWith("http");
  const body = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{main}</span>
        {sub && <span className="mt-0.5 block text-xs leading-relaxed text-muted">{sub}</span>}
      </span>
      {source.href && <ExternalLink className={`mt-0.5 size-3.5 shrink-0 ${external ? "text-muted" : "text-accent"}`} />}
    </>
  );
  const cls = "flex items-start gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition hover:border-accent/50";
  if (!source.href) return <li className={cls}>{body}</li>;
  return (
    <li>
      {external ? (
        <a href={source.href} target="_blank" rel="noreferrer" className={cls}>
          {body}
        </a>
      ) : (
        <Link href={source.href} className={cls}>
          {body}
        </Link>
      )}
    </li>
  );
}

export function SourcesPanel({ sources, question, onClose }: { sources: Source[]; question: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="sources-title">
      <button type="button" aria-label="Close sources" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 id="sources-title" className="font-display text-lg font-bold">
              Sources in this answer
            </h2>
            {question && <p className="mt-1 line-clamp-2 text-sm text-muted">“{question}”</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {groups.map((g) => {
            const items = sources.filter((s) => s.kind === g.kind);
            if (items.length === 0) return null;
            return (
              <section key={g.kind}>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  <span className="text-accent">{g.icon}</span> {g.title}
                  <span className="font-normal">({items.length})</span>
                </h3>
                <ul className="flex flex-col gap-2">
                  {items.map((s) => (
                    <Item key={s.key} source={s} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
        <p className="border-t border-border px-5 py-3 text-xs leading-relaxed text-muted">
          Sections of the criminal codes open in Code Converter, and articles open in the Constitution. Other Acts and judgments open a search so you can read the
          original. Always check a citation before relying on it.
        </p>
      </div>
    </div>
  );
}
