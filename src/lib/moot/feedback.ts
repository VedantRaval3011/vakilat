import { z } from "zod";

export const feedbackCriteria = [
  "Legal reasoning",
  "Use of authorities",
  "Procedural grasp",
  "Handling questions",
  "Persuasion",
  "Consistency",
  "Court manners & ethics",
] as const;

const score = z.number().min(0).max(10);

export const feedbackSchema = z.object({
  overall: score.describe("Overall score out of 10, one decimal place"),
  summary: z.string().describe("Two or three sentences on how the session went"),
  criteria: z
    .array(z.object({ name: z.enum(feedbackCriteria), score, comment: z.string().describe("One specific, actionable sentence") }))
    .describe("Exactly one entry per criterion"),
  strengths: z.array(z.string()).describe("Two to four concrete strengths, quoting counsel where useful"),
  improvements: z.array(z.string()).describe("Two to four concrete improvements"),
});

/** `turns` is how many submissions the feedback covered. */
export type MootFeedback = z.infer<typeof feedbackSchema> & { turns?: number };

export const sceneSchema = z.object({
  title: z.string().describe("Cause title, e.g. 'Ramesh Patel v. State of Gujarat'. Use invented names."),
  forum: z.string().describe("The specific court, e.g. 'Court of the Principal Sessions Judge, Ahmedabad'"),
  facts: z.string().describe("A realistic fact pattern of 120 to 200 words with dates, amounts and procedural history"),
  issues: z.array(z.string()).describe("Two to four issues the court must decide"),
});
