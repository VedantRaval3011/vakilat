"use client";

import { ArrowRight, Check, Copy, Info, Mic, MicOff, Search, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { SaveButton } from "@/components/app/desk/SaveButton";
import { useDictation } from "@/components/app/useDictation";
import {
  changeKind,
  changeLabels,
  mappingSlug,
  type ConverterPair,
  type Mapping,
} from "@/lib/data/code-map";
import { routes } from "@/lib/navigation";

type Filter = "all" | "new" | "dropped" | "amended";

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");

const mappingKey = (e: Mapping) => `${e.old ?? "none"}:${e.new ?? "none"}`;
const rowId = (e: Mapping) => `s-${mappingSlug(e)}`;

function matches(entry: Mapping, oldQ: string, newQ: string, subject: string, fullText: string) {
  if (oldQ && !(entry.old && norm(entry.old).startsWith(norm(oldQ)))) return false;
  if (newQ && !(entry.new && norm(entry.new).startsWith(norm(newQ)))) return false;
  if (subject) {
    const s = subject.toLowerCase();
    const hay = `${entry.subject ?? ""} ${entry.title} ${entry.note ?? ""}`.toLowerCase();
    if (!hay.includes(s)) return false;
  }
  if (fullText) {
    const f = fullText.toLowerCase();
    const hay = `${entry.oldText ?? ""} ${entry.newText ?? ""} ${entry.title} ${entry.note ?? ""}`.toLowerCase();
    if (!hay.includes(f)) return false;
  }
  return true;
}

function SectionCard({
  code,
  section,
  title,
  preview,
  empty,
  actions,
}: {
  code: string;
  section: string | null;
  title: string;
  preview?: string;
  empty: string;
  actions?: ReactNode;
}) {
  if (!section) {
    return (
      <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-border px-4 py-5 text-center text-sm text-muted">
        {empty}
      </div>
    );
  }
  return (
    <div className="min-w-0 rounded-xl border border-border bg-background px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-lg font-semibold">
          <span className="text-muted">{code}</span> <span className="text-accent">{section}</span>
        </p>
        {actions && <div className="flex shrink-0 items-center">{actions}</div>}
      </div>
      <p className="mt-1 text-sm font-medium leading-relaxed">{title}</p>
      {preview && (
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted">{preview}</p>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      aria-label={`Copy ${text}`}
      className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-foreground"
    >
      {done ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
    </button>
  );
}

export function CodeConverter({
  pair,
  pairs,
  savedKeys,
}: {
  pair: ConverterPair;
  pairs: Pick<ConverterPair, "slug" | "from" | "to">[];
  savedKeys: string[];
}) {
  const saved = useMemo(() => new Set(savedKeys), [savedKeys]);
  const params = useSearchParams();
  const [oldQ, setOldQ] = useState(() => params.get("old")?.slice(0, 20) ?? "");
  const [newQ, setNewQ] = useState(() => params.get("new")?.slice(0, 20) ?? "");
  const [subject, setSubject] = useState(() => params.get("subject")?.slice(0, 80) ?? "");
  const [fullText, setFullText] = useState(() => params.get("q")?.slice(0, 120) ?? "");
  const [filter, setFilter] = useState<Filter>("all");
  const { listening, toggle: toggleMic } = useDictation(setSubject);

  const results = useMemo(
    () =>
      pair.entries.filter((e) => {
        const kind = changeKind(e);
        if (filter === "new" && kind !== "new") return false;
        if (filter === "dropped" && kind !== "dropped") return false;
        if (filter === "amended" && kind !== "amended") return false;
        return matches(e, oldQ.trim(), newQ.trim(), subject.trim(), fullText.trim());
      }),
    [pair.entries, filter, oldQ, newQ, subject, fullText],
  );

  const counts = {
    all: pair.entries.length,
    new: pair.entries.filter((e) => changeKind(e) === "new").length,
    dropped: pair.entries.filter((e) => changeKind(e) === "dropped").length,
    amended: pair.entries.filter((e) => changeKind(e) === "amended").length,
  };

  const hasQuery = oldQ || newQ || subject || fullText || filter !== "all";
  const inputCls =
    "h-11 w-full min-w-0 rounded-xl border border-border bg-surface px-4 text-sm outline-none transition placeholder:text-muted focus:border-accent/60";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Code pairs">
        {pairs.map((p) => {
          const active = p.slug === pair.slug;
          return (
            <Link
              key={p.slug}
              href={routes.codeConverter(p.slug)}
              role="tab"
              aria-selected={active}
              className={`flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
                active ? "border-accent bg-accent text-black" : "border-border text-muted hover:border-accent/50 hover:text-foreground"
              }`}
            >
              {p.from} <ArrowRight className="size-3.5" /> {p.to}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-3 rounded-2xl border border-border bg-surface/50 p-3 sm:grid-cols-2 lg:grid-cols-3">
        <input
          value={oldQ}
          onChange={(e) => setOldQ(e.target.value)}
          placeholder={`${pair.from} section, e.g. ${pair.example}`}
          aria-label={`${pair.from} section`}
          className={inputCls}
        />
        <input
          value={newQ}
          onChange={(e) => setNewQ(e.target.value)}
          placeholder={`${pair.to} section`}
          aria-label={`${pair.to} section`}
          className={inputCls}
        />
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject, e.g. murder, bail, confession"
            aria-label="Subject search"
            className={`${inputCls} pl-10 pr-12`}
          />
          <button
            type="button"
            onClick={toggleMic}
            aria-label={listening ? "Stop voice search" : "Search by voice"}
            className={`absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg transition ${
              listening ? "bg-red-500/15 text-red-400" : "text-muted hover:bg-surface-2 hover:text-foreground"
            }`}
          >
            {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          </button>
        </div>
        <input
          value={fullText}
          onChange={(e) => setFullText(e.target.value)}
          placeholder="Full-text search across section wording"
          aria-label="Full-text search"
          className={`${inputCls} sm:col-span-2`}
        />
        <button
          type="button"
          disabled={!hasQuery}
          onClick={() => {
            setOldQ("");
            setNewQ("");
            setSubject("");
            setFullText("");
            setFilter("all");
          }}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold transition hover:bg-surface-2 disabled:opacity-40"
        >
          <X className="size-4" /> Clear
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All sections"],
              ["amended", "Amended"],
              ["new", "New provisions"],
              ["dropped", "Not carried over"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`h-8 rounded-full px-3 text-xs font-semibold transition ${
                filter === key ? "bg-foreground text-background" : "bg-surface-2 text-muted hover:text-foreground"
              }`}
            >
              {label} <span className="opacity-60">{counts[key]}</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-muted" aria-live="polite">
          {results.length} {results.length === 1 ? "match" : "matches"}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <Search className="size-7 text-muted" />
          <p className="font-semibold">No sections match your search</p>
          <p className="text-sm text-muted">Try a different section number, subject or a broader keyword.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {results.map((e) => {
            const kind = changeKind(e);
            const status = kind === "mapped" ? null : changeLabels[kind];
            const refKey = `${pair.slug}:${mappingKey(e)}`;
            const sectionHref = routes.codeConverterSection(pair.slug, mappingSlug(e));
            const actions = (
              <>
                <SaveButton
                  initialSaved={saved.has(refKey)}
                  target={{
                    kind: "section",
                    refKey,
                    title: e.new ? `${pair.to} ${e.new}${e.old ? ` (formerly ${pair.from} ${e.old})` : ""}` : `${pair.from} ${e.old}`,
                    subtitle: e.subject ?? e.title,
                    href: sectionHref,
                  }}
                />
                {e.new && <CopyButton text={`Section ${e.new}, ${pair.toFull}`} />}
              </>
            );
            return (
              <li
                key={refKey}
                id={rowId(e)}
                className="scroll-mt-24 rounded-2xl border border-border bg-surface p-3 transition hover:border-accent/40 target:border-accent target:ring-2 target:ring-accent/30 sm:p-4"
              >
                <Link href={sectionHref} className="block outline-none">
                  <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
                    <SectionCard
                      code={pair.from}
                      section={e.old}
                      title={e.subject ?? e.title}
                      preview={e.oldText}
                      empty={`No ${pair.from} equivalent`}
                      actions={e.new ? undefined : <div onClick={(ev) => ev.preventDefault()}>{actions}</div>}
                    />
                    <div className="grid place-items-center">
                      <span className="grid size-9 rotate-90 place-items-center rounded-full border border-border bg-background text-accent md:rotate-0">
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                    <SectionCard
                      code={pair.to}
                      section={e.new}
                      title={e.subject ?? e.title}
                      preview={e.newText}
                      empty={`No ${pair.to} equivalent`}
                      actions={e.new ? <div onClick={(ev) => ev.preventDefault()}>{actions}</div> : undefined}
                    />
                  </div>
                </Link>
                {(status || e.note) && (
                  <div className="mt-3 px-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {status && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                            kind === "new"
                              ? "bg-emerald-500/15 text-emerald-500"
                              : kind === "dropped"
                                ? "bg-amber-500/15 text-amber-500"
                                : "bg-sky-500/15 text-sky-400"
                          }`}
                        >
                          {status}
                        </span>
                      )}
                      {e.note && (
                        <p className="flex items-start gap-1.5 text-sm text-muted">
                          <Info className="mt-0.5 size-3.5 shrink-0" /> {e.note}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
