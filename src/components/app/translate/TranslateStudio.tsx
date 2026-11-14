"use client";

import {
  FileDown,
  FileText,
  Languages,
  Loader2,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { deleteTranslateItem, loadTranslateItem, rateTranslateItem } from "@/app/(app)/translate/actions";
import { downloadWord, printDocument } from "@/lib/export-doc";
import { extractUploadText } from "@/lib/translate/extract-client";
import {
  TRANSLATE_MAX_BYTES,
  TRANSLATE_MAX_CHARS,
  translateAccept,
  translateLangByCode,
  translateLanguages,
  type TranslateLangCode,
} from "@/lib/translate/languages";
import type { TranslationSummary } from "@/lib/translate/types";

type Mode = "text" | "file";
type Result = { id: string; title: string; language: string; result: string };

export function TranslateStudio({ history: initialHistory }: { history: TranslationSummary[] }) {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string>();
  const [fileNote, setFileNote] = useState<string>();
  const [language, setLanguage] = useState<TranslateLangCode>("hi");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState(initialHistory);
  const [rating, setRating] = useState<-1 | 0 | 1>(0);
  const [histPending, startHist] = useTransition();

  const langLabel = useMemo(() => translateLangByCode(language)?.name ?? language, [language]);
  const canRun = !pending && !!language && text.trim().length > 0;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(undefined);
    setFileNote(undefined);
    if (file.size > TRANSLATE_MAX_BYTES) {
      setError("Files must be 20 MB or smaller.");
      return;
    }
    const extracted = await extractUploadText(file);
    if (!extracted.text.trim()) {
      setError(extracted.note || "Could not read that file.");
      return;
    }
    setFileName(file.name);
    setFileNote(extracted.note);
    setText(extracted.text.slice(0, TRANSLATE_MAX_CHARS));
    setMode("file");
  }

  async function translate() {
    if (!canRun) return;
    setPending(true);
    setError(undefined);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language, fileName }),
      });
      const data = (await res.json().catch(() => null)) as
        | { error?: string; id?: string; title?: string; language?: string; result?: string }
        | null;
      if (!res.ok || !data?.result || !data.id) {
        setError(data?.error || "Translation failed. Please try again.");
        return;
      }
      const next = { id: data.id, title: data.title || "Translation", language: data.language || language, result: data.result };
      setResult(next);
      setRating(0);
      setHistory((h) => [
        { id: next.id, title: next.title, targetLang: next.language, rating: null, createdAt: new Date().toISOString() },
        ...h,
      ]);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
      <div className="flex flex-col gap-5">
        <div className="flex w-fit rounded-xl border border-border bg-surface p-1">
          {(
            [
              { id: "file", label: "Upload file" },
              { id: "text", label: "Paste text" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === m.id ? "bg-accent text-black" : "text-muted hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === "file" ? (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center transition hover:border-accent/50">
            <span className="grid size-12 place-items-center rounded-xl bg-accent/12 text-accent">
              <Upload className="size-5" />
            </span>
            <span className="font-semibold">{fileName ? fileName : "Drop a PDF or Word file, or click to browse"}</span>
            <span className="text-sm text-muted">PDF, DOCX or TXT · up to 20 MB</span>
            <input
              type="file"
              accept={translateAccept}
              className="hidden"
              onChange={(e) => {
                void onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {fileName && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFileName(undefined);
                  setFileNote(undefined);
                  setText("");
                }}
                className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted hover:text-foreground"
              >
                <X className="size-3.5" /> Clear file
              </button>
            )}
          </label>
        ) : null}

        {(mode === "text" || text) && (
          <div className="flex flex-col gap-2">
            <label htmlFor="translate-source" className="text-xs font-semibold text-muted">
              Source text
            </label>
            <textarea
              id="translate-source"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, TRANSLATE_MAX_CHARS))}
              rows={mode === "text" ? 12 : 8}
              placeholder="Paste the judgment excerpt, notice or order to translate…"
              className="w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none transition placeholder:text-muted focus:border-accent/60"
            />
            <p className="text-xs text-muted">
              {text.length.toLocaleString("en-IN")} / {TRANSLATE_MAX_CHARS.toLocaleString("en-IN")} characters
              {fileNote ? ` · ${fileNote}` : ""}
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted">Target language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as TranslateLangCode)}
              className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-accent/60"
            >
              {translateLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.native})
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col justify-end">
            <button
              type="button"
              disabled={!canRun}
              onClick={() => void translate()}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Languages className="size-4" />}
              {pending ? "Translating…" : "Translate"}
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {result && (
          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">{result.title}</h2>
                <p className="text-xs text-muted">Translated into {langLabel}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => printDocument(result.title, result.result)}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-surface-2"
                >
                  <FileDown className="size-3.5" /> PDF
                </button>
                <button
                  type="button"
                  onClick={() => downloadWord(result.title, result.result)}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-surface-2"
                >
                  <FileText className="size-3.5" /> Word
                </button>
                <button
                  type="button"
                  aria-label="Helpful"
                  aria-pressed={rating === 1}
                  onClick={() => {
                    const next = rating === 1 ? 0 : 1;
                    setRating(next);
                    startHist(async () => rateTranslateItem(result.id, next));
                  }}
                  className={`grid size-9 place-items-center rounded-lg border border-border ${rating === 1 ? "text-accent" : "text-muted"} hover:bg-surface-2`}
                >
                  <ThumbsUp className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Not helpful"
                  aria-pressed={rating === -1}
                  onClick={() => {
                    const next = rating === -1 ? 0 : -1;
                    setRating(next);
                    startHist(async () => rateTranslateItem(result.id, next));
                  }}
                  className={`grid size-9 place-items-center rounded-lg border border-border ${rating === -1 ? "text-red-400" : "text-muted"} hover:bg-surface-2`}
                >
                  <ThumbsDown className="size-4" />
                </button>
              </div>
            </div>
            <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl bg-background/60 p-4 font-sans text-sm leading-relaxed">
              {result.result}
            </pre>
          </section>
        )}
      </div>

      <aside className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold">Recent translations</h2>
        {history.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
            Your translations will appear here.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((h) => {
              const lang = translateLangByCode(h.targetLang)?.name ?? h.targetLang;
              return (
                <li key={h.id} className="rounded-xl border border-border bg-surface px-3.5 py-3">
                  <p className="truncate text-sm font-semibold">{h.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {lang}
                    {h.rating === 1 ? " · liked" : h.rating === -1 ? " · disliked" : ""}
                  </p>
                  <div className="mt-2 flex gap-1">
                    <button
                      type="button"
                      disabled={histPending}
                      onClick={() =>
                        startHist(async () => {
                          const full = await loadTranslateItem(h.id);
                          if (!full) return;
                          setResult({ id: full.id, title: full.title, language: full.targetLang, result: full.resultText });
                          setText(full.sourceText);
                          setFileName(full.sourceName ?? undefined);
                          setLanguage((full.targetLang as TranslateLangCode) || "hi");
                          setRating(full.rating === 1 || full.rating === -1 ? full.rating : 0);
                        })
                      }
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-accent hover:bg-surface-2"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      disabled={histPending}
                      onClick={() =>
                        startHist(async () => {
                          await deleteTranslateItem(h.id);
                          setHistory((list) => list.filter((x) => x.id !== h.id));
                          if (result?.id === h.id) setResult(null);
                        })
                      }
                      className="grid size-7 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-400"
                      aria-label="Delete translation"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
    </div>
  );
}
