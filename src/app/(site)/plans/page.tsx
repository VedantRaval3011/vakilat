import type { Metadata } from "next";
import { Suspense } from "react";
import { PlansPricing } from "@/components/site/PlansPricing";
import { getSession } from "@/lib/auth/session";
import { brand } from "@/lib/content";
import { getUserPlan } from "@/lib/plans/quotas";

export const metadata: Metadata = { title: "Plans | Vakilat" };

async function Pricing() {
  const session = await getSession();
  const plan = session ? getUserPlan(session.userId) : "free";
  return <PlansPricing currentPlan={plan} />;
}

export default function PlansPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:py-16">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight">Plans</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted">
          Start free on {brand.name}. Upgrade when you need more {brand.assistant} answers, drafting and translation room.
        </p>
      </div>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface" />}>
        <Pricing />
      </Suspense>
    </div>
  );
}
