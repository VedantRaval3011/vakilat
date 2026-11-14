"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

const papers = [
  { x: -260, y: -120, r: -28 },
  { x: 210, y: -150, r: 22 },
  { x: -120, y: 130, r: 14 },
  { x: 260, y: 110, r: -18 },
  { x: -300, y: 60, r: 38 },
  { x: 40, y: -190, r: -8 },
  { x: 120, y: 170, r: 30 },
  { x: -40, y: 40, r: -40 },
];

function Paper({
  progress,
  from,
  index,
}: {
  progress: MotionValue<number>;
  from: (typeof papers)[number];
  index: number;
}) {
  const x = useTransform(progress, [0, 0.6], [from.x, 0]);
  const y = useTransform(progress, [0, 0.6], [from.y, -index * 6]);
  const rotate = useTransform(progress, [0, 0.6], [from.r, 0]);

  return (
    <motion.div
      style={{ x, y, rotate }}
      className="absolute left-1/2 top-1/2 -ml-14 -mt-18 h-36 w-28 rounded-sm border border-zinc-400 bg-zinc-100 shadow-xl md:-ml-20 md:-mt-24 md:h-48 md:w-40"
    >
      <div className="space-y-1.5 p-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-1 rounded bg-zinc-400/70"
            style={{ width: `${60 + ((i * 37 + index * 11) % 40)}%` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function ScrollStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const beforeOpacity = useTransform(scrollYProgress, [0.2, 0.45], [1, 0]);
  const afterOpacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1]);
  const bg = useTransform(scrollYProgress, [0.2, 0.65], ["#71717a", "#0e7490"]);

  return (
    <div ref={ref} className="mx-auto max-w-6xl px-5 pb-24">
      <motion.div
        style={{ backgroundColor: bg }}
        className="relative h-[460px] overflow-hidden rounded-3xl md:h-[600px]"
      >
        <motion.p
          style={{ opacity: beforeOpacity }}
          className="absolute inset-0 grid place-items-center font-display text-6xl font-bold text-red-400/80 md:text-8xl"
        >
          Hours of digging.
        </motion.p>
        <motion.p
          style={{ opacity: afterOpacity }}
          className="absolute inset-x-0 bottom-10 text-center font-display text-5xl font-bold text-white md:text-7xl"
        >
          One cited answer.
        </motion.p>
        {papers.map((p, i) => (
          <Paper key={i} from={p} index={i} progress={scrollYProgress} />
        ))}
      </motion.div>
    </div>
  );
}
