import { NotebookPen } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { NotesBoard } from "@/components/app/desk/NotesBoard";
import { PageHeader, PageShell } from "@/components/app/PageHeader";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listFolders, listNotes } from "@/lib/desk/queries";

export const metadata: Metadata = { title: "Notes | Vakilat" };

async function Notes() {
  const user = await getCurrentUser();
  return <NotesBoard notes={listNotes(user.id)} folders={listFolders(user.id, "notes")} />;
}

export default function Page() {
  return (
    <PageShell>
      <PageHeader icon={NotebookPen} title="Notes" subtitle="Research notes, arguments and citations, saved as you type" />
      <Suspense fallback={<div className="h-[28rem] animate-pulse rounded-2xl bg-surface" />}>
        <Notes />
      </Suspense>
    </PageShell>
  );
}
