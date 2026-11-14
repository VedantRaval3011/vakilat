import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { SignInForm } from "@/components/auth/SignInForm";
import { brand } from "@/lib/content";

export const metadata: Metadata = { title: `Sign in | ${brand.name}` };

export default function SignInPage() {
  return (
    <>
      <AuthHeader title="Welcome back" subtitle={`Sign in to continue your research on ${brand.name}`} />
      <Suspense>
        <SignInForm />
      </Suspense>
    </>
  );
}
