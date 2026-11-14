import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { testimonials } from "@/lib/content";

function Row({ reverse = false }: { reverse?: boolean }) {
  const items = [...testimonials, ...testimonials, ...testimonials];
  return (
    <div className="mask-fade-x overflow-hidden">
      <ul
        className="flex w-max animate-marquee-slow gap-6 hover:[animation-play-state:paused]"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {items.map((t, i) => (
          <li
            key={i}
            className="flex w-[360px] shrink-0 flex-col gap-5 rounded-2xl border border-border bg-surface p-6"
          >
            <Quote className="size-6 text-accent" />
            <p className="leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-auto">
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-muted">{t.role}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-24">
      <SectionHeading
        eyebrow="Testimonials"
        title="What our users say"
        subtitle="Used by legal professionals across India"
      />
      <div className="mt-14 flex flex-col gap-6">
        <Row />
        <Row reverse />
      </div>
    </section>
  );
}
