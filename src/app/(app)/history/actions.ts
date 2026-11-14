"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { historyExport, type HistoryKind } from "@/lib/history/queries";

const kinds: HistoryKind[] = ["chat", "draft", "moot", "translation"];

export async function exportHistoryItem(kind: HistoryKind, id: string) {
  const user = await getCurrentUser();
  if (!kinds.includes(kind) || typeof id !== "string" || id.length < 8) return null;
  return historyExport(user.id, kind, id);
}
