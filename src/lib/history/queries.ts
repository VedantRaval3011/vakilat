import "server-only";
import type { UIMessage } from "ai";
import { listChats, loadChat } from "@/lib/ai/chats";
import { brand } from "@/lib/content";
import { getDraft, listDrafts } from "@/lib/drafts/queries";
import { templateByKey } from "@/lib/drafts/templates";
import { getMoot, listMoots } from "@/lib/moot/queries";
import { routes } from "@/lib/navigation";
import { translateLangByCode } from "@/lib/translate/languages";
import { getTranslation, listTranslations } from "@/lib/translate/queries";
import type { HistoryItem, HistoryKind } from "./types";

export type { HistoryItem, HistoryKind } from "./types";

const messagePlain = (m: UIMessage) =>
  m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

export function listHistory(userId: string, limit = 200): HistoryItem[] {
  const chats: HistoryItem[] = listChats(userId, "vidhi", limit).map((c) => ({
    id: c.id,
    kind: "chat",
    title: c.title,
    subtitle: c.pinned ? "Vidhi AI · Pinned" : "Vidhi AI",
    href: `${routes.vidhi}?c=${c.id}`,
    updatedAt: c.updatedAt,
  }));

  const drafts: HistoryItem[] = listDrafts(userId, limit).map((d) => {
    const template = templateByKey(d.template);
    return {
      id: d.id,
      kind: "draft",
      title: d.title,
      subtitle: template?.name ?? "Draft Studio",
      href: `${routes.draftStudio}?d=${d.id}`,
      updatedAt: d.updatedAt,
    };
  });

  const moots: HistoryItem[] = listMoots(userId, limit).map((m) => ({
    id: m.id,
    kind: "moot",
    title: m.title,
    subtitle: m.closed
      ? `Moot · ${m.side}${m.overall != null ? ` · ${m.overall.toFixed(1)}/10` : ""}`
      : `Moot · ${m.side} · in progress`,
    href: `${routes.mootPractice}?s=${m.id}`,
    updatedAt: m.updatedAt,
  }));

  const translations: HistoryItem[] = listTranslations(userId, limit).map((t) => ({
    id: t.id,
    kind: "translation",
    title: t.title,
    subtitle: `Translate · ${translateLangByCode(t.targetLang)?.name ?? t.targetLang}`,
    href: routes.translate,
    updatedAt: t.createdAt,
  }));

  return [...chats, ...drafts, ...moots, ...translations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function historyExport(userId: string, kind: HistoryKind, id: string): { title: string; body: string } | null {
  if (kind === "chat") {
    const messages = loadChat(userId, id);
    if (!messages) return null;
    const title = messages.find((m) => m.role === "user")
      ? messagePlain(messages.find((m) => m.role === "user")!).slice(0, 80) || "Vidhi conversation"
      : "Vidhi conversation";
    const body = messages
      .map((m) => {
        const text = messagePlain(m);
        if (!text) return null;
        return `${m.role === "user" ? "You" : brand.assistant}:\n${text}`;
      })
      .filter(Boolean)
      .join("\n\n");
    return {
      title,
      body: `${body}\n\nExported from ${brand.name}. AI answers are not legal advice; verify every citation.`,
    };
  }

  if (kind === "draft") {
    const draft = getDraft(userId, id);
    if (!draft) return null;
    const template = templateByKey(draft.template);
    return {
      title: draft.title,
      body: `${draft.body || "(Empty draft)"}\n\n—\nTemplate: ${template?.name ?? draft.template}\nExported from ${brand.name}.`,
    };
  }

  if (kind === "moot") {
    const moot = getMoot(userId, id);
    if (!moot) return null;
    const transcript = moot.messages
      .map((m) => {
        const text = messagePlain(m);
        if (!text) return null;
        return `${m.role === "user" ? "Counsel" : "Court"}:\n${text.replace(/\*/g, "")}`;
      })
      .filter(Boolean)
      .join("\n\n");
    const feedback = moot.feedback
      ? `Feedback (overall ${moot.feedback.overall}/10):\n${moot.feedback.summary}`
      : "No feedback yet.";
    return {
      title: `Moot — ${moot.setup.title}`,
      body: [
        moot.setup.title,
        moot.setup.forum,
        `Appearing for: ${moot.setup.side}`,
        feedback,
        "Transcript",
        transcript || "(No submissions yet)",
        `Exported from ${brand.name}. Practice feedback from an AI; verify all law independently.`,
      ].join("\n\n"),
    };
  }

  const translation = getTranslation(userId, id);
  if (!translation) return null;
  const lang = translateLangByCode(translation.targetLang)?.name ?? translation.targetLang;
  return {
    title: translation.title,
    body: [
      translation.title,
      `Target language: ${lang}`,
      translation.resultText,
      `Exported from ${brand.name}. Verify translations against the original.`,
    ].join("\n\n"),
  };
}
