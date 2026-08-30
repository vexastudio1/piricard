import type { BusinessHoursEntry } from "@/lib/businesses";

export interface HoursRow {
  label: string;
  /** Formatted "HH:MM - HH:MM" ranges joined by " / ", or null when closed. */
  value: string | null;
}

const DAY_ORDER: Array<{ label: string; index: number }> = [
  { label: "Segunda", index: 1 },
  { label: "Terça", index: 2 },
  { label: "Quarta", index: 3 },
  { label: "Quinta", index: 4 },
  { label: "Sexta", index: 5 },
  { label: "Sábado", index: 6 },
  { label: "Domingo", index: 0 },
];

/**
 * Expands lib/businesses.ts's grouped hours entries (e.g. "Segunda a sexta"
 * covering days [1,2,3,4,5]) into the master PDF skeleton's fixed
 * Monday→Sunday row layout — the same shape BusinessHoursSchedule already
 * renders on the live profile, just flattened to one row per day.
 *
 * Returns null when the business has no hours data at all (section is then
 * omitted entirely by the caller, per "never invent a schedule").
 *
 * A day with no matching entry — and therefore no explicit periods — is
 * shown as closed ("Encerrado") only once at least one OTHER day *is*
 * explicitly specified, matching how the master template itself treats
 * "Domingo [Encerrado / horário]" as a normal, expected state rather than
 * missing data. This is a standard business-hours convention (no listed
 * hours for a day a business is open every other day of the week implies
 * closed that day), not an invented number.
 */
export function buildHoursGrid(hours: BusinessHoursEntry[] | undefined): HoursRow[] | null {
  if (!hours || hours.length === 0) return null;

  const byDay = new Map<number, BusinessHoursEntry["periods"]>();
  for (const entry of hours) {
    for (const day of entry.days) byDay.set(day, entry.periods);
  }

  return DAY_ORDER.map(({ label, index }) => {
    const periods = byDay.get(index);
    if (!periods || periods.length === 0) return { label, value: null };
    return { label, value: periods.map((period) => `${period.open} - ${period.close}`).join(" / ") };
  });
}
