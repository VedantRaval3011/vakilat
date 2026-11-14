"use server";

import { randomUUID } from "node:crypto";
import { EMAIL_RE } from "@/lib/auth/validation";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export type SupportState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "subject" | "message", string>>;
  values?: Record<string, string>;
  success?: string;
} | undefined;

const clip = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

export async function sendSupportMessage(_: SupportState, fd: FormData): Promise<SupportState> {
  const values = {
    name: clip(fd.get("name"), 80),
    email: clip(fd.get("email"), 120).toLowerCase(),
    subject: clip(fd.get("subject"), 120),
    message: clip(fd.get("message"), 4000),
  };

  const fieldErrors: NonNullable<SupportState>["fieldErrors"] = {};
  if (values.name.length < 2) fieldErrors.name = "Enter your name.";
  if (!EMAIL_RE.test(values.email)) fieldErrors.email = "Enter a valid email.";
  if (values.subject.length < 3) fieldErrors.subject = "Enter a short subject.";
  if (values.message.length < 10) fieldErrors.message = "Tell us a little more (at least a sentence).";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  const session = await getSession();
  getDb()
    .prepare(
      `INSERT INTO support_messages (id, user_id, name, email, subject, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(randomUUID(), session?.userId ?? null, values.name, values.email, values.subject, values.message, new Date().toISOString());

  return { success: "Thanks — your message is with us. We'll reply by email when support inbox is connected." };
}
