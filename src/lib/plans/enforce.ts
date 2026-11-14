import "server-only";
import { featureQuota, type QuotaFeature } from "./quotas";

/** Returns an error message if the user is over the free-plan ceiling for this feature. */
export function quotaBlocked(userId: string, feature: QuotaFeature): string | null {
  const row = featureQuota(userId, feature);
  if (row.limit === null) return null;
  if (row.used >= row.limit) {
    const when = row.period === "day" ? "today" : row.period === "month" ? "this month" : "";
    return `You've reached the ${row.label} limit${when ? ` for ${when}` : ""} (${row.limit}). Upgrade on Plans for more room.`;
  }
  return null;
}
