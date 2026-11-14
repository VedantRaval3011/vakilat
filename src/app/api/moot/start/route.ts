import { randomUUID } from "node:crypto";
import { generateText, Output, type FilePart, type TextPart } from "ai";
import { getSession } from "@/lib/auth/session";
import { recordUsage, usageToday } from "@/lib/ai/chats";
import { dailyLimit, getModel } from "@/lib/ai/model";
import { recordAiSpend } from "@/lib/ai/spend";
import { mootDocumentPrompt, mootScenePrompt } from "@/lib/ai/prompts";
import { sceneSchema } from "@/lib/moot/feedback";
import { MAX_DOCUMENT_BYTES, MAX_FACTS_CHARS } from "@/lib/moot/limits";
import { createMoot } from "@/lib/moot/queries";
import {
  SPEAKERS,
  benchModes,
  courtLevels,
  opposingRole,
  roles,
  scenarioByKey,
  type BenchMode,
  type MootSetup,
} from "@/lib/moot/scenarios";

export const maxDuration = 60;

const fail = (status: number, error: string) => Response.json({ error }, { status });

const field = (form: FormData, name: string, max: number) => {
  const v = form.get(name);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
};

const issueLines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.replace(/^\s*(\d+[.)]|[-•*])\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 6);

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail(401, "Please sign in again.");

  const form = await req.formData().catch(() => null);
  if (!form) return fail(400, "Invalid request.");
  const mode = field(form, "mode", 20);
  const benchValue = field(form, "bench", 20);
  const bench = benchModes.some((b) => b.key === benchValue) ? (benchValue as BenchMode) : "balanced";

  let setup: MootSetup;

  if (mode === "library") {
    const s = scenarioByKey(field(form, "scenario", 60));
    if (!s) return fail(400, "Choose a moot problem.");
    const i = field(form, "sideIndex", 2) === "1" ? 1 : 0;
    setup = { source: "library", scenario: s.key, title: s.title, forum: s.forum, side: s.sides[i], opponent: s.sides[1 - i], facts: s.facts, issues: s.issues, bench };
  } else if (mode === "generate" || mode === "own") {
    const court = field(form, "court", 60);
    const role = field(form, "role", 40) as (typeof roles)[number];
    const caseType = field(form, "caseType", 120);
    if (!(courtLevels as readonly string[]).includes(court)) return fail(400, "Choose a court.");
    if (!roles.includes(role)) return fail(400, "Choose your role.");
    if (!caseType) return fail(400, "Enter the type of matter, e.g. Regular bail.");
    const opponent = opposingRole[role];
    const base = { source: mode, scenario: mode, caseType, side: role, opponent, bench } as const;

    const file = form.get("file");
    const document = file instanceof File && file.size > 0 ? file : null;
    const facts = field(form, "facts", MAX_FACTS_CHARS);
    if (mode === "own" && !document && facts.length < 40) {
      return fail(400, "Describe the facts in a few sentences, or upload the case document.");
    }
    if (document) {
      if (document.size > MAX_DOCUMENT_BYTES) return fail(400, "The document must be under 10 MB.");
      if (!["application/pdf", "text/plain"].includes(document.type)) return fail(400, "Upload a PDF or a plain-text (.txt) file.");
    }

    if (mode === "own" && !document) {
      const issues = issueLines(field(form, "issues", 2000));
      setup = {
        ...base,
        title: field(form, "title", 120) || caseType,
        forum: court,
        facts,
        issues: issues.length ? issues : ["As arising from the facts."],
      };
    } else {
      const ai = getModel("moot-scene");
      if (!ai) return fail(503, "Moot Practice isn't set up yet. Add an AI provider key to the server configuration.");
      const limit = dailyLimit();
      if (usageToday(session.userId).total >= limit) return fail(429, `You've used today's ${limit} AI requests. The limit resets at midnight.`);
      recordUsage(session.userId);

      try {
        let content: (TextPart | FilePart)[];
        if (document) {
          const prompt: TextPart = { type: "text", text: mootDocumentPrompt({ forum: court, caseType, side: role, notes: facts }) };
          content =
            document.type === "application/pdf"
              ? [prompt, { type: "file", mediaType: "application/pdf", data: new Uint8Array(await document.arrayBuffer()), filename: document.name }]
              : [prompt, { type: "text", text: `Case document:\n${(await document.text()).slice(0, 60_000)}` }];
        } else {
          content = [{ type: "text", text: mootScenePrompt({ forum: court, caseType, side: role, opponent }) }];
        }
        const result = await generateText({
          model: ai.model,
          output: Output.object({ schema: sceneSchema }),
          messages: [{ role: "user", content }],
          abortSignal: req.signal,
        });
        recordAiSpend(session.userId, ai, result.usage);
        const output = result.output;
        setup = {
          ...base,
          title: (mode === "own" && field(form, "title", 120)) || output.title.slice(0, 120),
          forum: output.forum.slice(0, 120) || court,
          facts: output.facts.slice(0, MAX_FACTS_CHARS),
          issues: output.issues.slice(0, 6),
        };
      } catch (error) {
        console.error("Moot setup error:", error);
        return fail(502, document ? "Couldn't read that document. Try a different file, or type the facts instead." : "Couldn't prepare a scenario just now. Please try again.");
      }
    }
  } else {
    return fail(400, "Invalid request.");
  }

  const id = randomUUID();
  const counsel = setup.side.replace(/\s*\(.*\)$/, "");
  createMoot(session.userId, id, setup, [
    {
      id: `open-${id.slice(0, 8)}`,
      role: "assistant",
      parts: [{ type: "text", text: `${SPEAKERS.bench} *(The bench assembles.)* Yes, Counsel for the ${counsel}. We have read the brief. You may begin.` }],
    },
  ]);
  return Response.json({ id });
}
