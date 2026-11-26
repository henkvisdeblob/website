import type { StoreId } from "@/lib/catalog/types";
import { addDays, type IsoDate } from "@/lib/dates";
import type { NormalizedDeal } from "./types";

/**
 * FICTIONAL sample deals for tests and offline development (DEALS_SOURCE=sample).
 * Never shown as real data: the UI labels them as "voorbeeldaanbiedingen".
 */
export function sampleDeals(storeId: StoreId, today: IsoDate): NormalizedDeal[] {
  const validFrom = addDays(today, -2);
  const validUntil = addDays(today, 7);
  const base = { source: "sample" as const, storeId, brand: null, validFrom, validUntil, validUntilEstimated: false, loyaltyPriceCents: null, loyaltyProgram: null, productUrl: null };
  const rows: Array<Omit<NormalizedDeal, keyof typeof base | "sourceProductId" | "pack"> & { pack: NormalizedDeal["pack"] }> = [
    { title: "Rundergehakt", category: "vlees", priceCents: 300, regularPriceCents: 599, bundle: { quantity: 2, priceCents: 599 }, quantityText: "500 g", pack: { amount: 500, unit: "g" }, promotionType: "one_plus_one" },
    { title: "Kipfilet", category: "vlees", priceCents: 449, regularPriceCents: 649, bundle: null, quantityText: "500 g", pack: { amount: 500, unit: "g" }, promotionType: "percentage" },
    { title: "Broccoli", category: "groente-fruit", priceCents: 99, regularPriceCents: 179, bundle: null, quantityText: "500 g", pack: { amount: 500, unit: "g" }, promotionType: "percentage" },
    { title: "Zilvervliesrijst", category: "pasta-rijst-wereldkeuken", priceCents: 115, regularPriceCents: 229, bundle: null, quantityText: "1 kg", pack: { amount: 1000, unit: "g" }, promotionType: "percentage" },
    { title: "Kikkererwten", category: "soepen-conserven-sauzen", priceCents: 50, regularPriceCents: 99, bundle: { quantity: 2, priceCents: 99 }, quantityText: "400 g", pack: { amount: 400, unit: "g" }, promotionType: "one_plus_one" },
    { title: "Zalmfilet", category: "vis", priceCents: 499, regularPriceCents: 649, bundle: null, quantityText: "250 g", pack: { amount: 250, unit: "g" }, promotionType: "percentage" },
    { title: "Uien", category: "groente-fruit", priceCents: 99, regularPriceCents: 139, bundle: null, quantityText: "1 kg", pack: { amount: 1000, unit: "g" }, promotionType: "percentage" },
    { title: "Rookworst", category: "vlees", priceCents: 249, regularPriceCents: 349, bundle: null, quantityText: "275 g", pack: { amount: 275, unit: "g" }, promotionType: "percentage" },
  ];
  return rows.map((r, i) => ({ ...base, ...r, sourceProductId: `sample-${storeId}-${i}` }));
}
