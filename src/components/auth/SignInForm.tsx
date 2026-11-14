"use client";

import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signIn } from "@/app/(auth)/actions";
import { brand } from "@/lib/content";
import { Divider, FormAlert, GoogleButton, PasswordField, SubmitButton, TextField } from "./fields";

export function SignInForm() {
  const [state, action] = useActionState(signIn, undefined);
  const next = useSearchParams().get("next") ?? "";

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />
      {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}

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
      <PasswordField
        name="password"
        label="Password"
        icon={Lock}
        placeholder="Your password"
        autoComplete="current-password"
        required
        error={state?.fieldErrors?.password}
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2.5 text-muted">
          <input type="checkbox" name="remember" className="size-4 accent-[var(--accent)]" />
          Keep me signed in
        </label>
        <Link href="/forgot-password" className="font-semibold text-accent hover:underline">
          Forgot password?
        </Link>
      </div>

      <SubmitButton pendingText="Signing in...">Sign in</SubmitButton>
      <Divider />
      <GoogleButton label="Continue with Google" />

      <p className="text-center text-sm text-muted">
        New to {brand.name}?{" "}
        <Link href={brand.signUpHref} className="font-semibold text-accent hover:underline">
          Create a free account
        </Link>
      </p>
    </form>
  );
}
