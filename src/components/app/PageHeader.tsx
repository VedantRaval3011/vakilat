import { ArrowLeft, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { routes } from "@/lib/navigation";

export function PageHeader({ icon: Icon, title, subtitle, actions }: { icon: LucideIcon; title: string; subtitle: ReactNode; actions?: ReactNode }) {
  return (
    <>
      <Link href={routes.dashboard} className="flex w-fit items-center gap-2 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" /> Dashboard
      </Link>
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid size-14 place-items-center rounded-xl border border-border bg-surface text-accent">
          <Icon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-muted">{subtitle}</p>
        </div>
        {actions}
      </div>
    </>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</div>;
}
