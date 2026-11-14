import { generateText } from "ai";
import { recordUsage, usageToday } from "@/lib/ai/chats";
import { dailyLimit, getModel } from "@/lib/ai/model";
import { recordAiSpend } from "@/lib/ai/spend";
import { translateSystemPrompt, translateUserPrompt } from "@/lib/ai/prompts";
import { getSession } from "@/lib/auth/session";
import { quotaBlocked } from "@/lib/plans/enforce";
import { translateLangByCode, TRANSLATE_MAX_CHARS } from "@/lib/translate/languages";
import { saveTranslation } from "@/lib/translate/queries";

export const maxDuration = 120;

const fail = (status: number, error: string) => Response.json({ error }, { status });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail(401, "Please sign in again.");

  const ai = getModel("translate");
  if (!ai) return fail(503, "Translate isn't set up yet. Add an AI provider key to the server configuration.");

  const body = (await req.json().catch(() => null)) as {
    text?: unknown;
    language?: unknown;
    fileName?: unknown;
  } | null;

  const text = typeof body?.text === "string" ? body.text.trim().slice(0, TRANSLATE_MAX_CHARS) : "";
  if (!text) return fail(400, "Paste text or upload a document with readable text.");

  const lang = typeof body?.language === "string" ? translateLangByCode(body.language) : undefined;
  if (!lang) return fail(400, "Choose a target language.");

  const fileName = typeof body?.fileName === "string" ? body.fileName.slice(0, 200) : undefined;

  const limit = dailyLimit();
  if (usageToday(session.userId).total >= limit) {
    return fail(429, `You've used today's ${limit} AI requests. The limit resets at midnight.`);
  }
  const blocked = quotaBlocked(session.userId, "translation");
  if (blocked) return fail(429, blocked);
  recordUsage(session.userId);

  try {
    const result = await generateText({
      model: ai.model,
      system: translateSystemPrompt(lang.name),
      prompt: translateUserPrompt({ text, targetLanguage: lang.name, fileName }),
      abortSignal: req.signal,
    });
    recordAiSpend(session.userId, ai, result.usage);

    const resultText = result.text.trim();
    if (!resultText) return fail(502, "The translation came back empty. Please try again.");

    const title =
      fileName?.replace(/\.[^.]+$/, "") ||
      text.replace(/\s+/g, " ").trim().slice(0, 80) ||
      `Translation · ${lang.name}`;

    const id = saveTranslation(session.userId, {
      title,
      targetLang: lang.code,
      sourceText: text,
      resultText,
      sourceName: fileName ?? null,
    });

    return Response.json({ id, title, language: lang.code, result: resultText });
  } catch (error) {
    console.error("Translate error:", error);
    return fail(502, "The translation couldn't be completed just now. Please try again.");
  }
}
