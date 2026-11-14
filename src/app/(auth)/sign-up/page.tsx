import type { Metadata } from "next";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { brand } from "@/lib/content";

export const metadata: Metadata = { title: `Create account | ${brand.name}` };

export default function SignUpPage() {
  return (
    <>
      <AuthHeader title={`Join ${brand.name}`} subtitle="Set up your free account in under a minute" />
      <SignUpForm />
    </>
  );
}
