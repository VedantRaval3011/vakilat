import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { SESSION_COOKIE as COOKIE_NAME } from "./constants";

const DEFAULT_DAYS = 1;
const REMEMBER_DAYS = 30;

export type SessionPayload = { userId: string };

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload, days: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(secretKey());
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secretKey(), {
      algorithms: ["HS256"],
    });
    return payload.userId ? { userId: payload.userId } : null;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, remember: boolean) {
  const days = remember ? REMEMBER_DAYS : DEFAULT_DAYS;
  const token = await encrypt({ userId }, days);
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: remember ? new Date(Date.now() + days * 86_400_000) : undefined,
  });
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  await connection();
  return decrypt(token);
}

export async function deleteSession() {
  (await cookies()).delete(COOKIE_NAME);
}