"use server";

import { randomUUID } from "node:crypto";
import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDraft, removeDraft, upsertDraft } from "@/lib/drafts/queries";
import { draftLanguages, GUIDED_TEMPLATE_KEY, MAX_FIELD_CHARS, templateByKey } from "@/lib/drafts/templates";
import { quotaBlocked } from "@/lib/plans/enforce";

export async function saveDraft(
  id: string,
  data: { template: string; title: string; fields: Record<string, string>; body: string; language?: string },
) {
  const user = await getCurrentUser();
  const template = templateByKey(data.template);
  if (!template || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) throw new Error("Invalid draft");

  const fields: Record<string, string> = {};
  for (const f of template.fields) {
    const v = data.fields?.[f.name];
    if (typeof v === "string") fields[f.name] = v.slice(0, MAX_FIELD_CHARS);
  }
  const title = (typeof data.title === "string" ? data.title.trim().slice(0, 200) : "") || template.name;
  const body = typeof data.body === "string" ? data.body.slice(0, 200_000) : "";
  const language = draftLanguages.find((l) => l === data.language) ?? "English";

  const isNew = !getDraft(user.id, id);
  if (isNew) {
    const blocked = quotaBlocked(user.id, "drafting");
    if (blocked) throw new Error(blocked);
  }
  if (!upsertDraft(user.id, id, { template: template.key, title, fields, body, language })) throw new Error("Draft not found");
  if (isNew) refresh();
}

export async function startGuidedDraft(language = "English") {
  const user = await getCurrentUser();
  const blocked = quotaBlocked(user.id, "drafting");
  if (blocked) throw new Error(blocked);
  const id = randomUUID().replace(/-/g, "").slice(0, 24);
  const lang = draftLanguages.find((l) => l === language) ?? "English";
  if (
    !upsertDraft(user.id, id, {
      template: GUIDED_TEMPLATE_KEY,
      title: "Guided draft",
      fields: {},
      body: "",
      messages: [],
      language: lang,
    })
  ) {
    throw new Error("Could not start draft");
  }
  refresh();
  return id;
}

export async function saveGuidedDraft(
  id: string,
  data: { title?: string; body?: string; language?: string },
) {
  const user = await getCurrentUser();
  const draft = getDraft(user.id, id);
  if (!draft || draft.template !== GUIDED_TEMPLATE_KEY) throw new Error("Draft not found");
  const language = draftLanguages.find((l) => l === data.language) ?? draft.language;
  upsertDraft(user.id, id, {
    template: draft.template,
    title: (data.title?.trim().slice(0, 200) || draft.title),
    fields: draft.fields,
    body: typeof data.body === "string" ? data.body.slice(0, 200_000) : draft.body,
    messages: draft.messages,
    language,
  });
}

export async function deleteDraft(id: string) {
  const user = await getCurrentUser();
  removeDraft(user.id, id);
  refresh();
}
