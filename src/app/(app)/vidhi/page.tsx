import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { TourGate } from "@/components/app/TourGate";
import { VidhiChat } from "@/components/app/vidhi/VidhiChat";
import { chatRatings, isChatId, listChats, loadChat, usageToday } from "@/lib/ai/chats";
import { dailyLimit, deepDailyLimit, isAiConfigured } from "@/lib/ai/model";
import { getVidhiProfile } from "@/lib/ai/profile";
import { getCurrentUser } from "@/lib/auth/current-user";
import { brand } from "@/lib/content";
import { routes } from "@/lib/navigation";
import type { VidhiMessage } from "@/lib/vidhi/config";

export const metadata: Metadata = { title: `${brand.assistant} | Vakilat` };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function Vidhi({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const sp = await searchParams;
  const c = typeof sp.c === "string" && isChatId(sp.c) ? sp.c : null;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 8000) : "";

  const messages = c ? loadChat<VidhiMessage>(user.id, c) : [];
  if (!messages) redirect(routes.vidhi);
  const id = c ?? randomUUID();
  const usage = usageToday(user.id);

  return (
    <VidhiChat
      key={id}
      chatId={id}
      initialMessages={messages}
      initialQuery={c ? "" : q}
      configured={isAiConfigured()}
      history={listChats(user.id, "vidhi")}
      ratings={c ? chatRatings(user.id, c) : {}}
      profile={getVidhiProfile(user.id)}
      remaining={dailyLimit() - usage.total}
      deepRemaining={deepDailyLimit() - usage.deep}
    />
  );
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <Suspense>
        <TourGate tourKey="vidhi" />
      </Suspense>
      <Suspense
        fallback={
          <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-10">
            <div className="hidden h-[70vh] w-64 animate-pulse rounded-2xl bg-surface lg:block" />
            <div className="h-[70vh] flex-1 animate-pulse rounded-2xl bg-surface" />
          </div>
        }
      >
        <Vidhi searchParams={searchParams} />
      </Suspense>
    </>
  );
}
