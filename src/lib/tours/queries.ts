import "server-only";
import { getDb } from "@/lib/db";
import type { TourKey } from "./catalog";

export function isTourDismissed(userId: string, tourKey: TourKey) {
  return !!getDb().prepare("SELECT 1 FROM user_tours WHERE user_id = ? AND tour_key = ?").get(userId, tourKey);
}

export function dismissTour(userId: string, tourKey: TourKey) {
  getDb()
    .prepare(
      `INSERT INTO user_tours (user_id, tour_key, dismissed_at) VALUES (?, ?, ?)
       ON CONFLICT (user_id, tour_key) DO UPDATE SET dismissed_at = excluded.dismissed_at`,
    )
    .run(userId, tourKey, new Date().toISOString());
}
