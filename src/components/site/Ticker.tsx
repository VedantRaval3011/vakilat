import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { products, tickerItems } from "@/lib/content";

export function Ticker() {
  const items = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className="relative flex h-12 items-center overflow-hidden bg-zinc-50 text-zinc-600">
      <div className="flex w-max animate-marquee gap-24 whitespace-nowrap pl-12 text-sm font-semibold uppercase tracking-wide">
        {items.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
      <Link
        href={products.assistant.href}
        className="absolute right-6 flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-[0_0_24px_12px_rgb(250_250_250)] transition hover:bg-black"
      >
        Ask {products.assistant.name} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
