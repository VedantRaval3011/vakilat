"use server";

import { generateText, Output } from "ai";
import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isChatId, recordUsage, usageToday } from "@/lib/ai/chats";
import { dailyLimit, getModel } from "@/lib/ai/model";
import { recordAiSpend } from "@/lib/ai/spend";
import { mootFeedbackPrompt } from "@/lib/ai/prompts";
import { feedbackSchema } from "@/lib/moot/feedback";
import { MIN_TURNS_FOR_FEEDBACK, counselTurns, messageText } from "@/lib/moot/limits";
import { getMoot, removeMoot, reopenMootSession, saveMootFeedback } from "@/lib/moot/queries";
import { SPEAKERS } from "@/lib/moot/scenarios";

function transcriptOf(messages: Parameters<typeof counselTurns>[0]) {
  return messages
    .map((m) => {
      const text = messageText(m);
      if (m.role === "user") return `COUNSEL: ${text}`;
      return text.startsWith(SPEAKERS.bench) || text.startsWith(SPEAKERS.opponent) ? text : `${SPEAKERS.bench} ${text}`;
    })
    .join("\n\n");
}

export async function endMoot(id: string): Promise<{ error: string } | undefined> {
  const user = await getCurrentUser();
  const moot = isChatId(id) ? getMoot(user.id, id) : null;
  if (!moot) return { error: "Session not found." };
  if (moot.closed) return;
  const turns = counselTurns(moot.messages);
  if (turns < MIN_TURNS_FOR_FEEDBACK) return { error: `Make at least ${MIN_TURNS_FOR_FEEDBACK} submissions before asking for feedback.` };
  if (moot.feedback?.turns !== undefined && turns <= moot.feedback.turns) {
    return { error: "Make at least one new submission before asking for updated feedback." };
  }

  const ai = getModel("moot-feedback");
  if (!ai) return { error: "Moot Practice isn't set up yet." };
  const limit = dailyLimit();
  if (usageToday(user.id).total >= limit) return { error: `You've used today's ${limit} AI requests. The limit resets at midnight.` };
  recordUsage(user.id);

  try {
    const result = await generateText({
      model: ai.model,
      output: Output.object({ schema: feedbackSchema }),
      prompt: mootFeedbackPrompt(moot.setup, transcriptOf(moot.messages)),
    });
    recordAiSpend(user.id, ai, result.usage);
    const output = result.output;
    saveMootFeedback(user.id, id, { ...output, turns });
  } catch (error) {
    console.error("Moot feedback error:", error);
    return { error: "Couldn't prepare feedback just now. Please try again." };
  }
  refresh();
}

export async function reopenMoot(id: string) {
  const user = await getCurrentUser();
  if (isChatId(id)) reopenMootSession(user.id, id);
  refresh();
}

export async function deleteMoot(id: string) {
  const user = await getCurrentUser();
  removeMoot(user.id, id);
  refresh();
}
