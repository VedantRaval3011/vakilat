"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  FileUp,
  KeyRound,
  Loader2,
  MessageSquarePlus,
  Paperclip,
  Printer,
  Send,
  Sparkles,
  Square,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { deleteDraft, saveGuidedDraft, startGuidedDraft } from "@/app/(app)/draft-studio/actions";
import { errorText } from "@/lib/ai/errors";
import { downloadWord, printDocument } from "@/lib/export-doc";
import { draftLanguages, guidedSuggestions } from "@/lib/drafts/templates";
import { routes } from "@/lib/navigation";
import { extractUploadText } from "@/lib/translate/extract-client";

const DRAFT_RE = /<<<DRAFT>>>\s*([\s\S]*?)\s*<<<END>>>/;

function textOf(m: UIMessage) {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

function splitDraft(raw: string) {
  const m = raw.match(DRAFT_RE);
  if (!m) return { chat: raw, draft: null as string | null };
  return {
    chat: raw.replace(DRAFT_RE, "").trim(),
    draft: m[1].trim(),
  };
}

export function DraftChat({
  draftId,
  initialMessages,
  initialBody,
  initialTitle,
  initialLanguage,
  configured,
  remaining: initialRemaining,
}: {
  draftId: string;
  initialMessages: UIMessage[];
  initialBody: string;
  initialTitle: string;
  initialLanguage: string;
  configured: boolean;
  remaining: number;
}) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState(initialLanguage);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [remaining, setRemaining] = useState(initialRemaining);
  const [copied, setCopied] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [starting, startNew] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/draft/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: { id, message: messages.at(-1), language },
        }),
      }),
    [language],
  );

  const { messages, sendMessage, status, error, stop, clearError } = useChat<UIMessage>({
    id: draftId,
    messages: initialMessages,
    transport,
    onFinish: ({ message }) => {
      const { draft } = splitDraft(textOf(message));
      if (draft) {
        setBody(draft);
        void saveGuidedDraft(draftId, { body: draft, language });
      }
      router.replace(`${routes.draftStudio}?d=${draftId}`, { scroll: false });
    },
  });

  const busy = status === "submitted" || status === "streaming";
  const canSend = configured && !busy && remaining > 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  const streamedDraft = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role !== "assistant") continue;
      const { draft } = splitDraft(textOf(messages[i]));
      if (draft) return draft;
    }
    return null;
  }, [messages]);

  const shownBody = body || streamedDraft || "";

  function ask(text: string) {
    const q = text.trim();
    if (!q || !canSend) return;
    if (error) clearError();
    sendMessage({ text: q });
    setRemaining((r) => r - 1);
    setInput("");
    setUploadNote(null);
    if (title === "Guided draft" || title.startsWith("Guided draft")) {
      const next = q.slice(0, 80).replace(/\s+/g, " ");
      setTitle(next);
      void saveGuidedDraft(draftId, { title: next, language });
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadNote(null);
    try {
      const { text, note } = await extractUploadText(file);
      if (note) setUploadNote(note);
      if (text.trim()) {
        setInput((prev) =>
          prev.trim()
            ? `${prev.trim()}\n\n[From ${file.name}]\n${text.trim().slice(0, 12_000)}`
            : `Please use this uploaded brief (${file.name}) when drafting:\n\n${text.trim().slice(0, 12_000)}`,
        );
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const fieldClass =
    "h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-accent/60 [color-scheme:light] dark:[color-scheme:dark]";
  const toolBtn =
    "flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-foreground disabled:opacity-40";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <section className="flex min-h-[70vh] flex-col rounded-2xl border border-border bg-surface">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          <Link href={routes.draftStudio} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
            <ArrowLeft className="size-4" /> Templates
          </Link>
          <span className="mx-1 h-4 w-px bg-border" />
          <Sparkles className="size-4 text-accent" />
          <span className="font-display text-sm font-semibold">Guided draft</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-muted">
              Language
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  void saveGuidedDraft(draftId, { language: e.target.value });
                }}
                className={`${fieldClass} h-8 py-0`}
              >
                {draftLanguages.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={starting}
              className={toolBtn}
              onClick={() =>
                startNew(async () => {
                  try {
                    const id = await startGuidedDraft(language);
                    router.push(`${routes.draftStudio}?d=${id}`);
                  } catch (e) {
                    alert(e instanceof Error ? e.message : "Could not start a new draft.");
                  }
                })
              }
            >
              <MessageSquarePlus className="size-4" /> New
            </button>
            <button
              type="button"
              disabled={deleting}
              className={`${toolBtn} hover:text-red-400`}
              onClick={() => {
                if (!confirm("Delete this guided draft?")) return;
                startDelete(async () => {
                  await deleteDraft(draftId);
                  router.push(routes.draftStudio);
                });
              }}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        {!configured && (
          <p className="mx-4 mt-4 flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm">
            <KeyRound className="mt-0.5 size-4 shrink-0 text-amber-400" />
            Add an AI provider key to <code className="font-mono">.env.local</code> to use guided drafting.
          </p>
        )}

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6">
          {messages.length === 0 && (
            <div className="mx-auto flex max-w-lg flex-col gap-4 py-8 text-center">
              <p className="font-display text-xl font-semibold">Describe the document you need</p>
              <p className="text-sm text-muted">
                Vidhi will ask a few questions, then produce a first draft. You can also upload a PDF or Word brief.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {guidedSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={!canSend}
                    onClick={() => ask(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-left text-xs font-medium transition hover:border-accent/50 hover:text-accent disabled:opacity-40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const raw = textOf(m);
            const { chat, draft } = m.role === "assistant" ? splitDraft(raw) : { chat: raw, draft: null };
            return (
              <div
                key={m.id}
                className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user" ? "ml-auto bg-accent/15 text-foreground" : "mr-auto border border-border bg-background"
                }`}
              >
                {chat && <p className="whitespace-pre-wrap">{chat}</p>}
                {draft && (
                  <p className="mt-2 text-xs font-semibold text-accent">Draft ready — see the editor on the right.</p>
                )}
              </div>
            );
          })}
          {busy && (
            <p className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="size-4 animate-spin" /> Thinking…
            </p>
          )}
          {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">{errorText(error)}</p>}
          <div ref={endRef} />
        </div>

        <form
          className="border-t border-border p-3 sm:p-4"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          {uploadNote && (
            <p className="mb-2 flex items-start justify-between gap-2 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">
              <span>{uploadNote}</span>
              <button type="button" aria-label="Dismiss" onClick={() => setUploadNote(null)}>
                <X className="size-3.5" />
              </button>
            </p>
          )}
          <div className="flex items-end gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="hidden"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            <button
              type="button"
              disabled={uploading || !configured}
              onClick={() => fileRef.current?.click()}
              aria-label="Upload a brief"
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-border text-muted transition hover:bg-surface-2 hover:text-foreground disabled:opacity-40"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />}
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              maxLength={16_000}
              placeholder="e.g. I need a rental agreement for my flat in Mumbai…"
              disabled={!configured}
              className="min-h-11 flex-1 resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-accent/60 disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
            />
            {busy ? (
              <button
                type="button"
                onClick={() => stop()}
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-foreground"
                aria-label="Stop"
              >
                <Square className="size-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSend || !input.trim()}
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-black transition hover:brightness-110 disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="size-4" />
              </button>
            )}
          </div>
          {configured && (
            <p className="mt-2 text-center text-xs text-muted">
              {Math.max(remaining, 0)} AI requests left today · PDF or Word up to ~20 MB
            </p>
          )}
        </form>
      </section>

      <section className="flex min-h-[70vh] flex-col rounded-2xl border border-border bg-surface xl:sticky xl:top-20 xl:max-h-[calc(100dvh-6rem)]">
        <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              void saveGuidedDraft(draftId, { title: e.target.value });
            }}
            aria-label="Draft title"
            maxLength={200}
            className="h-9 min-w-0 flex-1 rounded-lg bg-transparent px-2 font-display font-semibold outline-none focus:bg-surface-2"
          />
          <button
            type="button"
            disabled={!shownBody}
            className={toolBtn}
            onClick={async () => {
              await navigator.clipboard.writeText(shownBody);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
          </button>
          <button type="button" disabled={!shownBody} className={toolBtn} onClick={() => downloadWord(title, shownBody)}>
            <Download className="size-4" />
          </button>
          <button type="button" disabled={!shownBody} className={toolBtn} onClick={() => printDocument(title, shownBody)}>
            <Printer className="size-4" />
          </button>
        </div>
        {shownBody ? (
          <textarea
            value={shownBody}
            onChange={(e) => {
              setBody(e.target.value);
              void saveGuidedDraft(draftId, { body: e.target.value });
            }}
            aria-label="Draft text"
            spellCheck
            className="min-h-0 flex-1 resize-none bg-background px-5 py-5 font-serif text-[15px] leading-7 outline-none"
          />
        ) : (
          <div className="grid flex-1 place-items-center px-6 py-16 text-center">
            <div className="flex max-w-xs flex-col items-center gap-3">
              <FileUp className="size-8 text-muted" />
              <p className="font-display font-semibold">Draft appears here</p>
              <p className="text-sm text-muted">After a few questions, Vidhi will place the document in this panel for editing and export.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
