import { Languages } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, PageShell } from "@/components/app/PageHeader";
import { TourGate } from "@/components/app/TourGate";
import { TranslateStudio } from "@/components/app/translate/TranslateStudio";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listTranslations } from "@/lib/translate/queries";

export const metadata: Metadata = { title: "Translate | Vakilat" };

async function Studio() {
  const user = await getCurrentUser();
  return <TranslateStudio history={listTranslations(user.id)} />;
}

export default function Page() {
  return (
    <PageShell>
      <Suspense>
        <TourGate tourKey="translate" />
      </Suspense>
      <PageHeader
        icon={Languages}
        title="Translate"
        subtitle="Legal text into 13 Indian languages — paste or upload a PDF or Word file"
      />
      <Suspense fallback={<div className="h-[28rem] animate-pulse rounded-2xl bg-surface" />}>
        <Studio />
      </Suspense>
    </PageShell>
  );
}
