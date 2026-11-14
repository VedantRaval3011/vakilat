import "server-only";
import { createHash, randomBytes, randomInt, randomUUID, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getDb } from "@/lib/db";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  profession: string;
  accountType: string;
  photo: string | null;
  inviteCode?: string;
  passwordHash: string;
  passwordUpdatedAt: string | null;
  createdAt: string;
};

export type PublicUser = Pick<UserRecord, "id" | "name" | "email" | "profession" | "state" | "photo">;

export type AccountProfile = Omit<UserRecord, "passwordHash" | "inviteCode">;

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  profession: string;
  account_type: string | null;
  photo: string | null;
  invite_code: string | null;
  password_hash: string;
  password_updated_at: string | null;
  created_at: string;
};

const fromRow = (r: Row): UserRecord => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  state: r.state,
  profession: r.profession,
  accountType: r.account_type || "Legal professional",
  photo: r.photo,
  inviteCode: r.invite_code ?? undefined,
  passwordHash: r.password_hash,
  passwordUpdatedAt: r.password_updated_at,
  createdAt: r.created_at,
});

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string) {
  const [saltHex, keyHex] = stored.split(":");
  const key = await scrypt(password, Buffer.from(saltHex, "hex"), 64);
  return timingSafeEqual(key, Buffer.from(keyHex, "hex"));
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const hashCode = (code: string) => createHash("sha256").update(code).digest("hex");

export function toPublic(u: UserRecord): PublicUser {
  return { id: u.id, name: u.name, email: u.email, profession: u.profession, state: u.state, photo: u.photo };
}

export function toAccountProfile(u: UserRecord): AccountProfile {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    state: u.state,
    profession: u.profession,
    accountType: u.accountType,
    photo: u.photo,
    passwordUpdatedAt: u.passwordUpdatedAt,
    createdAt: u.createdAt,
  };
}

export async function findUserById(id: string) {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as Row | undefined;
  return row ? fromRow(row) : null;
}

async function findUserByEmail(email: string) {
  const row = getDb().prepare("SELECT * FROM users WHERE email = ?").get(normalizeEmail(email)) as Row | undefined;
  return row ? fromRow(row) : null;
}

function defaultAccountType(profession: string) {
  if (profession === "Law student") return "Law student";
  if (profession === "Academic or researcher") return "Academic institution";
  if (profession === "Not a legal professional") return "Individual / other";
  return "Legal professional";
}

export async function createUser(
  input: Omit<UserRecord, "id" | "passwordHash" | "createdAt" | "accountType" | "photo" | "passwordUpdatedAt"> & {
    password: string;
    accountType?: string;
  },
) {
  const email = normalizeEmail(input.email);
  if (await findUserByEmail(email)) return { error: "email_taken" as const };

  const now = new Date().toISOString();
  const user: UserRecord = {
    id: randomUUID(),
    name: input.name,
    email,
    phone: input.phone,
    state: input.state,
    profession: input.profession,
    accountType: input.accountType ?? defaultAccountType(input.profession),
    photo: null,
    inviteCode: input.inviteCode,
    passwordHash: await hashPassword(input.password),
    passwordUpdatedAt: now,
    createdAt: now,
  };
  getDb()
    .prepare(
      `INSERT INTO users (id, name, email, phone, state, profession, account_type, photo, invite_code, password_hash, password_updated_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      user.id,
      user.name,
      user.email,
      user.phone,
      user.state,
      user.profession,
      user.accountType,
      null,
      user.inviteCode ?? null,
      user.passwordHash,
      user.passwordUpdatedAt,
      user.createdAt,
    );
  return { user };
}

export async function authenticate(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  return (await verifyPassword(password, user.passwordHash)) ? user : null;
}

export async function updateProfile(
  userId: string,
  data: { name: string; phone: string; photo?: string | null },
) {
  if (data.photo === undefined) {
    getDb().prepare("UPDATE users SET name = ?, phone = ? WHERE id = ?").run(data.name, data.phone, userId);
  } else {
    getDb()
      .prepare("UPDATE users SET name = ?, phone = ?, photo = ? WHERE id = ?")
      .run(data.name, data.phone, data.photo, userId);
  }
}

export async function updateProfessional(
  userId: string,
  data: { state: string; profession: string; accountType: string },
) {
  getDb()
    .prepare("UPDATE users SET state = ?, profession = ?, account_type = ? WHERE id = ?")
    .run(data.state, data.profession, data.accountType, userId);
}

/** Creates a 6-digit code. Caller must deliver it (email stub returns it in demo). */
export async function issuePasswordCode(userId: string) {
  const code = String(randomInt(100_000, 1_000_000));
  const expires = new Date(Date.now() + 10 * 60_000).toISOString();
  getDb()
    .prepare(
      `INSERT INTO password_codes (user_id, code_hash, expires_at, created_at) VALUES (?, ?, ?, ?)
       ON CONFLICT (user_id) DO UPDATE SET code_hash = excluded.code_hash, expires_at = excluded.expires_at, created_at = excluded.created_at`,
    )
    .run(userId, hashCode(code), expires, new Date().toISOString());
  return code;
}

export async function changePasswordWithCode(userId: string, code: string, newPassword: string) {
  const row = getDb().prepare("SELECT code_hash, expires_at FROM password_codes WHERE user_id = ?").get(userId) as
    | { code_hash: string; expires_at: string }
    | undefined;
  if (!row) return { error: "no_code" as const };
  if (new Date(row.expires_at).getTime() < Date.now()) {
    getDb().prepare("DELETE FROM password_codes WHERE user_id = ?").run(userId);
    return { error: "expired" as const };
  }
  const a = Buffer.from(row.code_hash);
  const b = Buffer.from(hashCode(code.trim()));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { error: "bad_code" as const };

  const now = new Date().toISOString();
  getDb()
    .prepare("UPDATE users SET password_hash = ?, password_updated_at = ? WHERE id = ?")
    .run(await hashPassword(newPassword), now, userId);
  getDb().prepare("DELETE FROM password_codes WHERE user_id = ?").run(userId);
  return { ok: true as const };
}

export async function deleteUser(userId: string) {
  getDb().prepare("DELETE FROM users WHERE id = ?").run(userId);
}
