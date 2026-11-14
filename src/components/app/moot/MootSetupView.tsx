"use client";

import { ArrowRight, BookOpen, FileText, FileUp, Gavel, KeyRound, Library, Loader2, Mic, MicOff, Sparkles, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { deleteMoot } from "@/app/(app)/moot-practice/actions";
import { useDictation } from "@/components/app/useDictation";
import { formatDayMonth } from "@/lib/desk/format";
import { MAX_DOCUMENT_BYTES, MAX_FACTS_CHARS } from "@/lib/moot/limits";
import { benchModes, caseTypeSuggestions, courtLevels, roles, scenarios, type BenchMode, type CaseSource } from "@/lib/moot/scenarios";
import { routes } from "@/lib/navigation";

export type MootListItem = { id: string; title: string; side: string; overall: number | null; closed: boolean; updatedAt: string };

const label = "text-xs font-semibold uppercase tracking-[0.14em] text-muted";
const inputCls =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-accent/60";

const modes: { key: CaseSource; label: string; blurb: string; icon: typeof Sparkles }[] = [
  { key: "generate", label: "Generate a case", blurb: "AI writes a fresh fact pattern for you", icon: Sparkles },
  { key: "own", label: "My own case", blurb: "Practise a real matter you're preparing", icon: FileText },
  { key: "library", label: "Practice library", blurb: "Ready-made moot problems", icon: Library },
];

function Choice({ active, onClick, title, blurb }: { active: boolean; onClick: () => void; title: string; blurb?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex flex-col gap-0.5 rounded-xl border px-4 py-3 text-left transition ${
        active ? "border-accent bg-accent/10" : "border-border bg-background hover:border-accent/50"
      }`}
    >
      <span className={`text-sm font-semibold ${active ? "text-accent" : ""}`}>{title}</span>
      {blurb && <span className="text-xs text-muted">{blurb}</span>}
    </button>
  );
}

function Field({ title, hint, children, wide }: { title: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-medium ${wide ? "sm:col-span-2" : ""}`}>
      <span>
        {title} {hint && <span className="font-normal text-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function MicButton({ onText, label: name }: { onText: (t: string) => void; label: string }) {
  const { listening, toggle } = useDictation(onText, { continuous: true });
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? "Stop dictation" : name}
      className={`absolute right-2 top-2 grid size-8 place-items-center rounded-lg transition ${
        listening ? "bg-red-500/15 text-red-400" : "text-muted hover:bg-surface-2 hover:text-foreground"
      }`}
    >
      {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
    </button>
  );
}

function PastSessions({ sessions }: { sessions: MootListItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <aside className="flex flex-col gap-3 lg:sticky lg:top-20 lg:self-start">
      <h2 className={label}>Past hearings</h2>
      {sessions.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          Your hearings and scores are saved here.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {sessions.map((s) => (
            <li key={s.id} className="group relative">
              <button
                type="button"
                onClick={() => router.push(`${routes.mootPractice}?s=${s.id}`)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 pr-9 text-left text-sm transition hover:bg-surface-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{s.title}</span>
                  <span className="block truncate text-xs text-muted">
                    {s.side} · {formatDayMonth(s.updatedAt)}
                    {!s.closed && s.overall !== null && " · in progress"}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                    s.overall === null ? "bg-surface-2 text-muted" : "bg-accent/12 text-accent"
                  }`}
                >
                  {s.overall === null ? "Open" : s.overall.toFixed(1)}
                </span>
              </button>
              <button
                type="button"
                disabled={pending}
                aria-label={`Delete ${s.title}`}
                onClick={() => {
                  if (confirm("Delete this hearing?")) start(() => deleteMoot(s.id));
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
  );
}

export function MootSetupView({ sessions, configured }: { sessions: MootListItem[]; configured: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<CaseSource>("generate");
  const [court, setCourt] = useState<string>(courtLevels[1]);
  const [caseType, setCaseType] = useState("");
  const [role, setRole] = useState<string>(roles[0]);
  const [bench, setBench] = useState<BenchMode>("balanced");
  const [own, setOwn] = useState({ title: "", facts: "", issues: "" });
  const [file, setFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [scenario, setScenario] = useState(scenarios[0].key);
  const [sideIndex, setSideIndex] = useState(0);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const selected = scenarios.find((s) => s.key === scenario)!;
  const usesAi = mode === "generate" || (mode === "own" && file !== null);
  const append = (k: "facts") => (t: string) => setOwn((o) => ({ ...o, [k]: o[k] ? `${o[k]} ${t}` : t }));

  function pickFile(f: File | undefined) {
    setError("");
    if (!f) return;
    if (!["application/pdf", "text/plain"].includes(f.type)) return setError("Upload a PDF or a plain-text (.txt) file.");
    if (f.size > MAX_DOCUMENT_BYTES) return setError("The document must be under 10 MB.");
    setFile(f);
  }

  async function begin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const body = new FormData();
    body.set("mode", mode);
    body.set("bench", bench);
    if (mode === "library") {
      body.set("scenario", scenario);
      body.set("sideIndex", String(sideIndex));
    } else {
      body.set("court", court);
      body.set("caseType", caseType);
      body.set("role", role);
      if (mode === "own") {
        body.set("title", own.title);
        body.set("facts", own.facts);
        body.set("issues", own.issues);
        if (file) body.set("file", file);
      }
    }
    setPending(true);
    try {
      const res = await fetch("/api/moot/start", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error || "Couldn't start the hearing. Please try again.");
      router.push(`${routes.mootPractice}?s=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start the hearing. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <form onSubmit={begin} className="flex flex-col gap-8">
        {!configured && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
            <KeyRound className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <p>
              <span className="font-semibold">The virtual courtroom isn&apos;t connected yet.</span>{" "}
              <span className="text-muted">Add an AI provider key to the server configuration to start hearings.</span>
            </p>
          </div>
        )}

        <section>
          <h2 className={`${label} mb-3`}>1 · The case</h2>
          <div className="grid gap-2 sm:grid-cols-3" role="tablist">
            {modes.map((m) => (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={mode === m.key}
                onClick={() => {
                  setMode(m.key);
                  setError("");
                }}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  mode === m.key ? "border-accent bg-accent/8" : "border-border bg-surface hover:border-accent/50"
                }`}
              >
                <m.icon className={`mt-0.5 size-4 shrink-0 ${mode === m.key ? "text-accent" : "text-muted"}`} />
                <span>
                  <span className={`block text-sm font-semibold ${mode === m.key ? "text-accent" : ""}`}>{m.label}</span>
                  <span className="block text-xs text-muted">{m.blurb}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          {mode === "library" ? (
            <div className="flex flex-col gap-5">
              <div className="grid gap-2 sm:grid-cols-2">
                {scenarios.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    aria-pressed={scenario === s.key}
                    onClick={() => {
                      setScenario(s.key);
                      setSideIndex(0);
                    }}
                    className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition ${
                      scenario === s.key ? "border-accent bg-accent/8" : "border-border bg-background hover:border-accent/50"
                    }`}
                  >
                    <span className="text-xs font-semibold text-accent">{s.area}</span>
                    <span className="font-display text-sm font-semibold">{s.title}</span>
                    <span className="text-xs text-muted">{s.forum}</span>
                  </button>
                ))}
              </div>
              <p className="font-serif text-[15px] leading-relaxed text-foreground/90">{selected.facts}</p>
              <div>
                <p className={`${label} mb-2`}>Issues</p>
                <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground/85">
                  {selected.issues.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ol>
              </div>
              <div>
                <p className={`${label} mb-2`}>You appear for</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selected.sides.map((side, i) => (
                    <Choice key={side} active={sideIndex === i} onClick={() => setSideIndex(i)} title={side} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field title="Court">
                <select value={court} onChange={(e) => setCourt(e.target.value)} className={inputCls}>
                  {courtLevels.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field title="You appear as">
                <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field title="Type of matter *" wide>
                <input
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  required
                  maxLength={120}
                  list="moot-case-types"
                  placeholder="e.g. Regular bail, Writ petition, Cheque dishonour"
                  className={inputCls}
                />
                <datalist id="moot-case-types">
                  {caseTypeSuggestions.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </Field>

              {mode === "generate" ? (
                <p className="flex items-start gap-2 text-sm text-muted sm:col-span-2">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
                  A fictional but realistic fact pattern will be written for this court and matter, balanced so both sides have arguable points.
                </p>
              ) : (
                <>
                  <Field title="Case title" hint="(optional)" wide>
                    <input
                      value={own.title}
                      onChange={(e) => setOwn((o) => ({ ...o, title: e.target.value }))}
                      maxLength={120}
                      placeholder="e.g. Sharma v. State of Rajasthan"
                      className={inputCls}
                    />
                  </Field>
                  <Field title={file ? "Your notes on the case" : "Facts *"} hint={file ? "(optional)" : undefined} wide>
                    <div className="relative">
                      <textarea
                        value={own.facts}
                        onChange={(e) => setOwn((o) => ({ ...o, facts: e.target.value }))}
                        maxLength={MAX_FACTS_CHARS}
                        rows={6}
                        placeholder={file ? "Anything the document doesn't say, or what you want to focus on." : "Parties, key events, the stage of proceedings and the central dispute."}
                        className={`${inputCls} resize-y pr-12`}
                      />
                      <MicButton onText={append("facts")} label="Dictate the facts" />
                    </div>
                  </Field>
                  {!file && (
                    <Field title="Issues" hint="(optional, one per line)" wide>
                      <textarea
                        value={own.issues}
                        onChange={(e) => setOwn((o) => ({ ...o, issues: e.target.value }))}
                        maxLength={2000}
                        rows={3}
                        className={`${inputCls} resize-y`}
                      />
                    </Field>
                  )}
                  <div className="sm:col-span-2">
                    <input
                      ref={fileInput}
                      type="file"
                      accept="application/pdf,text/plain,.pdf,.txt"
                      className="hidden"
                      onChange={(e) => {
                        pickFile(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                    {file ? (
                      <div className="flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/8 px-4 py-3 text-sm">
                        <FileText className="size-4 shrink-0 text-accent" />
                        <span className="min-w-0 flex-1 truncate font-medium">{file.name}</span>
                        <span className="text-xs text-muted">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                        <button type="button" aria-label="Remove document" onClick={() => setFile(null)} className="text-muted hover:text-foreground">
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          pickFile(e.dataTransfer.files[0]);
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-4 text-sm text-muted transition hover:border-accent/50 hover:text-foreground"
                      >
                        <FileUp className="size-4" /> Upload the case document (PDF or .txt, up to 10 MB), and the brief is prepared from it
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        <section>
          <h2 className={`${label} mb-3`}>2 · How tough should the court be?</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {benchModes.map((b) => (
              <Choice key={b.key} active={bench === b.key} onClick={() => setBench(b.key)} title={b.label} blurb={b.blurb} />
            ))}
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted">
            <BookOpen className="size-4 shrink-0" /> The AI plays both the judge and opposing counsel.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={!configured || pending}
            className="flex h-12 items-center gap-2 rounded-xl bg-accent px-6 font-semibold text-black transition hover:brightness-110 disabled:opacity-40"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Gavel className="size-4" />}
            {pending && usesAi ? "Preparing the brief…" : "Enter the courtroom"}
            {!pending && <ArrowRight className="size-4" />}
          </button>
          {error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : (
            usesAi && <p className="text-xs text-muted">Preparing the brief uses one AI request.</p>
          )}
        </div>
      </form>

      <PastSessions sessions={sessions} />
    </div>
  );
}
