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

/** `failed`: PrijsProfeet could not be reached; `deals` is empty and the result is cached only briefly. */
export type DealsResult = { source: "prijsprofeet" | "sample"; deals: NormalizedDeal[]; failed?: boolean };

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
 * Never throws: an error inside a cached function would fail the prerender (and so a deploy) even when
 * the caller catches it. A failure returns no deals and is cached for minutes only.
 */
export async function getStoreDeals(storeId: StoreId, today: IsoDate): Promise<DealsResult> {
  "use cache";
  if (process.env.DEALS_SOURCE === "sample") {
    cacheLife("hours");
    return { source: "sample", deals: sampleDeals(storeId, today) };
  }
  try {
    const deals = await new PrijsProfeetSource().fetchDeals(storeId);
    cacheLife("hours");
    return { source: "prijsprofeet", deals };
  } catch (error) {
    console.error(`[deals] PrijsProfeet unreachable for ${storeId}`, error);
    cacheLife("minutes");
    return { source: "prijsprofeet", deals: [], failed: true };
  }
}
