import type { StoreId } from "@/lib/catalog/types";
import { isIsoDate } from "@/lib/dates";
import { parseQuantity } from "./quantity";
import type { NormalizedDeal, PrijsProfeetProduct } from "./types";

const toCents = (euros: number | null | undefined) =>
  typeof euros === "number" && Number.isFinite(euros) ? Math.round(euros * 100) : null;

/** Converts one PrijsProfeet promotion into our NormalizedDeal. Returns null for unusable rows. */
export function normalizePrijsProfeet(p: PrijsProfeetProduct, storeId: StoreId): NormalizedDeal | null {
  const priceCents = toCents(p.price);
  if (priceCents === null || priceCents <= 0) return null;
  if (!p.valid_from || !p.valid_until || !isIsoDate(p.valid_from) || !isIsoDate(p.valid_until)) return null;

  const regularPriceCents = toCents(p.original_price);
  const bundleQty = p.multi_buy_quantity ?? 0;
  const bundlePrice = toCents(p.multi_buy_price);
  const bundle = bundleQty >= 2 && bundlePrice && bundlePrice > 0 ? { quantity: bundleQty, priceCents: bundlePrice } : null;

  return {
    source: "prijsprofeet",
    sourceProductId: p.base_product_id || p.product_id,
    storeId,
    title: p.name.trim(),
    brand: p.brand,
    category: p.unified_category,
    priceCents,
    // Without a "was" price we cannot prove a saving; keep it null rather than guessing.
    regularPriceCents: regularPriceCents !== null && regularPriceCents >= priceCents ? regularPriceCents : null,
    bundle,
    quantityText: p.quantity,
    pack: parseQuantity(p.quantity),
    validFrom: p.valid_from,
    validUntil: p.valid_until,
    validUntilEstimated: Boolean(p.valid_until_estimated),
    promotionType: p.promotion_type,
    loyaltyPriceCents: toCents(p.loyalty_price),
    loyaltyProgram: p.loyalty_program,
    productUrl: p.product_url,
  };
}

/** Short Dutch label for a deal, e.g. "1+1 gratis", "2 voor €3,00", "−25%". */
export function dealLabel(deal: Pick<NormalizedDeal, "bundle" | "priceCents" | "regularPriceCents" | "promotionType">): string {
  if (deal.bundle) {
    const { quantity, priceCents } = deal.bundle;
    if (deal.promotionType === "one_plus_one" && deal.regularPriceCents) {
      const paidItems = Math.round(priceCents / deal.regularPriceCents);
      if (paidItems >= 1 && paidItems < quantity) return `${paidItems}+${quantity - paidItems} gratis`;
      if (quantity === 2 && Math.abs(priceCents - deal.regularPriceCents * 1.5) <= 2) return "2e halve prijs";
    }
    return `${quantity} voor ${formatEuroShort(priceCents)}`;
  }
  if (deal.regularPriceCents && deal.regularPriceCents > deal.priceCents) {
    const pct = Math.round((1 - deal.priceCents / deal.regularPriceCents) * 100);
    if (pct >= 1) return `−${pct}%`;
  }
  return "Aanbieding";
}

function formatEuroShort(cents: number) {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}
