"use client";

import { Loader2, NotebookPen, Pin, PinOff, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useRef, useState, useTransition } from "react";
import { createNote, deleteNote, moveNote, saveNote } from "@/app/(app)/desk-actions";
import { FolderRail } from "@/components/app/desk/FolderRail";
import type { Folder, Note } from "@/lib/desk/queries";
import { formatDayMonth } from "@/lib/desk/format";

type Draft = { title: string; body: string; tag: string; pinned: boolean };
type Status = "idle" | "saving" | "saved";

function Editor({ note, folders, onDeleted }: { note: Note; folders: Folder[]; onDeleted: () => void }) {
  const [draft, setDraft] = useState<Draft>({ title: note.title, body: note.body, tag: note.tag ?? "", pinned: note.pinned });
  const [status, setStatus] = useState<Status>("idle");
  const [deleting, startDelete] = useTransition();
  const [moving, startMove] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef(draft);

  function update(patch: Partial<Draft>, immediate = false) {
    latest.current = { ...latest.current, ...patch };
    setDraft(latest.current);
    setStatus("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(
      async () => {
        await saveNote(note.id, latest.current);
        setStatus("saved");
      },
      immediate ? 0 : 700,
    );
  }

  return (
    <div className="flex min-h-[28rem] min-w-0 flex-col rounded-2xl border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <input
          value={draft.tag}
          onChange={(e) => update({ tag: e.target.value })}
          placeholder="Add a tag, e.g. Bail matter"
          aria-label="Tag"
          maxLength={40}
          className="h-8 w-40 min-w-0 rounded-lg bg-surface-2 px-3 text-xs outline-none placeholder:text-muted focus:ring-1 focus:ring-accent/60"
        />
        <select
          aria-label="Folder"
          disabled={moving}
          value={note.folderId ?? ""}
          onChange={(e) => startMove(() => moveNote(note.id, e.target.value || null))}
          className="h-8 max-w-[10rem] rounded-lg bg-surface-2 px-2 text-xs outline-none focus:ring-1 focus:ring-accent/60"
        >
          <option value="">Unfiled</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted" aria-live="polite">
          {status === "saving" && <Loader2 className="size-3.5 animate-spin" />}
          {status === "saving" ? "Saving" : status === "saved" ? "Saved" : `Edited ${formatDayMonth(note.updatedAt)}`}
        </span>
        <button
          type="button"
          onClick={() => update({ pinned: !draft.pinned }, true)}
          aria-label={draft.pinned ? "Unpin note" : "Pin note"}
          aria-pressed={draft.pinned}
          className={`grid size-8 place-items-center rounded-lg transition hover:bg-surface-2 ${draft.pinned ? "text-accent" : "text-muted"}`}
        >
          {draft.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={() => {
            if (!confirm("Delete this note? This can't be undone.")) return;
            clearTimeout(timer.current);
            startDelete(async () => {
              await deleteNote(note.id);
              onDeleted();
            });
          }}
          aria-label="Delete note"
          className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <input
        value={draft.title}
        onChange={(e) => update({ title: e.target.value })}
        placeholder="Title"
        aria-label="Note title"
        maxLength={200}
        className="bg-transparent px-5 pt-5 font-display text-2xl font-bold outline-none placeholder:text-muted"
      />
      <textarea
        value={draft.body}
        onChange={(e) => update({ body: e.target.value })}
        placeholder="Write your research notes, arguments or citations here…"
        aria-label="Note body"
        className="min-h-80 flex-1 resize-none bg-transparent px-5 py-4 text-[15px] leading-7 outline-none placeholder:text-muted"
      />
    </div>
  );
}

export function NotesBoard({ notes, folders }: { notes: Note[]; folders: Folder[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(notes[0]?.id ?? null);
  const [folderFilter, setFolderFilter] = useState<string | null | "all">("all");
  const [query, setQuery] = useState("");
  const [creating, startCreate] = useTransition();

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: notes.length, unfiled: 0 };
    for (const n of notes) {
      if (!n.folderId) c.unfiled++;
      else c[n.folderId] = (c[n.folderId] ?? 0) + 1;
    }
    return c;
  }, [notes]);

  const filtered = useMemo(() => {
    let list = notes;
    if (folderFilter === null) list = list.filter((n) => !n.folderId);
    else if (folderFilter !== "all") list = list.filter((n) => n.folderId === folderFilter);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) || n.tag?.toLowerCase().includes(q),
    );
  }, [notes, query, folderFilter]);

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  function newNote() {
    startCreate(async () => {
      const id = await createNote(folderFilter === "all" ? null : folderFilter);
      setQuery("");
      setSelectedId(id);
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_280px_1fr]">
      <aside className="rounded-2xl border border-border bg-surface p-3">
        <FolderRail kind="notes" folders={folders} selectedId={folderFilter} onSelect={setFolderFilter} counts={counts} />
      </aside>
      <aside className="flex min-w-0 flex-col gap-3">
        <button
          type="button"
          onClick={newNote}
          disabled={creating}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
        >
          {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} New note
        </button>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes"
            aria-label="Search notes"
            className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-sm outline-none placeholder:text-muted focus:border-accent/60"
          />
        </div>
        <ul className="flex max-h-[32rem] flex-col gap-1.5 overflow-y-auto">
          {filtered.map((n) => {
            const active = n.id === selectedId;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(n.id)}
                  className={`flex w-full flex-col gap-1 rounded-xl border px-4 py-3 text-left transition ${
                    active ? "border-accent/50 bg-accent/10" : "border-transparent hover:bg-surface"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {n.pinned && <Pin className="size-3.5 shrink-0 text-accent" />}
                    <span className="truncate text-sm font-semibold">{n.title}</span>
                  </span>
                  <span className="line-clamp-2 text-xs text-muted">{n.body || "No content yet"}</span>
                  <span className="flex items-center gap-2 text-[11px] text-muted">
                    {formatDayMonth(n.updatedAt)}
                    {n.tag && <span className="rounded-full bg-surface-2 px-2 py-0.5">{n.tag}</span>}
                  </span>
                </button>
              </li>
            );
          })}
          {notes.length > 0 && filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-muted">No notes match this folder or search.</li>
          )}
        </ul>
      </aside>

      {selected ? (
        <Editor
          key={selected.id}
          note={selected}
          folders={folders}
          onDeleted={() => setSelectedId(notes.find((n) => n.id !== selected.id)?.id ?? null)}
        />
      ) : (
        <div className="grid min-h-[28rem] place-items-center gap-3 rounded-2xl border border-dashed border-border px-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <NotebookPen className="size-8 text-muted" />
            <p className="font-display text-lg font-semibold">{notes.length ? "Pick a note to open it" : "No notes yet"}</p>
            <p className="max-w-sm text-sm text-muted">
              Keep research notes, arguments and citations in one place. They save automatically as you type.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
