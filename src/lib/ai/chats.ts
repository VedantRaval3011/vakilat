import "server-only";
import type { UIMessage } from "ai";
import { getDb } from "@/lib/db";
import { todayInIndia } from "@/lib/desk/format";

export type ChatTool = "vidhi";

export type ChatSummary = { id: string; title: string; tool: ChatTool; pinned: boolean; updatedAt: string };

type ChatRow = { id: string; title: string; tool: ChatTool; messages: string; pinned: number; updated_at: string };

export const isChatId = (id: string) => /^[A-Za-z0-9_-]{8,64}$/.test(id);

export function listChats(userId: string, tool?: ChatTool, limit = 100): ChatSummary[] {
  const columns = "id, title, tool, pinned, updated_at";
  const order = "ORDER BY pinned DESC, updated_at DESC LIMIT ?";
  const rows = (
    tool
      ? getDb().prepare(`SELECT ${columns} FROM chats WHERE user_id = ? AND tool = ? ${order}`).all(userId, tool, limit)
      : getDb().prepare(`SELECT ${columns} FROM chats WHERE user_id = ? ${order}`).all(userId, limit)
  ) as unknown as Omit<ChatRow, "messages">[];
  return rows.map((r) => ({ id: r.id, title: r.title, tool: r.tool, pinned: r.pinned === 1, updatedAt: r.updated_at }));
}

export function loadChat<M extends UIMessage = UIMessage>(userId: string, id: string): M[] | null {
  const row = getDb().prepare("SELECT messages FROM chats WHERE id = ? AND user_id = ?").get(id, userId) as
    | Pick<ChatRow, "messages">
    | undefined;
  return row ? (JSON.parse(row.messages) as M[]) : null;
}

/** Returns false if the id belongs to another user. */
export function saveChat(userId: string, id: string, tool: ChatTool, messages: UIMessage[]): boolean {
  const db = getDb();
  const owner = db.prepare("SELECT user_id FROM chats WHERE id = ?").get(id) as { user_id: string } | undefined;
  if (owner && owner.user_id !== userId) return false;
  const now = new Date().toISOString();
  if (owner) {
    db.prepare("UPDATE chats SET messages = ?, updated_at = ? WHERE id = ?").run(JSON.stringify(messages), now, id);
  } else {
    db.prepare("INSERT INTO chats (id, user_id, tool, title, messages, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      id,
      userId,
      tool,
      titleFrom(messages),
      JSON.stringify(messages),
      now,
      now,
    );
  }
  return true;
}

export function removeChat(userId: string, id: string) {
  getDb().prepare("DELETE FROM chats WHERE id = ? AND user_id = ?").run(id, userId);
}

export function setChatPinned(userId: string, id: string, pinned: boolean) {
  getDb().prepare("UPDATE chats SET pinned = ? WHERE id = ? AND user_id = ?").run(pinned ? 1 : 0, id, userId);
}

function titleFrom(messages: UIMessage[]) {
  const first = messages.find((m) => m.role === "user");
  const text = first?.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").replace(/\s+/g, " ").trim() || "New conversation";
  return text.length > 80 ? `${text.slice(0, 77)}…` : text;
}

export function usageToday(userId: string) {
  const row = getDb().prepare("SELECT count, deep FROM ai_usage WHERE user_id = ? AND day = ?").get(userId, todayInIndia()) as
    | { count: number; deep: number }
    | undefined;
  return { total: row?.count ?? 0, deep: row?.deep ?? 0 };
}

export function recordUsage(userId: string, { deep = false } = {}) {
  const d = deep ? 1 : 0;
  getDb()
    .prepare(
      "INSERT INTO ai_usage (user_id, day, count, deep) VALUES (?, ?, 1, ?) ON CONFLICT (user_id, day) DO UPDATE SET count = count + 1, deep = deep + ?",
    )
    .run(userId, todayInIndia(), d, d);
}

/** Returns false if the chat isn't the user's. */
export function rateAnswer(userId: string, chatId: string, messageId: string, rating: -1 | 0 | 1, comment?: string) {
  const db = getDb();
  if (!db.prepare("SELECT 1 FROM chats WHERE id = ? AND user_id = ?").get(chatId, userId)) return false;
  if (rating === 0) {
    db.prepare("DELETE FROM answer_ratings WHERE user_id = ? AND message_id = ?").run(userId, messageId);
  } else {
    db.prepare(
      `INSERT INTO answer_ratings (user_id, chat_id, message_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (user_id, message_id) DO UPDATE SET rating = excluded.rating, comment = excluded.comment, created_at = excluded.created_at`,
    ).run(userId, chatId, messageId, rating, comment ?? null, new Date().toISOString());
  }
  return true;
}

export function chatRatings(userId: string, chatId: string): Record<string, 1 | -1> {
  const rows = getDb().prepare("SELECT message_id, rating FROM answer_ratings WHERE user_id = ? AND chat_id = ?").all(userId, chatId) as {
    message_id: string;
    rating: 1 | -1;
  }[];
  return Object.fromEntries(rows.map((r) => [r.message_id, r.rating]));
}
