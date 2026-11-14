import { CalendarClock } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Hearings } from "@/components/app/desk/Hearings";
import { PageHeader, PageShell } from "@/components/app/PageHeader";
import { TourGate } from "@/components/app/TourGate";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listHearings } from "@/lib/desk/queries";

export const metadata: Metadata = { title: "Hearings | Vakilat" };

async function HearingsData() {
  const user = await getCurrentUser();
  return <Hearings hearings={listHearings(user.id)} />;
}

export default function Page() {
  return (
    <PageShell>
      <Suspense>
        <TourGate tourKey="hearings" />
      </Suspense>
      <PageHeader icon={CalendarClock} title="Hearings" subtitle="Month calendar for hearings, deadlines, reminders and other dates" />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface" />}>
        <HearingsData />
      </Suspense>
    </PageShell>
  );
}
