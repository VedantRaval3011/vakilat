"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { stats } from "@/lib/content";

function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="py-24">
      <SectionHeading eyebrow="Coverage" title="The library behind every answer" />
      <div className="mt-14 bg-surface">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 py-10 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-2 border-foreground/50 py-8 odd:border-r lg:border-r lg:last:border-r-0"
            >
              <dt className="order-2 text-lg text-muted">{s.label}</dt>
              <dd className="order-1 font-display text-4xl font-bold md:text-5xl">
                <CountUp to={s.value} suffix={s.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
