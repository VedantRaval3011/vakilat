import "server-only";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { demoModel } from "./demo-model";

export type AiProvider = "google" | "openai" | "anthropic" | "deepseek";

type ProviderConfig = {
  key: string;
  /** Quick answers, chat, moot, improve, and translation. */
  everyday: string;
  /** Deep research and finished drafts. */
  strong: string;
  create: (apiKey: string, model: string) => LanguageModel;
};

/**
 * List prices as of November 2026, cheapest capable model first.
 * OpenAI GPT-6 Luna ($0.10 / $0.50 per million tokens) is the default.
 * Override a task with AI_MODEL, AI_DEEP_MODEL, AI_DRAFT_MODEL, or AI_TRANSLATE_MODEL.
 */
const providers: Record<AiProvider, ProviderConfig> = {
  openai: {
    key: "OPENAI_API_KEY",
    everyday: "gpt-6-luna",
    strong: "gpt-6.1-terra",
    create: (apiKey, model) => createOpenAI({ apiKey })(model),
  },
  anthropic: {
    key: "ANTHROPIC_API_KEY",
    everyday: "claude-haiku-5-5",
    strong: "claude-sonnet-5-5",
    create: (apiKey, model) => createAnthropic({ apiKey })(model),
  },
  google: {
    key: "GOOGLE_GENERATIVE_AI_API_KEY",
    everyday: "gemini-3.5-flash-lite",
    strong: "gemini-3.6-flash",
    create: (apiKey, model) => createGoogleGenerativeAI({ apiKey })(model),
  },
  deepseek: {
    key: "DEEPSEEK_API_KEY",
    everyday: "deepseek-flash",
    strong: "deepseek-v4-pro",
    create: (apiKey, model) =>
      createOpenAI({ apiKey, baseURL: "https://api.deepseek.com/v1", name: "deepseek" }).chat(model),
  },
};

const strongTasks = new Set<AiTask>(["vidhi-deep", "draft"]);

const taskEnv: Partial<Record<AiTask, "AI_DEEP_MODEL" | "AI_DRAFT_MODEL" | "AI_TRANSLATE_MODEL">> = {
  "vidhi-deep": "AI_DEEP_MODEL",
  draft: "AI_DRAFT_MODEL",
  translate: "AI_TRANSLATE_MODEL",
};

function pickProvider(): AiProvider | null {
  const requested = process.env.AI_PROVIDER as AiProvider | undefined;
  if (requested && requested in providers) return process.env[providers[requested].key] ? requested : null;
  return (Object.keys(providers) as AiProvider[]).find((p) => process.env[providers[p].key]) ?? null;
}

const demoEnabled = () => process.env.AI_PROVIDER === "demo" && process.env.NODE_ENV !== "production";

function modelIdFor(task: AiTask, provider: ProviderConfig) {
  const specific = taskEnv[task] ? process.env[taskEnv[task]!]?.trim() : "";
  if (specific) return specific;
  if (strongTasks.has(task)) return provider.strong;
  return process.env.AI_MODEL?.trim() || provider.everyday;
}

export type AiTask =
  | "vidhi"
  | "vidhi-deep"
  | "vidhi-improve"
  | "draft"
  | "draft-chat"
  | "moot"
  | "moot-feedback"
  | "moot-scene"
  | "translate";

export type ResolvedModel = {
  model: LanguageModel;
  provider: AiProvider | "demo";
  modelId: string;
  task: AiTask;
};

/** The configured language model, or null when no API key is set. */
export function getModel(task: AiTask = "vidhi"): ResolvedModel | null {
  if (demoEnabled()) return { model: demoModel(task), provider: "demo", modelId: "demo", task };
  const name = pickProvider();
  if (!name) return null;
  const provider = providers[name];
  const modelId = modelIdFor(task, provider);
  return { model: provider.create(process.env[provider.key]!, modelId), provider: name, modelId, task };
}

export const isAiConfigured = () => demoEnabled() || pickProvider() !== null;

export const dailyLimit = () => Number(process.env.AI_DAILY_LIMIT) || 30;

export const deepDailyLimit = () => Number(process.env.AI_DEEP_DAILY_LIMIT) || 5;
