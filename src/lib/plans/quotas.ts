import "server-only";
import { dailyLimit, deepDailyLimit } from "@/lib/ai/model";
import { usageToday } from "@/lib/ai/chats";
import { getDb } from "@/lib/db";
import { todayInIndia } from "@/lib/desk/format";
import { type PlanId, type QuotaFeature, type QuotaRow } from "./types";

export type { PlanId, QuotaFeature, QuotaRow } from "./types";
export { planLabels } from "./types";

/** Free-plan ceilings. Paid tiers land with the Plans page; until then everyone is Free. */
const freeLimits: Record<QuotaFeature, { limit: number | null; period: QuotaRow["period"]; label: string }> = {
  vidhi: { limit: null, period: "day", label: "Vidhi AI questions" },
  deep_research: { limit: null, period: "day", label: "Deep research" },
  drafting: { limit: 10, period: "month", label: "Draft Studio" },
  moot: { limit: 5, period: "month", label: "Moot Practice" },
  translation: { limit: 5, period: "month", label: "Translations" },
  notes: { limit: 50, period: "total", label: "Notes" },
  bookmarks: { limit: 50, period: "total", label: "Saved items" },
  downloads: { limit: 20, period: "month", label: "Downloads" },
  uploads: { limit: 10, period: "month", label: "Uploads" },
  calendar: { limit: 30, period: "total", label: "Hearing events" },
  summaries: { limit: 10, period: "month", label: "Judgment summaries" },
  compare: { limit: 3, period: "month", label: "Compare judgments" },
};

function monthPrefix() {
  return todayInIndia().slice(0, 7);
}

function count(sql: string, ...params: (string | number)[]) {
  const row = getDb().prepare(sql).get(...params) as { n: number } | undefined;
  return row?.n ?? 0;
}

/** Current plan for a user. Stub until billing exists. */
export function getUserPlan(userId: string): PlanId {
  void userId;
  return "free";
}

export function featureQuota(userId: string, feature: QuotaFeature): QuotaRow {
  const meta = freeLimits[feature];
  const daily = usageToday(userId);
  let used = 0;

  switch (feature) {
    case "vidhi":
      used = daily.total;
      return { key: feature, label: meta.label, used, limit: dailyLimit(), period: "day" };
    case "deep_research":
      used = daily.deep;
      return { key: feature, label: meta.label, used, limit: deepDailyLimit(), period: "day" };
    case "drafting":
      used = count(
        "SELECT COUNT(*) AS n FROM drafts WHERE user_id = ? AND substr(created_at, 1, 7) = ?",
        userId,
        monthPrefix(),
      );
      break;
    case "moot":
      used = count(
        "SELECT COUNT(*) AS n FROM moot_sessions WHERE user_id = ? AND substr(created_at, 1, 7) = ?",
        userId,
        monthPrefix(),
      );
      break;
    case "notes":
      used = count("SELECT COUNT(*) AS n FROM notes WHERE user_id = ?", userId);
      break;
    case "bookmarks":
      used = count("SELECT COUNT(*) AS n FROM saved_items WHERE user_id = ?", userId);
      break;
    case "calendar":
      used = count("SELECT COUNT(*) AS n FROM hearings WHERE user_id = ?", userId);
      break;
    case "translation":
    case "downloads":
    case "uploads":
    case "summaries":
    case "compare":
      used = 0;
      break;
  }

  return { key: feature, label: meta.label, used, limit: meta.limit, period: meta.period };
}

export function usageSnapshot(userId: string): QuotaRow[] {
  return (Object.keys(freeLimits) as QuotaFeature[]).map((k) => featureQuota(userId, k));
}
