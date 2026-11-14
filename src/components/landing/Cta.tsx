import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { brand } from "@/lib/content";

const core = [
  "AI legal research",
  "Judgment summaries & citations",
  "IPC to BNS conversion",
  "Built for Indian courts",
];

const advanced = [
  "Privacy-first architecture",
  "Natural language search",
  "Smart document understanding",
  "Continuously improving models",
];

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted">{title}</h4>
      <ul className="mt-5 space-y-3">
        {items.map((i) => (
          <li key={i} className="flex items-center gap-3">
            <Check className="size-4 text-accent" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Cta() {
  return (
    <section className="border-t border-border px-5 py-24">
      <Reveal className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.4fr_1fr]">
        <List title="Research" items={core} />
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-4xl font-bold leading-tight md:text-5xl">
            Do better legal work
            <br />
            <span className="text-gradient-accent">with Vakilat.</span>
          </h2>
          <p className="max-w-md text-lg text-muted">
            See how much faster research gets when every answer comes with its source.
          </p>
          <Link
            href={brand.signUpHref}
            className="flex h-14 items-center gap-3 rounded-xl bg-foreground px-9 text-lg font-semibold text-background transition hover:opacity-90"
          >
            Create free account <ArrowRight className="size-5" />
          </Link>
        </div>
        <List title="Trust" items={advanced} />
      </Reveal>
    </section>
  );
}
