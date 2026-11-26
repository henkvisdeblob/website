import type { Ingredient } from "@/lib/catalog/types";
import type { IsoDate } from "@/lib/dates";
import { isWithin } from "@/lib/dates";
import type { Offer } from "./types";

/** One way to buy an ingredient: a promotion, or the normal (reference) pack. */
export type BuyOption = {
  offer: Offer | null;
  packAmount: number;
  /** Normal price of one pack, used for savings; null when unknown. */
  regularPackCents: number | null;
  costForPacks: (k: number) => number;
};

/**
 * Cost of k items under a promotion (docs/05 §3, step 2):
 *   cost(k) = ⌊k / q⌋ × bundlePrice + (k mod q) × single price
 * Items outside a full bundle cost the normal price ("1+1 gratis": one item alone is full price).
 */
export function offerCost(offer: Pick<Offer, "priceCents" | "regularPriceCents" | "bundle">, k: number): number {
  if (k <= 0) return 0;
  if (!offer.bundle) return k * offer.priceCents;
  const { quantity, priceCents } = offer.bundle;
  const single = offer.regularPriceCents ?? offer.priceCents;
  return Math.floor(k / quantity) * priceCents + (k % quantity) * single;
}

export function referencePackCents(ingredient: Ingredient, priceFactor: number): number {
  return Math.round(ingredient.refPack.priceCents * priceFactor);
}

/** All ways to buy an ingredient on the shop date. */
export function buyOptions(ingredient: Ingredient, offers: Offer[], shopDate: IsoDate, priceFactor: number): BuyOption[] {
  const refPack = referencePackCents(ingredient, priceFactor);
  const options: BuyOption[] = [
    {
      offer: null,
      packAmount: ingredient.refPack.amount,
      regularPackCents: refPack,
      costForPacks: (k) => k * refPack,
    },
  ];
  for (const offer of offers) {
    if (offer.ingredientId !== ingredient.id || offer.packAmount <= 0) continue;
    if (!isWithin(shopDate, offer.validFrom, offer.validUntil)) continue;
    options.push({
      offer,
      packAmount: offer.packAmount,
      regularPackCents: offer.regularPriceCents,
      costForPacks: (k) => offerCost(offer, k),
    });
  }
  return options;
}

export type BestBuy = {
  option: BuyOption;
  packs: number;
  /** Minimum packs needed; packs above this came free with a multi-buy. */
  neededPacks: number;
  costCents: number;
};

/**
 * Cheapest way to buy at least `need` of an ingredient. If an extra item is free (cost(k+1) ≤ cost(k)),
 * take it: it ends up on the list as "gratis extra".
 */
export function bestBuy(options: BuyOption[], need: number): BestBuy {
  let best: BestBuy | null = null;
  for (const option of options) {
    const neededPacks = Math.max(1, Math.ceil(need / option.packAmount - 1e-9));
    let packs = neededPacks;
    let cost = option.costForPacks(packs);
    const maxExtra = option.offer?.bundle ? option.offer.bundle.quantity - 1 : 0;
    for (let extra = 1; extra <= maxExtra; extra++) {
      const c = option.costForPacks(neededPacks + extra);
      if (c <= cost) {
        cost = c;
        packs = neededPacks + extra;
      }
    }
    const better =
      !best ||
      cost < best.costCents ||
      // Same price: prefer the promotion (it shows a real saving), then less waste.
      (cost === best.costCents && option.offer !== null && best.option.offer === null);
    if (better) best = { option, packs, neededPacks, costCents: cost };
  }
  if (!best) throw new Error("No buy options");
  return best;
}
