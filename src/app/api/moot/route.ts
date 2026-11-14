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
import { mootSystemPrompt } from "@/lib/ai/prompts";
import { MAX_SUBMISSION_CHARS, MAX_TURNS, counselTurns } from "@/lib/moot/limits";
import { getMoot, saveMootMessages } from "@/lib/moot/queries";

export const maxDuration = 60;

const fail = (status: number, error: string) => Response.json({ error }, { status });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail(401, "Please sign in again.");

  const ai = getModel("moot");
  if (!ai) return fail(503, "Moot Practice isn't set up yet. Add an AI provider key to the server configuration.");

  const body = (await req.json().catch(() => null)) as { id?: unknown; message?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  const moot = isChatId(id) ? getMoot(session.userId, id) : null;
  if (!moot) return fail(404, "Session not found.");
  if (moot.closed) return fail(409, "This hearing is closed. Choose “Continue arguing” to reopen it.");

  const incoming = await safeValidateUIMessages({ messages: [body?.message] });
  if (!incoming.success) return fail(400, "Invalid message.");
  const message = incoming.data[0];
  const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
  if (message.role !== "user" || !text.trim()) return fail(400, "Make a submission first.");
  if (text.length > MAX_SUBMISSION_CHARS) {
    return fail(400, `Keep each submission under ${MAX_SUBMISSION_CHARS.toLocaleString("en-IN")} characters.`);
  }

  const resent = moot.messages.findIndex((m) => m.id === message.id);
  const messages: UIMessage[] = [...(resent >= 0 ? moot.messages.slice(0, resent) : moot.messages), message];
  if (counselTurns(messages) > MAX_TURNS) return fail(400, "Time is up for this hearing. End the session to get your feedback.");

  const limit = dailyLimit();
  if (usageToday(session.userId).total >= limit) {
    return fail(429, `You've used today's ${limit} AI requests. The limit resets at midnight.`);
  }

  saveMootMessages(session.userId, id, messages);
  recordUsage(session.userId);

  // The bench's opening line is scripted; some providers require the conversation to start with a user turn.
  const firstUser = messages.findIndex((m) => m.role === "user");
  const result = streamText({
    model: ai.model,
    system: mootSystemPrompt(moot.setup),
    messages: await convertToModelMessages(messages.slice(firstUser)),
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
        console.error("Moot bench error:", error);
        return "The bench couldn't respond just now. Please try again.";
      },
      onEnd: ({ messages: all }) => {
        saveMootMessages(session.userId, id, all);
      },
    }),
  });
}
