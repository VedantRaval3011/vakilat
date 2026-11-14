const TZ = "Asia/Kolkata";

const dayMonth = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "short" });
const full = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
const monthYear = new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", month: "long", year: "numeric" });

export const formatDayMonth = (iso: string) => dayMonth.format(new Date(iso));

/** `date` is a calendar date (YYYY-MM-DD), not an instant. */
export const formatCalendarDate = (date: string) => full.format(new Date(`${date}T12:00:00+05:30`));

export const formatMonthYear = (year: number, month: number) => monthYear.format(new Date(Date.UTC(year, month, 1)));

export function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Today's calendar date in India, as YYYY-MM-DD. */
export function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}
