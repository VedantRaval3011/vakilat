import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  safeValidateUIMessages,
  streamText,
  toUIMessageStream,
} from "ai";
import { getSession } from "@/lib/auth/session";
import { isChatId, loadChat, recordUsage, saveChat, usageToday } from "@/lib/ai/chats";
import { dailyLimit, deepDailyLimit, getModel } from "@/lib/ai/model";
import { recordAiSpend } from "@/lib/ai/spend";
import { getVidhiProfile } from "@/lib/ai/profile";
import { vidhiSystemPrompt } from "@/lib/ai/prompts";
import {
  attachmentKind,
  attachmentRules,
  dataUrlBytes,
  MAX_QUESTION_CHARS,
  type ResearchMode,
  type VidhiMessage,
} from "@/lib/vidhi/config";

export const maxDuration = 120;

const HISTORY_MESSAGES = 30;
const mb = (bytes: number) => `${bytes / (1024 * 1024)} MB`;

const fail = (status: number, error: string) => Response.json({ error }, { status });

function checkAttachments(message: VidhiMessage): string | null {
  const counts = { document: 0, image: 0 };
  for (const part of message.parts) {
    if (part.type !== "file") continue;
    const kind = attachmentKind(part.mediaType);
    if (!kind) return "Attach PDF or text documents, or PNG, JPEG or WebP images.";
    const rule = attachmentRules[kind];
    if (++counts[kind] > rule.max) return kind === "document" ? "Attach one document per question." : `Attach up to ${rule.max} images per question.`;
    if (dataUrlBytes(part.url) > rule.maxBytes) return `${part.filename ?? "A file"} is larger than ${mb(rule.maxBytes)}.`;
  }
  return null;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail(401, "Please sign in again.");

  const body = (await req.json().catch(() => null)) as { id?: unknown; message?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  if (!isChatId(id)) return fail(400, "Invalid conversation.");

  const incoming = await safeValidateUIMessages<VidhiMessage>({ messages: [body?.message] });
  if (!incoming.success) return fail(400, "Invalid message.");
  const message = incoming.data[0];
  const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
  const hasFiles = message.parts.some((p) => p.type === "file");
  if (message.role !== "user" || (!text.trim() && !hasFiles)) return fail(400, "Type a question first.");
  if (text.length > MAX_QUESTION_CHARS) return fail(400, `Keep questions under ${MAX_QUESTION_CHARS.toLocaleString("en-IN")} characters.`);
  const attachmentError = checkAttachments(message);
  if (attachmentError) return fail(400, attachmentError);

  const mode: ResearchMode = message.metadata?.mode === "deep" ? "deep" : "normal";
  message.metadata = { mode };

  const ai = getModel(mode === "deep" ? "vidhi-deep" : "vidhi");
  if (!ai) return fail(503, "Vidhi AI isn't set up yet. Add an AI provider key to the server configuration.");

  const usage = usageToday(session.userId);
  const limit = dailyLimit();
  if (usage.total >= limit) return fail(429, `You've used today's ${limit} questions. The limit resets at midnight.`);
  if (mode === "deep" && usage.deep >= deepDailyLimit()) {
    return fail(429, `You've used today's ${deepDailyLimit()} deep research questions. Switch to Quick answer, or try again tomorrow.`);
  }

  const previous = loadChat<VidhiMessage>(session.userId, id) ?? [];
  const resent = previous.findIndex((m) => m.id === message.id);
  const messages: VidhiMessage[] = [...(resent >= 0 ? previous.slice(0, resent) : previous), message];
  if (!saveChat(session.userId, id, "vidhi", messages)) return fail(403, "Conversation not found.");
  recordUsage(session.userId, { deep: mode === "deep" });

  const result = streamText({
    model: ai.model,
    system: vidhiSystemPrompt({ profile: getVidhiProfile(session.userId), mode }),
    messages: await convertToModelMessages(messages.slice(-HISTORY_MESSAGES)),
    maxOutputTokens: mode === "deep" ? 6000 : 2500,
    abortSignal: req.signal,
    onEnd: ({ usage }) => recordAiSpend(session.userId, ai, usage),
  });
  result.consumeStream();

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
      messageMetadata: ({ part }) => (part.type === "start" ? { mode } : undefined),
      onError: (error) => {
        console.error("Vidhi AI error:", error);
        return "Vidhi AI couldn't answer just now. Please try again.";
      },
      onEnd: ({ messages: all }) => {
        saveChat(session.userId, id, "vidhi", all);
      },
    }),
  });
}
