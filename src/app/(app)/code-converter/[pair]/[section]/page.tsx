import { TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SectionCompare } from "@/components/app/code-converter/SectionCompare";
import { getCurrentUser } from "@/lib/auth/current-user";
import { findMapping, findPair, mappingSlug } from "@/lib/data/code-map";
import { savedKeys } from "@/lib/desk/queries";

type Props = { params: Promise<{ pair: string; section: string }> };

export function generateStaticParams() {
  const pair = findPair("ipc-bns");
  if (!pair) return [];
  // Prefetch a few common comparison pages; the rest render on demand.
  return pair.entries.slice(0, 12).map((e) => ({ pair: pair.slug, section: mappingSlug(e) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair, section } = await params;
  const match = findPair(pair);
  const entry = match ? findMapping(match, section) : null;
  const label = entry
    ? entry.new
      ? `${match!.to} ${entry.new}`
      : `${match!.from} ${entry.old}`
    : "Section comparison";
  return { title: `${label} | Code Converter | Vakilat` };
}

async function Compare({ params }: Props) {
  const { pair, section } = await params;
  const match = findPair(pair);
  if (!match) notFound();
  const entry = findMapping(match, section);
  if (!entry) notFound();
  const user = await getCurrentUser();
  const refKey = `${match.slug}:${entry.old ?? "none"}:${entry.new ?? "none"}`;
  const keys = savedKeys(user.id, "section");

  return <SectionCompare pair={match} entry={entry} saved={keys.includes(refKey)} />;
}

export default function Page({ params }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface" />}>
        <Compare params={params} />
      </Suspense>
      <p className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-muted">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
        Section text is for research orientation. Always confirm against the official Gazette before relying on it in
        court.
      </p>
    </div>
  );
}
