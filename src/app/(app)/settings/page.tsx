import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsPanel } from "@/components/app/settings/SettingsPanel";
import { PageShell } from "@/components/app/PageHeader";
import { getCurrentUser } from "@/lib/auth/current-user";
import { findUserById, toAccountProfile } from "@/lib/auth/users";
import { spendThisMonth } from "@/lib/ai/spend";
import { getUserPlan, usageSnapshot } from "@/lib/plans/quotas";

export const metadata: Metadata = { title: "Settings | Vakilat" };

async function Settings() {
  const session = await getCurrentUser();
  const user = await findUserById(session.id);
  if (!user) return null;
  const profile = toAccountProfile(user);
  return <SettingsPanel profile={profile} usage={usageSnapshot(user.id)} plan={getUserPlan(user.id)} spend={spendThisMonth(user.id)} />;
}

export default function Page() {
  return (
    <PageShell>
      <Suspense fallback={<div className="h-[32rem] animate-pulse rounded-2xl bg-surface" />}>
        <Settings />
      </Suspense>
    </PageShell>
  );
}
