export const eventTypes = [
  { id: "hearing", label: "Hearing", color: "bg-accent" },
  { id: "deadline", label: "Deadline", color: "bg-amber-400" },
  { id: "general", label: "General", color: "bg-sky-400" },
  { id: "notification", label: "Notification", color: "bg-violet-400" },
  { id: "training", label: "Training", color: "bg-emerald-400" },
] as const;

export type EventTypeId = (typeof eventTypes)[number]["id"];

export const eventTypeById = (id: string) => eventTypes.find((t) => t.id === id) ?? eventTypes[0];

export const remindOptions = [
  { value: "", label: "No reminder" },
  { value: "0", label: "On the day" },
  { value: "1", label: "1 day before" },
  { value: "2", label: "2 days before" },
  { value: "7", label: "1 week before" },
] as const;

/** Calendar date (YYYY-MM-DD) for the reminder, or null. */
export function remindDate(eventDate: string, daysBefore: string | null | undefined) {
  if (daysBefore == null || daysBefore === "") return null;
  const n = Number(daysBefore);
  if (!Number.isFinite(n) || n < 0) return null;
  const d = new Date(`${eventDate}T12:00:00+05:30`);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
