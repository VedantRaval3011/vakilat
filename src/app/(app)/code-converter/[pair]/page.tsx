import { ArrowLeft, ArrowLeftRight, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CodeConverter } from "@/components/app/code-converter/CodeConverter";
import { TourGate } from "@/components/app/TourGate";
import { getCurrentUser } from "@/lib/auth/current-user";
import { converterPairs } from "@/lib/data/code-map";
import { savedKeys } from "@/lib/desk/queries";
import { codePairs, routes } from "@/lib/navigation";

type Props = { params: Promise<{ pair: string }> };

export function generateStaticParams() {
  return converterPairs.map((p) => ({ pair: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const match = converterPairs.find((p) => p.slug === pair);
  return { title: `${match ? `${match.from} to ${match.to} Converter` : "Code Converter"} | Vakilat` };
}

async function Converter({ params }: Props) {
  const { pair } = await params;
  const match = converterPairs.find((p) => p.slug === pair);
  if (!match) notFound();
  const user = await getCurrentUser();

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid size-14 place-items-center rounded-xl border border-border bg-surface text-accent">
          <ArrowLeftRight className="size-6" />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold tracking-tight">Code Converter</h1>
          <p className="mt-1 text-muted">
            {match.fromFull} <span className="text-accent">→</span> {match.toFull}
          </p>
        </div>
      </div>
      <CodeConverter key={match.slug} pair={match} pairs={codePairs} savedKeys={savedKeys(user.id, "section")} />
    </>
  );
}

export default function Page({ params }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <Suspense>
        <TourGate tourKey="code-converter" />
      </Suspense>
      <Link href={routes.dashboard} className="flex w-fit items-center gap-2 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" /> Dashboard
      </Link>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface" />}>
        <Converter params={params} />
      </Suspense>
      <p className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-muted">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
        The three new criminal laws came into force on 1 July 2024. This table covers frequently cited sections and is being
        expanded. Always confirm against the official Gazette text before relying on it in court.
      </p>
    </div>
  );
}
