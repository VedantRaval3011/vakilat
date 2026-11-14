import type { Metadata } from "next";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { brand } from "@/lib/content";

export const metadata: Metadata = { title: `Reset password | ${brand.name}` };

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader title="Reset your password" subtitle="Enter your email and we'll send you a reset link" />
      <ForgotPasswordForm />
    </>
  );
}
