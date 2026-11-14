/** Feature keys shown on Usage and enforced later by Plans. `null` limit = unlimited. */
export type QuotaFeature =
  | "vidhi"
  | "deep_research"
  | "drafting"
  | "moot"
  | "translation"
  | "notes"
  | "bookmarks"
  | "downloads"
  | "uploads"
  | "calendar"
  | "summaries"
  | "compare";

export type QuotaRow = {
  key: QuotaFeature;
  label: string;
  used: number;
  limit: number | null;
  period: "day" | "month" | "total";
};

export type PlanId = "free" | "basic" | "pro" | "ultimate";

export const planLabels: Record<PlanId, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
  ultimate: "Ultimate",
};
