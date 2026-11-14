"use client";

import { BookMarked, Check, Copy, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { SaveButton } from "@/components/app/desk/SaveButton";
import { glossary, glossaryCategories, type GlossaryCategory, type GlossaryTerm } from "@/lib/data/glossary";
import { routes } from "@/lib/navigation";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const termAnchor = (term: string) => `term-${term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

function TermCard({ item, saved }: { item: GlossaryTerm; saved: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <li
      id={termAnchor(item.term)}
      className="flex scroll-mt-24 flex-col gap-2 rounded-2xl border border-border bg-surface p-5 target:border-accent target:ring-2 target:ring-accent/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold leading-snug">{item.term}</h3>
          {item.literal && <p className="mt-0.5 font-serif text-sm italic text-muted">“{item.literal}”</p>}
        </div>
        <div className="flex shrink-0 items-center">
        <SaveButton
          initialSaved={saved}
          target={{
            kind: "term",
            refKey: item.term,
            title: item.term,
            subtitle: item.meaning,
            href: `${routes.glossary}#${termAnchor(item.term)}`,
          }}
        />
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(`${item.term}: ${item.meaning}`);
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          }}
          aria-label={`Copy meaning of ${item.term}`}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-foreground"
        >
          {done ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
        </button>
        </div>
      </div>
      <p className="text-sm leading-relaxed">{item.meaning}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-muted">{item.category}</span>
        {item.reference && (
          <span className="flex items-center gap-1 rounded-full bg-accent/12 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
            <BookMarked className="size-3" /> {item.reference}
          </span>
        )}
      </div>
    </li>
  );
}

export function GlossaryBrowser({ savedKeys }: { savedKeys: string[] }) {
  const saved = useMemo(() => new Set(savedKeys), [savedKeys]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GlossaryCategory | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return glossary
      .filter((t) => category === "All" || t.category === category)
      .filter(
        (t) =>
          !q ||
          t.term.toLowerCase().includes(q) ||
          t.meaning.toLowerCase().includes(q) ||
          t.literal?.toLowerCase().includes(q),
      )
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [query, category]);

  const groups = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    for (const t of filtered) {
      const l = t.term[0].toUpperCase();
      map.set(l, [...(map.get(l) ?? []), t]);
    }
    return map;
  }, [filtered]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/50 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a term, maxim or meaning, e.g. res judicata, bail"
            aria-label="Search the glossary"
            className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-11 text-[15px] outline-none transition placeholder:text-muted focus:border-accent/60"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {(["All", ...glossaryCategories] as const).map((c) => {
            const count = c === "All" ? glossary.length : glossary.filter((t) => t.category === c).length;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`h-8 rounded-full px-3 text-xs font-semibold transition ${
                  category === c ? "bg-foreground text-background" : "bg-surface-2 text-muted hover:text-foreground"
                }`}
              >
                {c} <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <nav aria-label="Jump to letter" className="flex flex-wrap gap-1">
        {letters.map((l) => {
          const has = groups.has(l);
          return has ? (
            <a
              key={l}
              href={`#letter-${l}`}
              className="grid size-8 place-items-center rounded-md font-display text-sm font-semibold text-foreground transition hover:bg-accent hover:text-black"
            >
              {l}
            </a>
          ) : (
            <span key={l} className="grid size-8 place-items-center font-display text-sm text-muted/40">
              {l}
            </span>
          );
        })}
      </nav>

      <p className="text-sm text-muted" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "term" : "terms"}
      </p>

      {filtered.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <Search className="size-7 text-muted" />
          <p className="font-semibold">No terms match your search</p>
          <p className="text-sm text-muted">Try a shorter word or pick a different topic.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {[...groups.entries()].map(([letter, items]) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-24">
              <div className="mb-3 flex items-center gap-3">
                <span className="font-display text-2xl font-bold text-accent">{letter}</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <ul className="grid gap-3 md:grid-cols-2">
                {items.map((t) => (
                  <TermCard key={t.term} item={t} saved={saved.has(t.term)} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
