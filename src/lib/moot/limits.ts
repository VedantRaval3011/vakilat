import type { UIMessage } from "ai";

export const MAX_TURNS = 20;
export const MAX_SUBMISSION_CHARS = 6000;
export const MAX_FACTS_CHARS = 5000;
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
/** Counsel needs at least this many submissions before the bench can give useful feedback. */
export const MIN_TURNS_FOR_FEEDBACK = 2;

export const counselTurns = (messages: UIMessage[]) => messages.filter((m) => m.role === "user").length;

export const messageText = (m: UIMessage) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
