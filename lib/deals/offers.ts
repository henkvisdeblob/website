import type { Ingredient } from "@/lib/catalog/types";
import { matchDeal } from "@/lib/matching/match";
import type { Offer } from "@/lib/planner/types";
import { dealLabel } from "./normalize";
import type { NormalizedDeal } from "./types";

/** Minimum match confidence to use a deal without human review (docs/06 §3). */
export const MIN_CONFIDENCE = 0.85;

/** Turns normalized deals into planner offers by matching them to ingredients. Pure. */
export function buildOffers(deals: NormalizedDeal[], ingredients: Ingredient[]): Offer[] {
  const offers: Offer[] = [];
  for (const deal of deals) {
    const match = matchDeal(deal, ingredients);
    if (!match || match.confidence < MIN_CONFIDENCE) continue;
    offers.push({
      ingredientId: match.ingredientId,
      storeId: deal.storeId,
      title: deal.title,
      packAmount: match.packAmount,
      priceCents: deal.priceCents,
      regularPriceCents: deal.regularPriceCents,
      bundle: deal.bundle,
      label: dealLabel(deal),
      validFrom: deal.validFrom,
      validUntil: deal.validUntil,
    });
  }
  return offers;
}
