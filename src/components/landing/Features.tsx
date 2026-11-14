import { FileText, Gavel, Mic, Search, Sparkles } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { languages, whyPoints } from "@/lib/content";
import { SummaryDemo } from "./SummaryDemo";

const results = [
  { title: "BNS Section 103: Punishment for Murder", type: "Bare Act", score: 98, icon: FileText },
  { title: "Sentencing principles and leading precedents", type: "Case Law", score: 95, icon: Gavel },
  { title: "Distinguishing culpable homicide from murder", type: "Commentary", score: 91, icon: FileText },
];

function Card({ title, body, children, className = "" }: {
  title: string;
  body: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-6 overflow-hidden rounded-3xl border border-border bg-surface p-7 ${className}`}>
      <div>
        <h3 className="font-display text-2xl font-bold">{title}</h3>
        <p className="mt-2 text-muted">{body}</p>
      </div>
      {children}
    </div>
  );
}

export function Features() {
  const [research, language, summary] = whyPoints;

  return (
    <section className="px-5 py-24">
      <SectionHeading
        eyebrow="Features"
        title="Why lawyers choose Vakilat"
        subtitle="Fast, reliable research on Indian law, with AI that shows its sources so you stay in control."
      />
      <div className="mx-auto mt-16 grid max-w-7xl gap-6 lg:grid-cols-2">
        <Reveal className="min-w-0 lg:row-span-2">
          <Card title={research.title} body={research.body} className="h-full">
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-accent/15 text-accent">
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Instant Research</p>
                    <p className="text-xs text-muted">3 clicks to results</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                  0.3s
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                <Search className="size-4 text-muted" />
                <span className="text-sm">Section 103 BNS murder sentencing</span>
                <span className="ml-auto text-xs text-muted">{results.length} results</span>
              </div>
              <ul className="mt-4 space-y-3">
                {results.map((r) => (
                  <li key={r.title} className="flex items-center gap-3 rounded-xl bg-surface p-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2">
                      <r.icon className="size-4 text-accent" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted">{r.type}</p>
                    </div>
                    <span className="text-sm font-semibold text-accent">{r.score}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.1} className="min-w-0">
          <Card title={language.title} body={language.body}>
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-background">
                <Mic className="size-5" />
              </span>
              <div className="mask-fade-x min-w-0 flex-1 overflow-hidden">
                <div className="flex w-max animate-marquee-slow gap-3">
                  {[...languages, ...languages, ...languages].map((l, i) => (
                    <span
                      key={i}
                      className="flex flex-col items-center rounded-xl border border-border bg-background px-4 py-2"
                    >
                      <span className="text-xs font-bold text-accent">{l.code}</span>
                      <span className="text-sm">{l.native}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.2} className="min-w-0">
          <Card title={summary.title} body={summary.body}>
            <SummaryDemo />
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
