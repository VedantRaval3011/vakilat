"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/auth/session";
import { authenticate, createUser } from "@/lib/auth/users";
import { EMAIL_RE, PHONE_RE, passwordIssue } from "@/lib/auth/validation";
import { brand, indianStates, professions } from "@/lib/content";

export type FormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  values?: Record<string, string>;
  success?: string;
} | undefined;

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

function safeNext(next: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : brand.appHref;
}

export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email");
  const password = String(fd.get("password") ?? "");
  const remember = fd.get("remember") === "on";
  const values = { email };

  const fieldErrors: Record<string, string> = {};
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (!password) fieldErrors.password = "Enter your password.";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  const user = await authenticate(email, password);
  if (!user) return { error: "That email and password don't match an account.", values };

  await createSession(user.id, remember);
  redirect(safeNext(str(fd, "next")));
}

export async function signUp(_: FormState, fd: FormData): Promise<FormState> {
  const values = {
    name: str(fd, "name"),
    email: str(fd, "email"),
    phone: str(fd, "phone").replace(/\D/g, "").replace(/^91(?=\d{10}$)/, ""),
    state: str(fd, "state"),
    profession: str(fd, "profession"),
    inviteCode: str(fd, "inviteCode"),
  };
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (values.name.length < 2) fieldErrors.name = "Enter your full name.";
  if (!EMAIL_RE.test(values.email)) fieldErrors.email = "Enter a valid email address.";
  if (!PHONE_RE.test(values.phone)) fieldErrors.phone = "Enter a 10-digit Indian mobile number.";
  if (!indianStates.includes(values.state)) fieldErrors.state = "Choose your state or UT.";
  if (!professions.includes(values.profession)) fieldErrors.profession = "Choose what describes you best.";
  const pwIssue = passwordIssue(password);
  if (pwIssue) fieldErrors.password = pwIssue;
  else if (password !== confirm) fieldErrors.confirm = "Passwords don't match.";
  if (fd.get("terms") !== "on") fieldErrors.terms = "Please accept the Terms and Privacy Policy.";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  const result = await createUser({ ...values, inviteCode: values.inviteCode || undefined, password });
  if ("error" in result) {
    return {
      fieldErrors: { email: "An account with this email already exists. Try signing in." },
      values,
    };
  }

  await createSession(result.user.id, true);
  redirect(brand.appHref);
}

export async function requestPasswordReset(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email");
  if (!EMAIL_RE.test(email)) {
    return { fieldErrors: { email: "Enter a valid email address." }, values: { email } };
  }
  return {
    success: `If an account exists for ${email}, you'll receive a reset link shortly.`,
    values: { email },
  };
}

export async function signOut() {
  await deleteSession();
  redirect(brand.signInHref);
}
