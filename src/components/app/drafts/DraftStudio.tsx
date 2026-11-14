"use client";

import { useCompletion } from "@ai-sdk/react";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  FileText,
  Gavel,
  KeyRound,
  Loader2,
  Mail,
  MessageSquareText,
  PenLine,
  Printer,
  RotateCcw,
  Scale,
  Sparkles,
  Square,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteDraft, saveDraft, startGuidedDraft } from "@/app/(app)/draft-studio/actions";
import { errorText } from "@/lib/ai/errors";
import { downloadWord, printDocument } from "@/lib/export-doc";
import { formatDayMonth } from "@/lib/desk/format";
import { routes } from "@/lib/navigation";
import {
  draftLanguages,
  draftTemplates,
  GUIDED_TEMPLATE_KEY,
  type DraftCategory,
  type DraftTemplate,
} from "@/lib/drafts/templates";

export type DraftData = { id: string; template: string; title: string; fields: Record<string, string>; body: string };
export type DraftListItem = { id: string; template: string; title: string; updatedAt: string };

const categoryIcons: Record<DraftCategory, LucideIcon> = {
  Criminal: Gavel,
  Notices: Mail,
  "Civil & consumer": Scale,
  Documents: FileText,
};

const formTemplates = draftTemplates.filter((t) => t.key !== GUIDED_TEMPLATE_KEY);
const categories = [...new Set(formTemplates.map((t) => t.category))];

export function DraftGallery({ drafts }: { drafts: DraftListItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [starting, startGuided] = useTransition();
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-8">
        <button
          type="button"
          disabled={starting}
          onClick={() =>
            startGuided(async () => {
              try {
                const id = await startGuidedDraft();
                router.push(`${routes.draftStudio}?d=${id}`);
              } catch (e) {
                alert(e instanceof Error ? e.message : "Could not start guided draft.");
              }
            })
          }
          className="group flex flex-col gap-2 rounded-2xl border border-accent/40 bg-accent/8 p-6 text-left transition hover:border-accent hover:bg-accent/12 disabled:opacity-60"
        >
          <span className="flex items-center gap-2 font-display text-lg font-semibold text-accent">
            <MessageSquareText className="size-5" />
            {starting ? "Starting…" : "Describe what you need"}
          </span>
          <span className="text-sm text-muted">
            Chat with Vidhi: answer a few questions, upload a brief if you like, then get a first draft in your language.
          </span>
        </button>

        {categories.map((cat) => {
          const Icon = categoryIcons[cat];
          return (
            <section key={cat}>
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                <Icon className="size-4 text-accent" /> {cat}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {formTemplates
                  .filter((t) => t.category === cat)
                  .map((t) => (
                    <Link
                      key={t.key}
                      href={`${routes.draftStudio}?t=${t.key}`}
                      className="group flex flex-col gap-1.5 rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/50"
                    >
                      <span className="font-display font-semibold group-hover:text-accent">{t.name}</span>
                      <span className="text-sm text-muted">{t.blurb}</span>
                    </Link>
                  ))}
              </div>
            </section>
          );
        })}
      </div>

      <aside className="flex flex-col gap-3 lg:sticky lg:top-20 lg:self-start">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Your drafts</h2>
        {drafts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            Drafts you generate are saved here.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {drafts.map((d) => (
              <li key={d.id} className="group relative">
                <button
                  type="button"
                  onClick={() => router.push(`${routes.draftStudio}?d=${d.id}`)}
                  className="flex w-full flex-col rounded-lg px-3 py-2 pr-9 text-left text-sm transition hover:bg-surface-2"
                >
                  <span className="truncate font-medium">{d.title}</span>
                  <span className="text-xs text-muted">
                    {d.template === GUIDED_TEMPLATE_KEY
                      ? "Guided"
                      : (draftTemplates.find((t) => t.key === d.template)?.name ?? "Draft")}{" "}
                    · {formatDayMonth(d.updatedAt)}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={pending}
                  aria-label={`Delete ${d.title}`}
                  onClick={() => {
                    if (confirm("Delete this draft?")) start(() => deleteDraft(d.id));
                  }}
                  className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted opacity-0 transition hover:text-red-400 focus:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function DraftEditor({
  template,
  initial,
  configured,
  remaining: initialRemaining,
}: {
  template: DraftTemplate;
  initial: DraftData | null;
  configured: boolean;
  remaining: number;
}) {
  const router = useRouter();
  const [id] = useState(() => initial?.id ?? crypto.randomUUID());
  const [fields, setFields] = useState<Record<string, string>>(initial?.fields ?? {});
  const [language, setLanguage] = useState<string>("English");
  const [instructions, setInstructions] = useState("");
  const [title, setTitle] = useState(initial?.title ?? template.name);
  const [body, setBody] = useState(initial?.body ?? "");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [save, setSave] = useState<SaveState>("idle");
  const [copied, setCopied] = useState(false);
  const [deleting, startDelete] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const saved = useRef(initial !== null);
  const latest = useRef({ title, fields, body });

  async function persist(patch: Partial<typeof latest.current>) {
    latest.current = { ...latest.current, ...patch };
    setSave("saving");
    try {
      await saveDraft(id, { template: template.key, ...latest.current });
      setSave("saved");
      if (!saved.current) {
        saved.current = true;
        router.replace(`${routes.draftStudio}?d=${id}`, { scroll: false });
      }
    } catch {
      setSave("error");
    }
  }

  function edit(patch: Partial<typeof latest.current>) {
    latest.current = { ...latest.current, ...patch };
    if (!saved.current) return;
    setSave("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => persist({}), 800);
  }

  const { completion, complete, isLoading, stop, error } = useCompletion({
    api: "/api/draft",
    onFinish: (_prompt, text) => {
      setBody(text);
      persist({ body: text });
    },
  });

  const shown = isLoading ? completion : body;
  const canGenerate = configured && remaining > 0 && !isLoading;

  function generate() {
    if (!canGenerate) return;
    if (body.trim() && !confirm("Replace the current draft with a new one?")) return;
    clearTimeout(timer.current);
    setRemaining((r) => r - 1);
    complete(instructions, { body: { template: template.key, fields, language } });
  }

  const fieldClass =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted/70 focus:border-accent/60 [color-scheme:light] dark:[color-scheme:dark]";
  const toolBtn =
    "flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-foreground disabled:opacity-40";

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          generate();
        }}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 xl:sticky xl:top-20 xl:max-h-[calc(100dvh-6rem)] xl:self-start xl:overflow-y-auto"
      >
        <Link href={routes.draftStudio} className="flex w-fit items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="size-4" /> All templates
        </Link>
        <div>
          <h2 className="font-display text-lg font-bold">{template.name}</h2>
          <p className="mt-0.5 text-sm text-muted">{template.blurb}</p>
        </div>

        {!configured && (
          <p className="flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm">
            <KeyRound className="mt-0.5 size-4 shrink-0 text-amber-400" />
            Add an AI provider key to <code className="font-mono">.env.local</code> to generate drafts.
          </p>
        )}

        {template.fields.map((f) => (
          <label key={f.name} className="flex flex-col gap-1.5 text-sm font-medium">
            <span>
              {f.label}
              {f.required && <span className="text-accent"> *</span>}
            </span>
            {f.type === "textarea" ? (
              <textarea
                value={fields[f.name] ?? ""}
                onChange={(e) => {
                  const next = { ...fields, [f.name]: e.target.value };
                  setFields(next);
                  edit({ fields: next });
                }}
                required={f.required}
                rows={4}
                maxLength={4000}
                placeholder={f.placeholder}
                className={`${fieldClass} resize-y`}
              />
            ) : (
              <input
                type={f.type ?? "text"}
                value={fields[f.name] ?? ""}
                onChange={(e) => {
                  const next = { ...fields, [f.name]: e.target.value };
                  setFields(next);
                  edit({ fields: next });
                }}
                required={f.required}
                maxLength={4000}
                placeholder={f.placeholder}
                className={fieldClass}
              />
            )}
          </label>
        ))}

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Language
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={fieldClass}>
            {draftLanguages.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Anything else? <span className="font-normal text-muted">Optional instructions for the draft</span>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            maxLength={4000}
            placeholder="e.g. Keep it under two pages, add a ground on delay in trial"
            className={`${fieldClass} resize-y`}
          />
        </label>

        {isLoading ? (
          <button
            type="button"
            onClick={() => {
              stop();
              setBody(completion);
              persist({ body: completion });
            }}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-surface-2 text-sm font-semibold transition hover:bg-border"
          >
            <Square className="size-3.5 fill-current" /> Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canGenerate}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-40"
          >
            {body ? <RotateCcw className="size-4" /> : <Sparkles className="size-4" />}
            {body ? "Regenerate draft" : "Generate draft"}
          </button>
        )}
        {configured && <p className="-mt-2 text-center text-xs text-muted">{Math.max(remaining, 0)} AI requests left today</p>}
      </form>

      <section className="flex min-w-0 flex-col rounded-2xl border border-border bg-surface">
        <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              edit({ title: e.target.value });
            }}
            aria-label="Draft title"
            maxLength={200}
            className="h-9 min-w-0 flex-1 rounded-lg bg-transparent px-2 font-display font-semibold outline-none focus:bg-surface-2"
          />
          <span className="px-2 text-xs text-muted" aria-live="polite">
            {save === "saving" ? "Saving…" : save === "saved" ? "Saved" : save === "error" ? "Couldn't save" : ""}
          </span>
          <button
            type="button"
            disabled={!shown}
            className={toolBtn}
            onClick={async () => {
              await navigator.clipboard.writeText(shown);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            type="button"
            disabled={!body || isLoading}
            className={toolBtn}
            onClick={() => downloadWord(title, body)}
          >
            <Download className="size-4" /> <span className="hidden sm:inline">Word</span>
          </button>
          <button
            type="button"
            disabled={!body || isLoading}
            className={toolBtn}
            onClick={() => printDocument(title, body)}
          >
            <Printer className="size-4" /> <span className="hidden sm:inline">Print / PDF</span>
          </button>
          {initial && (
            <button
              type="button"
              disabled={deleting}
              aria-label="Delete draft"
              className={`${toolBtn} hover:text-red-400`}
              onClick={() => {
                if (!confirm("Delete this draft? This can't be undone.")) return;
                clearTimeout(timer.current);
                startDelete(async () => {
                  await deleteDraft(id);
                  router.push(routes.draftStudio);
                });
              }}
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>

        {error && <p className="mx-4 mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">{errorText(error)}</p>}

        {shown || isLoading ? (
          <div className="relative flex-1 p-4 sm:p-6">
            <textarea
              value={shown}
              readOnly={isLoading}
              onChange={(e) => {
                setBody(e.target.value);
                edit({ body: e.target.value });
              }}
              aria-label="Draft text"
              spellCheck
              className="min-h-[70vh] w-full resize-none rounded-xl border border-border bg-background px-6 py-8 font-serif text-[15px] leading-7 outline-none [field-sizing:content] focus:border-accent/40 sm:px-12"
            />
            {isLoading && (
              <span className="absolute right-8 top-8 flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs text-muted">
                <Loader2 className="size-3.5 animate-spin" /> Drafting…
              </span>
            )}
          </div>
        ) : (
          <div className="grid flex-1 place-items-center px-6 py-24 text-center">
            <div className="flex max-w-sm flex-col items-center gap-3">
              <PenLine className="size-8 text-muted" />
              <p className="font-display text-lg font-semibold">Your draft will appear here</p>
              <p className="text-sm text-muted">
                Fill in the details on the left and generate. You can edit the text afterwards, and it saves as you type.
              </p>
            </div>
          </div>
        )}
        <p className="border-t border-border px-4 py-2.5 text-xs text-muted">
          AI drafts are a starting point. Check facts, sections and formatting against your court&apos;s rules before filing.
        </p>
      </section>
    </div>
  );
}
