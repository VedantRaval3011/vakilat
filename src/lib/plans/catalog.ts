import type { PlanId } from "./types";

export type BillingCycle = "monthly" | "semi_annual" | "yearly";

export const billingCycles: { id: BillingCycle; label: string; months: number }[] = [
  { id: "monthly", label: "Monthly", months: 1 },
  { id: "semi_annual", label: "Semi-annual", months: 6 },
  { id: "yearly", label: "Yearly", months: 12 },
];

/** Prices in INR per billing period. Stub until Razorpay is live. */
export const planCatalog: {
  id: PlanId;
  name: string;
  blurb: string;
  prices: Record<BillingCycle, number>;
  features: string[];
  highlighted?: boolean;
}[] = [
  {
    id: "free",
    name: "Free",
    blurb: "Core research for daily practice.",
    prices: { monthly: 0, semi_annual: 0, yearly: 0 },
    features: ["Vidhi AI (daily limit)", "Code Converter & Constitution", "Notes, Saved & Hearings", "5 translations / month"],
  },
  {
    id: "basic",
    name: "Basic",
    blurb: "More AI room for a busy junior.",
    prices: { monthly: 499, semi_annual: 2499, yearly: 4499 },
    features: ["Higher Vidhi AI limits", "Draft Studio", "Moot Practice", "20 translations / month"],
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "For advocates who live in the tools.",
    prices: { monthly: 999, semi_annual: 4999, yearly: 8999 },
    features: ["Deep research", "Priority drafts & moot", "60 translations / month", "Higher upload limits"],
    highlighted: true,
  },
  {
    id: "ultimate",
    name: "Ultimate",
    blurb: "Chambers and power users.",
    prices: { monthly: 1999, semi_annual: 9999, yearly: 17_999 },
    features: ["Highest AI limits", "Team seats (soon)", "Unlimited translations*", "Early access features"],
  },
];

export function formatInr(n: number) {
  if (n === 0) return "₹0";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
