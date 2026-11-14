import { SpellCheck2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { GlossaryBrowser } from "@/components/app/glossary/GlossaryBrowser";
import { PageHeader, PageShell } from "@/components/app/PageHeader";
import { getCurrentUser } from "@/lib/auth/current-user";
import { glossary } from "@/lib/data/glossary";
import { savedKeys } from "@/lib/desk/queries";

export const metadata: Metadata = { title: "Legal Glossary | Vakilat" };

async function Browser() {
  const user = await getCurrentUser();
  return <GlossaryBrowser savedKeys={savedKeys(user.id, "term")} />;
}

export default function Page() {
  return (
    <PageShell>
      <PageHeader
        icon={SpellCheck2}
        title="Legal Glossary"
        subtitle={`${glossary.length} maxims, writs and terms, explained in plain English`}
      />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface" />}>
        <Browser />
      </Suspense>
    </PageShell>
  );
}
