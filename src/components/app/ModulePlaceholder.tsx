import { ArrowLeft, Hammer } from "lucide-react";
import Link from "next/link";
import { allModules } from "@/lib/modules";
import { routes } from "@/lib/navigation";

export function ModulePlaceholderSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="h-5 w-24 animate-pulse rounded bg-surface" />
      <div className="flex items-center gap-4">
        <div className="size-14 animate-pulse rounded-xl bg-surface" />
        <div className="flex flex-col gap-2">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-surface" />
          <div className="h-4 w-48 animate-pulse rounded bg-surface" />
        </div>
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-surface" />
    </div>
  );
}

export function ModulePlaceholder({
  moduleKey,
  title,
  subtitle,
}: {
  moduleKey: string;
  title?: string;
  subtitle?: string;
}) {
  const mod = allModules.find((m) => m.key === moduleKey);
  const Icon = mod?.icon ?? Hammer;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <Link href={routes.dashboard} className="flex w-fit items-center gap-2 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" /> Dashboard
      </Link>
      <div className="flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-xl border border-border bg-surface text-accent">
          <Icon className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{title ?? mod?.name}</h1>
          <p className="mt-1 text-muted">{subtitle ?? mod?.blurb}</p>
        </div>
      </div>
      <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
        <Hammer className="size-8 text-muted" />
        <p className="font-display text-lg font-semibold">This module is being built</p>
        <p className="max-w-md text-sm text-muted">It will be ready soon. The rest of your dashboard works as usual.</p>
      </div>
    </div>
  );
}
