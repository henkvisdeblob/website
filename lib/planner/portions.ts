import type { ChildAge } from "./types";

/** Share of an adult portion per age group (rule of thumb; see docs/05 §3, step 1). */
export const CHILD_FACTORS: Record<ChildAge, number> = {
  "1-3": 0.4,
  "4-8": 0.6,
  "9-13": 0.8,
  "14+": 1.0,
};

export function portionEquivalents(household: { adults: number; children: ChildAge[] }): number {
  const total = household.adults + household.children.reduce((sum, age) => sum + CHILD_FACTORS[age], 0);
  return Math.round(total * 100) / 100;
}
