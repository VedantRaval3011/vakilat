"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { billingCycles, formatInr, planCatalog, type BillingCycle } from "@/lib/plans/catalog";
import { planLabels, type PlanId } from "@/lib/plans/types";

/** Stub checkout — Razorpay wires in here later. */
function startCheckout(plan: PlanId, cycle: BillingCycle, coupon: string) {
  void plan;
  void cycle;
  void coupon;
  return new Promise<string>((resolve) => {
    setTimeout(() => resolve("Payments aren't connected yet. Razorpay checkout will open here once your merchant account is ready."), 600);
  });
}

export function PlansPricing({ currentPlan = "free" }: { currentPlan?: PlanId }) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [coupon, setCoupon] = useState("");
  const [note, setNote] = useState<string>();
  const [busy, setBusy] = useState<PlanId | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4">
        <div className="flex rounded-xl border border-border bg-surface p-1">
          {billingCycles.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCycle(c.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                cycle === c.id ? "bg-accent text-black" : "text-muted hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <label className="flex w-full max-w-sm items-center gap-2">
          <span className="sr-only">Coupon code</span>
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            placeholder="Coupon code (optional)"
            maxLength={32}
            className="h-10 flex-1 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-accent/60"
          />
        </label>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {planCatalog.map((plan) => {
          const price = plan.prices[cycle];
          const isCurrent = currentPlan === plan.id;
          return (
            <li
              key={plan.id}
              className={`flex flex-col rounded-2xl border p-5 ${
                plan.highlighted ? "border-accent bg-accent/10" : "border-border bg-surface"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{planLabels[plan.id]}</p>
              <p className="mt-2 font-display text-3xl font-bold">
                {formatInr(price)}
                <span className="text-sm font-normal text-muted">
                  {price === 0 ? "" : cycle === "monthly" ? "/mo" : cycle === "semi_annual" ? "/6 mo" : "/yr"}
                </span>
              </p>
              <p className="mt-2 text-sm text-muted">{plan.blurb}</p>
              <ul className="mt-5 flex flex-1 flex-col gap-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" /> {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={isCurrent || busy !== null || plan.id === "free"}
                onClick={() => {
                  setNote(undefined);
                  setBusy(plan.id);
                  void startCheckout(plan.id, cycle, coupon).then((msg) => {
                    setNote(msg);
                    setBusy(null);
                  });
                }}
                className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-semibold text-background disabled:opacity-50"
              >
                {busy === plan.id && <Loader2 className="size-4 animate-spin" />}
                {isCurrent ? "Current plan" : plan.id === "free" ? "Included" : "Choose plan"}
              </button>
            </li>
          );
        })}
      </ul>

      {note && (
        <p role="status" className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100">
          {note}
        </p>
      )}
      <p className="text-center text-xs text-muted">
        * Unlimited on Ultimate is a product goal — limits will be finalised with pricing. Checkout will use Razorpay; no charges are taken yet.
      </p>
    </div>
  );
}
