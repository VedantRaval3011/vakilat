import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ModulePlaceholder, ModulePlaceholderSkeleton } from "@/components/app/ModulePlaceholder";
import { highCourts } from "@/lib/navigation";

type Props = { params: Promise<{ court: string }> };

export function generateStaticParams() {
  return highCourts.map((c) => ({ court: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { court } = await params;
  const match = highCourts.find((c) => c.slug === court);
  return { title: `${match?.name ?? "High Court"} | Vakilat` };
}

async function Court({ params }: Props) {
  const { court } = await params;
  const match = highCourts.find((c) => c.slug === court);
  if (!match) notFound();
  return <ModulePlaceholder moduleKey="high-courts" title={match.name} subtitle="Reported and unreported judgments" />;
}

export default function Page({ params }: Props) {
  return (
    <Suspense fallback={<ModulePlaceholderSkeleton />}>
      <Court params={params} />
    </Suspense>
  );
}
