import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { brand } from "@/lib/content";
import { getSession } from "./session";
import { findUserById, toPublic } from "./users";

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) redirect(brand.signInHref);

  const user = await findUserById(session.userId);
  if (!user) redirect(brand.signInHref);

  return toPublic(user);
});
