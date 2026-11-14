"use client";

import { Check, ChevronDown, Copy, Search, X } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { SaveButton } from "@/components/app/desk/SaveButton";
import { parts, preamble, schedules, type Article, type Part } from "@/lib/data/constitution";
import { routes } from "@/lib/navigation";

type Tab = "preamble" | "parts" | "schedules";

const tabs: { key: Tab; label: string }[] = [
  { key: "preamble", label: "Preamble" },
  { key: "parts", label: `Parts (${parts.length})` },
  { key: "schedules", label: `Schedules (${schedules.length})` },
];

function CopyCitation({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted transition hover:bg-surface-2 hover:text-foreground"
    >
      {done ? <Check className="size-3.5 text-accent" /> : <Copy className="size-3.5" />}
      {done ? "Copied" : "Copy citation"}
    </button>
  );
}

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function useHashArticle() {
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => "",
  );
  const number = hash.startsWith("#article-") ? hash.slice("#article-".length) : "";
  for (const p of parts) {
    const a = p.articles?.find((x) => x.number.toLowerCase() === number);
    if (a) return { part: p.number, article: a.number };
  }
  return null;
}

function ArticleItem({ article, saved, defaultOpen = false }: { article: Article; saved: boolean; defaultOpen?: boolean }) {
  const [toggled, setToggled] = useState<boolean | null>(null);
  const open = toggled ?? defaultOpen;
  return (
    <li
      id={`article-${article.number.toLowerCase()}`}
      className="scroll-mt-24 rounded-xl border border-border bg-background target:border-accent target:ring-2 target:ring-accent/30"
    >
      <button
        type="button"
        onClick={() => setToggled(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-4 py-3.5 text-left"
      >
        <span className="grid h-9 min-w-12 shrink-0 place-items-center rounded-lg bg-accent/12 px-2 font-display text-sm font-bold text-accent">
          {article.number}
        </span>
        <span className={`min-w-0 flex-1 text-sm font-medium ${article.repealed ? "text-muted line-through" : ""}`}>
          {article.heading}
        </span>
        {article.repealed && (
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold uppercase text-muted">Repealed</span>
        )}
        <ChevronDown className={`size-4 shrink-0 text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-border px-4 py-4">
          {article.text ? (
            <p className="whitespace-pre-line font-serif text-[15px] leading-7">{article.text}</p>
          ) : (
            <p className="text-sm text-muted">
              {article.repealed ? "This article has been repealed." : "The full text of this article is being added."}
            </p>
          )}
          <div className="mt-3 flex justify-end gap-1">
            <SaveButton
              label
              initialSaved={saved}
              target={{
                kind: "article",
                refKey: article.number,
                title: `Article ${article.number}, Constitution of India`,
                subtitle: article.heading,
                href: `${routes.constitution}#article-${article.number.toLowerCase()}`,
              }}
            />
            <CopyCitation text={`Article ${article.number}, Constitution of India`} />
          </div>
        </div>
      )}
    </li>
  );
}

function PartDetail({ part, saved, target }: { part: Part; saved: Set<string>; target?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Part {part.number}</p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">{part.title}</h2>
        <p className="mt-1 text-sm text-muted">
          {part.range.includes("–") ? "Articles" : "Article"} {part.range}
          {part.repealed && " · Repealed"}
        </p>
      </div>
      {part.articles ? (
        <ul className="flex flex-col gap-2">
          {part.articles.map((a) => (
            <ArticleItem key={a.number} article={a} saved={saved.has(a.number)} defaultOpen={a.number === target} />
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted">
          {part.repealed
            ? "This Part was repealed by the Constitution (Seventh Amendment) Act, 1956."
            : "Articles for this Part are being added."}
        </div>
      )}
    </div>
  );
}

export function ConstitutionReader({ savedKeys }: { savedKeys: string[] }) {
  const saved = useMemo(() => new Set(savedKeys), [savedKeys]);
  const [tab, setTab] = useState<Tab>("parts");
  const target = useHashArticle();
  const [partNo, setPartNo] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const part = parts.find((p) => p.number === (partNo ?? target?.part ?? "III")) ?? parts[0];

  const targetArticle = target?.article;
  useEffect(() => {
    if (targetArticle) document.getElementById(`article-${targetArticle.toLowerCase()}`)?.scrollIntoView({ block: "start" });
  }, [targetArticle]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const articles = parts.flatMap((p) =>
      (p.articles ?? [])
        .filter(
          (a) => a.number.toLowerCase() === q || a.heading.toLowerCase().includes(q) || a.text?.toLowerCase().includes(q),
        )
        .map((a) => ({ part: p, article: a })),
    );
    const matchedParts = parts.filter((p) => p.title.toLowerCase().includes(q) || p.number.toLowerCase() === q);
    return { articles, parts: matchedParts };
  }, [query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key && !results}
              onClick={() => {
                setTab(t.key);
                setQuery("");
              }}
              className={`h-10 rounded-full border px-4 text-sm font-semibold transition ${
                tab === t.key && !results
                  ? "border-accent bg-accent text-black"
                  : "border-border text-muted hover:border-accent/50 hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Article number or keyword, e.g. 21, liberty"
            aria-label="Search the Constitution"
            className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-10 text-sm outline-none transition placeholder:text-muted focus:border-accent/60"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {results ? (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-muted" aria-live="polite">
            {results.articles.length + results.parts.length}{" "}
            {results.articles.length + results.parts.length === 1 ? "result" : "results"} for “{query.trim()}”
          </p>
          {results.parts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {results.parts.map((p) => (
                <button
                  key={p.number}
                  type="button"
                  onClick={() => {
                    setPartNo(p.number);
                    setTab("parts");
                    setQuery("");
                  }}
                  className="rounded-xl border border-border bg-surface px-4 py-2.5 text-left text-sm transition hover:border-accent/50"
                >
                  <span className="font-semibold text-accent">Part {p.number}</span> · {p.title}
                </button>
              ))}
            </div>
          )}
          <ul className="flex flex-col gap-2">
            {results.articles.map(({ part: p, article }) => (
              <ArticleItem key={`${p.number}-${article.number}`} article={article} saved={saved.has(article.number)} defaultOpen />
            ))}
          </ul>
          {results.articles.length + results.parts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted">
              Nothing matches. Try an article number such as 14, or a word such as equality.
            </div>
          )}
        </div>
      ) : tab === "preamble" ? (
        <article className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-10 text-center sm:px-14 sm:py-14">
          <span aria-hidden className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">The Preamble</p>
          <div className="relative mx-auto mt-6 flex max-w-3xl flex-col gap-4 font-serif text-lg leading-8 sm:text-xl sm:leading-9">
            <p className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{preamble.opening}</p>
            <p>{preamble.resolve}</p>
            <div className="flex flex-col gap-1">
              {preamble.ideals.map((i) => (
                <p key={i.word}>
                  <span className="font-semibold text-accent">{i.word}</span> {i.rest}
                </p>
              ))}
            </div>
            <p>{preamble.promote}</p>
            <p>
              <span className="font-semibold text-accent">{preamble.fraternity.word}</span> {preamble.fraternity.rest}
            </p>
            <p>{preamble.closing}</p>
          </div>
          <div className="relative mt-8 flex justify-center">
            <CopyCitation text="Preamble, Constitution of India" />
          </div>
        </article>
      ) : tab === "schedules" ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {schedules.map((s) => (
            <li key={s.number} className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-background font-display font-bold text-accent">
                {s.number}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Schedule {s.number}</p>
                <p className="mt-1 text-sm font-medium leading-relaxed">{s.title}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <nav aria-label="Parts" className="lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto">
            <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
              {parts.map((p) => {
                const active = p.number === part.number;
                return (
                  <li key={p.number} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setPartNo(p.number)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                        active ? "bg-accent/12 text-accent" : "text-foreground/85 hover:bg-surface-2"
                      }`}
                    >
                      <span className="w-10 shrink-0 font-display text-xs font-bold">{p.number}</span>
                      <span className={`whitespace-nowrap lg:truncate lg:whitespace-normal ${p.repealed ? "text-muted line-through" : ""}`}>
                        {p.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          <PartDetail key={part.number} part={part} saved={saved} target={target?.article} />
        </div>
      )}
    </div>
  );
}
