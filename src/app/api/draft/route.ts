import { createUIMessageStreamResponse, streamText, toUIMessageStream } from "ai";
import { getSession } from "@/lib/auth/session";
import { recordUsage, usageToday } from "@/lib/ai/chats";
import { dailyLimit, getModel } from "@/lib/ai/model";
import { recordAiSpend } from "@/lib/ai/spend";
import { draftSystemPrompt, draftUserPrompt } from "@/lib/ai/prompts";
import { draftLanguages, GUIDED_TEMPLATE_KEY, MAX_FIELD_CHARS, templateByKey } from "@/lib/drafts/templates";
import { quotaBlocked } from "@/lib/plans/enforce";

export const maxDuration = 120;

const fail = (status: number, error: string) => Response.json({ error }, { status });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail(401, "Please sign in again.");

  const ai = getModel("draft");
  if (!ai) return fail(503, "Draft Studio isn't set up yet. Add an AI provider key to the server configuration.");

  const body = (await req.json().catch(() => null)) as {
    prompt?: unknown;
    template?: unknown;
    fields?: unknown;
    language?: unknown;
  } | null;

  const template = typeof body?.template === "string" ? templateByKey(body.template) : undefined;
  if (!template || template.key === GUIDED_TEMPLATE_KEY) return fail(400, "Choose a document type.");

  const raw = body?.fields && typeof body.fields === "object" ? (body.fields as Record<string, unknown>) : {};
  const fields: Record<string, string> = {};
  for (const f of template.fields) {
    const v = typeof raw[f.name] === "string" ? (raw[f.name] as string).slice(0, MAX_FIELD_CHARS) : "";
    if (f.required && !v.trim()) return fail(400, `Fill in "${f.label}".`);
    fields[f.name] = v;
  }
  const language = draftLanguages.find((l) => l === body?.language) ?? "English";
  const instructions = typeof body?.prompt === "string" ? body.prompt.slice(0, MAX_FIELD_CHARS) : "";

  const limit = dailyLimit();
  if (usageToday(session.userId).total >= limit) {
    return fail(429, `You've used today's ${limit} AI requests. The limit resets at midnight.`);
  }
  const blocked = quotaBlocked(session.userId, "drafting");
  if (blocked) return fail(429, blocked);
  recordUsage(session.userId);

  const result = streamText({
    model: ai.model,
    system: draftSystemPrompt(),
    prompt: draftUserPrompt(template, fields, language, instructions),
    abortSignal: req.signal,
    onEnd: ({ usage }) => recordAiSpend(session.userId, ai, usage),
  });
  result.consumeStream();

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: (error) => {
        console.error("Draft Studio error:", error);
        return "The draft couldn't be generated just now. Please try again.";
      },
    }),
  });
}
