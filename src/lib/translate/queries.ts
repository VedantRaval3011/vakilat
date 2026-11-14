import "server-only";
import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";

export type { Translation, TranslationSummary } from "./types";
import type { Translation, TranslationSummary } from "./types";

type Row = {
  id: string;
  title: string;
  source_lang: string;
  target_lang: string;
  source_text: string;
  result_text: string;
  source_name: string | null;
  rating: number | null;
  created_at: string;
};

const toSummary = (r: Pick<Row, "id" | "title" | "target_lang" | "rating" | "created_at">): TranslationSummary => ({
  id: r.id,
  title: r.title,
  targetLang: r.target_lang,
  rating: r.rating,
  createdAt: r.created_at,
});

export function listTranslations(userId: string, limit = 50): TranslationSummary[] {
  const rows = getDb()
    .prepare(
      "SELECT id, title, target_lang, rating, created_at FROM translations WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
    )
    .all(userId, limit) as unknown as Row[];
  return rows.map(toSummary);
}

export function getTranslation(userId: string, id: string): Translation | null {
  const r = getDb().prepare("SELECT * FROM translations WHERE id = ? AND user_id = ?").get(id, userId) as Row | undefined;
  if (!r) return null;
  return {
    ...toSummary(r),
    sourceLang: r.source_lang,
    sourceText: r.source_text,
    resultText: r.result_text,
    sourceName: r.source_name,
  };
}

export function saveTranslation(
  userId: string,
  data: {
    title: string;
    sourceLang?: string;
    targetLang: string;
    sourceText: string;
    resultText: string;
    sourceName?: string | null;
  },
) {
  const id = randomUUID();
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO translations (id, user_id, title, source_lang, target_lang, source_text, result_text, source_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      userId,
      data.title.slice(0, 200),
      data.sourceLang ?? "auto",
      data.targetLang,
      data.sourceText.slice(0, 100_000),
      data.resultText.slice(0, 100_000),
      data.sourceName?.slice(0, 200) ?? null,
      now,
    );
  return id;
}

export function rateTranslation(userId: string, id: string, rating: -1 | 0 | 1) {
  if (rating === 0) {
    getDb().prepare("UPDATE translations SET rating = NULL WHERE id = ? AND user_id = ?").run(id, userId);
  } else {
    getDb().prepare("UPDATE translations SET rating = ? WHERE id = ? AND user_id = ?").run(rating, id, userId);
  }
}

export function removeTranslation(userId: string, id: string) {
  getDb().prepare("DELETE FROM translations WHERE id = ? AND user_id = ?").run(id, userId);
}
