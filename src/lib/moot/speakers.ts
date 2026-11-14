export type Speaker = "bench" | "opponent";

// Accepts "BENCH:", "**BENCH:**" and "**BENCH**:" without eating a following italic marker.
const label = /(?:^|\n)[ \t]*(\*\*)?(BENCH|OPPOSING COUNSEL)(?:\1)?[ \t]*:(?:\1)?[ \t]*/g;

/** Splits a hearing reply into speaker turns. Text before any label belongs to the bench. */
export function speakerParts(text: string): { speaker: Speaker; text: string }[] {
  const parts: { speaker: Speaker; text: string }[] = [];
  let speaker: Speaker = "bench";
  let last = 0;
  for (const match of text.matchAll(label)) {
    const chunk = text.slice(last, match.index).trim();
    if (chunk) parts.push({ speaker, text: chunk });
    speaker = match[2] === "BENCH" ? "bench" : "opponent";
    last = match.index + match[0].length;
  }
  const rest = text.slice(last).trim();
  if (rest) parts.push({ speaker, text: rest });
  return parts;
}
