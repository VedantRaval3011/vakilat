"use client";

import { X } from "lucide-react";
import { useState, useTransition } from "react";
import { dismissUserTour } from "@/app/(app)/tour-actions";
import { tours, type TourKey } from "@/lib/tours/catalog";

export function Tour({ tourKey }: { tourKey: TourKey }) {
  const tour = tours[tourKey];
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(true);
  const [pending, start] = useTransition();

  if (!open || !tour) return null;
  const current = tour.steps[step]!;
  const last = step >= tour.steps.length - 1;

  function close() {
    setOpen(false);
    start(() => dismissUserTour(tourKey));
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[min(100%-2rem,22rem)] rounded-2xl border border-border bg-surface p-5 shadow-2xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
            {tour.label} · {step + 1}/{tour.steps.length}
          </p>
          <h2 className="mt-1 font-display text-lg font-bold">{current.title}</h2>
        </div>
        <button type="button" onClick={close} disabled={pending} aria-label="Dismiss tour" className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2">
          <X className="size-4" />
        </button>
      </div>
      <p className="text-sm leading-relaxed text-muted">{current.body}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button type="button" onClick={close} className="text-xs font-semibold text-muted hover:text-foreground">
          Skip
        </button>
        <div className="flex gap-2">
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="h-9 rounded-lg px-3 text-sm font-semibold text-muted hover:bg-surface-2">
              Back
            </button>
          )}
          <button
            type="button"
            onClick={() => (last ? close() : setStep((s) => s + 1))}
            className="h-9 rounded-lg bg-accent px-4 text-sm font-semibold text-black"
          >
            {last ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
