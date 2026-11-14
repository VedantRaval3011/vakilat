"use client";

import {
  ArrowLeftRight,
  BookOpenText,
  ChevronDown,
  Crown,
  Landmark,
  LifeBuoy,
  Library,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  SpellCheck2,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { useT } from "@/components/i18n/LocaleProvider";
import { codePairs, highCourts, routes, states } from "@/lib/navigation";
import type { MessageKey } from "@/lib/i18n/messages";

type Leaf = { name: string; href: string };
type Item = { nameKey?: MessageKey; name?: string; href: string; icon: LucideIcon; children?: Leaf[] };
type Group = { labelKey: MessageKey; items: Item[] };

const groups: Group[] = [
  {
    labelKey: "nav.caseLaw",
    items: [
      { nameKey: "nav.supremeCourt", href: routes.supremeCourt, icon: Landmark },
      {
        nameKey: "nav.highCourts",
        href: routes.highCourts,
        icon: Landmark,
        children: highCourts.map((c) => ({ name: c.name.replace(" High Court", ""), href: routes.highCourt(c.slug) })),
      },
    ],
  },
  {
    labelKey: "nav.statutes",
    items: [
      { nameKey: "nav.centralActs", href: routes.centralActs, icon: BookOpenText },
      {
        nameKey: "nav.stateActs",
        href: routes.stateActs,
        icon: Library,
        children: states.map((s) => ({ name: s.name, href: routes.stateAct(s.slug) })),
      },
    ],
  },
  {
    labelKey: "nav.codeConverter",
    items: codePairs.map((p) => ({
      name: `${p.from} → ${p.to}`,
      href: routes.codeConverter(p.slug),
      icon: ArrowLeftRight,
    })),
  },
  {
    labelKey: "nav.reference",
    items: [
      { nameKey: "nav.constitution", href: routes.constitution, icon: Scale },
      { nameKey: "nav.glossary", href: routes.glossary, icon: SpellCheck2 },
    ],
  },
];

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const t = useT();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const compact = collapsed && !mobileOpen;

  return (
    <>
      <div
        aria-hidden
        onClick={onCloseMobile}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface transition-[width,transform] duration-300 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${compact ? "w-[76px]" : "w-72"}`}
      >
        <div className={`flex h-16 shrink-0 items-center border-b border-border px-4 ${compact ? "justify-center" : "justify-between"}`}>
          {!compact && <Logo href={routes.dashboard} />}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
            className="hidden size-9 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-foreground lg:grid"
          >
            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label={t("nav.closeMenu")}
            className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          {groups.map((group) => (
            <div key={group.labelKey} className="mb-5">
              {compact ? (
                <div className="mx-auto mb-2 h-px w-8 bg-border" />
              ) : (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{t(group.labelKey)}</p>
              )}
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const open = expanded[item.href] ?? active;
                  const Icon = item.icon;
                  const label = item.nameKey ? t(item.nameKey) : (item.name ?? "");
                  return (
                    <li key={item.href}>
                      <div
                        className={`group flex items-center rounded-lg transition ${
                          active ? "bg-accent/12 text-accent" : "text-foreground/85 hover:bg-surface-2"
                        }`}
                      >
                        <Link
                          href={item.href}
                          title={compact ? label : undefined}
                          onClick={onCloseMobile}
                          className={`flex min-w-0 flex-1 items-center gap-3 py-2.5 text-sm font-medium ${
                            compact ? "justify-center px-0" : "px-3"
                          }`}
                        >
                          <Icon className={`size-[18px] shrink-0 ${active ? "text-accent" : "text-muted group-hover:text-foreground"}`} />
                          {!compact && <span className="truncate">{label}</span>}
                        </Link>
                        {item.children && !compact && (
                          <button
                            type="button"
                            aria-label={`${open ? t("nav.hide") : t("nav.show")} ${label}`}
                            aria-expanded={open}
                            onClick={() => setExpanded((e) => ({ ...e, [item.href]: !open }))}
                            className="mr-1 grid size-8 place-items-center rounded-md text-muted hover:text-foreground"
                          >
                            <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>
                      {item.children && !compact && open && (
                        <ul className="ml-[21px] mt-1 flex max-h-72 flex-col overflow-y-auto border-l border-border py-1 pl-3">
                          {item.children.map((child) => {
                            const childActive = pathname === child.href;
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onCloseMobile}
                                  className={`block truncate rounded-md px-3 py-1.5 text-[13px] transition ${
                                    childActive ? "bg-accent/12 text-accent" : "text-muted hover:bg-surface-2 hover:text-foreground"
                                  }`}
                                >
                                  {child.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          {compact ? (
            <Link
              href={routes.plans}
              title={t("nav.goPro")}
              className="mx-auto grid size-11 place-items-center rounded-xl bg-accent text-black transition hover:brightness-110"
            >
              <Crown className="size-5" />
            </Link>
          ) : (
            <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/15 to-transparent p-4">
              <p className="flex items-center gap-2 font-display text-base font-semibold">
                <Crown className="size-4 text-accent" /> Vakilat Pro
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{t("nav.proBlurb")}</p>
              <Link
                href={routes.plans}
                className="mt-3 flex h-9 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-black transition hover:brightness-110"
              >
                {t("nav.goPro")}
              </Link>
            </div>
          )}
          <Link
            href="/help"
            title={compact ? t("nav.help") : undefined}
            className={`mt-2 flex items-center gap-3 rounded-lg py-2.5 text-sm text-muted transition hover:bg-surface-2 hover:text-foreground ${
              compact ? "justify-center" : "px-3"
            }`}
          >
            <LifeBuoy className="size-[18px]" />
            {!compact && t("nav.help")}
          </Link>
        </div>
      </aside>
    </>
  );
}
