import "server-only";
import type { LanguageModelUsage } from "ai";
import { getDb } from "@/lib/db";
import { todayInIndia } from "@/lib/desk/format";
import type { ResolvedModel } from "./model";
import { estimateCost, taskLabels, type MonthSpend } from "./pricing";

const insert = () =>
  getDb().prepare(
    `INSERT INTO ai_spend (user_id, day, task, provider, model, input_tokens, cached_tokens, output_tokens, cost_micros, priced, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

/** Logs tokens and an estimated provider cost. Never throws into the AI request. */
export function recordAiSpend(userId: string, resolved: ResolvedModel, usage: LanguageModelUsage) {
  if (resolved.provider === "demo") return;
  try {
    const input = usage.inputTokens && usage.inputTokens > 0 ? usage.inputTokens : 0;
    const output = usage.outputTokens && usage.outputTokens > 0 ? usage.outputTokens : 0;
    const cacheRead = usage.inputTokenDetails?.cacheReadTokens;
    const cached = Math.min(input, cacheRead && cacheRead > 0 ? cacheRead : 0);
    const cost = estimateCost(resolved.modelId, usage);
    insert().run(
      userId,
      todayInIndia(),
      resolved.task,
      resolved.provider,
      resolved.modelId,
      input,
      cached,
      output,
      cost.micros,
      cost.priced ? 1 : 0,
      new Date().toISOString(),
    );
  } catch (error) {
    console.error("AI spend log failed:", error);
  }
}

type SpendRow = {
  task: string;
  requests: number;
  input_tokens: number;
  output_tokens: number;
  cost_micros: number;
  unpriced: number;
};

/** Estimated AI spend for the signed-in user in the current India calendar month. */
export function spendThisMonth(userId: string): MonthSpend {
  const month = todayInIndia().slice(0, 7);
  const rows = getDb()
    .prepare(
      `SELECT task,
              COUNT(*) AS requests,
              COALESCE(SUM(input_tokens), 0) AS input_tokens,
              COALESCE(SUM(output_tokens), 0) AS output_tokens,
              COALESCE(SUM(cost_micros), 0) AS cost_micros,
              COALESCE(SUM(CASE WHEN priced = 0 THEN 1 ELSE 0 END), 0) AS unpriced
       FROM ai_spend
       WHERE user_id = ? AND substr(day, 1, 7) = ?
       GROUP BY task
       ORDER BY cost_micros DESC`,
    )
    .all(userId, month) as SpendRow[];

  const totals = rows.reduce(
    (sum, row) => ({
      requests: sum.requests + row.requests,
      inputTokens: sum.inputTokens + row.input_tokens,
      outputTokens: sum.outputTokens + row.output_tokens,
      costUsd: sum.costUsd + row.cost_micros / 1_000_000,
      unpriced: sum.unpriced + row.unpriced,
    }),
    { requests: 0, inputTokens: 0, outputTokens: 0, costUsd: 0, unpriced: 0 },
  );

  return {
    ...totals,
    byTask: rows.map((row) => ({
      task: row.task,
      label: taskLabels[row.task] ?? row.task,
      requests: row.requests,
      costUsd: row.cost_micros / 1_000_000,
    })),
  };
}
