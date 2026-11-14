"use client";

import { ArrowLeftRight, BookMarked, Scale, SpellCheck2, Trash2, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteSaved, moveSaved } from "@/app/(app)/desk-actions";
import { FolderRail } from "@/components/app/desk/FolderRail";
import type { Folder, SavedItem, SavedKind } from "@/lib/desk/queries";
import { formatDayMonth } from "@/lib/desk/format";
import { routes } from "@/lib/navigation";

const kindMeta: Record<SavedKind, { label: string; icon: LucideIcon }> = {
  section: { label: "Sections", icon: ArrowLeftRight },
  article: { label: "Articles", icon: Scale },
  term: { label: "Glossary terms", icon: SpellCheck2 },
};

function Row({ item, folders }: { item: SavedItem; folders: Folder[] }) {
  const [pending, start] = useTransition();
  const Icon = kindMeta[item.kind].icon;
  return (
    <li className={`flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition ${pending ? "opacity-50" : ""}`}>
      <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-background text-accent">
        <Icon className="size-5" />
      </span>
      <Link href={item.href} className="min-w-0 flex-1 hover:underline">
        <p className="truncate font-semibold">{item.title}</p>
        {item.subtitle && <p className="truncate text-sm text-muted">{item.subtitle}</p>}
      </Link>
      <select
        aria-label="Folder"
        disabled={pending}
        value={item.folderId ?? ""}
        onChange={(e) => start(() => moveSaved(item.id, e.target.value || null))}
        className="hidden h-8 max-w-[9rem] rounded-lg border border-border bg-background px-2 text-xs sm:block"
      >
        <option value="">Unfiled</option>
        {folders.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
      <span className="hidden text-xs text-muted md:block">{formatDayMonth(item.createdAt)}</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => deleteSaved(item.id))}
        aria-label={`Remove ${item.title}`}
        className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-red-500/10 hover:text-red-400"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}

export function SavedList({ items, folders }: { items: SavedItem[]; folders: Folder[] }) {
  const [kind, setKind] = useState<SavedKind | "all">("all");
  const [folderFilter, setFolderFilter] = useState<string | null | "all">("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length, unfiled: 0 };
    for (const i of items) {
      if (!i.folderId) c.unfiled++;
      else c[i.folderId] = (c[i.folderId] ?? 0) + 1;
    }
    return c;
  }, [items]);

  const shown = useMemo(() => {
    let list = kind === "all" ? items : items.filter((i) => i.kind === kind);
    if (folderFilter === null) list = list.filter((i) => !i.folderId);
    else if (folderFilter !== "all") list = list.filter((i) => i.folderId === folderFilter);
    return list;
  }, [items, kind, folderFilter]);

  if (items.length === 0) {
    return (
      <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
        <BookMarked className="size-8 text-muted" />
        <p className="font-display text-lg font-semibold">Nothing saved yet</p>
        <p className="max-w-md text-sm text-muted">
          Tap the bookmark on any section in the Code Converter, an article of the Constitution or a glossary term to keep it here.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Link href={routes.codeConverter("ipc-bns")} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-surface">
            Code Converter
          </Link>
          <Link href={routes.constitution} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-surface">
            Constitution
          </Link>
          <Link href={routes.glossary} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-surface">
            Glossary
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <aside className="rounded-2xl border border-border bg-surface p-3 lg:sticky lg:top-20 lg:self-start">
        <FolderRail kind="saved" folders={folders} selectedId={folderFilter} onSelect={setFolderFilter} counts={counts} />
      </aside>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          {(["all", "section", "article", "term"] as const).map((k) => {
            const count = k === "all" ? items.length : items.filter((i) => i.kind === k).length;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`h-8 rounded-full px-3 text-xs font-semibold transition ${
                  kind === k ? "bg-foreground text-background" : "bg-surface-2 text-muted hover:text-foreground"
                }`}
              >
                {k === "all" ? "All" : kindMeta[k].label} <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
        <ul className="flex flex-col gap-2">
          {shown.map((i) => (
            <Row key={i.id} item={i} folders={folders} />
          ))}
          {shown.length === 0 && <li className="py-8 text-center text-sm text-muted">Nothing in this folder.</li>}
        </ul>
      </div>
    </div>
  );
}
