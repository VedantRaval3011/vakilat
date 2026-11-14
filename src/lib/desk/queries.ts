import "server-only";
import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";

export type Note = {
  id: string;
  title: string;
  body: string;
  tag: string | null;
  pinned: boolean;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SavedKind = "section" | "article" | "term";

export type SavedItem = {
  id: string;
  kind: SavedKind;
  refKey: string;
  title: string;
  subtitle: string | null;
  href: string;
  folderId: string | null;
  createdAt: string;
};

export type FolderKind = "notes" | "saved";

export type Folder = {
  id: string;
  kind: FolderKind;
  name: string;
  createdAt: string;
};

export type Hearing = {
  id: string;
  caseTitle: string;
  caseNumber: string | null;
  court: string;
  purpose: string | null;
  date: string;
  time: string | null;
  notes: string | null;
  eventType: string;
  remindAt: string | null;
};

const now = () => new Date().toISOString();

// Notes

type NoteRow = {
  id: string;
  title: string;
  body: string;
  tag: string | null;
  pinned: number;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
};

const toNote = (r: NoteRow): Note => ({
  id: r.id,
  title: r.title,
  body: r.body,
  tag: r.tag,
  pinned: r.pinned === 1,
  folderId: r.folder_id,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export function listNotes(userId: string) {
  const rows = getDb()
    .prepare("SELECT * FROM notes WHERE user_id = ? ORDER BY pinned DESC, updated_at DESC")
    .all(userId) as NoteRow[];
  return rows.map(toNote);
}

export function insertNote(userId: string, folderId?: string | null) {
  const id = randomUUID();
  const t = now();
  getDb()
    .prepare("INSERT INTO notes (id, user_id, title, body, folder_id, created_at, updated_at) VALUES (?, ?, ?, '', ?, ?, ?)")
    .run(id, userId, "Untitled note", folderId ?? null, t, t);
  return id;
}

export function patchNote(
  userId: string,
  id: string,
  data: { title: string; body: string; tag: string | null; pinned: boolean; folderId?: string | null },
) {
  if (data.folderId === undefined) {
    getDb()
      .prepare("UPDATE notes SET title = ?, body = ?, tag = ?, pinned = ?, updated_at = ? WHERE id = ? AND user_id = ?")
      .run(data.title, data.body, data.tag, data.pinned ? 1 : 0, now(), id, userId);
  } else {
    getDb()
      .prepare("UPDATE notes SET title = ?, body = ?, tag = ?, pinned = ?, folder_id = ?, updated_at = ? WHERE id = ? AND user_id = ?")
      .run(data.title, data.body, data.tag, data.pinned ? 1 : 0, data.folderId, now(), id, userId);
  }
}

export function setNoteFolder(userId: string, id: string, folderId: string | null) {
  getDb().prepare("UPDATE notes SET folder_id = ?, updated_at = ? WHERE id = ? AND user_id = ?").run(folderId, now(), id, userId);
}

export function removeNote(userId: string, id: string) {
  getDb().prepare("DELETE FROM notes WHERE id = ? AND user_id = ?").run(id, userId);
}

// Folders

type FolderRow = { id: string; kind: FolderKind; name: string; created_at: string };

export function listFolders(userId: string, kind: FolderKind): Folder[] {
  const rows = getDb()
    .prepare("SELECT id, kind, name, created_at FROM folders WHERE user_id = ? AND kind = ? ORDER BY name COLLATE NOCASE")
    .all(userId, kind) as FolderRow[];
  return rows.map((r) => ({ id: r.id, kind: r.kind, name: r.name, createdAt: r.created_at }));
}

export function insertFolder(userId: string, kind: FolderKind, name: string) {
  const id = randomUUID();
  getDb()
    .prepare("INSERT INTO folders (id, user_id, kind, name, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(id, userId, kind, name, now());
  return id;
}

export function renameFolder(userId: string, id: string, name: string) {
  getDb().prepare("UPDATE folders SET name = ? WHERE id = ? AND user_id = ?").run(name, id, userId);
}

export function removeFolder(userId: string, id: string, kind: FolderKind) {
  const db = getDb();
  if (kind === "notes") db.prepare("UPDATE notes SET folder_id = NULL WHERE user_id = ? AND folder_id = ?").run(userId, id);
  else db.prepare("UPDATE saved_items SET folder_id = NULL WHERE user_id = ? AND folder_id = ?").run(userId, id);
  db.prepare("DELETE FROM folders WHERE id = ? AND user_id = ?").run(id, userId);
}

// Saved items

type SavedRow = {
  id: string;
  kind: SavedKind;
  ref_key: string;
  title: string;
  subtitle: string | null;
  href: string;
  folder_id: string | null;
  created_at: string;
};

export function listSaved(userId: string) {
  const rows = getDb().prepare("SELECT * FROM saved_items WHERE user_id = ? ORDER BY created_at DESC").all(userId) as SavedRow[];
  return rows.map(
    (r): SavedItem => ({
      id: r.id,
      kind: r.kind,
      refKey: r.ref_key,
      title: r.title,
      subtitle: r.subtitle,
      href: r.href,
      folderId: r.folder_id,
      createdAt: r.created_at,
    }),
  );
}

export function savedKeys(userId: string, kind: SavedKind) {
  const rows = getDb().prepare("SELECT ref_key FROM saved_items WHERE user_id = ? AND kind = ?").all(userId, kind) as { ref_key: string }[];
  return rows.map((r) => r.ref_key);
}

export function toggleSavedItem(userId: string, item: Omit<SavedItem, "id" | "createdAt" | "folderId"> & { folderId?: string | null }) {
  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM saved_items WHERE user_id = ? AND kind = ? AND ref_key = ?")
    .get(userId, item.kind, item.refKey) as { id: string } | undefined;
  if (existing) {
    db.prepare("DELETE FROM saved_items WHERE id = ?").run(existing.id);
    return false;
  }
  db.prepare(
    "INSERT INTO saved_items (id, user_id, kind, ref_key, title, subtitle, href, folder_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).run(randomUUID(), userId, item.kind, item.refKey, item.title, item.subtitle, item.href, item.folderId ?? null, now());
  return true;
}

export function setSavedFolder(userId: string, id: string, folderId: string | null) {
  getDb().prepare("UPDATE saved_items SET folder_id = ? WHERE id = ? AND user_id = ?").run(folderId, id, userId);
}

export function removeSavedItem(userId: string, id: string) {
  getDb().prepare("DELETE FROM saved_items WHERE id = ? AND user_id = ?").run(id, userId);
}

// Hearings

type HearingRow = {
  id: string;
  case_title: string;
  case_number: string | null;
  court: string;
  purpose: string | null;
  hearing_date: string;
  hearing_time: string | null;
  notes: string | null;
  event_type: string | null;
  remind_at: string | null;
};

export function listHearings(userId: string) {
  const rows = getDb()
    .prepare("SELECT * FROM hearings WHERE user_id = ? ORDER BY hearing_date ASC, hearing_time ASC")
    .all(userId) as HearingRow[];
  return rows.map(
    (r): Hearing => ({
      id: r.id,
      caseTitle: r.case_title,
      caseNumber: r.case_number,
      court: r.court,
      purpose: r.purpose,
      date: r.hearing_date,
      time: r.hearing_time,
      notes: r.notes,
      eventType: r.event_type || "hearing",
      remindAt: r.remind_at,
    }),
  );
}

export function insertHearing(userId: string, h: Omit<Hearing, "id">) {
  getDb()
    .prepare(
      `INSERT INTO hearings (id, user_id, case_title, case_number, court, purpose, hearing_date, hearing_time, notes, event_type, remind_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      randomUUID(),
      userId,
      h.caseTitle,
      h.caseNumber,
      h.court,
      h.purpose,
      h.date,
      h.time,
      h.notes,
      h.eventType,
      h.remindAt,
      now(),
    );
}

export function updateHearing(userId: string, id: string, h: Omit<Hearing, "id">) {
  getDb()
    .prepare(
      `UPDATE hearings SET case_title = ?, case_number = ?, court = ?, purpose = ?, hearing_date = ?, hearing_time = ?, notes = ?, event_type = ?, remind_at = ?
       WHERE id = ? AND user_id = ?`,
    )
    .run(h.caseTitle, h.caseNumber, h.court, h.purpose, h.date, h.time, h.notes, h.eventType, h.remindAt, id, userId);
}

export function removeHearing(userId: string, id: string) {
  getDb().prepare("DELETE FROM hearings WHERE id = ? AND user_id = ?").run(id, userId);
}
