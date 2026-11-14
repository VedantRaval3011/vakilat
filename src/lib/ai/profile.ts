import "server-only";
import { getDb } from "@/lib/db";
import { emptyProfile, profileFields, type VidhiProfile } from "@/lib/vidhi/config";

export function getVidhiProfile(userId: string): VidhiProfile {
  const row = getDb()
    .prepare("SELECT nickname, role, practice, jurisdiction, preferences FROM vidhi_profiles WHERE user_id = ?")
    .get(userId) as VidhiProfile | undefined;
  return row ? { ...emptyProfile, ...row } : { ...emptyProfile };
}

export function cleanProfile(input: Partial<Record<string, unknown>>): VidhiProfile {
  const out = { ...emptyProfile };
  for (const f of profileFields) {
    const v = input[f.name];
    out[f.name] = typeof v === "string" ? v.trim().slice(0, f.max) : "";
  }
  return out;
}

export function saveVidhiProfile(userId: string, profile: VidhiProfile) {
  getDb()
    .prepare(
      `INSERT INTO vidhi_profiles (user_id, nickname, role, practice, jurisdiction, preferences, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (user_id) DO UPDATE SET nickname = excluded.nickname, role = excluded.role, practice = excluded.practice,
       jurisdiction = excluded.jurisdiction, preferences = excluded.preferences, updated_at = excluded.updated_at`,
    )
    .run(userId, profile.nickname, profile.role, profile.practice, profile.jurisdiction, profile.preferences, new Date().toISOString());
}
