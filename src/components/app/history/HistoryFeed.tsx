"use client";

import { ExternalLink, FileDown, FileText, Gavel, History, Languages, Loader2, PenLine, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { exportHistoryItem } from "@/app/(app)/history/actions";
import { downloadWord, printDocument } from "@/lib/export-doc";
import type { HistoryItem, HistoryKind } from "@/lib/history/types";

type Tab = "all" | HistoryKind;
type Sort = "newest" | "oldest";

const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "chat", label: "Chats" },
  { id: "draft", label: "Drafts" },
  { id: "moot", label: "Moot" },
  { id: "translation", label: "Translate" },
];

const kindMeta: Record<HistoryKind, { label: string; icon: typeof Sparkles }> = {
  chat: { label: "Chat", icon: Sparkles },
  draft: { label: "Draft", icon: PenLine },
  moot: { label: "Moot", icon: Gavel },
  translation: { label: "Translate", icon: Languages },
};

function relativeWhen(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

function ExportButtons({ item }: { item: HistoryItem }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();

  function run(mode: "pdf" | "word") {
    setError(undefined);
    start(async () => {
      const doc = await exportHistoryItem(item.kind, item.id);
      if (!doc) {
        setError("Could not export this item.");
        return;
      }
      if (mode === "word") downloadWord(doc.title, doc.body);
      else printDocument(doc.title, doc.body);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={pending}
          onClick={() => run("pdf")}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-semibold text-muted transition hover:bg-surface-2 hover:text-foreground disabled:opacity-50"
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <FileDown className="size-3.5" />}
          PDF
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run("word")}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-semibold text-muted transition hover:bg-surface-2 hover:text-foreground disabled:opacity-50"
        >
          <FileText className="size-3.5" />
          Word
        </button>
        <Link
          href={item.href}
          aria-label={`Open ${item.title}`}
          className="grid size-8 place-items-center rounded-lg border border-border text-muted transition hover:bg-surface-2 hover:text-foreground"
        >
          <ExternalLink className="size-3.5" />
        </Link>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function HistoryFeed({ items }: { items: HistoryItem[] }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [sort, setSort] = useState<Sort>("newest");

  const counts = useMemo(() => {
    const c = { all: items.length, chat: 0, draft: 0, moot: 0, translation: 0 };
    for (const i of items) c[i.kind]++;
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = tab === "all" ? items : items.filter((i) => i.kind === tab);
    if (q) list = list.filter((i) => i.title.toLowerCase().includes(q) || i.subtitle.toLowerCase().includes(q));
    return [...list].sort((a, b) =>
      sort === "newest" ? b.updatedAt.localeCompare(a.updatedAt) : a.updatedAt.localeCompare(b.updatedAt),
    );
  }, [items, query, tab, sort]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title…"
            className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm outline-none transition placeholder:text-muted focus:border-accent/60"
          />
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          aria-label="Sort order"
          className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-accent/60"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Activity type">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
              tab === t.id ? "bg-accent text-black" : "bg-surface text-muted hover:text-foreground"
            }`}
          >
            {t.label} {counts[t.id]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <History className="size-8 text-muted" />
          <p className="font-medium">{items.length === 0 ? "No activity yet" : "No matches"}</p>
          <p className="max-w-sm text-sm text-muted">
            {items.length === 0
              ? "Vidhi chats, drafts and moot sessions will show up here as you work."
              : "Try a different search or tab."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {filtered.map((item) => {
            const meta = kindMeta[item.kind];
            const Icon = meta.icon;
            return (
              <li
                key={`${item.kind}-${item.id}`}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface px-4 py-3.5 sm:px-5"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-background text-accent">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={item.href} className="block truncate font-semibold hover:text-accent">
                    {item.title}
                  </Link>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                    <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-semibold uppercase tracking-wide">{meta.label}</span>
                    <span>{item.subtitle}</span>
                    <span aria-hidden>·</span>
                    <time dateTime={item.updatedAt}>{relativeWhen(item.updatedAt)}</time>
                  </p>
                </div>
                <ExportButtons item={item} />
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-muted">
        Showing {filtered.length} of {items.length} {items.length === 1 ? "entry" : "entries"}
      </p>
    </div>
  );
}
