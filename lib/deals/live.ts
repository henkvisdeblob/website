import "server-only";
import { cacheLife } from "next/cache";
import type { StoreId } from "@/lib/catalog/types";
import type { IsoDate } from "@/lib/dates";
import { PrijsProfeetSource } from "./prijsprofeet";
import { sampleDeals } from "./sample";
import type { NormalizedDeal } from "./types";

export type DealsResult = { source: "prijsprofeet" | "sample"; deals: NormalizedDeal[] };

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
