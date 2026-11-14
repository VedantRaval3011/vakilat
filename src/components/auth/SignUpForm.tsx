"use client";

import { BriefcaseBusiness, Check, Lock, Mail, MapPin, Phone, Ticket, User } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { signUp } from "@/app/(auth)/actions";
import { passwordRules } from "@/lib/auth/validation";
import { brand, indianStates, professions } from "@/lib/content";
import {
  Divider,
  FormAlert,
  GoogleButton,
  PasswordField,
  SelectField,
  SubmitButton,
  TextField,
} from "./fields";

export function SignUpForm() {
  const [state, action] = useActionState(signUp, undefined);
  const [password, setPassword] = useState("");
  const v = state?.values;
  const e = state?.fieldErrors;

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <GoogleButton label="Sign up with Google" />
      <Divider />
      {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}

      <TextField name="name" label="Full name" icon={User} placeholder="Aditi Sharma" autoComplete="name" required defaultValue={v?.name} error={e?.name} />
      <TextField name="email" type="email" label="Email" icon={Mail} placeholder="you@chambers.in" autoComplete="email" required defaultValue={v?.email} error={e?.email} />
      <TextField
        name="phone"
        type="tel"
        inputMode="numeric"
        label="Mobile number"
        icon={Phone}
        prefix="+91"
        placeholder="98XXXXXXXX"
        autoComplete="tel-national"
        maxLength={10}
        required
        defaultValue={v?.phone}
        error={e?.phone}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField name="state" label="State / UT" icon={MapPin} options={indianStates} placeholder="Choose state" required defaultValue={v?.state} error={e?.state} />
        <SelectField name="profession" label="I am a" icon={BriefcaseBusiness} options={professions} placeholder="Choose one" required defaultValue={v?.profession} error={e?.profession} />
      </div>

      <TextField name="inviteCode" label="Invite code" icon={Ticket} placeholder="e.g. VK-2026" optional defaultValue={v?.inviteCode} />

      <PasswordField
        name="password"
        label="Password"
        icon={Lock}
        placeholder="Create a password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
        error={e?.password}
        hint={
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {passwordRules.map((r) => {
              const ok = r.test(password);
              return (
                <li key={r.label} className={`flex items-center gap-1 ${ok ? "text-emerald-400" : "text-muted"}`}>
                  <Check className={`size-3.5 ${ok ? "" : "opacity-30"}`} />
                  {r.label}
                </li>
              );
            })}
          </ul>
        }
      />
      <PasswordField name="confirm" label="Confirm password" icon={Lock} placeholder="Repeat your password" autoComplete="new-password" required error={e?.confirm} />

      <div className="flex flex-col gap-1.5">
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted">
          <input type="checkbox" name="terms" className="mt-0.5 size-4 accent-[var(--accent)]" />
          <span>
            I agree to the{" "}
            <Link href="/legal/terms" className="text-foreground underline underline-offset-4">Terms of Use</Link> and{" "}
            <Link href="/legal/privacy" className="text-foreground underline underline-offset-4">Privacy Policy</Link>.
          </span>
        </label>
        {e?.terms && <p className="text-sm text-red-400">{e.terms}</p>}
      </div>

      <SubmitButton pendingText="Creating your account...">Create account</SubmitButton>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={brand.signInHref} className="font-semibold text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
