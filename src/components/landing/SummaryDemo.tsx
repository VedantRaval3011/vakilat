"use client";

import { FileText } from "lucide-react";
import { useEffect, useState } from "react";

const points = [
  "Conviction upheld: intention established from the nature of injuries.",
  "Plea of sudden provocation rejected for lack of contemporaneous evidence.",
  "Sentence commuted to life imprisonment on mitigating factors.",
];

export function SummaryDemo() {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setShown((n) => (n >= points.length + 2 ? 0 : n + 1)), 1200);
    return () => clearInterval(id);
  }, []);

  const visible = Math.min(shown, points.length);

  return (
    <div className="rounded-2xl border border-border bg-background p-4 font-mono text-xs">
      <div className="flex items-center justify-between text-muted">
        <span className="tracking-widest">AI SUMMARY ENGINE</span>
        <span className={visible < points.length ? "text-amber-400" : "text-emerald-400"}>
          {visible < points.length ? "Extracting points" : "Complete"}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface px-3 py-2 font-sans text-sm">
        <FileText className="size-4 text-accent" />
        Judgment.pdf
      </div>
      <ul className="mt-3 min-h-24 space-y-2 font-sans text-sm">
        {visible === 0 && <li className="text-muted">Waiting for extraction...</li>}
        {points.slice(0, visible).map((p) => (
          <li key={p} className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between text-[10px] tracking-widest text-muted">
        <span>DOC_ID: 7F21A9</span>
        <span>VAKILAT LEGAL AI</span>
      </div>
    </div>
  );
}
