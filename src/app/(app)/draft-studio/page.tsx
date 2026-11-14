import { PenLine } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DraftChat } from "@/components/app/drafts/DraftChat";
import { DraftEditor, DraftGallery } from "@/components/app/drafts/DraftStudio";
import { PageHeader, PageShell } from "@/components/app/PageHeader";
import { TourGate } from "@/components/app/TourGate";
import { usageToday } from "@/lib/ai/chats";
import { dailyLimit, isAiConfigured } from "@/lib/ai/model";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDraft, isGuidedDraft, listDrafts } from "@/lib/drafts/queries";
import { GUIDED_TEMPLATE_KEY, templateByKey } from "@/lib/drafts/templates";
import { routes } from "@/lib/navigation";

export const metadata: Metadata = { title: "Draft Studio | Vakilat" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function Studio({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const sp = await searchParams;
  const d = typeof sp.d === "string" ? sp.d : null;
  const t = typeof sp.t === "string" ? sp.t : null;
  const remaining = dailyLimit() - usageToday(user.id).total;
  const configured = isAiConfigured();

  if (d) {
    const draft = getDraft(user.id, d);
    if (!draft) redirect(routes.draftStudio);
    if (isGuidedDraft(draft.template)) {
      return (
        <DraftChat
          key={draft.id}
          draftId={draft.id}
          initialMessages={draft.messages}
          initialBody={draft.body}
          initialTitle={draft.title}
          initialLanguage={draft.language}
          configured={configured}
          remaining={remaining}
        />
      );
    }
    const template = templateByKey(draft.template);
    if (!template) redirect(routes.draftStudio);
    return (
      <DraftEditor
        key={draft.id}
        template={template}
        initial={draft}
        configured={configured}
        remaining={remaining}
      />
    );
  }

  if (t) {
    if (t === GUIDED_TEMPLATE_KEY) redirect(routes.draftStudio);
    const template = templateByKey(t);
    if (!template) redirect(routes.draftStudio);
    return (
      <DraftEditor
        key={`new:${template.key}`}
        template={template}
        initial={null}
        configured={configured}
        remaining={remaining}
      />
    );
  }

  return <DraftGallery drafts={listDrafts(user.id)} />;
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <PageShell>
      <Suspense>
        <TourGate tourKey="draft-studio" />
      </Suspense>
      <PageHeader
        icon={PenLine}
        title="Draft Studio"
        subtitle="Templates or a guided chat — bail applications, notices, complaints and agreements"
      />
      <Suspense fallback={<div className="h-[32rem] animate-pulse rounded-2xl bg-surface" />}>
        <Studio searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}
