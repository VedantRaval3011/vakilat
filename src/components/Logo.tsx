import Link from "next/link";

export function Logo({
  className = "",
  href = "/",
  compact = false,
}: {
  className?: string;
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link href={href} aria-label="Vakilat home" className={`flex items-center gap-1.5 ${className}`}>
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-foreground text-xl font-bold leading-none text-background">
        व
      </span>
      {!compact && <span className="font-display text-[28px] font-semibold tracking-tight">vakilat</span>}
    </Link>
  );
}
