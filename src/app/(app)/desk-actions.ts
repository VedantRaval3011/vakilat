"use server";

import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { eventTypes, remindDate } from "@/lib/desk/event-types";
import {
  insertFolder,
  insertHearing,
  insertNote,
  patchNote,
  removeFolder,
  removeHearing,
  removeNote,
  removeSavedItem,
  renameFolder,
  setNoteFolder,
  setSavedFolder,
  toggleSavedItem,
  updateHearing,
  type FolderKind,
  type SavedKind,
} from "@/lib/desk/queries";

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Notes

export async function createNote(folderId?: string | null) {
  const user = await getCurrentUser();
  const id = insertNote(user.id, folderId);
  refresh();
  return id;
}

export async function saveNote(id: string, data: { title: string; body: string; tag: string; pinned: boolean }) {
  const user = await getCurrentUser();
  patchNote(user.id, id, {
    title: clip(data.title, 200) || "Untitled note",
    body: typeof data.body === "string" ? data.body.slice(0, 50_000) : "",
    tag: clip(data.tag, 40) || null,
    pinned: data.pinned === true,
  });
  refresh();
}

export async function moveNote(id: string, folderId: string | null) {
  const user = await getCurrentUser();
  setNoteFolder(user.id, id, folderId);
  refresh();
}

export async function deleteNote(id: string) {
  const user = await getCurrentUser();
  removeNote(user.id, id);
  refresh();
}

// Folders

export async function createFolder(kind: FolderKind, name: string) {
  const user = await getCurrentUser();
  const cleaned = clip(name, 60);
  if (!cleaned || (kind !== "notes" && kind !== "saved")) return null;
  const id = insertFolder(user.id, kind, cleaned);
  refresh();
  return id;
}

export async function updateFolderName(id: string, name: string) {
  const user = await getCurrentUser();
  const cleaned = clip(name, 60);
  if (!cleaned) return;
  renameFolder(user.id, id, cleaned);
  refresh();
}

export async function deleteFolder(id: string, kind: FolderKind) {
  const user = await getCurrentUser();
  if (kind !== "notes" && kind !== "saved") return;
  removeFolder(user.id, id, kind);
  refresh();
}

export async function moveSaved(id: string, folderId: string | null) {
  const user = await getCurrentUser();
  setSavedFolder(user.id, id, folderId);
  refresh();
}

// Saved items

const kinds: SavedKind[] = ["section", "article", "term"];

export async function toggleSaved(item: { kind: SavedKind; refKey: string; title: string; subtitle?: string; href: string }) {
  const user = await getCurrentUser();
  if (!kinds.includes(item.kind) || !item.href.startsWith("/")) throw new Error("Invalid item");
  const saved = toggleSavedItem(user.id, {
    kind: item.kind,
    refKey: clip(item.refKey, 120),
    title: clip(item.title, 200),
    subtitle: clip(item.subtitle, 300) || null,
    href: clip(item.href, 300),
  });
  refresh();
  return saved;
}

export async function deleteSaved(id: string) {
  const user = await getCurrentUser();
  removeSavedItem(user.id, id);
  refresh();
}

// Hearings

export type HearingFormState = {
  errors?: Partial<Record<"caseTitle" | "court" | "date" | "time" | "eventType", string>>;
  values?: Record<string, string>;
  ok?: boolean;
  error?: string;
};

const hearingFields = ["id", "caseTitle", "caseNumber", "court", "date", "time", "purpose", "notes", "eventType", "remindDays"];

function parseHearingForm(form: FormData): HearingFormState & { data?: Parameters<typeof insertHearing>[1] & { id?: string } } {
  const caseTitle = clip(form.get("caseTitle"), 200);
  const court = clip(form.get("court"), 120);
  const date = clip(form.get("date"), 10);
  const time = clip(form.get("time"), 5);
  const eventType = clip(form.get("eventType"), 40) || "hearing";
  const remindDays = clip(form.get("remindDays"), 2);

  const errors: HearingFormState["errors"] = {};
  if (!caseTitle) errors.caseTitle = "Enter a title.";
  if (!court) errors.court = "Enter the court or venue.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) errors.date = "Pick a valid date.";
  if (time && !/^\d{2}:\d{2}$/.test(time)) errors.time = "Use the HH:MM format.";
  if (!eventTypes.some((t) => t.id === eventType)) errors.eventType = "Choose an event type.";
  if (Object.keys(errors).length) {
    return { errors, values: Object.fromEntries(hearingFields.map((f) => [f, clip(form.get(f), 1000)])) };
  }

  return {
    data: {
      id: clip(form.get("id"), 64) || undefined,
      caseTitle,
      court,
      date,
      time: time || null,
      caseNumber: clip(form.get("caseNumber"), 80) || null,
      purpose: clip(form.get("purpose"), 120) || null,
      notes: clip(form.get("notes"), 1000) || null,
      eventType,
      remindAt: remindDate(date, remindDays),
    },
  };
}

export async function addHearing(_: HearingFormState, form: FormData): Promise<HearingFormState> {
  const user = await getCurrentUser();
  const parsed = parseHearingForm(form);
  if (!parsed.data) return parsed;
  const { id: _id, ...data } = parsed.data;
  void _id;
  insertHearing(user.id, data);
  refresh();
  return { ok: true };
}

export async function saveHearing(_: HearingFormState, form: FormData): Promise<HearingFormState> {
  const user = await getCurrentUser();
  const parsed = parseHearingForm(form);
  if (!parsed.data?.id) return { error: "Missing event." } as HearingFormState;
  const { id, ...data } = parsed.data;
  updateHearing(user.id, id!, data);
  refresh();
  return { ok: true };
}

export async function deleteHearing(id: string) {
  const user = await getCurrentUser();
  removeHearing(user.id, id);
  refresh();
}
