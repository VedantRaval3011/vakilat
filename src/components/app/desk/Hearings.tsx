"use client";

import {
  Bell,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useActionState, useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { addHearing, deleteHearing, saveHearing, type HearingFormState } from "@/app/(app)/desk-actions";
import { eventTypeById, eventTypes, remindOptions, type EventTypeId } from "@/lib/desk/event-types";
import type { Hearing } from "@/lib/desk/queries";
import { formatCalendarDate, formatMonthYear, formatTime, todayInIndia } from "@/lib/desk/format";
import { highCourts } from "@/lib/navigation";

const courts = [
  "Supreme Court of India",
  ...highCourts.map((c) => c.name),
  "District Court",
  "Sessions Court",
  "Chief Judicial Magistrate",
  "Family Court",
  "Consumer Commission",
  "NCLT",
  "Chamber / office",
  "Online / virtual",
];

const purposes = ["Admission", "Arguments", "Bail", "Evidence", "Framing of charge", "Judgment", "Mention", "Orders", "Final hearing", "Filing deadline", "Limitation"];

const noop = () => () => {};
const useToday = () => useSyncExternalStore(noop, todayInIndia, () => null);

const pad = (n: number) => String(n).padStart(2, "0");
const isoDate = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function shiftDate(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBeforeFromRemind(eventDate: string, remindAt: string | null) {
  if (!remindAt) return "";
  const a = new Date(`${eventDate}T12:00:00+05:30`).getTime();
  const b = new Date(`${remindAt}T12:00:00+05:30`).getTime();
  const days = Math.round((a - b) / 86_400_000);
  return String(Math.max(0, days));
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

const inputCls =
  "h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted focus:border-accent/60 [color-scheme:light] dark:[color-scheme:dark]";

function EventForm({
  defaultDate,
  editing,
  onDone,
}: {
  defaultDate: string | null;
  editing: Hearing | null;
  onDone: () => void;
}) {
  const action = editing ? saveHearing : addHearing;
  const [state, formAction, pending] = useActionState<HearingFormState, FormData>(action, {});
  const [formKey, setFormKey] = useState(0);
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state.ok) {
      setFormKey((k) => k + 1);
      queueMicrotask(onDone);
    }
  }
  const e = state.errors ?? {};
  const v = state.values ?? {};
  const initial = editing;

  return (
    <form key={`${formKey}-${initial?.id ?? "new"}`} action={formAction} className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-5" noValidate>
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        {initial ? <Pencil className="size-4 text-accent" /> : <Plus className="size-4 text-accent" />}
        {initial ? "Edit event" : "Add an event"}
      </h2>
      <Field label="Event type" error={e.eventType}>
        <select name="eventType" defaultValue={v.eventType ?? initial?.eventType ?? "hearing"} className={inputCls}>
          {eventTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Title" error={e.caseTitle}>
        <input name="caseTitle" defaultValue={v.caseTitle ?? initial?.caseTitle} placeholder="e.g. State v. Sharma" maxLength={200} className={inputCls} />
      </Field>
      <Field label="Case number (optional)">
        <input name="caseNumber" defaultValue={v.caseNumber ?? initial?.caseNumber ?? ""} placeholder="e.g. CRL.A. 123/2026" maxLength={80} className={inputCls} />
      </Field>
      <Field label="Court / venue" error={e.court}>
        <input name="court" defaultValue={v.court ?? initial?.court} list="court-options" placeholder="Start typing a court" maxLength={120} className={inputCls} />
        <datalist id="court-options">
          {courts.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" error={e.date}>
          <input name="date" type="date" defaultValue={v.date ?? initial?.date ?? defaultDate ?? undefined} className={inputCls} />
        </Field>
        <Field label="Time (optional)" error={e.time}>
          <input name="time" type="time" defaultValue={v.time ?? initial?.time ?? undefined} className={inputCls} />
        </Field>
      </div>
      <Field label="Purpose (optional)">
        <input name="purpose" defaultValue={v.purpose ?? initial?.purpose ?? ""} list="purpose-options" placeholder="e.g. Arguments" maxLength={120} className={inputCls} />
        <datalist id="purpose-options">
          {purposes.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </Field>
      <Field label="Reminder">
        <select
          name="remindDays"
          defaultValue={v.remindDays ?? (initial ? daysBeforeFromRemind(initial.date, initial.remindAt) : "1")}
          className={inputCls}
        >
          {remindOptions.map((o) => (
            <option key={o.value || "none"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Notes (optional)">
        <textarea
          name="notes"
          defaultValue={v.notes ?? initial?.notes ?? ""}
          rows={3}
          maxLength={1000}
          placeholder="Documents to carry, points to argue…"
          className={`${inputCls} h-auto resize-none py-2`}
        />
      </Field>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="mt-1 flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {initial ? "Save changes" : "Add event"}
        </button>
        {initial && (
          <button type="button" onClick={onDone} className="mt-1 h-11 rounded-xl px-4 text-sm font-semibold text-muted hover:bg-surface-2">
            Cancel
          </button>
        )}
      </div>
      {state.ok && (
        <p className="text-center text-xs text-emerald-500" aria-live="polite">
          {initial ? "Event updated." : "Event added."}
        </p>
      )}
      {state.error && <p className="text-center text-xs text-red-400">{state.error}</p>}
    </form>
  );
}

function Calendar({
  hearings,
  today,
  selected,
  onSelect,
}: {
  hearings: Hearing[];
  today: string | null;
  selected: string | null;
  onSelect: (d: string | null) => void;
}) {
  const base = today ?? hearings[0]?.date ?? "2026-01-01";
  const [cursor, setCursor] = useState(() => ({ y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) - 1 }));
  const byDate = useMemo(() => {
    const map = new Map<string, Hearing[]>();
    for (const h of hearings) map.set(h.date, [...(map.get(h.date) ?? []), h]);
    return map;
  }, [hearings]);

  const firstWeekday = (new Date(Date.UTC(cursor.y, cursor.m, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(cursor.y, cursor.m + 1, 0)).getUTCDate();
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const move = (delta: number) =>
    setCursor(({ y, m }) => {
      const n = m + delta;
      return { y: y + Math.floor(n / 12), m: ((n % 12) + 12) % 12 };
    });

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => move(-1)} aria-label="Previous month" className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2">
          <ChevronLeft className="size-4" />
        </button>
        <p className="font-display font-semibold">{formatMonthYear(cursor.y, cursor.m)}</p>
        <button type="button" onClick={() => move(1)} aria-label="Next month" className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2">
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <span key={d} className="py-1 text-[11px] font-semibold uppercase text-muted">
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />;
          const date = isoDate(cursor.y, cursor.m, day);
          const items = byDate.get(date) ?? [];
          const isSel = selected === date;
          const isToday = today === date;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(isSel ? null : date)}
              aria-label={`${formatCalendarDate(date)}${items.length ? `, ${items.length} event${items.length > 1 ? "s" : ""}` : ""}`}
              aria-pressed={isSel}
              className={`relative grid aspect-square place-items-center rounded-lg text-sm transition ${
                isSel ? "bg-accent font-semibold text-black" : isToday ? "border border-accent/60 text-accent" : "hover:bg-surface-2"
              }`}
            >
              {day}
              {items.length > 0 && (
                <span className="absolute bottom-1 flex gap-0.5">
                  {items.slice(0, 3).map((h) => (
                    <span key={h.id} className={`size-1.5 rounded-full ${isSel ? "bg-black" : eventTypeById(h.eventType).color}`} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <ul className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
        {eventTypes.map((t) => (
          <li key={t.id} className="flex items-center gap-1.5 text-[11px] text-muted">
            <span className={`size-2 rounded-full ${t.color}`} /> {t.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HearingCard({ h, onEdit }: { h: Hearing; onEdit: (h: Hearing) => void }) {
  const [pending, start] = useTransition();
  const type = eventTypeById(h.eventType);
  return (
    <li className={`flex gap-4 rounded-xl border border-border bg-background p-4 transition ${pending ? "opacity-50" : ""}`}>
      <div className="w-16 shrink-0 text-sm font-semibold text-accent">{h.time ? formatTime(h.time) : "Any time"}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold text-black ${type.color}`}>{type.label}</span>
          {h.remindAt && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <Bell className="size-3" /> Reminder {formatCalendarDate(h.remindAt)}
            </span>
          )}
        </div>
        <p className="mt-1.5 font-semibold">{h.caseTitle}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <span className="flex items-center gap-1">
            <Landmark className="size-3.5" /> {h.court}
          </span>
          {h.caseNumber && <span>· {h.caseNumber}</span>}
        </p>
        {h.purpose && <span className="mt-2 inline-block rounded-full bg-accent/12 px-2.5 py-0.5 text-[11px] font-semibold text-accent">{h.purpose}</span>}
        {h.notes && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{h.notes}</p>}
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <button
          type="button"
          onClick={() => onEdit(h)}
          aria-label={`Edit ${h.caseTitle}`}
          className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-foreground"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm(`Delete “${h.caseTitle}”?`)) start(() => deleteHearing(h.id));
          }}
          aria-label={`Delete ${h.caseTitle}`}
          className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}

function DayGroups({ hearings, today, onEdit }: { hearings: Hearing[]; today: string | null; onEdit: (h: Hearing) => void }) {
  const groups = useMemo(() => {
    const map = new Map<string, Hearing[]>();
    for (const h of hearings) map.set(h.date, [...(map.get(h.date) ?? []), h]);
    return [...map.entries()];
  }, [hearings]);

  const label = (date: string) => {
    if (!today) return null;
    if (date === today) return "Today";
    if (date === shiftDate(today, 1)) return "Tomorrow";
    if (date === shiftDate(today, -1)) return "Yesterday";
    return null;
  };

  return (
    <div className="flex flex-col gap-5">
      {groups.map(([date, items]) => (
        <section key={date} className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            {label(date) && <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-black">{label(date)}</span>}
            {formatCalendarDate(date)}
          </h3>
          <ul className="flex flex-col gap-2">
            {items.map((h) => (
              <HearingCard key={h.id} h={h} onEdit={onEdit} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function Hearings({ hearings }: { hearings: Hearing[] }) {
  const today = useToday();
  const [selected, setSelected] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [editing, setEditing] = useState<Hearing | null>(null);
  const [typeFilter, setTypeFilter] = useState<EventTypeId | "all">("all");

  const filtered = typeFilter === "all" ? hearings : hearings.filter((h) => h.eventType === typeFilter);
  const upcoming = today ? filtered.filter((h) => h.date >= today) : filtered;
  const past = today ? filtered.filter((h) => h.date < today).reverse() : [];
  const dayItems = selected ? filtered.filter((h) => h.date === selected) : [];
  const dueReminders =
    today
      ? hearings.filter((h) => h.remindAt && h.remindAt <= today && h.date >= today).slice(0, 5)
      : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex min-w-0 flex-col gap-6">
        {dueReminders.length > 0 && (
          <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-200">
              <Bell className="size-4" /> Reminders
            </p>
            <ul className="flex flex-col gap-1.5 text-sm">
              {dueReminders.map((h) => (
                <li key={h.id}>
                  <button type="button" onClick={() => setEditing(h)} className="text-left hover:underline">
                    {h.caseTitle}
                    <span className="text-muted"> · {formatCalendarDate(h.date)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${typeFilter === "all" ? "bg-accent text-black" : "bg-surface text-muted"}`}
          >
            All
          </button>
          {eventTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTypeFilter(t.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${typeFilter === t.id ? "bg-accent text-black" : "bg-surface text-muted"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {selected ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold">{formatCalendarDate(selected)}</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted hover:bg-surface-2 hover:text-foreground"
              >
                <X className="size-3.5" /> Show all
              </button>
            </div>
            {dayItems.length ? (
              <DayGroups hearings={dayItems} today={today} onEdit={setEditing} />
            ) : (
              <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
                No events on this day. Add one with the form; the date is already filled in.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold">Upcoming</h2>
            {upcoming.length ? (
              <DayGroups hearings={upcoming} today={today} onEdit={setEditing} />
            ) : (
              <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
                <CalendarClock className="size-8 text-muted" />
                <p className="font-display text-lg font-semibold">No upcoming events</p>
                <p className="max-w-sm text-sm text-muted">Add hearings, deadlines and reminders — they’ll sort by day and time here.</p>
              </div>
            )}
            {past.length > 0 && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowPast((s) => !s)}
                  aria-expanded={showPast}
                  className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-foreground"
                >
                  <ChevronDown className={`size-4 transition ${showPast ? "rotate-180" : ""}`} /> Past events ({past.length})
                </button>
                {showPast && (
                  <div className="mt-4 opacity-80">
                    <DayGroups hearings={past} today={today} onEdit={setEditing} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
        <Calendar key={today ?? "pending"} hearings={filtered} today={today} selected={selected} onSelect={setSelected} />
        <EventForm
          key={`${editing?.id ?? "new"}-${selected}-${today}`}
          defaultDate={selected ?? today}
          editing={editing}
          onDone={() => setEditing(null)}
        />
      </div>
    </div>
  );
}
