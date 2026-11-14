"use client";

import { BookOpen, Check, Copy, Loader2, NotebookPen, Share2, Square, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { createNote, saveNote } from "@/app/(app)/desk-actions";
import { rateVidhiAnswer } from "@/app/(app)/vidhi/actions";
import { brand } from "@/lib/content";

const scripts: [RegExp, string][] = [
  [/[\u0A80-\u0AFF]/, "gu-IN"],
  [/[\u0980-\u09FF]/, "bn-IN"],
  [/[\u0B80-\u0BFF]/, "ta-IN"],
  [/[\u0C00-\u0C7F]/, "te-IN"],
  [/[\u0C80-\u0CFF]/, "kn-IN"],
  [/[\u0D00-\u0D7F]/, "ml-IN"],
  [/[\u0A00-\u0A7F]/, "pa-IN"],
  [/[\u0900-\u097F]/, "hi-IN"],
];

const plain = (md: string) =>
  md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\s*\|?[-:| ]+\|?\s*$/gm, " ")
    .replace(/[#>*_`|]/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

/** One speaker for the page, so starting a new answer stops the previous one. */
let activeStop: (() => void) | null = null;

function useReadAloud(text: string) {
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function toggle() {
    const synth = window.speechSynthesis;
    if (!synth) return alert("Read aloud isn't supported in this browser.");
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    activeStop?.();
    synth.cancel();
    const body = plain(text);
    const lang = scripts.find(([re]) => re.test(body))?.[1] ?? "en-IN";
    const voice = synth.getVoices().find((v) => v.lang === lang) ?? synth.getVoices().find((v) => v.lang.startsWith(lang.slice(0, 2)));
    const chunks = body.match(/[^.!?।]+[.!?।]*\s*/g) ?? [body];
    chunks.forEach((chunk, i) => {
      const u = new SpeechSynthesisUtterance(chunk);
      u.lang = lang;
      if (voice) u.voice = voice;
      if (i === chunks.length - 1) u.onend = () => setSpeaking(false);
      synth.speak(u);
    });
    activeStop = () => setSpeaking(false);
    setSpeaking(true);
  }

  return { speaking, toggle };
}

const btn =
  "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted transition hover:bg-surface-2 hover:text-foreground disabled:opacity-50";
const iconBtn = "grid size-8 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-foreground";

export function AnswerActions({
  chatId,
  messageId,
  text,
  question,
  rating: initialRating,
  sourceCount,
  onSources,
}: {
  chatId: string;
  messageId: string;
  text: string;
  question: string;
  rating?: 1 | -1;
  sourceCount: number;
  onSources: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [noted, setNoted] = useState(false);
  const [rating, setRating] = useState<1 | -1 | 0>(initialRating ?? 0);
  const [pending, start] = useTransition();
  const { speaking, toggle } = useReadAloud(text);

  function rate(value: 1 | -1) {
    const next = rating === value ? 0 : value;
    setRating(next);
    rateVidhiAnswer(chatId, messageId, next);
  }

  async function share() {
    const body = `${question ? `Q: ${question}\n\n` : ""}${text}\n\n— ${brand.assistant}, ${brand.name}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: question.slice(0, 80) || `${brand.assistant} answer`, text: body });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(body);
    setShared(true);
    setTimeout(() => setShared(false), 1800);
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-0.5">
      <button
        type="button"
        aria-label="Helpful"
        aria-pressed={rating === 1}
        title="Helpful"
        onClick={() => rate(1)}
        className={`${iconBtn} ${rating === 1 ? "text-accent" : ""}`}
      >
        <ThumbsUp className={`size-3.5 ${rating === 1 ? "fill-current" : ""}`} />
      </button>
      <button
        type="button"
        aria-label="Not helpful"
        aria-pressed={rating === -1}
        title="Not helpful"
        onClick={() => rate(-1)}
        className={`${iconBtn} ${rating === -1 ? "text-red-400" : ""}`}
      >
        <ThumbsDown className={`size-3.5 ${rating === -1 ? "fill-current" : ""}`} />
      </button>
      <span className="mx-1 h-4 w-px bg-border" />
      <button
        type="button"
        className={btn}
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check className="size-3.5 text-accent" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <button type="button" className={btn} onClick={toggle} aria-pressed={speaking}>
        {speaking ? <Square className="size-3 fill-current" /> : <Volume2 className="size-3.5" />}
        {speaking ? "Stop" : "Read aloud"}
      </button>
      <button type="button" className={btn} onClick={share}>
        {shared ? <Check className="size-3.5 text-accent" /> : <Share2 className="size-3.5" />}
        {shared ? "Copied to share" : "Share"}
      </button>
      <button
        type="button"
        className={btn}
        disabled={pending || noted}
        onClick={() =>
          start(async () => {
            const id = await createNote();
            await saveNote(id, { title: question.slice(0, 200) || `${brand.assistant} answer`, body: text, tag: brand.assistant, pinned: false });
            setNoted(true);
          })
        }
      >
        {noted ? <Check className="size-3.5 text-accent" /> : pending ? <Loader2 className="size-3.5 animate-spin" /> : <NotebookPen className="size-3.5" />}
        {noted ? "Saved to Notes" : "Save to Notes"}
      </button>
      {sourceCount > 0 && (
        <button type="button" className={`${btn} text-accent hover:text-accent`} onClick={onSources}>
          <BookOpen className="size-3.5" /> Sources ({sourceCount})
        </button>
      )}
    </div>
  );
}
