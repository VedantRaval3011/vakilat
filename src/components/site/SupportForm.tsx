"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { sendSupportMessage, type SupportState } from "@/app/(site)/support/actions";

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm outline-none transition placeholder:text-muted focus:border-accent/60";

export function SupportForm({ defaultName, defaultEmail }: { defaultName?: string; defaultEmail?: string }) {
  const [state, action, pending] = useActionState<SupportState, FormData>(sendSupportMessage, undefined);
  const e = state?.fieldErrors ?? {};
  const v = state?.values;

  if (state?.success) {
    return (
      <p role="status" className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-5 py-6 text-sm text-emerald-200">
        {state.success}
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-muted">Name</span>
        <input name="name" required defaultValue={v?.name ?? defaultName} maxLength={80} className={inputCls} />
        {e.name && <span className="text-xs text-red-400">{e.name}</span>}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-muted">Email</span>
        <input name="email" type="email" required defaultValue={v?.email ?? defaultEmail} maxLength={120} className={inputCls} />
        {e.email && <span className="text-xs text-red-400">{e.email}</span>}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-muted">Subject</span>
        <input name="subject" required defaultValue={v?.subject} maxLength={120} placeholder="e.g. Billing question" className={inputCls} />
        {e.subject && <span className="text-xs text-red-400">{e.subject}</span>}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-muted">Message</span>
        <textarea
          name="message"
          required
          rows={6}
          defaultValue={v?.message}
          maxLength={4000}
          placeholder="How can we help?"
          className={`${inputCls} h-auto resize-y py-3`}
        />
        {e.message && <span className="text-xs text-red-400">{e.message}</span>}
      </label>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-black disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Send message
      </button>
    </form>
  );
}
