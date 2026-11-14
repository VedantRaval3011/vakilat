import "server-only";
import type { UIMessage } from "ai";
import { getDb } from "@/lib/db";
import type { MootFeedback } from "./feedback";
import type { MootSetup } from "./scenarios";

export type MootSession = {
  id: string;
  setup: MootSetup;
  messages: UIMessage[];
  feedback: MootFeedback | null;
  closed: boolean;
  updatedAt: string;
};

export type MootSummary = { id: string; title: string; side: string; overall: number | null; closed: boolean; updatedAt: string };

type Row = { id: string; setup: string; messages: string; feedback: string | null; closed: number; updated_at: string };

export function listMoots(userId: string, limit = 30): MootSummary[] {
  const rows = getDb()
    .prepare("SELECT id, setup, feedback, closed, updated_at FROM moot_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?")
    .all(userId, limit) as unknown as Omit<Row, "messages">[];
  return rows.map((r) => {
    const setup = JSON.parse(r.setup) as MootSetup;
    const feedback = r.feedback ? (JSON.parse(r.feedback) as MootFeedback) : null;
    return { id: r.id, title: setup.title, side: setup.side, overall: feedback?.overall ?? null, closed: r.closed === 1, updatedAt: r.updated_at };
  });
}

export function getMoot(userId: string, id: string): MootSession | null {
  const row = getDb().prepare("SELECT * FROM moot_sessions WHERE id = ? AND user_id = ?").get(id, userId) as Row | undefined;
  if (!row) return null;
  return {
    id: row.id,
    setup: JSON.parse(row.setup) as MootSetup,
    messages: JSON.parse(row.messages) as UIMessage[],
    feedback: row.feedback ? (JSON.parse(row.feedback) as MootFeedback) : null,
    closed: row.closed === 1,
    updatedAt: row.updated_at,
  };
}

export function createMoot(userId: string, id: string, setup: MootSetup, messages: UIMessage[]) {
  const now = new Date().toISOString();
  getDb()
    .prepare("INSERT INTO moot_sessions (id, user_id, setup, messages, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, userId, JSON.stringify(setup), JSON.stringify(messages), now, now);
}

export function saveMootMessages(userId: string, id: string, messages: UIMessage[]) {
  getDb()
    .prepare("UPDATE moot_sessions SET messages = ?, updated_at = ? WHERE id = ? AND user_id = ?")
    .run(JSON.stringify(messages), new Date().toISOString(), id, userId);
}

/** Stores the feedback and closes the hearing. */
export function saveMootFeedback(userId: string, id: string, feedback: MootFeedback) {
  getDb()
    .prepare("UPDATE moot_sessions SET feedback = ?, closed = 1, updated_at = ? WHERE id = ? AND user_id = ?")
    .run(JSON.stringify(feedback), new Date().toISOString(), id, userId);
}

export function reopenMootSession(userId: string, id: string) {
  getDb()
    .prepare("UPDATE moot_sessions SET closed = 0, updated_at = ? WHERE id = ? AND user_id = ?")
    .run(new Date().toISOString(), id, userId);
}

export function removeMoot(userId: string, id: string) {
  getDb().prepare("DELETE FROM moot_sessions WHERE id = ? AND user_id = ?").run(id, userId);
}
