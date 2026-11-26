import { portionEquivalents } from "./portions";
import type { ChildAge } from "./types";

/** A suggested weekly budget for the dinners: about €2.75 per portion, rounded up to €5. */
export function suggestedBudgetCents(household: { adults: number; children: ChildAge[] }, dinners: number): number {
  const euros = portionEquivalents(household) * dinners * 2.75;
  return Math.ceil(euros / 5) * 500;
}
