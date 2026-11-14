import "server-only";
import type { UIMessage } from "ai";
import { getDb } from "@/lib/db";
import { GUIDED_TEMPLATE_KEY } from "@/lib/drafts/templates";

export type DraftSummary = { id: string; template: string; title: string; updatedAt: string };
export type Draft = DraftSummary & {
  fields: Record<string, string>;
  body: string;
  messages: UIMessage[];
  language: string;
};

type Row = {
  id: string;
  template: string;
  title: string;
  fields: string;
  body: string;
  messages: string | null;
  language: string | null;
  updated_at: string;
};

function parseMessages(raw: string | null): UIMessage[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

export function listDrafts(userId: string, limit = 50): DraftSummary[] {
  const rows = getDb()
    .prepare("SELECT id, template, title, updated_at FROM drafts WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?")
    .all(userId, limit) as unknown as Row[];
  return rows.map((r) => ({ id: r.id, template: r.template, title: r.title, updatedAt: r.updated_at }));
}

export function getDraft(userId: string, id: string): Draft | null {
  const r = getDb().prepare("SELECT * FROM drafts WHERE id = ? AND user_id = ?").get(id, userId) as Row | undefined;
  if (!r) return null;
  return {
    id: r.id,
    template: r.template,
    title: r.title,
    updatedAt: r.updated_at,
    fields: JSON.parse(r.fields),
    body: r.body,
    messages: parseMessages(r.messages),
    language: r.language || "English",
  };
}

/** Returns false if the id belongs to another user. */
export function upsertDraft(
  userId: string,
  id: string,
  data: {
    template: string;
    title: string;
    fields: Record<string, string>;
    body: string;
    messages?: UIMessage[];
    language?: string;
  },
): boolean {
  const db = getDb();
  const owner = db.prepare("SELECT user_id FROM drafts WHERE id = ?").get(id) as { user_id: string } | undefined;
  if (owner && owner.user_id !== userId) return false;
  const now = new Date().toISOString();
  const messages = JSON.stringify(data.messages ?? []);
  const language = data.language ?? "English";
  if (owner) {
    db.prepare(
      "UPDATE drafts SET title = ?, fields = ?, body = ?, messages = ?, language = ?, updated_at = ? WHERE id = ?",
    ).run(data.title, JSON.stringify(data.fields), data.body, messages, language, now, id);
  } else {
    db.prepare(
      "INSERT INTO drafts (id, user_id, template, title, fields, body, messages, language, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(id, userId, data.template, data.title, JSON.stringify(data.fields), data.body, messages, language, now, now);
  }
  return true;
}

export function saveDraftMessages(userId: string, id: string, messages: UIMessage[], title?: string, body?: string) {
  const draft = getDraft(userId, id);
  if (!draft) return false;
  return upsertDraft(userId, id, {
    template: draft.template,
    title: title?.trim() || draft.title,
    fields: draft.fields,
    body: body ?? draft.body,
    messages,
    language: draft.language,
  });
}

export function isGuidedDraft(template: string) {
  return template === GUIDED_TEMPLATE_KEY;
}

export function removeDraft(userId: string, id: string) {
  getDb().prepare("DELETE FROM drafts WHERE id = ? AND user_id = ?").run(id, userId);
}
