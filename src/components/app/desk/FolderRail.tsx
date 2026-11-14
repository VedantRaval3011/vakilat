"use client";

import { FolderPlus, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { createFolder, deleteFolder, updateFolderName } from "@/app/(app)/desk-actions";
import type { Folder, FolderKind } from "@/lib/desk/queries";

export function FolderRail({
  kind,
  folders,
  selectedId,
  onSelect,
  counts,
}: {
  kind: FolderKind;
  folders: Folder[];
  selectedId: string | null | "all";
  onSelect: (id: string | null | "all") => void;
  counts: Record<string, number>;
}) {
  const [pending, start] = useTransition();
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <div className="flex flex-col gap-1.5">
      <div className="mb-1 flex items-center justify-between px-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Folders</p>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            const name = prompt("Folder name");
            if (!name?.trim()) return;
            start(async () => {
              const id = await createFolder(kind, name);
              if (id) onSelect(id);
            });
          }}
          className="grid size-7 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
          aria-label="New folder"
        >
          <FolderPlus className="size-3.5" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onSelect("all")}
        className={`rounded-lg px-3 py-1.5 text-left text-sm transition ${
          selectedId === "all" ? "bg-accent/15 font-semibold text-accent" : "text-muted hover:bg-surface-2 hover:text-foreground"
        }`}
      >
        All <span className="opacity-60">{counts.all ?? 0}</span>
      </button>
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`rounded-lg px-3 py-1.5 text-left text-sm transition ${
          selectedId === null ? "bg-accent/15 font-semibold text-accent" : "text-muted hover:bg-surface-2 hover:text-foreground"
        }`}
      >
        Unfiled <span className="opacity-60">{counts.unfiled ?? 0}</span>
      </button>
      {folders.map((f) => (
        <div key={f.id} className="group flex items-center gap-1">
          {renaming === f.id ? (
            <form
              className="flex min-w-0 flex-1 gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                start(async () => {
                  await updateFolderName(f.id, draft);
                  setRenaming(null);
                });
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
                maxLength={60}
                className="h-8 min-w-0 flex-1 rounded-lg border border-border bg-background px-2 text-sm outline-none"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => onSelect(f.id)}
              className={`min-w-0 flex-1 truncate rounded-lg px-3 py-1.5 text-left text-sm transition ${
                selectedId === f.id ? "bg-accent/15 font-semibold text-accent" : "text-muted hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              {f.name} <span className="opacity-60">{counts[f.id] ?? 0}</span>
            </button>
          )}
          <button
            type="button"
            aria-label={`Rename ${f.name}`}
            onClick={() => {
              setRenaming(f.id);
              setDraft(f.name);
            }}
            className="grid size-7 place-items-center rounded-lg text-muted opacity-0 hover:bg-surface-2 group-hover:opacity-100"
          >
            <Pencil className="size-3" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${f.name}`}
            disabled={pending}
            onClick={() => {
              if (!confirm(`Delete folder “${f.name}”? Items stay, unfiled.`)) return;
              start(async () => {
                await deleteFolder(f.id, kind);
                if (selectedId === f.id) onSelect("all");
              });
            }}
            className="grid size-7 place-items-center rounded-lg text-muted opacity-0 hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
