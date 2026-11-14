import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  safeValidateUIMessages,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { getSession } from "@/lib/auth/session";
import { isChatId, recordUsage, usageToday } from "@/lib/ai/chats";
import { dailyLimit, getModel } from "@/lib/ai/model";
import { recordAiSpend } from "@/lib/ai/spend";
import { draftChatSystemPrompt } from "@/lib/ai/prompts";
import { draftLanguages, MAX_FIELD_CHARS } from "@/lib/drafts/templates";
import { getDraft, isGuidedDraft, saveDraftMessages } from "@/lib/drafts/queries";

export const maxDuration = 120;

const fail = (status: number, error: string) => Response.json({ error }, { status });

const DRAFT_MARKER = /<<<DRAFT>>>\s*([\s\S]*?)\s*<<<END>>>/;

function extractDraft(text: string) {
  const m = text.match(DRAFT_MARKER);
  return m?.[1]?.trim() ?? null;
}

function titleFromMessages(messages: UIMessage[]) {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "Guided draft";
  const text = first.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").trim();
  return (text.slice(0, 80) || "Guided draft").replace(/\s+/g, " ");
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail(401, "Please sign in again.");

  const ai = getModel("draft-chat");
  if (!ai) return fail(503, "Draft Studio isn't set up yet. Add an AI provider key to the server configuration.");

  const body = (await req.json().catch(() => null)) as {
    id?: unknown;
    message?: unknown;
    language?: unknown;
  } | null;

  const id = typeof body?.id === "string" ? body.id : "";
  const draft = isChatId(id) ? getDraft(session.userId, id) : null;
  if (!draft || !isGuidedDraft(draft.template)) return fail(404, "Draft session not found.");

  const language = draftLanguages.find((l) => l === body?.language) ?? draft.language ?? "English";

  const incoming = await safeValidateUIMessages({ messages: [body?.message] });
  if (!incoming.success) return fail(400, "Invalid message.");
  const message = incoming.data[0];
  const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
  if (message.role !== "user" || !text.trim()) return fail(400, "Describe the document or answer the questions first.");
  if (text.length > MAX_FIELD_CHARS * 4) {
    return fail(400, `Keep each message under ${(MAX_FIELD_CHARS * 4).toLocaleString("en-IN")} characters.`);
  }

  const resent = draft.messages.findIndex((m) => m.id === message.id);
  const messages: UIMessage[] = [...(resent >= 0 ? draft.messages.slice(0, resent) : draft.messages), message];

  const limit = dailyLimit();
  if (usageToday(session.userId).total >= limit) {
    return fail(429, `You've used today's ${limit} AI requests. The limit resets at midnight.`);
  }
  saveDraftMessages(session.userId, id, messages, titleFromMessages(messages));
  recordUsage(session.userId);

  const result = streamText({
    model: ai.model,
    system: draftChatSystemPrompt(language),
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
    onEnd: ({ usage }) => recordAiSpend(session.userId, ai, usage),
  });
  result.consumeStream();

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
      onError: (error) => {
        console.error("Draft chat error:", error);
        return "The draft assistant couldn't reply just now. Please try again.";
      },
      onEnd: ({ messages: all }) => {
        const last = [...all].reverse().find((m) => m.role === "assistant");
        const lastText = last?.parts.map((p) => (p.type === "text" ? p.text : "")).join("") ?? "";
        const bodyText = extractDraft(lastText);
        saveDraftMessages(session.userId, id, all, titleFromMessages(all), bodyText ?? undefined);
      },
    }),
  });
}
