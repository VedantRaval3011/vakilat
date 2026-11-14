"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { journalPosts } from "@/lib/content";

export function JournalCarousel() {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);

  function scrollTo(i: number) {
    const el = track.current;
    if (!el) return;
    const next = (i + journalPosts.length) % journalPosts.length;
    const card = el.children[next] as HTMLElement | undefined;
    if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
    setIndex(next);
  }

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => scrollTo(index + 1), 4000);
    return () => clearInterval(id);
  });

  return (
    <section className="px-5 py-24">
      <SectionHeading
        eyebrow="Journal"
        title="From the Vakilat Journal"
        subtitle="Practical writing on legal technology, new laws and better research habits"
      />
      <div className="mx-auto mt-14 max-w-7xl">
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            const w = (el.children[0] as HTMLElement | undefined)?.offsetWidth ?? 1;
            setIndex(Math.round(el.scrollLeft / (w + 24)));
          }}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none]"
        >
          {journalPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/journal/${post.slug}`}
              className="group flex w-[85%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-accent/60 md:w-[calc((100%-48px)/3)]"
            >
              <div className="relative aspect-[16/9] bg-gradient-to-br from-cyan-900/60 via-surface-2 to-surface">
                <span className="absolute bottom-4 left-4 font-display text-5xl font-bold text-white/10">
                  व
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {post.category}
                </p>
                <h3 className="font-display text-xl font-bold leading-snug">{post.title}</h3>
                <p className="line-clamp-3 text-sm text-muted">{post.excerpt}</p>
                <div className="mt-auto flex items-center justify-between pt-4 text-sm text-muted">
                  <span>{post.date}</span>
                  <ArrowUpRight className="size-5 transition group-hover:text-accent" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAuto((a) => !a)}
              aria-label="Toggle scroll mode"
              className="grid size-10 place-items-center rounded-full border border-border hover:bg-surface"
            >
              {auto ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => scrollTo(index - 1)}
              aria-label="Previous post"
              className="grid size-10 place-items-center rounded-full border border-border hover:bg-surface"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollTo(index + 1)}
              aria-label="Next post"
              className="grid size-10 place-items-center rounded-full border border-border hover:bg-surface"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
          <div className="flex gap-2">
            {journalPosts.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Go to post ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-accent" : "w-2 bg-border"
                }`}
              />
            ))}
          </div>
          <Link
            href="/journal"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:bg-surface"
          >
            Read the Journal
          </Link>
        </div>
      </div>
    </section>
  );
}
