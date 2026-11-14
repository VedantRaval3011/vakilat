import { History } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { HistoryFeed } from "@/components/app/history/HistoryFeed";
import { PageHeader, PageShell } from "@/components/app/PageHeader";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listHistory } from "@/lib/history/queries";

export const metadata: Metadata = { title: "History | Vakilat" };

async function Feed() {
  const user = await getCurrentUser();
  return <HistoryFeed items={listHistory(user.id)} />;
}

export default function Page() {
  return (
    <PageShell>
      <PageHeader
        icon={History}
        title="History"
        subtitle="Your Vidhi chats, drafts and moot sessions in one place"
      />
      <Suspense fallback={<div className="h-[24rem] animate-pulse rounded-2xl bg-surface" />}>
        <Feed />
      </Suspense>
    </PageShell>
  );
}
