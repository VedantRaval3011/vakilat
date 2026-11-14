import { Gavel } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MootCourtroom } from "@/components/app/moot/MootCourtroom";
import { MootSetupView } from "@/components/app/moot/MootSetupView";
import { PageHeader, PageShell } from "@/components/app/PageHeader";
import { TourGate } from "@/components/app/TourGate";
import { isChatId, usageToday } from "@/lib/ai/chats";
import { dailyLimit, isAiConfigured } from "@/lib/ai/model";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMoot, listMoots } from "@/lib/moot/queries";
import { routes } from "@/lib/navigation";

export const metadata: Metadata = { title: "Moot Practice | Vakilat" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function Moot({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const sp = await searchParams;
  const s = typeof sp.s === "string" ? sp.s : null;

  if (s) {
    const moot = isChatId(s) ? getMoot(user.id, s) : null;
    if (!moot) redirect(routes.mootPractice);
    return (
      <MootCourtroom
        key={moot.id}
        id={moot.id}
        setup={moot.setup}
        initialMessages={moot.messages}
        feedback={moot.feedback}
        closed={moot.closed}
        configured={isAiConfigured()}
        remaining={dailyLimit() - usageToday(user.id).total}
      />
    );
  }

  return (
    <>
      <PageHeader icon={Gavel} title="Moot Practice" subtitle="Argue before a virtual bench and get scored feedback" />
      <MootSetupView sessions={listMoots(user.id)} configured={isAiConfigured()} />
    </>
  );
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <PageShell>
      <Suspense>
        <TourGate tourKey="moot-practice" />
      </Suspense>
      <Suspense fallback={<div className="h-[32rem] animate-pulse rounded-2xl bg-surface" />}>
        <Moot searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}
