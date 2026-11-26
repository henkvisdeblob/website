import { isWithin, type IsoDate } from "@/lib/dates";
import type { Offer } from "@/lib/planner/types";

export type TopDeal = {
  title: string;
  label: string;
  priceCents: number;
  regularPriceCents: number | null;
  validUntil: IsoDate;
};

/**
 * The most interesting cooking deals of a store on a date: one per ingredient, biggest relative saving
 * first; deals without a known normal price (often Lidl) come after, cheapest first. Pure.
 */
export function topDeals(offers: Offer[], date: IsoDate, limit: number): TopDeal[] {
  const discount = (o: Offer) => {
    const perItem = o.bundle ? o.bundle.priceCents / o.bundle.quantity : o.priceCents;
    return o.regularPriceCents ? 1 - perItem / o.regularPriceCents : -1;
  };
  const valid = offers
    .filter((o) => isWithin(date, o.validFrom, o.validUntil))
    .sort((a, b) => discount(b) - discount(a) || a.priceCents - b.priceCents);

  const seen = new Set<string>();
  const result: TopDeal[] = [];
  for (const o of valid) {
    if (seen.has(o.ingredientId)) continue;
    seen.add(o.ingredientId);
    result.push({
      title: o.title,
      label: o.label,
      priceCents: o.priceCents,
      regularPriceCents: o.regularPriceCents,
      validUntil: o.validUntil,
    });
    if (result.length >= limit) break;
  }
  return result;
}
