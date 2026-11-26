/**
 * The one date module (see CLAUDE.md): shop dates and deal validity are calendar dates
 * ("YYYY-MM-DD") in the Europe/Amsterdam time zone. ISO date strings compare correctly as strings.
 */

const TZ = "Europe/Amsterdam";

export type IsoDate = string;

/** Today's calendar date in the Netherlands. Pass `now` explicitly from request-time code. */
export function todayInAmsterdam(now: Date): IsoDate {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  const ms = (d: IsoDate) => {
    const [y, m, day] = d.split("-").map(Number);
    return Date.UTC(y, m - 1, day);
  };
  return Math.round((ms(to) - ms(from)) / 86_400_000);
}

export function isWithin(date: IsoDate, from: IsoDate, until: IsoDate): boolean {
  return from <= date && date <= until;
}

export function isIsoDate(value: string): value is IsoDate {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

/** "zaterdag 28 november" */
export function formatDateNl(date: IsoDate, options: { weekday?: boolean } = { weekday: true }): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("nl-NL", {
    timeZone: "UTC",
    weekday: options.weekday ? "long" : undefined,
    day: "numeric",
    month: "long",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Short weekday label for a date: "za", "zo", "ma" … */
export function shortWeekdayNl(date: IsoDate): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("nl-NL", { timeZone: "UTC", weekday: "short" })
    .format(new Date(Date.UTC(y, m - 1, d)))
    .replace(".", "");
}
