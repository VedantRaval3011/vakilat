"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  changePasswordWithCode,
  deleteUser,
  findUserById,
  issuePasswordCode,
  updateProfessional,
  updateProfile,
} from "@/lib/auth/users";
import { EMAIL_RE, PHONE_RE, passwordIssue } from "@/lib/auth/validation";
import { accountTypes, brand, indianStates, professions } from "@/lib/content";

export type SettingsFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  success?: string;
  /** Shown only when email delivery is not configured yet. */
  demoCode?: string;
} | undefined;

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

const PHOTO_MAX = 220_000;
const PHOTO_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

export async function saveProfile(_: SettingsFormState, fd: FormData): Promise<SettingsFormState> {
  const user = await getCurrentUser();
  const name = str(fd, "name");
  const phone = str(fd, "phone").replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  const photoRaw = str(fd, "photo");
  const clearPhoto = fd.get("clearPhoto") === "1";

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Enter your full name.";
  if (!PHONE_RE.test(phone)) fieldErrors.phone = "Enter a 10-digit Indian mobile number.";

  let photo: string | null | undefined;
  if (clearPhoto) photo = null;
  else if (photoRaw) {
    if (!PHOTO_RE.test(photoRaw) || photoRaw.length > PHOTO_MAX) {
      fieldErrors.photo = "Use a JPG, PNG or WebP under about 160 KB.";
    } else {
      photo = photoRaw;
    }
  }

  if (Object.keys(fieldErrors).length) return { fieldErrors };

  await updateProfile(user.id, { name, phone, photo });
  refresh();
  return { success: "Profile updated." };
}

export async function saveProfessional(_: SettingsFormState, fd: FormData): Promise<SettingsFormState> {
  const user = await getCurrentUser();
  const state = str(fd, "state");
  const profession = str(fd, "profession");
  const accountType = str(fd, "accountType");

  const fieldErrors: Record<string, string> = {};
  if (!indianStates.includes(state)) fieldErrors.state = "Choose your state or UT.";
  if (!professions.includes(profession)) fieldErrors.profession = "Choose what describes you best.";
  if (!accountTypes.includes(accountType)) fieldErrors.accountType = "Choose an account type.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  await updateProfessional(user.id, { state, profession, accountType });
  refresh();
  return { success: "Professional details saved." };
}

export async function requestPasswordChangeCode(_prev: SettingsFormState, _form: FormData): Promise<SettingsFormState> {
  void _prev;
  void _form;
  const user = await getCurrentUser();
  const code = await issuePasswordCode(user.id);
  // Email delivery is not wired yet — surface the code so local testing still works.
  return {
    success: `A verification code was prepared for ${user.email}. Email delivery is not set up yet, so use the code below.`,
    demoCode: code,
  };
}

export async function confirmPasswordChange(_: SettingsFormState, fd: FormData): Promise<SettingsFormState> {
  const user = await getCurrentUser();
  const code = str(fd, "code");
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!/^\d{6}$/.test(code)) fieldErrors.code = "Enter the 6-digit code.";
  const pwIssue = passwordIssue(password);
  if (pwIssue) fieldErrors.password = pwIssue;
  else if (password !== confirm) fieldErrors.confirm = "Passwords don't match.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const result = await changePasswordWithCode(user.id, code, password);
  if (result.error === "no_code") return { error: "Request a verification code first." };
  if (result.error === "expired") return { error: "That code has expired. Request a new one." };
  if (result.error === "bad_code") return { fieldErrors: { code: "That code is incorrect." } };

  refresh();
  return { success: "Password updated." };
}

export async function destroyAccount(_: SettingsFormState, fd: FormData): Promise<SettingsFormState> {
  const sessionUser = await getCurrentUser();
  const full = await findUserById(sessionUser.id);
  if (!full) redirect(brand.signInHref);

  const confirmEmail = str(fd, "confirmEmail").toLowerCase();
  const confirmPhrase = str(fd, "confirmPhrase");

  const fieldErrors: Record<string, string> = {};
  if (!EMAIL_RE.test(confirmEmail) || confirmEmail !== full.email) {
    fieldErrors.confirmEmail = "Type your account email exactly to confirm.";
  }
  if (confirmPhrase.toLowerCase() !== "delete my account") {
    fieldErrors.confirmPhrase = 'Type "delete my account" to confirm.';
  }
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  await deleteUser(full.id);
  await deleteSession();
  redirect(brand.signInHref);
}
