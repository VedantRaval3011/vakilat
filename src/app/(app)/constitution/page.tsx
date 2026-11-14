import { Info, Scale } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ConstitutionReader } from "@/components/app/constitution/ConstitutionReader";
import { PageHeader, PageShell } from "@/components/app/PageHeader";
import { getCurrentUser } from "@/lib/auth/current-user";
import { savedKeys } from "@/lib/desk/queries";

export const metadata: Metadata = { title: "Constitution of India | Vakilat" };

async function Reader() {
  const user = await getCurrentUser();
  return <ConstitutionReader savedKeys={savedKeys(user.id, "article")} />;
}

export default function Page() {
  return (
    <PageShell>
      <PageHeader icon={Scale} title="Constitution of India" subtitle="Preamble, Parts, Articles and Schedules" />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface" />}>
        <Reader />
      </Suspense>
      <p className="flex items-start gap-2 rounded-xl border border-border bg-surface/50 px-4 py-3 text-xs leading-relaxed text-muted">
        <Info className="mt-0.5 size-4 shrink-0 text-accent" />
        Article text is shown as amended. Where an article has several clauses, only the clause most often cited is shown for
        now. Full text for every article is being added from the official Legislative Department edition.
      </p>
    </PageShell>
  );
}
