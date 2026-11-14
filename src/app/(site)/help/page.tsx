import { BookOpenText, HelpCircle, LifeBuoy, Mail, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { brand, faqs, products } from "@/lib/content";
import { routes } from "@/lib/navigation";

export const metadata: Metadata = { title: "Help Centre | Vakilat" };

const guides = [
  { title: brand.assistant, body: "Ask research questions, attach PDFs or photos, and get cited answers.", href: routes.vidhi, icon: Sparkles },
  { title: "Code Converter", body: "Map IPC, CrPC and Evidence Act sections to BNS, BNSS and BSA.", href: routes.codeConverter("ipc-bns"), icon: BookOpenText },
  { title: "Draft Studio", body: "Fill a template and generate a first draft you can export.", href: routes.draftStudio, icon: BookOpenText },
  { title: "Moot Practice", body: "Argue before a virtual bench and get scored feedback.", href: routes.mootPractice, icon: BookOpenText },
];

export default function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:py-16">
      <div className="mb-10 flex flex-col gap-3">
        <span className="grid size-12 place-items-center rounded-xl bg-accent/12 text-accent">
          <HelpCircle className="size-6" />
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight">Help Centre</h1>
        <p className="max-w-2xl text-muted">
          Short answers about {brand.name}, plus links into the tools. For account or billing issues, use{" "}
          <Link href="/support" className="font-semibold text-accent hover:underline">
            Support
          </Link>
          .
        </p>
      </div>

      <section className="mb-12">
        <h2 className="mb-4 font-display text-xl font-semibold">Start here</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {guides.map((g) => (
            <li key={g.href}>
              <Link href={g.href} className="flex gap-3 rounded-2xl border border-border bg-surface p-4 transition hover:border-accent/40">
                <g.icon className="mt-0.5 size-5 shrink-0 text-accent" />
                <span>
                  <span className="font-semibold">{g.title}</span>
                  <span className="mt-1 block text-sm text-muted">{g.body}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 font-display text-xl font-semibold">Common questions</h2>
        <ul className="flex flex-col gap-3">
          {faqs.map((f) => (
            <li key={f.q} className="rounded-2xl border border-border bg-surface px-5 py-4">
              <p className="font-semibold">{f.q}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-6 py-5">
        <div className="flex items-start gap-3">
          <LifeBuoy className="mt-0.5 size-5 text-accent" />
          <div>
            <p className="font-semibold">Still stuck?</p>
            <p className="text-sm text-muted">Write to us — we read every message.</p>
          </div>
        </div>
        <Link href="/support" className="flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-black">
          <Mail className="size-4" /> Contact support
        </Link>
      </section>

      <p className="mt-8 text-center text-xs text-muted">
        Looking for {products.assistant.name}? Open it from your{" "}
        <Link href={routes.dashboard} className="text-accent hover:underline">
          dashboard
        </Link>
        .
      </p>
    </div>
  );
}
