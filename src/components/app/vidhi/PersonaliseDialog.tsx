"use client";

import { Check, Loader2, RotateCcw, UserRoundCog, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { updateVidhiProfile } from "@/app/(app)/vidhi/actions";
import { brand } from "@/lib/content";
import { emptyProfile, profileFields, type VidhiProfile } from "@/lib/vidhi/config";

export function PersonaliseDialog({
  profile,
  onClose,
  onSaved,
}: {
  profile: VidhiProfile;
  onClose: () => void;
  onSaved: (p: VidhiProfile) => void;
}) {
  const [draft, setDraft] = useState(profile);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const empty = profileFields.every((f) => !draft[f.name].trim());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition placeholder:text-muted focus:border-accent/60";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="personalise-title">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const next = await updateVidhiProfile(draft);
            onSaved(next);
            setSaved(true);
            setTimeout(onClose, 600);
          });
        }}
        className="relative flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-5">
          <div className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
              <UserRoundCog className="size-5" />
            </span>
            <div>
              <h2 id="personalise-title" className="font-display text-lg font-bold">
                Personalise {brand.assistant}
              </h2>
              <p className="mt-0.5 text-sm text-muted">Tell {brand.assistant} about your work so answers fit your practice.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          {profileFields.map((f) => (
            <label key={f.name} className="flex flex-col gap-1.5 text-sm font-medium">
              <span className="flex justify-between gap-2">
                {f.label}
                <span className="font-normal tabular-nums text-muted">
                  {draft[f.name].length}/{f.max.toLocaleString("en-IN")}
                </span>
              </span>
              {f.multiline ? (
                <textarea
                  value={draft[f.name]}
                  maxLength={f.max}
                  rows={f.name === "preferences" ? 4 : 2}
                  onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  className={`${inputCls} resize-y py-2.5`}
                />
              ) : (
                <input
                  value={draft[f.name]}
                  maxLength={f.max}
                  onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  className={`${inputCls} h-11`}
                />
              )}
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
          <p className="text-xs text-muted">Applied to every new answer. Only you can see this.</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={empty || pending}
              onClick={() => setDraft(emptyProfile)}
              className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-muted transition hover:text-foreground disabled:opacity-40"
            >
              <RotateCcw className="size-3.5" /> Clear all
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-accent px-4 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
            >
              {saved ? <Check className="size-4" /> : pending && <Loader2 className="size-4 animate-spin" />}
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
