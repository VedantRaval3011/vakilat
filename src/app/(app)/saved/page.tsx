import { BookMarked } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SavedList } from "@/components/app/desk/SavedList";
import { PageHeader, PageShell } from "@/components/app/PageHeader";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listFolders, listSaved } from "@/lib/desk/queries";

export const metadata: Metadata = { title: "Saved | Vakilat" };

async function Saved() {
  const user = await getCurrentUser();
  return <SavedList items={listSaved(user.id)} folders={listFolders(user.id, "saved")} />;
}

export default function Page() {
  return (
    <PageShell>
      <PageHeader icon={BookMarked} title="Saved" subtitle="Sections, articles and terms you bookmarked" />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface" />}>
        <Saved />
      </Suspense>
    </PageShell>
  );
}
