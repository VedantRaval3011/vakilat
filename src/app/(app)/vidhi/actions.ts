"use server";

import { refresh } from "next/cache";
import { isChatId, rateAnswer, removeChat, setChatPinned } from "@/lib/ai/chats";
import { cleanProfile, saveVidhiProfile } from "@/lib/ai/profile";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { VidhiProfile } from "@/lib/vidhi/config";

export async function deleteChat(id: string) {
  const user = await getCurrentUser();
  removeChat(user.id, id);
  refresh();
}

export async function pinChat(id: string, pinned: boolean) {
  const user = await getCurrentUser();
  if (!isChatId(id)) return;
  setChatPinned(user.id, id, pinned);
  refresh();
}

export async function rateVidhiAnswer(chatId: string, messageId: string, rating: -1 | 0 | 1) {
  const user = await getCurrentUser();
  if (!isChatId(chatId) || !/^[A-Za-z0-9_-]{1,64}$/.test(messageId) || ![-1, 0, 1].includes(rating)) return false;
  return rateAnswer(user.id, chatId, messageId, rating);
}

export async function updateVidhiProfile(input: Partial<VidhiProfile>) {
  const user = await getCurrentUser();
  const profile = cleanProfile(input);
  saveVidhiProfile(user.id, profile);
  return profile;
}
