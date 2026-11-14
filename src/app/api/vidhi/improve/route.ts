import { generateText } from "ai";
import { getSession } from "@/lib/auth/session";
import { recordUsage, usageToday } from "@/lib/ai/chats";
import { dailyLimit, getModel } from "@/lib/ai/model";
import { recordAiSpend } from "@/lib/ai/spend";
import { getVidhiProfile } from "@/lib/ai/profile";
import { improveQuestionPrompt } from "@/lib/ai/prompts";

export const maxDuration = 30;

const MAX_CHARS = 2000;

const fail = (status: number, error: string) => Response.json({ error }, { status });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail(401, "Please sign in again.");

  const body = (await req.json().catch(() => null)) as { text?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (text.length < 5) return fail(400, "Type a question first.");
  if (text.length > MAX_CHARS) return fail(400, `Improve works on questions under ${MAX_CHARS.toLocaleString("en-IN")} characters.`);

  const ai = getModel("vidhi-improve");
  if (!ai) return fail(503, "Vidhi AI isn't set up yet.");

  const limit = dailyLimit();
  if (usageToday(session.userId).total >= limit) return fail(429, `You've used today's ${limit} AI requests. The limit resets at midnight.`);
  recordUsage(session.userId);

  try {
    const result = await generateText({
      model: ai.model,
      prompt: improveQuestionPrompt(text, getVidhiProfile(session.userId)),
      maxOutputTokens: 400,
      abortSignal: req.signal,
    });
    recordAiSpend(session.userId, ai, result.usage);
    const improved = result.text;
    const clean = improved.trim().replace(/^["“]|["”]$/g, "");
    if (!clean) return fail(502, "Couldn't improve the question. Please try again.");
    return Response.json({ text: clean.slice(0, MAX_CHARS * 2) });
  } catch (error) {
    console.error("Improve question error:", error);
    return fail(502, "Couldn't improve the question. Please try again.");
  }
}
