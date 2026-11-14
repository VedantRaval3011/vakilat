"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleSaved } from "@/app/(app)/desk-actions";
import type { SavedKind } from "@/lib/desk/queries";

export type SaveTarget = { kind: SavedKind; refKey: string; title: string; subtitle?: string; href: string };

export function SaveButton({ target, initialSaved, label = false }: { target: SaveTarget; initialSaved: boolean; label?: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${target.title} from Saved` : `Save ${target.title}`}
      onClick={() => {
        setSaved(!saved);
        start(async () => {
          try {
            setSaved(await toggleSaved(target));
          } catch {
            setSaved(saved);
          }
        });
      }}
      className={`flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition hover:bg-surface-2 ${
        label ? "px-2.5" : "w-8"
      } ${saved ? "text-accent" : "text-muted hover:text-foreground"}`}
    >
      {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
      {label && (saved ? "Saved" : "Save")}
    </button>
  );
}
