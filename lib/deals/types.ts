import type { BaseUnit, StoreId } from "@/lib/catalog/types";
import type { IsoDate } from "@/lib/dates";

/** The subset of a PrijsProfeet product we use. Field meanings: their OpenAPI spec. */
export type PrijsProfeetProduct = {
  product_id: string;
  base_product_id: string;
  name: string;
  brand: string | null;
  ean: string | null;
  image_url: string | null;
  /** Price of ONE item (promotional price while a promotion runs). Aldi differs; we don't use Aldi yet. */
  price: number;
  original_price: number | null;
  multi_buy_quantity: number | null;
  /** Total for the bundle, e.g. 3.00 for "2 voor 3,-". */
  multi_buy_price: number | null;
  quantity: string | null;
  unified_category: string | null;
  product_url: string | null;
  retailer: string;
  promotion_type: string | null;
  promotion_status: string | null;
  valid_from: string | null;
  valid_until: string | null;
  valid_until_estimated: boolean | null;
  loyalty_price: number | null;
  loyalty_program: string | null;
};

/** A deal in our own shape (docs/06 §1), independent of the source. Money in cents. */
export type NormalizedDeal = {
  source: "prijsprofeet" | "sample";
  sourceProductId: string;
  storeId: StoreId;
  title: string;
  brand: string | null;
  category: string | null;
  priceCents: number;
  regularPriceCents: number | null;
  bundle: { quantity: number; priceCents: number } | null;
  quantityText: string | null;
  pack: { amount: number; unit: BaseUnit } | null;
  validFrom: IsoDate;
  validUntil: IsoDate;
  validUntilEstimated: boolean;
  promotionType: string | null;
  loyaltyPriceCents: number | null;
  loyaltyProgram: string | null;
  productUrl: string | null;
};

export interface DealSource {
  name: string;
  fetchDeals(storeId: StoreId): Promise<NormalizedDeal[]>;
}
