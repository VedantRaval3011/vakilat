"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { FilePen, FileText, Gavel, KeyRound, Loader2, Plus, RotateCcw, Sparkles, Telescope, UserRoundCog } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { errorText } from "@/lib/ai/errors";
import { brand } from "@/lib/content";
import { routes } from "@/lib/navigation";
import { profileFields, type ResearchMode, type VidhiMessage, type VidhiProfile } from "@/lib/vidhi/config";
import { extractSources, type Source } from "@/lib/vidhi/sources";
import { AnswerActions } from "./AnswerActions";
import { ChatHistory, type ChatListItem } from "./ChatHistory";
import { Composer, type Attachment } from "./Composer";
import { Markdown } from "./Markdown";
import { PersonaliseDialog } from "./PersonaliseDialog";
import { SourcesPanel } from "./SourcesPanel";

export type { ChatListItem };

const suggestions = [
  "What is the punishment for cheating under the BNS, and which IPC section did it replace?",
  "Explain the conditions for anticipatory bail under Section 482 BNSS.",
  "When is electronic evidence admissible under the Bharatiya Sakshya Adhiniyam?",
  "What are the grounds for divorce under the Hindu Marriage Act, 1955?",
];

const textOf = (m: VidhiMessage) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

function EmptyState({ onPick, disabled, nickname }: { onPick: (q: string) => void; disabled: boolean; nickname: string }) {
  const shortcut =
    "flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-foreground/85 transition hover:border-accent/50";
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
      <span className="grid size-16 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
        <Sparkles className="size-7" />
      </span>
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          {nickname ? `How can I help, ${nickname}?` : `Ask ${brand.assistant}`}
        </h2>
        <p className="mt-1 text-muted">Questions on Indian law, in English, Hindi or your own language. Attach an FIR, order or notice to ask about it.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href={routes.mootPractice} className={shortcut}>
          <Gavel className="size-4 text-accent" /> Practise a hearing
        </Link>
        <Link href={routes.draftStudio} className={shortcut}>
          <FilePen className="size-4 text-accent" /> Draft a document
        </Link>
      </div>
      <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onPick(s)}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm text-foreground/85 transition hover:border-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserTurn({ message }: { message: VidhiMessage }) {
  const text = textOf(message);
  const files = message.parts.filter((p) => p.type === "file");
  return (
    <li className="ml-auto flex max-w-[85%] flex-col items-end gap-2">
      {files.length > 0 && (
        <ul className="flex flex-wrap justify-end gap-2">
          {files.map((f, i) =>
            f.mediaType.startsWith("image/") ? (
              <li key={i}>
                <a href={f.url} target="_blank" rel="noreferrer" title={f.filename}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- user-attached data URL */}
                  <img src={f.url} alt={f.filename ?? "Attached image"} className="size-24 rounded-xl border border-border object-cover" />
                </a>
              </li>
            ) : (
              <li key={i} className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm">
                <FileText className="size-4 text-accent" />
                <span className="max-w-56 truncate">{f.filename ?? "Document"}</span>
              </li>
            ),
          )}
        </ul>
      )}
      {text && <div className="whitespace-pre-wrap rounded-2xl rounded-br-md bg-accent/15 px-4 py-3 text-[15px]">{text}</div>}
    </li>
  );
}

export function VidhiChat({
  chatId,
  initialMessages,
  initialQuery,
  configured,
  history,
  ratings,
  profile: initialProfile,
  remaining: initialRemaining,
  deepRemaining: initialDeepRemaining,
}: {
  chatId: string;
  initialMessages: VidhiMessage[];
  initialQuery: string;
  configured: boolean;
  history: ChatListItem[];
  ratings: Record<string, 1 | -1>;
  profile: VidhiProfile;
  remaining: number;
  deepRemaining: number;
}) {
  const router = useRouter();
  const [input, setInput] = useState(configured ? "" : initialQuery);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [mode, setMode] = useState<ResearchMode>("normal");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [deepRemaining, setDeepRemaining] = useState(initialDeepRemaining);
  const [profile, setProfile] = useState(initialProfile);
  const [personalising, setPersonalising] = useState(false);
  const [sources, setSources] = useState<{ list: Source[]; question: string } | null>(null);
  const [transport] = useState(
    () =>
      new DefaultChatTransport<VidhiMessage>({
        api: "/api/vidhi",
        prepareSendMessagesRequest: ({ id, messages }) => ({ body: { id, message: messages.at(-1) } }),
      }),
  );
  const { messages, sendMessage, status, error, stop, regenerate, clearError } = useChat<VidhiMessage>({
    id: chatId,
    messages: initialMessages,
    transport,
    onFinish: () => router.replace(`${routes.vidhi}?c=${chatId}`, { scroll: false }),
  });
  const busy = status === "submitted" || status === "streaming";
  const canSend = configured && !busy && remaining > 0 && (mode === "normal" || deepRemaining > 0);
  const personalised = profileFields.some((f) => profile[f.name].trim());

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  function spend(m: ResearchMode) {
    setRemaining((r) => r - 1);
    if (m === "deep") setDeepRemaining((r) => r - 1);
  }

  function ask(text: string) {
    const q = text.trim();
    if ((!q && attachments.length === 0) || !canSend) return;
    if (error) clearError();
    sendMessage({ text: q, files: attachments.map((a) => a.part), metadata: { mode } });
    spend(mode);
    setInput("");
    setAttachments([]);
  }

  const autoAsked = useRef(false);
  useEffect(() => {
    if (!initialQuery || initialMessages.length > 0 || !configured) return;
    const timer = setTimeout(() => {
      if (autoAsked.current) return;
      autoAsked.current = true;
      sendMessage({ text: initialQuery, metadata: { mode: "normal" } });
      setRemaining((r) => r - 1);
    });
    return () => clearTimeout(timer);
  }, [initialQuery, initialMessages.length, configured, sendMessage]);

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const retryMode: ResearchMode = lastUser?.metadata?.mode === "deep" ? "deep" : "normal";
  const sourceLists = useMemo(
    () => new Map(messages.filter((m) => m.role === "assistant").map((m) => [m.id, extractSources(textOf(m))])),
    [messages],
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-10">
      <ChatHistory chats={history} activeId={chatId} />

      <section className="flex min-h-[calc(100dvh-7rem)] min-w-0 flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-accent" />
            <h1 className="font-display text-xl font-bold">{brand.assistant}</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPersonalising(true)}
              className="relative flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-semibold transition hover:border-accent/50"
            >
              <UserRoundCog className="size-4" /> Personalise
              {personalised && <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-accent" aria-label="Personalisation on" />}
            </button>
            <Link
              href={routes.vidhi}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-semibold transition hover:border-accent/50 lg:hidden"
            >
              <Plus className="size-4" /> New
            </Link>
          </div>
        </div>

        {!configured && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
            <KeyRound className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <p>
              <span className="font-semibold">{brand.assistant} isn&apos;t connected yet.</span>{" "}
              <span className="text-muted">
                Add an AI provider key (Gemini, OpenAI or Anthropic) to <code className="font-mono">.env.local</code> and restart the
                server.
              </span>
            </p>
          </div>
        )}

        {messages.length === 0 ? (
          <EmptyState onPick={ask} disabled={!canSend} nickname={profile.nickname} />
        ) : (
          <ol className="flex flex-1 flex-col gap-6 pb-6">
            {messages.map((m, i) => {
              if (m.role === "user") return <UserTurn key={m.id} message={m} />;
              const text = textOf(m);
              const last = i === messages.length - 1;
              const streaming = last && status === "streaming";
              const question = messages[i - 1] ? textOf(messages[i - 1]) : "";
              const list = sourceLists.get(m.id) ?? [];
              return (
                <li key={m.id} className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/12 text-accent">
                    {m.metadata?.mode === "deep" ? <Telescope className="size-4" /> : <Sparkles className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    {m.metadata?.mode === "deep" && (
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Deep research</p>
                    )}
                    {text ? <Markdown>{text}</Markdown> : streaming && <Loader2 className="size-4 animate-spin text-muted" />}
                    {!streaming && text && (
                      <AnswerActions
                        chatId={chatId}
                        messageId={m.id}
                        text={text}
                        question={question}
                        rating={ratings[m.id]}
                        sourceCount={list.length}
                        onSources={() => setSources({ list, question })}
                      />
                    )}
                  </div>
                </li>
              );
            })}
            {status === "submitted" && (
              <li className="flex items-center gap-3 text-sm text-muted">
                <span className="grid size-8 place-items-center rounded-lg bg-accent/12 text-accent">
                  {lastUser?.metadata?.mode === "deep" ? <Telescope className="size-4" /> : <Sparkles className="size-4" />}
                </span>
                <Loader2 className="size-4 animate-spin" />
                {lastUser?.metadata?.mode === "deep" ? "Researching in depth… this can take a minute" : "Researching…"}
              </li>
            )}
            {error && (
              <li className="flex flex-wrap items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
                <span className="flex-1">{errorText(error)}</span>
                {configured && remaining > 0 && (retryMode === "normal" || deepRemaining > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      spend(retryMode);
                      regenerate();
                    }}
                    className="flex items-center gap-1.5 font-semibold text-accent"
                  >
                    <RotateCcw className="size-3.5" /> Retry
                  </button>
                )}
              </li>
            )}
            <div ref={endRef} />
          </ol>
        )}

        <Composer
          input={input}
          setInput={setInput}
          attachments={attachments}
          setAttachments={setAttachments}
          mode={mode}
          setMode={setMode}
          busy={busy}
          canSend={canSend}
          configured={configured}
          remaining={remaining}
          deepRemaining={deepRemaining}
          onSubmit={() => ask(input)}
          onStop={stop}
          onUsedRequest={() => setRemaining((r) => r - 1)}
        />
      </section>

      {sources && <SourcesPanel sources={sources.list} question={sources.question} onClose={() => setSources(null)} />}
      {personalising && <PersonaliseDialog profile={profile} onClose={() => setPersonalising(false)} onSaved={setProfile} />}
    </div>
  );
}
