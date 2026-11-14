"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { faqs } from "@/lib/content";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="px-5 py-24">
      <SectionHeading
        eyebrow="FAQ"
        title="Frequently asked questions"
        subtitle="Everything you need to know about getting started with Vakilat."
      />
      <div className="mx-auto mt-14 max-w-3xl divide-y divide-border rounded-2xl border border-border bg-surface">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-lg font-semibold"
                >
                  {f.q}
                  <Plus
                    className={`size-5 shrink-0 text-accent transition ${isOpen ? "rotate-45" : ""}`}
                  />
                </button>
              </h3>
              <div
                className={`grid transition-all duration-300 ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <p className="overflow-hidden px-6 text-muted">
                  <span className="block pb-5">{f.a}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-8 text-center text-muted">
        Still have questions?{" "}
        <Link href="/help" className="font-semibold text-accent hover:underline">
          Visit the Help Centre
        </Link>{" "}
        and we will get back to you within 24 hours.
      </p>
    </section>
  );
}
