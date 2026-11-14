import type { LanguageModelUsage } from "ai";

/** US dollars per million tokens. Checked against provider price pages on 7 Nov 2026. */
type Band = { input: number; cached: number; output: number };

type Rate = {
  short: Band;
  /** Applied to the whole request once input tokens pass the threshold. */
  long?: { aboveInputTokens: number; rate: Band };
  /** DeepSeek weekday peak. Off-peak is `short`. */
  peak?: Band;
};

const rates: Record<string, Rate> = {
  "gpt-6-luna": {
    short: { input: 0.1, cached: 0.01, output: 0.5 },
    long: { aboveInputTokens: 272_000, rate: { input: 0.2, cached: 0.02, output: 0.75 } },
  },
  "gpt-6.1-terra": {
    short: { input: 1, cached: 0.05, output: 5 },
    long: { aboveInputTokens: 272_000, rate: { input: 2, cached: 0.1, output: 7.5 } },
  },
  "claude-haiku-5-5": {
    short: { input: 0.1, cached: 0.01, output: 0.5 },
    long: { aboveInputTokens: 100_000, rate: { input: 0.5, cached: 0.05, output: 2.5 } },
  },
  "claude-sonnet-5-5": {
    short: { input: 2, cached: 0.1, output: 10 },
  },
  "gemini-3.5-flash-lite": {
    short: { input: 0.3, cached: 0.03, output: 2.5 },
  },
  "gemini-3.6-flash": {
    short: { input: 0.75, cached: 0.075, output: 3.75 },
  },
  "deepseek-flash": {
    short: { input: 0.15, cached: 0.003, output: 0.6 },
    peak: { input: 0.3, cached: 0.006, output: 1.2 },
  },
  "deepseek-v4-pro": {
    short: { input: 0.66, cached: 0.022, output: 1.98 },
    peak: { input: 1.32, cached: 0.044, output: 3.96 },
  },
};

const tokens = (n: number | undefined) => (n && n > 0 ? n : 0);

/** Weekday 01:00–04:00 and 06:00–10:00 UTC. Chinese public holidays are not excluded. */
function deepseekPeak(at: Date) {
  const day = at.getUTCDay();
  if (day === 0 || day === 6) return false;
  const minutes = at.getUTCHours() * 60 + at.getUTCMinutes();
  return (minutes >= 60 && minutes < 240) || (minutes >= 360 && minutes < 600);
}

export type CostEstimate = { micros: number; priced: boolean };

/** Integer millionths of a US dollar, so a $0.10 request is 100_000. */
export function estimateCost(modelId: string, usage: LanguageModelUsage, at = new Date()): CostEstimate {
  const rate = rates[modelId];
  if (!rate) return { micros: 0, priced: false };

  const input = tokens(usage.inputTokens);
  const output = tokens(usage.outputTokens);
  const cacheRead = Math.min(input, tokens(usage.inputTokenDetails?.cacheReadTokens));
  const cacheWrite = Math.min(input - cacheRead, tokens(usage.inputTokenDetails?.cacheWriteTokens));
  const fresh = input - cacheRead - cacheWrite;

  let band = rate.short;
  if (rate.long && input > rate.long.aboveInputTokens) band = rate.long.rate;
  else if (rate.peak && deepseekPeak(at)) band = rate.peak;

  const usd =
    (fresh * band.input + cacheRead * band.cached + cacheWrite * band.input * 1.25 + output * band.output) / 1_000_000;
  return { micros: Math.round(usd * 1_000_000), priced: true };
}

export const taskLabels: Record<string, string> = {
  vidhi: "Vidhi AI",
  "vidhi-deep": "Deep research",
  "vidhi-improve": "Improve question",
  draft: "Drafts",
  "draft-chat": "Draft chat",
  moot: "Moot bench",
  "moot-feedback": "Moot feedback",
  "moot-scene": "Moot setup",
  translate: "Translate",
};

export type MonthSpend = {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  unpriced: number;
  byTask: { task: string; label: string; requests: number; costUsd: number }[];
};
