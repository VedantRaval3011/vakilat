import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { Module } from "@/lib/modules";

export function ModuleCard({ module, size = "md" }: { module: Module; size?: "md" | "lg" }) {
  const Icon = module.icon;
  const lg = size === "lg";

  return (
    <Link
      href={module.href}
      className={`group relative flex min-w-0 gap-4 overflow-hidden rounded-2xl border border-border bg-surface transition duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-surface-2 ${
        lg ? "items-center p-6" : "flex-col p-5"
      }`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-accent/10 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100"
      />
      <span
        className={`grid shrink-0 place-items-center rounded-xl border border-border bg-background text-accent transition group-hover:border-accent/40 ${
          lg ? "size-14" : "size-11"
        }`}
      >
        <Icon className={lg ? "size-6" : "size-5"} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block font-display font-semibold ${lg ? "text-xl" : "text-base"}`}>{module.name}</span>
        <span className="mt-0.5 block text-sm text-muted">{module.blurb}</span>
      </span>
      {lg && (
        <ArrowUpRight className="size-5 shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
      )}
    </Link>
  );
}
