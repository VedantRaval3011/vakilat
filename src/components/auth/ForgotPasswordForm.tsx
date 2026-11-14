"use client";

import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/app/(auth)/actions";
import { brand } from "@/lib/content";
import { FormAlert, SubmitButton, TextField } from "./fields";

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, undefined);

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {state?.success && <FormAlert tone="success">{state.success}</FormAlert>}
      <TextField
        name="email"
        type="email"
        label="Email"
        icon={Mail}
        placeholder="you@chambers.in"
        autoComplete="email"
        required
        defaultValue={state?.values?.email}
        error={state?.fieldErrors?.email}
      />
      <SubmitButton pendingText="Sending...">Send reset link</SubmitButton>
      <Link
        href={brand.signInHref}
        className="flex items-center justify-center gap-2 text-sm font-semibold text-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
    </form>
  );
}
