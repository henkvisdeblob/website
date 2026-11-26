import "server-only";
import { cacheLife } from "next/cache";
import { INGREDIENTS } from "@/lib/catalog/ingredients";
import { STORES } from "@/lib/catalog/stores";
import type { StoreId } from "@/lib/catalog/types";
import { todayInAmsterdam, type IsoDate } from "@/lib/dates";
import { buildOffers } from "./offers";
import { PrijsProfeetSource } from "./prijsprofeet";
import { sampleDeals } from "./sample";
import { topDeals, type TopDeal } from "./top";
import type { NormalizedDeal } from "./types";

export type DealsResult = { source: "prijsprofeet" | "sample"; deals: NormalizedDeal[] };

export type StoreTopDeals = { storeId: StoreId; storeName: string; deals: TopDeal[] };
export type TopDealsResult = { date: IsoDate; source: "prijsprofeet" | "sample"; stores: StoreTopDeals[] };

/**
 * The best cooking deals of today for every store, for the home page and the planner's empty state.
 * Captured in the cache (and the static shell) for an hour; failures are cached only briefly.
 */
export async function getTopCookingDeals(limit = 5): Promise<TopDealsResult> {
  "use cache";
  const today = todayInAmsterdam(new Date());
  const source = process.env.DEALS_SOURCE === "sample" ? "sample" : "prijsprofeet";
  const stores = await Promise.all(
    STORES.map(async (store): Promise<StoreTopDeals> => {
      try {
        const { deals } = await getStoreDeals(store.id, today);
        return { storeId: store.id, storeName: store.name, deals: topDeals(buildOffers(deals, INGREDIENTS), today, limit) };
      } catch (error) {
        console.error(`[deals] top deals for ${store.id} failed`, error);
        return { storeId: store.id, storeName: store.name, deals: [] };
      }
    }),
  );
  if (stores.some((s) => s.deals.length === 0)) cacheLife("minutes");
  else cacheLife("hours");
  return { date: today, source, stores };
}

/**
 * This week's deals for one store. Cached for hours: PrijsProfeet refreshes nightly, and we don't
 * want to call them for every visitor. Set DEALS_SOURCE=sample for tests and offline development.
 */
export async function getStoreDeals(storeId: StoreId, today: IsoDate): Promise<DealsResult> {
  "use cache";
  cacheLife("hours");
  if (process.env.DEALS_SOURCE === "sample") {
    return { source: "sample", deals: sampleDeals(storeId, today) };
  }
  return { source: "prijsprofeet", deals: await new PrijsProfeetSource().fetchDeals(storeId) };
}
