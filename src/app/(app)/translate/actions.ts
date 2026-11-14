"use server";

import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTranslation, rateTranslation, removeTranslation } from "@/lib/translate/queries";

export async function rateTranslateItem(id: string, rating: -1 | 0 | 1) {
  const user = await getCurrentUser();
  rateTranslation(user.id, id, rating);
  refresh();
}

export async function deleteTranslateItem(id: string) {
  const user = await getCurrentUser();
  removeTranslation(user.id, id);
  refresh();
}

export async function loadTranslateItem(id: string) {
  const user = await getCurrentUser();
  return getTranslation(user.id, id);
}
