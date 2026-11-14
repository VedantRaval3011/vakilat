import { Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SupportForm } from "@/components/site/SupportForm";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { brand } from "@/lib/content";

export const metadata: Metadata = { title: "Support | Vakilat" };

async function FormSlot() {
  const session = await getSession();
  const user = session ? await findUserById(session.userId) : null;
  return <SupportForm defaultName={user?.name} defaultEmail={user?.email} />;
}

export default function SupportPage() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-5 py-12 sm:py-16 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">Support</h1>
        <p className="mt-3 text-muted">
          Account, billing or product questions — send a message and we&apos;ll get back by email. For how-to guides, see the{" "}
          <Link href="/help" className="font-semibold text-accent hover:underline">
            Help Centre
          </Link>
          .
        </p>
        <ul className="mt-8 flex flex-col gap-4 text-sm">
          <li className="flex gap-3">
            <Mail className="mt-0.5 size-4 text-accent" />
            <span>
              <span className="font-semibold">Email</span>
              <span className="mt-0.5 block text-muted">support@{brand.name.toLowerCase()}.in (placeholder)</span>
            </span>
          </li>
          <li className="flex gap-3">
            <Phone className="mt-0.5 size-4 text-accent" />
            <span>
              <span className="font-semibold">Phone</span>
              <span className="mt-0.5 block text-muted">Coming soon</span>
            </span>
          </li>
          <li className="flex gap-3">
            <MapPin className="mt-0.5 size-4 text-accent" />
            <span>
              <span className="font-semibold">Office</span>
              <span className="mt-0.5 block text-muted">India — address to be confirmed before launch</span>
            </span>
          </li>
        </ul>
      </div>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface" />}>
        <FormSlot />
      </Suspense>
    </div>
  );
}
