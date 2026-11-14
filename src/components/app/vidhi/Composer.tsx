"use client";

import type { FileUIPart } from "ai";
import { ArrowUp, FileText, ImagePlus, Loader2, Mic, MicOff, Paperclip, Square, Telescope, Undo2, WandSparkles, X, Zap } from "lucide-react";
import { useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useDictation } from "@/components/app/useDictation";
import { brand } from "@/lib/content";
import {
  attachmentKind,
  attachmentRules,
  dictationLanguages,
  MAX_QUESTION_CHARS,
  researchModes,
  type AttachmentKind,
  type ResearchMode,
} from "@/lib/vidhi/config";

export type Attachment = { id: string; kind: AttachmentKind; part: FileUIPart; size: number };

const LANG_KEY = "vakilat:dictation-lang";
const mb = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${+(bytes / (1024 * 1024)).toFixed(1)} MB`;

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

function Chip({ attachment, onRemove }: { attachment: Attachment; onRemove: () => void }) {
  return (
    <li className="flex max-w-56 items-center gap-2 rounded-lg border border-border bg-background py-1 pl-1 pr-1.5 text-xs">
      {attachment.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
        <img src={attachment.part.url} alt="" className="size-8 rounded object-cover" />
      ) : (
        <span className="grid size-8 place-items-center rounded bg-accent/12 text-accent">
          <FileText className="size-4" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{attachment.part.filename}</span>
        <span className="text-muted">{mb(attachment.size)}</span>
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${attachment.part.filename}`}
        className="grid size-6 place-items-center rounded text-muted hover:bg-surface-2 hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </li>
  );
}

function ModeSwitch({ mode, onChange, deepRemaining }: { mode: ResearchMode; onChange: (m: ResearchMode) => void; deepRemaining: number }) {
  const opts: { value: ResearchMode; icon: ReactNode }[] = [
    { value: "normal", icon: <Zap className="size-3.5" /> },
    { value: "deep", icon: <Telescope className="size-3.5" /> },
  ];
  return (
    <div role="radiogroup" aria-label="Research mode" className="flex rounded-lg border border-border bg-background p-0.5">
      {opts.map((o) => {
        const active = mode === o.value;
        const disabled = o.value === "deep" && deepRemaining <= 0;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            title={disabled ? "No deep research questions left today" : researchModes[o.value].hint}
            onClick={() => onChange(o.value)}
            className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              active ? "bg-accent text-black" : "text-muted hover:text-foreground"
            }`}
          >
            {o.icon}
            {researchModes[o.value].label}
            {o.value === "deep" && <span className={active ? "text-black/70" : "text-muted"}>· {Math.max(deepRemaining, 0)}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Composer({
  input,
  setInput,
  attachments,
  setAttachments,
  mode,
  setMode,
  busy,
  canSend,
  configured,
  remaining,
  deepRemaining,
  onSubmit,
  onStop,
  onUsedRequest,
}: {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  attachments: Attachment[];
  setAttachments: (a: Attachment[]) => void;
  mode: ResearchMode;
  setMode: (m: ResearchMode) => void;
  busy: boolean;
  canSend: boolean;
  configured: boolean;
  remaining: number;
  deepRemaining: number;
  onSubmit: () => void;
  onStop: () => void;
  onUsedRequest: () => void;
}) {
  const docInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [improving, setImproving] = useState(false);
  const [beforeImprove, setBeforeImprove] = useState<string | null>(null);
  const [lang, setLang] = useState("en-IN");

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read a browser-only preference after hydration
    if (saved && dictationLanguages.some((l) => l.code === saved)) setLang(saved);
  }, []);

  const { listening, toggle: toggleMic } = useDictation((t) => setInput((v) => (v ? `${v.trimEnd()} ${t}` : t)), { lang, continuous: true });

  async function addFiles(files: FileList | File[]) {
    setNotice(null);
    const next = [...attachments];
    for (const file of Array.from(files)) {
      const kind = attachmentKind(file.type);
      if (!kind) {
        setNotice(`${file.name}: attach a PDF or text document, or a PNG, JPEG or WebP image.`);
        continue;
      }
      const rule = attachmentRules[kind];
      if (file.size > rule.maxBytes) {
        setNotice(`${file.name} is larger than ${mb(rule.maxBytes)}.`);
        continue;
      }
      if (next.filter((a) => a.kind === kind).length >= rule.max) {
        setNotice(kind === "document" ? "Attach one document per question." : `Attach up to ${rule.max} images per question.`);
        continue;
      }
      const url = await readAsDataUrl(file);
      next.push({ id: crypto.randomUUID(), kind, size: file.size, part: { type: "file", mediaType: file.type, filename: file.name, url } });
    }
    setAttachments(next);
  }

  async function improve() {
    const text = input.trim();
    if (text.length < 5 || improving) return;
    setImproving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/vidhi/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
      if (!res.ok || !data.text) throw new Error(data.error ?? "Couldn't improve the question.");
      onUsedRequest();
      setBeforeImprove(input);
      setInput(data.text);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Couldn't improve the question.");
    } finally {
      setImproving(false);
    }
  }

  const hasContent = input.trim().length > 0 || attachments.length > 0;
  const menuItem = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-surface-2";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setBeforeImprove(null);
        onSubmit();
      }}
      className="sticky bottom-0 bg-background pb-4 pt-2"
    >
      <input
        ref={docInput}
        type="file"
        hidden
        accept={attachmentRules.document.accept}
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={imageInput}
        type="file"
        hidden
        multiple
        accept={attachmentRules.image.accept}
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        onDragOver={(e) => {
          if (!configured) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (configured && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={`rounded-2xl border bg-surface p-2 transition focus-within:border-accent/60 ${
          dragging ? "border-accent border-dashed bg-accent/5" : "border-border"
        }`}
      >
        {attachments.length > 0 && (
          <ul className="mb-2 flex flex-wrap gap-2 px-1 pt-1">
            {attachments.map((a) => (
              <Chip key={a.id} attachment={a} onRemove={() => setAttachments(attachments.filter((x) => x.id !== a.id))} />
            ))}
          </ul>
        )}

        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (beforeImprove !== null) setBeforeImprove(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              setBeforeImprove(null);
              onSubmit();
            }
          }}
          onPaste={(e) => {
            const images = Array.from(e.clipboardData.files).filter((f) => attachmentKind(f.type));
            if (images.length && configured) {
              e.preventDefault();
              addFiles(images);
            }
          }}
          rows={1}
          maxLength={MAX_QUESTION_CHARS}
          disabled={!configured}
          aria-label={`Ask ${brand.assistant}`}
          placeholder={
            remaining <= 0
              ? "You've reached today's limit"
              : mode === "deep"
                ? "Describe the legal problem in detail for a research memo…"
                : "Ask a legal question, or attach an FIR, order or notice…"
          }
          className="max-h-60 min-h-12 w-full resize-none bg-transparent px-2 py-2.5 text-[15px] outline-none [field-sizing:content] placeholder:text-muted disabled:cursor-not-allowed"
        />

        <div className="flex flex-wrap items-center gap-1.5">
          <div className="relative">
            <button
              type="button"
              disabled={!configured}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Attach"
              aria-expanded={menuOpen}
              title="Attach a document or images"
              className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-foreground disabled:opacity-40"
            >
              <Paperclip className="size-4" />
            </button>
            {menuOpen && (
              <>
                <button type="button" aria-label="Close menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setMenuOpen(false)} />
                <div role="menu" className="absolute bottom-10 left-0 z-20 w-64 rounded-xl border border-border bg-surface p-1.5 shadow-xl">
                  <button
                    type="button"
                    role="menuitem"
                    className={menuItem}
                    onClick={() => {
                      setMenuOpen(false);
                      docInput.current?.click();
                    }}
                  >
                    <FileText className="size-4 text-accent" />
                    <span>
                      Document <span className="block text-xs text-muted">PDF or text, up to {mb(attachmentRules.document.maxBytes)}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={menuItem}
                    onClick={() => {
                      setMenuOpen(false);
                      imageInput.current?.click();
                    }}
                  >
                    <ImagePlus className="size-4 text-accent" />
                    <span>
                      Images{" "}
                      <span className="block text-xs text-muted">
                        Up to {attachmentRules.image.max} photos or scans, {mb(attachmentRules.image.maxBytes)} each
                      </span>
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>

          {beforeImprove !== null ? (
            <button
              type="button"
              onClick={() => {
                setInput(beforeImprove);
                setBeforeImprove(null);
              }}
              className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-accent transition hover:bg-surface-2"
            >
              <Undo2 className="size-3.5" /> Undo improve
            </button>
          ) : (
            <button
              type="button"
              disabled={!configured || improving || input.trim().length < 5 || remaining <= 0}
              onClick={improve}
              title="Rewrite your question so it gets a more precise answer"
              className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted transition hover:bg-surface-2 hover:text-foreground disabled:opacity-40"
            >
              {improving ? <Loader2 className="size-3.5 animate-spin" /> : <WandSparkles className="size-3.5" />}
              Improve question
            </button>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <ModeSwitch mode={mode} onChange={setMode} deepRemaining={deepRemaining} />
            <select
              value={lang}
              onChange={(e) => {
                setLang(e.target.value);
                localStorage.setItem(LANG_KEY, e.target.value);
              }}
              aria-label="Voice input language"
              title="Voice input language"
              className="h-8 rounded-lg border border-border bg-background px-1.5 text-xs text-muted outline-none focus:border-accent/60"
            >
              {dictationLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!configured}
              onClick={toggleMic}
              aria-label={listening ? "Stop voice input" : "Voice input"}
              title={listening ? "Stop voice input" : "Voice input"}
              className={`grid size-8 place-items-center rounded-lg transition disabled:opacity-40 ${
                listening ? "bg-red-500/15 text-red-400" : "text-muted hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </button>
            {busy ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop"
                className="grid size-9 place-items-center rounded-xl bg-surface-2 text-foreground transition hover:bg-border"
              >
                <Square className="size-4 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSend || !hasContent}
                aria-label="Send"
                className="grid size-9 place-items-center rounded-xl bg-accent text-black transition hover:brightness-110 disabled:opacity-40"
              >
                <ArrowUp className="size-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {notice && <p className="mt-2 px-1 text-xs text-red-400">{notice}</p>}
      <p className="mt-2 flex flex-wrap justify-between gap-2 px-1 text-xs text-muted">
        <span>{brand.assistant} can make mistakes. Verify citations against the official text before relying on them.</span>
        {configured && <span>{Math.max(remaining, 0)} questions left today</span>}
      </p>
    </form>
  );
}
