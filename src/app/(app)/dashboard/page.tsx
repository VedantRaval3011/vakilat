import { Compass, Search, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ModuleCard } from "@/components/app/ModuleCard";
import { TourGate } from "@/components/app/TourGate";
import { getCurrentUser } from "@/lib/auth/current-user";
import { brand } from "@/lib/content";
import { aiModules, deskModules, researchModules } from "@/lib/modules";
import { routes } from "@/lib/navigation";

export const metadata: Metadata = { title: `Dashboard | ${brand.name}` };

async function Greeting() {
  const user = await getCurrentUser();
  return <>Namaste, {user.name.split(" ")[0]}</>;
}

function Section({ index, title, meta, children }: { index: string; title: string; meta: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <span className="font-display text-sm font-semibold text-accent">{index}</span>
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em]">{title}</h2>
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-[0.14em] text-muted">{meta}</span>
      </div>
      {children}
    </section>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <Suspense>
        <TourGate tourKey="dashboard" />
      </Suspense>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              <Suspense fallback={<span className="inline-block h-9 w-56 animate-pulse rounded-lg bg-surface align-middle" />}>
                <Greeting />
              </Suspense>
            </h1>
            <p className="mt-2 text-muted">What are we researching today?</p>
          </div>
          <Link
            href="/help"
            className="flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold transition hover:border-accent/50 hover:bg-surface"
          >
            <Compass className="size-4 text-accent" /> Help & resources
          </Link>
        </div>

        <Form
          action={routes.vidhi}
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2 pl-5 transition focus-within:border-accent/60"
        >
          <Search className="size-5 shrink-0 text-muted" />
          <input
            name="q"
            aria-label={`Ask ${brand.assistant}`}
            placeholder="Ask a legal question, or search a judgment, Act or section…"
            className="h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-black transition hover:brightness-110"
          >
            <Sparkles className="size-4" />
            <span className="hidden sm:inline">Ask {brand.assistant}</span>
          </button>
        </Form>
      </div>

      <Section index="01" title="Research Library" meta={`${researchModules.length} modules`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {researchModules.map((m) => (
            <ModuleCard key={m.key} module={m} />
          ))}
        </div>
      </Section>

      <Section index="02" title="AI Tools" meta={`Powered by ${brand.assistant}`}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {aiModules.map((m) => (
            <ModuleCard key={m.key} module={m} size="lg" />
          ))}
        </div>
      </Section>

      <Section index="03" title="My Desk" meta="Your workspace">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {deskModules.map((m) => (
            <ModuleCard key={m.key} module={m} />
          ))}
        </div>
      </Section>
    </div>
  );
}
