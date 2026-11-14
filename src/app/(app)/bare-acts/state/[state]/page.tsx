import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ModulePlaceholder, ModulePlaceholderSkeleton } from "@/components/app/ModulePlaceholder";
import { states } from "@/lib/navigation";

type Props = { params: Promise<{ state: string }> };

export function generateStaticParams() {
  return states.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const match = states.find((s) => s.slug === state);
  return { title: `${match?.name ?? "State"} Acts | Vakilat` };
}

async function StateActs({ params }: Props) {
  const { state } = await params;
  const match = states.find((s) => s.slug === state);
  if (!match) notFound();
  return <ModulePlaceholder moduleKey="state-acts" title={`${match.name} Acts`} subtitle="State legislation, rules and amendments" />;
}

export default function Page({ params }: Props) {
  return (
    <Suspense fallback={<ModulePlaceholderSkeleton />}>
      <StateActs params={params} />
    </Suspense>
  );
}
