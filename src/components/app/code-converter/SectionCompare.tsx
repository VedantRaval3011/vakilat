"use client";

import { ArrowLeft, ArrowLeftRight, Check, Copy, Loader2, NotebookPen, Share2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { createNote, saveNote } from "@/app/(app)/desk-actions";
import { SaveButton } from "@/components/app/desk/SaveButton";
import {
  changeKind,
  changeLabels,
  mappingSlug,
  type ConverterPair,
  type Mapping,
} from "@/lib/data/code-map";
import { routes } from "@/lib/navigation";

function CopyIcon({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      aria-label="Copy text"
      className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-foreground"
    >
      {done ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
    </button>
  );
}

function TextPane({
  code,
  full,
  section,
  text,
  empty,
}: {
  code: string;
  full: string;
  section: string | null;
  text?: string;
  empty: string;
}) {
  return (
    <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-surface">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold tracking-tight">
            <span className="text-muted">{code}</span>{" "}
            <span className="text-accent">{section ?? "—"}</span>
          </p>
          <p className="mt-0.5 text-xs text-muted">{full}</p>
        </div>
        {text && <CopyIcon text={text} />}
      </div>
      <div className="flex-1 px-4 py-4 sm:px-5">
        {text ? (
          <p className="whitespace-pre-line font-serif text-[15px] leading-7">{text}</p>
        ) : (
          <p className="text-sm text-muted">{empty}</p>
        )}
      </div>
    </div>
  );
}

export function SectionCompare({
  pair,
  entry,
  saved,
}: {
  pair: ConverterPair;
  entry: Mapping;
  saved: boolean;
}) {
  const kind = changeKind(entry);
  const slug = mappingSlug(entry);
  const href = routes.codeConverterSection(pair.slug, slug);
  const refKey = `${pair.slug}:${entry.old ?? "none"}:${entry.new ?? "none"}`;
  const title = entry.new
    ? `${pair.to} ${entry.new}${entry.old ? ` (formerly ${pair.from} ${entry.old})` : ""}`
    : `${pair.from} ${entry.old}`;
  const [noted, setNoted] = useState(false);
  const [shared, setShared] = useState(false);
  const [pending, start] = useTransition();

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : href;
    const body = `${title}\n${entry.subject ?? entry.title}\n\n${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: body, url });
        return;
      } catch {
        /* fall through to clipboard */
      }
    }
    await navigator.clipboard.writeText(body);
    setShared(true);
    setTimeout(() => setShared(false), 1800);
  }

  const btn =
    "flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-muted transition hover:bg-surface-2 hover:text-foreground disabled:opacity-50";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={routes.codeConverter(pair.slug)}
          className="flex w-fit items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to Code Converter
        </Link>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            className={btn}
            disabled={pending || noted}
            onClick={() =>
              start(async () => {
                const id = await createNote();
                const body = [
                  `Subject: ${entry.subject ?? entry.title}`,
                  entry.old ? `${pair.from} ${entry.old}` : `No ${pair.from} equivalent`,
                  entry.new ? `${pair.to} ${entry.new}` : `No ${pair.to} equivalent`,
                  "",
                  entry.oldText ? `— ${pair.from} —\n${entry.oldText}` : "",
                  entry.newText ? `— ${pair.to} —\n${entry.newText}` : "",
                  entry.note ? `\nNote: ${entry.note}` : "",
                ]
                  .filter(Boolean)
                  .join("\n");
                await saveNote(id, {
                  title: title.slice(0, 200),
                  body,
                  tag: "Code Converter",
                  pinned: false,
                });
                setNoted(true);
              })
            }
          >
            {noted ? (
              <Check className="size-3.5 text-accent" />
            ) : pending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <NotebookPen className="size-3.5" />
            )}
            {noted ? "Saved to Notes" : "Notes"}
          </button>
          <button type="button" className={btn} onClick={share}>
            {shared ? <Check className="size-3.5 text-accent" /> : <Share2 className="size-3.5" />}
            {shared ? "Copied" : "Share"}
          </button>
          <SaveButton
            label
            initialSaved={saved}
            target={{
              kind: "section",
              refKey,
              title,
              subtitle: entry.subject ?? entry.title,
              href,
            }}
          />
        </div>
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Section comparison</h1>
        <p className="mt-1 text-muted">
          {pair.fromFull} <span className="text-accent">→</span> {pair.toFull}
        </p>
      </div>

      <dl className="grid gap-4 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-5">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">Subject</dt>
          <dd className="mt-1 text-sm font-medium">{entry.subject ?? entry.title}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">Change type</dt>
          <dd className="mt-1">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                kind === "new"
                  ? "bg-emerald-500/15 text-emerald-500"
                  : kind === "dropped"
                    ? "bg-amber-500/15 text-amber-500"
                    : kind === "amended"
                      ? "bg-sky-500/15 text-sky-400"
                      : "bg-surface-2 text-muted"
              }`}
            >
              {changeLabels[kind]}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">{pair.from} section</dt>
          <dd className="mt-1 font-display text-lg font-semibold text-accent">{entry.old ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">{pair.to} section</dt>
          <dd className="mt-1 font-display text-lg font-semibold text-accent">{entry.new ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">Legacy statute</dt>
          <dd className="mt-1 text-sm">{pair.fromFull}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">Current statute</dt>
          <dd className="mt-1 text-sm">{pair.toFull}</dd>
        </div>
      </dl>

      {entry.note && (
        <p className="rounded-xl border border-border bg-surface-2/50 px-4 py-3 text-sm text-muted">{entry.note}</p>
      )}

      <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <TextPane
          code={pair.from}
          full={pair.fromFull}
          section={entry.old}
          text={entry.oldText}
          empty={entry.old ? "Full text for this section is being added." : `No ${pair.from} equivalent.`}
        />
        <div className="grid place-items-center">
          <span className="grid size-10 rotate-90 place-items-center rounded-full border border-border bg-background text-accent lg:rotate-0">
            <ArrowLeftRight className="size-4" />
          </span>
        </div>
        <TextPane
          code={pair.to}
          full={pair.toFull}
          section={entry.new}
          text={entry.newText}
          empty={entry.new ? "Full text for this section is being added." : `No ${pair.to} equivalent.`}
        />
      </div>
    </div>
  );
}
