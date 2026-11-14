"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  ArrowLeft,
  ArrowUp,
  Check,
  Download,
  Gavel,
  Loader2,
  Mic,
  MicOff,
  NotebookPen,
  Printer,
  RotateCcw,
  Scale,
  Sparkles,
  Square,
  Swords,
  Timer,
  Trophy,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { createNote, saveNote } from "@/app/(app)/desk-actions";
import { endMoot, reopenMoot } from "@/app/(app)/moot-practice/actions";
import { Markdown } from "@/components/app/vidhi/Markdown";
import { useDictation } from "@/components/app/useDictation";
import { errorText } from "@/lib/ai/errors";
import { brand } from "@/lib/content";
import { downloadWord, printDocument } from "@/lib/export-doc";
import type { MootFeedback } from "@/lib/moot/feedback";
import { MAX_SUBMISSION_CHARS, MAX_TURNS, MIN_TURNS_FOR_FEEDBACK, counselTurns, messageText } from "@/lib/moot/limits";
import { benchModes, type MootSetup } from "@/lib/moot/scenarios";
import { speakerParts } from "@/lib/moot/speakers";
import { routes } from "@/lib/navigation";

const label = "text-xs font-semibold uppercase tracking-[0.14em] text-muted";
const actionBtn =
  "flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold transition hover:border-accent/50 disabled:opacity-60";

function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  return `${String(m).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function scoreColour(score: number) {
  if (score >= 7.5) return "bg-emerald-400";
  if (score >= 5) return "bg-accent";
  return "bg-amber-400";
}

function feedbackText(f: MootFeedback) {
  return [
    `Overall: ${f.overall.toFixed(1)} / 10`,
    f.summary,
    "",
    ...f.criteria.map((c) => `${c.name}: ${c.score}/10. ${c.comment}`),
    "",
    "What worked:",
    ...f.strengths.map((s) => `- ${s}`),
    "",
    "To improve:",
    ...f.improvements.map((s) => `- ${s}`),
  ].join("\n");
}

function reportText(setup: MootSetup, f: MootFeedback, messages: UIMessage[]) {
  const transcript = messages.flatMap((m) =>
    m.role === "user"
      ? [`COUNSEL: ${messageText(m)}`]
      : speakerParts(messageText(m)).map((p) => `${p.speaker === "bench" ? "BENCH" : "OPPOSING COUNSEL"}: ${p.text.replace(/\*/g, "")}`),
  );
  return [
    `MOOT PRACTICE REPORT`,
    `${setup.title}\n${setup.forum}\nAppearing for: ${setup.side}`,
    feedbackText(f),
    "TRANSCRIPT",
    transcript.join("\n\n"),
    `Prepared on ${brand.name}. Practice feedback from an AI; verify all law independently.`,
  ].join("\n\n");
}

function Scorecard({ id, setup, feedback, messages, closed }: { id: string; setup: MootSetup; feedback: MootFeedback; messages: UIMessage[]; closed: boolean }) {
  const [noted, setNoted] = useState(false);
  const [pending, start] = useTransition();
  const [reopening, startReopen] = useTransition();
  const reportTitle = `Moot report - ${setup.title}`;
  const vidhiQuery = `I argued this case in moot practice as counsel for ${setup.side}. ${setup.title}, ${setup.forum}. Facts: ${setup.facts}\n\nWhat are the strongest arguments and authorities for my side, and how should I answer the other side's best points?`;

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-accent/30 bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-5">
        <div className="grid size-20 shrink-0 place-items-center rounded-2xl border border-accent/30 bg-accent/10">
          <span className="font-display text-3xl font-bold text-accent">{feedback.overall.toFixed(1)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className={label}>
            <Trophy className="mr-1.5 inline size-3.5 text-accent" />
            Court&apos;s feedback{feedback.turns ? ` · after ${feedback.turns} submissions` : ""}
          </p>
          <p className="mt-1.5 text-[15px] leading-relaxed">{feedback.summary}</p>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {feedback.criteria.map((c) => (
          <li key={c.name} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold">{c.name}</span>
              <span className="font-mono text-muted">{c.score}/10</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className={`h-full rounded-full ${scoreColour(c.score)}`} style={{ width: `${c.score * 10}%` }} />
            </div>
            <p className="text-sm text-muted">{c.comment}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className={`${label} mb-2`}>What worked</p>
          <ul className="space-y-1.5 text-sm">
            {feedback.strengths.map((s) => (
              <li key={s} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" /> {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className={`${label} mb-2`}>To improve</p>
          <ul className="space-y-1.5 text-sm">
            {feedback.improvements.map((s) => (
              <li key={s} className="flex gap-2">
                <ArrowUp className="mt-0.5 size-4 shrink-0 text-amber-400" /> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        {closed && (
          <button
            type="button"
            disabled={reopening}
            onClick={() => startReopen(() => reopenMoot(id))}
            className="flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
          >
            {reopening ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />} Continue arguing
          </button>
        )}
        <Link href={routes.mootPractice} className={actionBtn}>
          <Gavel className="size-4" /> New hearing
        </Link>
        <button type="button" className={actionBtn} onClick={() => downloadWord(reportTitle, reportText(setup, feedback, messages))}>
          <Download className="size-4" /> Word
        </button>
        <button type="button" className={actionBtn} onClick={() => printDocument(reportTitle, reportText(setup, feedback, messages))}>
          <Printer className="size-4" /> Print / PDF
        </button>
        <button
          type="button"
          disabled={pending || noted}
          onClick={() =>
            start(async () => {
              const noteId = await createNote();
              await saveNote(noteId, {
                title: `Moot feedback: ${setup.title}`,
                body: `${setup.title} (${setup.forum}), appearing for ${setup.side}\n\n${feedbackText(feedback)}`,
                tag: "Moot Practice",
                pinned: false,
              });
              setNoted(true);
            })
          }
          className={actionBtn}
        >
          {noted ? <Check className="size-4 text-accent" /> : pending ? <Loader2 className="size-4 animate-spin" /> : <NotebookPen className="size-4" />}
          {noted ? "Saved to Notes" : "Save to Notes"}
        </button>
        <Link href={`${routes.vidhi}?q=${encodeURIComponent(vidhiQuery.slice(0, 7000))}`} className={actionBtn}>
          <Sparkles className="size-4 text-accent" /> Research with {brand.assistant}
        </Link>
      </div>
    </section>
  );
}

function Brief({ setup }: { setup: MootSetup }) {
  return (
    <>
      {setup.caseType && <p className="mb-2 text-xs font-semibold text-accent">{setup.caseType}</p>}
      <p className="font-serif text-sm leading-relaxed text-foreground/90">{setup.facts}</p>
      <p className={`${label} mt-4 mb-2`}>Issues</p>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground/85">
        {setup.issues.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ol>
    </>
  );
}

function CourtTurn({ text, streaming, opponent }: { text: string; streaming: boolean; opponent: string }) {
  const parts = speakerParts(text);
  if (parts.length === 0) {
    return streaming ? (
      <li className="flex items-center gap-3 pl-12 text-sm text-muted">
        <Loader2 className="size-4 animate-spin" />
      </li>
    ) : null;
  }
  return (
    <>
      {parts.map((p, i) => {
        const bench = p.speaker === "bench";
        return (
          <li key={i} className="flex max-w-[90%] gap-3">
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-xl border ${
                bench ? "border-amber-500/30 bg-amber-500/10 text-amber-400" : "border-rose-500/30 bg-rose-500/10 text-rose-400"
              }`}
            >
              {bench ? <Scale className="size-4" /> : <Swords className="size-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-muted">{bench ? "The Bench" : `Opposing counsel · ${opponent}`}</span>
              <div
                className={`mt-1 rounded-2xl rounded-tl-md border px-4 py-3 font-serif text-[15px] ${
                  bench ? "border-border bg-surface" : "border-rose-500/20 bg-rose-500/5"
                }`}
              >
                <Markdown>{p.text}</Markdown>
              </div>
            </div>
          </li>
        );
      })}
    </>
  );
}

export function MootCourtroom({
  id,
  setup,
  initialMessages,
  feedback,
  closed,
  configured,
  remaining: initialRemaining,
}: {
  id: string;
  setup: MootSetup;
  initialMessages: UIMessage[];
  feedback: MootFeedback | null;
  closed: boolean;
  configured: boolean;
  remaining: number;
}) {
  const [input, setInput] = useState("");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/moot",
        prepareSendMessagesRequest: ({ id, messages }) => ({ body: { id, message: messages.at(-1) } }),
      }),
  );
  const { messages, sendMessage, status, error, stop, regenerate, clearError } = useChat({ id, messages: initialMessages, transport });
  const busy = status === "submitted" || status === "streaming";
  const turns = counselTurns(messages);
  const canSend = configured && !closed && !busy && remaining > 0 && turns < MAX_TURNS && messages.at(-1)?.role !== "user";
  const unanswered = status === "ready" && !closed && messages.at(-1)?.role === "user";

  const [ending, startEnding] = useTransition();
  const [endError, setEndError] = useState("");
  const scoredTurns = feedback?.turns ?? 0;
  const canEnd = !closed && !busy && !ending && turns >= MIN_TURNS_FOR_FEEDBACK && turns > scoredTurns && remaining > 0;

  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (closed) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [closed]);

  const { listening, toggle: toggleMic } = useDictation((t) => setInput((v) => (v ? `${v} ${t}` : t)), { continuous: true });

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status, feedback, ending, closed]);

  function submit() {
    const text = input.trim();
    if (!text || !canSend) return;
    if (error) clearError();
    if (listening) toggleMic();
    sendMessage({ text });
    setRemaining((r) => r - 1);
    setInput("");
  }

  function end() {
    if (!confirm("Close the hearing and get the court's feedback? You can continue arguing afterwards.")) return;
    setEndError("");
    startEnding(async () => {
      const res = await endMoot(id);
      if (res?.error) setEndError(res.error);
      else setRemaining((r) => r - 1);
    });
  }

  const benchLabel = benchModes.find((b) => b.key === setup.bench)?.label ?? "Bench";
  const opponentName = setup.opponent.replace(/\s*\(.*\)$/, "");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <section className="flex min-h-[calc(100dvh-14rem)] min-w-0 flex-col">
        <div className="mb-5 flex flex-col gap-3">
          <Link href={routes.mootPractice} className="flex w-fit items-center gap-2 text-sm text-muted hover:text-foreground">
            <ArrowLeft className="size-4" /> Moot Practice
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">{setup.title}</h1>
            <p className="mt-1 text-sm text-muted">
              {setup.forum} · You appear for <span className="font-semibold text-foreground">{setup.side}</span>
            </p>
          </div>
          <details className="rounded-xl border border-border bg-surface px-4 py-3 lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold">Case brief</summary>
            <div className="mt-3">
              <Brief setup={setup} />
            </div>
          </details>
        </div>

        <ol className="flex flex-1 flex-col gap-5 pb-6">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <li key={m.id} className="ml-auto flex max-w-[85%] flex-col items-end gap-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                  <User className="size-3.5" /> You · {setup.side.replace(/\s*\(.*\)$/, "")}
                </span>
                <div className="whitespace-pre-wrap rounded-2xl rounded-br-md bg-accent/15 px-4 py-3 text-[15px]">{messageText(m)}</div>
              </li>
            ) : (
              <CourtTurn key={m.id} text={messageText(m)} streaming={i === messages.length - 1 && status === "streaming"} opponent={opponentName} />
            ),
          )}
          {status === "submitted" && (
            <li className="flex items-center gap-3 text-sm text-muted">
              <span className="grid size-9 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                <Scale className="size-4" />
              </span>
              <Loader2 className="size-4 animate-spin" /> The court is considering…
            </li>
          )}
          {(error || unanswered) && (
            <li className="flex flex-wrap items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
              <span className="flex-1">{error ? errorText(error) : "The court didn't respond to your last submission."}</span>
              {configured && !closed && remaining > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setRemaining((r) => r - 1);
                    regenerate();
                  }}
                  className="flex items-center gap-1.5 font-semibold text-accent"
                >
                  <RotateCcw className="size-3.5" /> Retry
                </button>
              )}
            </li>
          )}
          {ending && (
            <li className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
              <Loader2 className="size-4 animate-spin text-accent" /> The court is preparing your feedback…
            </li>
          )}
          {feedback && closed && (
            <li>
              <Scorecard id={id} setup={setup} feedback={feedback} messages={messages} closed />
            </li>
          )}
          <div ref={endRef} />
        </ol>

        {!closed && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="sticky bottom-0 bg-background pb-4 pt-2"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 pl-4 transition focus-within:border-accent/60">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={1}
                maxLength={MAX_SUBMISSION_CHARS}
                disabled={!configured || ending}
                aria-label="Your submission"
                placeholder={turns >= MAX_TURNS ? "Time is up. End the hearing to get feedback." : "May it please the Court…"}
                className="max-h-56 min-h-10 flex-1 resize-none bg-transparent py-2.5 text-[15px] outline-none [field-sizing:content] placeholder:text-muted disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={toggleMic}
                disabled={!configured || ending}
                aria-label={listening ? "Stop dictation" : "Speak your submission"}
                className={`grid size-10 shrink-0 place-items-center rounded-xl transition disabled:opacity-40 ${
                  listening ? "bg-red-500/15 text-red-400" : "text-muted hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </button>
              {busy ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  aria-label="Stop"
                  className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-foreground transition hover:bg-border"
                >
                  <Square className="size-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSend || !input.trim()}
                  aria-label="Submit"
                  className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-black transition hover:brightness-110 disabled:opacity-40"
                >
                  <ArrowUp className="size-5" />
                </button>
              )}
            </div>
            <p className="mt-2 flex flex-wrap justify-between gap-2 px-1 text-xs text-muted">
              <span>
                {listening ? "Listening… speak your submission, then press Enter." : "Practice only. The court is an AI and can be wrong about the law."}
              </span>
              {configured && <span>{Math.max(remaining, 0)} AI requests left today</span>}
            </p>
          </form>
        )}
      </section>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className={label}>
              <Timer className="mr-1 inline size-3.5" />
              Clock
            </p>
            <p className="mt-1 font-mono text-xl font-semibold">{closed ? "Closed" : clock(seconds)}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className={label}>Submissions</p>
            <p className="mt-1 font-mono text-xl font-semibold">
              {turns}
              <span className="text-sm text-muted">/{MAX_TURNS}</span>
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">
          <p>
            <span className="font-semibold">{benchLabel}</span> <span className="text-muted">court</span>
          </p>
          <p className="mt-1 text-xs text-muted">The AI plays the judge and counsel for {opponentName}.</p>
        </div>

        {!closed && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={end}
              disabled={!canEnd}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-accent/50 text-sm font-semibold text-accent transition hover:bg-accent/10 disabled:opacity-40"
            >
              {ending ? <Loader2 className="size-4 animate-spin" /> : <Gavel className="size-4" />}
              {feedback ? "Get updated feedback" : "End hearing & get feedback"}
            </button>
            <p className="text-xs text-muted">
              {endError ||
                (turns < MIN_TURNS_FOR_FEEDBACK
                  ? `Make at least ${MIN_TURNS_FOR_FEEDBACK} submissions to get feedback.`
                  : feedback && turns <= scoredTurns
                    ? "Make a new submission to get updated feedback."
                    : "You'll get a score on seven criteria with specific pointers.")}
            </p>
          </div>
        )}

        {feedback && !closed && (
          <details className="rounded-2xl border border-border bg-surface px-4 py-3">
            <summary className="cursor-pointer text-sm">
              <span className="font-semibold">Previous score {feedback.overall.toFixed(1)}</span>{" "}
              <span className="text-muted">after {feedback.turns ?? "earlier"} submissions</span>
            </summary>
            <ul className="mt-3 space-y-1 text-sm">
              {feedback.criteria.map((c) => (
                <li key={c.name} className="flex justify-between gap-2">
                  <span className="text-muted">{c.name}</span>
                  <span className="font-mono">{c.score}</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="hidden rounded-2xl border border-border bg-surface p-4 lg:block">
          <p className={`${label} mb-3`}>Case brief</p>
          <Brief setup={setup} />
        </div>
      </aside>
    </div>
  );
}
