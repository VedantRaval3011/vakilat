"use client";

import { ChevronDown, Eye, EyeOff, Loader2, type LucideIcon } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

const inputBase =
  "h-13 w-full rounded-xl border bg-surface pl-12 pr-4 text-[15px] outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-accent/15";

function FieldShell({
  id,
  label,
  required,
  optional,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {required && <span className="text-accent"> *</span>}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-400">
          {error}
        </p>
      ) : (
        hint
      )}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  icon: LucideIcon;
  error?: string;
  optional?: boolean;
  prefix?: string;
  hint?: ReactNode;
};

export function TextField({ name, label, icon: Icon, error, optional, prefix, hint, required, ...rest }: TextFieldProps) {
  return (
    <FieldShell id={name} label={label} required={required} optional={optional} error={error} hint={hint}>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        {prefix && (
          <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[15px] text-muted">
            {prefix}
          </span>
        )}
        <input
          id={name}
          name={name}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`${inputBase} ${prefix ? "pl-[86px]" : ""} ${error ? "border-red-400/70" : "border-border"}`}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}

export function PasswordField({
  name,
  label,
  icon,
  error,
  hint,
  required,
  ...rest
}: Omit<TextFieldProps, "type">) {
  const [visible, setVisible] = useState(false);
  const Icon = icon;

  return (
    <FieldShell id={name} label={label} required={required} error={error} hint={hint}>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`${inputBase} pr-12 ${error ? "border-red-400/70" : "border-border"}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:text-foreground"
        >
          {visible ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
        </button>
      </div>
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  icon: Icon,
  options,
  placeholder,
  error,
  required,
  defaultValue,
}: {
  name: string;
  label: string;
  icon: LucideIcon;
  options: string[];
  placeholder: string;
  error?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <FieldShell id={name} label={label} required={required} error={error}>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <select
          id={name}
          name={name}
          required={required}
          defaultValue={defaultValue ?? ""}
          aria-invalid={!!error}
          className={`${inputBase} appearance-none pr-10 invalid:text-muted/60 ${error ? "border-red-400/70" : "border-border"}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o} className="bg-surface text-foreground">
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
      </div>
    </FieldShell>
  );
}

export function SubmitButton({ children, pendingText }: { children: ReactNode; pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-base font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
    >
      {pending && <Loader2 className="size-5 animate-spin" />}
      {pending ? pendingText : children}
    </button>
  );
}

export function Divider() {
  return (
    <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-muted">
      <span className="h-px flex-1 bg-border" />
      or
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function GoogleButton({ label }: { label: string }) {
  const [note, setNote] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setNote(true)}
        className="flex h-13 w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface text-base font-semibold transition hover:bg-surface-2"
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8Z" />
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.7-4.9h-4v3.1A12 12 0 0 0 12 24Z" />
          <path fill="#FBBC05" d="M5.3 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.8l4-3Z" />
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
        </svg>
        {label}
      </button>
      {note && (
        <p role="status" className="text-center text-sm text-muted">
          Google sign-in isn&apos;t available yet. Please use email for now.
        </p>
      )}
    </div>
  );
}

export function FormAlert({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
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
