"use client";

import {
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  ShieldAlert,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  confirmPasswordChange,
  destroyAccount,
  requestPasswordChangeCode,
  saveProfessional,
  saveProfile,
  type SettingsFormState,
} from "@/app/(app)/settings/actions";
import type { AccountProfile } from "@/lib/auth/users";
import { accountTypes, brand, indianStates, professions } from "@/lib/content";
import { formatDayMonth } from "@/lib/desk/format";
import { routes } from "@/lib/navigation";
import type { MonthSpend } from "@/lib/ai/pricing";
import { planLabels, type PlanId, type QuotaRow } from "@/lib/plans/types";

type Tab = "professional" | "usage" | "billing" | "security";

const tabs: { id: Tab; label: string }[] = [
  { id: "professional", label: "Professional details" },
  { id: "usage", label: "Usage" },
  { id: "billing", label: "Billing" },
  { id: "security", label: "Security" },
];

const inputCls =
  "h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted focus:border-accent/60";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

function Alert({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${
        tone === "error"
          ? "border-red-400/40 bg-red-500/10 text-red-300"
          : "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
      }`}
    >
      {children}
    </p>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted">{label}</span>
      {children}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  );
}

function periodLabel(period: QuotaRow["period"]) {
  if (period === "day") return "today";
  if (period === "month") return "this month";
  return "total";
}

function QuotaBar({ row }: { row: QuotaRow }) {
  const unlimited = row.limit === null;
  const pct = unlimited ? 0 : Math.min(100, Math.round((row.used / Math.max(row.limit!, 1)) * 100));
  const tight = !unlimited && pct >= 90;
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-background/50 px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">{row.label}</p>
        <p className="text-xs text-muted">
          {unlimited ? (
            <>Unlimited · {row.used} used {periodLabel(row.period)}</>
          ) : (
            <>
              {row.used} / {row.limit} · {periodLabel(row.period)}
            </>
          )}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className={`h-full rounded-full transition-all ${tight ? "bg-amber-400" : "bg-accent"}`}
          style={{ width: unlimited ? "0%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

function resizePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas"));
        return;
      }
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}

function EditProfileDialog({
  profile,
  onClose,
}: {
  profile: AccountProfile;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(saveProfile, undefined);
  const [preview, setPreview] = useState<string | null>(profile.photo);
  const [clearPhoto, setClearPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <form action={action} className="relative flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <h2 id="edit-profile-title" className="font-display text-lg font-bold">
          Edit profile
        </h2>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative grid size-20 place-items-center overflow-hidden rounded-2xl bg-accent font-display text-xl font-bold text-black"
            aria-label="Change photo"
          >
            {preview && !clearPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="size-full object-cover" />
            ) : (
              initials(profile.name)
            )}
            <span className="absolute inset-x-0 bottom-0 flex justify-center bg-black/50 py-1 text-white">
              <Camera className="size-3.5" />
            </span>
          </button>
          <div className="flex flex-col gap-1.5 text-sm">
            <button type="button" onClick={() => fileRef.current?.click()} className="text-left font-semibold text-accent hover:underline">
              Upload photo
            </button>
            {(preview || profile.photo) && !clearPhoto && (
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setClearPhoto(true);
                }}
                className="text-left text-muted hover:text-foreground"
              >
                Remove photo
              </button>
            )}
            <p className="text-xs text-muted">Square JPG or PNG, resized automatically.</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (file.size > 5 * 1024 * 1024) {
                setPhotoError("Choose an image under 5 MB.");
                return;
              }
              try {
                const data = await resizePhoto(file);
                setPreview(data);
                setClearPhoto(false);
                setPhotoError(undefined);
              } catch {
                setPhotoError("Could not read that image.");
              }
            }}
          />
        </div>
        {(photoError || state?.fieldErrors?.photo) && (
          <p className="text-sm text-red-400">{photoError || state?.fieldErrors?.photo}</p>
        )}

        {preview && !clearPhoto && preview !== profile.photo && <input type="hidden" name="photo" value={preview} />}
        {clearPhoto && <input type="hidden" name="clearPhoto" value="1" />}

        <Field label="Full name" error={state?.fieldErrors?.name}>
          <input name="name" defaultValue={profile.name} maxLength={80} required className={inputCls} />
        </Field>
        <Field label="Mobile number" error={state?.fieldErrors?.phone}>
          <input name="phone" defaultValue={profile.phone} inputMode="numeric" maxLength={10} required className={inputCls} />
        </Field>
        <p className="text-xs text-muted">Email can&apos;t be changed here. Contact support if you need to move accounts.</p>

        {state?.error && <Alert tone="error">{state.error}</Alert>}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="h-10 rounded-lg px-4 text-sm font-semibold text-muted hover:bg-surface-2">
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-black disabled:opacity-60"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

function ProfessionalTab({ profile }: { profile: AccountProfile }) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(saveProfessional, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-lg font-semibold">Professional details</h3>
        <p className="mt-1 text-sm text-muted">Where you practise and how your account is classified.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="State / UT" error={state?.fieldErrors?.state}>
          <select name="state" defaultValue={profile.state} className={inputCls}>
            {indianStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Occupation" error={state?.fieldErrors?.profession}>
          <select name="profession" defaultValue={profile.profession} className={inputCls}>
            {professions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Account type" error={state?.fieldErrors?.accountType}>
          <select name="accountType" defaultValue={profile.accountType} className={inputCls}>
            {accountTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
        <BadgeCheck className="size-4 shrink-0 text-emerald-400" />
        <span>Email on file: {profile.email}</span>
      </div>
      {state?.success && <Alert tone="success">{state.success}</Alert>}
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <button
        type="submit"
        disabled={pending}
        className="flex h-10 w-fit items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-semibold text-background disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Save details
      </button>
    </form>
  );
}

function money(usd: number) {
  if (usd > 0 && usd < 0.01) return `$${usd.toFixed(4)}`;
  return usd.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function UsageTab({ usage, plan, spend }: { usage: QuotaRow[]; plan: PlanId; spend: MonthSpend }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">Usage</h3>
          <p className="mt-1 text-sm text-muted">
            How much of your {planLabels[plan]} plan you&apos;ve used. Limits reset by day or calendar month as noted.
          </p>
        </div>
        <Link href={routes.plans} className="text-sm font-semibold text-accent hover:underline">
          Compare plans
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{usage.map((row) => <QuotaBar key={row.key} row={row} />)}</div>
      <div className="rounded-xl border border-border bg-background/50 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">AI cost this month</p>
        {spend.requests === 0 ? (
          <p className="mt-2 text-sm text-muted">No AI requests recorded yet this month.</p>
        ) : (
          <>
            <p className="mt-1 font-display text-xl font-bold">{money(spend.costUsd)}</p>
            <p className="mt-1 text-sm text-muted">
              {spend.requests.toLocaleString("en-IN")} requests · {spend.inputTokens.toLocaleString("en-IN")} input tokens ·{" "}
              {spend.outputTokens.toLocaleString("en-IN")} output tokens. Estimated from provider list prices, billed in US dollars.
              {spend.unpriced > 0 ? " Some requests used a model without a listed price, so this is a lower bound." : ""}
            </p>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm">
              {spend.byTask.map((row) => (
                <li key={row.task} className="flex items-center justify-between gap-3">
                  <span>
                    {row.label}
                    <span className="text-muted"> · {row.requests.toLocaleString("en-IN")}</span>
                  </span>
                  <span className="font-medium">{money(row.costUsd)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function BillingTab({ plan }: { plan: PlanId }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-display text-lg font-semibold">Billing</h3>
        <p className="mt-1 text-sm text-muted">Your current plan and invoices. Payments will use Razorpay when enabled.</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/50 px-4 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Current plan</p>
          <p className="mt-1 font-display text-xl font-bold">{planLabels[plan]}</p>
        </div>
        <Link
          href={routes.plans}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
        >
          Upgrade
        </Link>
      </div>
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
        <CreditCard className="size-8 text-muted" />
        <p className="font-medium">No invoices yet</p>
        <p className="max-w-sm text-sm text-muted">
          When you subscribe to a paid plan, receipts and invoices will appear here. Razorpay checkout is stubbed until billing is connected.
        </p>
      </div>
    </div>
  );
}

function SecurityTab({ profile }: { profile: AccountProfile }) {
  const [codeState, codeAction, codePending] = useActionState<SettingsFormState, FormData>(
    requestPasswordChangeCode,
    undefined,
  );
  const [pwState, pwAction, pwPending] = useActionState<SettingsFormState, FormData>(confirmPasswordChange, undefined);
  const [delState, delAction, delPending] = useActionState<SettingsFormState, FormData>(destroyAccount, undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="font-display text-lg font-semibold">Security</h3>
        <p className="mt-1 text-sm text-muted">Change your password or permanently close this account.</p>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-background/50 p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-accent/12 text-accent">
            <Lock className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Password</p>
            <p className="text-sm text-muted">We email a one-time code, then you set a new password.</p>
            <p className="mt-2 text-xs text-muted">
              Last changed{" "}
              {profile.passwordUpdatedAt ? formatDayMonth(profile.passwordUpdatedAt) : formatDayMonth(profile.createdAt)}
            </p>
          </div>
        </div>

        <form action={codeAction}>
          <button
            type="submit"
            disabled={codePending}
            className="flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-surface-2 disabled:opacity-60"
          >
            {codePending && <Loader2 className="size-4 animate-spin" />}
            Send verification code
          </button>
        </form>
        {codeState?.success && <Alert tone="success">{codeState.success}</Alert>}
        {codeState?.demoCode && (
          <p className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 font-mono text-sm text-amber-200">
            Code: {codeState.demoCode}
          </p>
        )}
        {codeState?.error && <Alert tone="error">{codeState.error}</Alert>}

        <form action={pwAction} className="grid gap-3 sm:grid-cols-2">
          <Field label="Verification code" error={pwState?.fieldErrors?.code}>
            <input name="code" inputMode="numeric" maxLength={6} placeholder="6-digit code" className={inputCls} />
          </Field>
          <div className="hidden sm:block" />
          <Field label="New password" error={pwState?.fieldErrors?.password}>
            <input name="password" type="password" autoComplete="new-password" className={inputCls} />
          </Field>
          <Field label="Confirm password" error={pwState?.fieldErrors?.confirm}>
            <input name="confirm" type="password" autoComplete="new-password" className={inputCls} />
          </Field>
          {pwState?.success && (
            <div className="sm:col-span-2">
              <Alert tone="success">{pwState.success}</Alert>
            </div>
          )}
          {pwState?.error && (
            <div className="sm:col-span-2">
              <Alert tone="error">{pwState.error}</Alert>
            </div>
          )}
          <button
            type="submit"
            disabled={pwPending}
            className="flex h-10 w-fit items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-semibold text-background disabled:opacity-60"
          >
            {pwPending && <Loader2 className="size-4 animate-spin" />}
            Update password
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-red-500/30 bg-red-500/5 p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-red-500/15 text-red-400">
            <ShieldAlert className="size-5" />
          </span>
          <div>
            <p className="font-semibold">Delete account</p>
            <p className="text-sm text-muted">
              Permanently removes your {brand.name} account, chats, drafts, notes and saved items. This can&apos;t be undone.
            </p>
          </div>
        </div>
        {!confirmOpen ? (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="flex h-10 w-fit items-center gap-2 rounded-lg bg-red-500/90 px-4 text-sm font-semibold text-white hover:bg-red-500"
          >
            <Trash2 className="size-4" /> Delete account
          </button>
        ) : (
          <form action={delAction} className="flex flex-col gap-3">
            <Field label={`Type ${profile.email} to confirm`} error={delState?.fieldErrors?.confirmEmail}>
              <input name="confirmEmail" autoComplete="off" className={inputCls} />
            </Field>
            <Field label='Type "delete my account"' error={delState?.fieldErrors?.confirmPhrase}>
              <input name="confirmPhrase" autoComplete="off" className={inputCls} />
            </Field>
            {delState?.error && <Alert tone="error">{delState.error}</Alert>}
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={delPending}
                className="flex h-10 items-center gap-2 rounded-lg bg-red-500 px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                {delPending && <Loader2 className="size-4 animate-spin" />}
                Permanently delete
              </button>
              <button type="button" onClick={() => setConfirmOpen(false)} className="h-10 rounded-lg px-4 text-sm font-semibold text-muted hover:bg-surface-2">
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export function SettingsPanel({
  profile,
  usage,
  plan,
  spend,
}: {
  profile: AccountProfile;
  usage: QuotaRow[];
  plan: PlanId;
  spend: MonthSpend;
}) {
  const [tab, setTab] = useState<Tab>("professional");
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-accent/25 via-accent/10 to-surface">
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-6 sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-accent font-display text-2xl font-bold text-black shadow-lg">
              {profile.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photo} alt="" className="size-full object-cover" />
              ) : (
                initials(profile.name)
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-bold tracking-tight sm:text-3xl">{profile.name}</h1>
              <p className="mt-1.5 inline-flex rounded-full bg-background/70 px-2.5 py-0.5 text-xs font-medium">{profile.profession}</p>
              <p className="mt-2 truncate text-sm text-muted">{profile.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="h-10 rounded-lg border border-border bg-background/80 px-4 text-sm font-semibold backdrop-blur hover:bg-background"
            >
              Edit profile
            </button>
            <button
              type="button"
              onClick={() => setTab("security")}
              className="h-10 rounded-lg bg-red-500/90 px-4 text-sm font-semibold text-white hover:bg-red-500"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
              <UserRound className="size-3.5" /> Account
            </p>
            <dl className="flex flex-col gap-3.5 text-sm">
              <div>
                <dt className="text-xs text-muted">Email</dt>
                <dd className="mt-0.5 break-all font-medium">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Phone</dt>
                <dd className="mt-0.5 font-medium">{profile.phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Member since</dt>
                <dd className="mt-0.5 font-medium">{formatDayMonth(profile.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Plan</dt>
                <dd className="mt-0.5 font-medium">{planLabels[plan]}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
              <BriefcaseBusiness className="size-3.5" /> Practice
            </p>
            <p className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                {profile.state}
                <span className="mt-1 block text-muted">{profile.accountType}</span>
              </span>
            </p>
          </div>
        </aside>

        <div className="rounded-2xl border border-border bg-surface">
          <div className="flex gap-1 overflow-x-auto border-b border-border px-2 pt-2" role="tablist" aria-label="Settings sections">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
                  tab === t.id ? "bg-background text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="p-5 sm:p-6" role="tabpanel">
            {tab === "professional" && <ProfessionalTab profile={profile} />}
            {tab === "usage" && <UsageTab usage={usage} plan={plan} spend={spend} />}
            {tab === "billing" && <BillingTab plan={plan} />}
            {tab === "security" && <SecurityTab profile={profile} />}
          </div>
        </div>
      </div>

      {editing && <EditProfileDialog profile={profile} onClose={() => setEditing(false)} />}
    </div>
  );
}
