import "server-only";
import { getStore } from "@/lib/catalog/stores";
import type { StoreId } from "@/lib/catalog/types";
import { normalizePrijsProfeet } from "./normalize";
import type { DealSource, NormalizedDeal, PrijsProfeetProduct } from "./types";

const BASE_URL = "https://www.prijsprofeet.nl/api/v1";

/** Only the unified categories that matter for cooking dinner (skips drinks, sweets, drugstore …). */
export const COOKING_CATEGORIES = [
  "vlees",
  "vis",
  "groente-fruit",
  "vega",
  "zuivel-eieren",
  "kaas",
  "pasta-rijst-wereldkeuken",
  "soepen-conserven-sauzen",
  "brood-bakkerij",
  "diepvries",
] as const;

type SearchResponse = { total: number; page: number; page_size: number; results: PrijsProfeetProduct[] };

/** Whether the configured key is accepted. An unknown key is otherwise served as keyless without an error. */
export type KeyStatus =
  | { kind: "none" }
  | { kind: "valid"; plan: string; rateLimit: string }
  | { kind: "rejected"; httpStatus: number; detail: string }
  | { kind: "error"; httpStatus: number };

/**
 * PrijsProfeet supermarket-promotions API (free plan: commercial use allowed with visible attribution).
 * Uses /search filtered by category and promotion status, so we only fetch what we can cook with.
 * Optional PRIJSPROFEET_API_KEY raises the rate limit (sent as X-API-Key). An unknown or revoked key is
 * served as keyless with an X-PrijsProfeet-Notice header, which we log so a bad key doesn't go unnoticed.
 */
export class PrijsProfeetSource implements DealSource {
  name = "prijsprofeet";
  private noticeLogged = false;

  constructor(
    private apiKey: string | undefined = process.env.PRIJSPROFEET_API_KEY,
    private fetchImpl: typeof fetch = fetch,
  ) {}

  async fetchDeals(storeId: StoreId): Promise<NormalizedDeal[]> {
    const store = getStore(storeId);
    if (!store) throw new Error(`Unknown store ${storeId}`);

    const requests: Promise<PrijsProfeetProduct[]>[] = [];
    for (const category of COOKING_CATEGORIES) {
      for (const status of ["active", "upcoming"]) {
        requests.push(this.searchAll({ retailer: store.sourceKey, category, promotion_status: status }));
      }
    }
    const pages = await Promise.all(requests);

    const seen = new Set<string>();
    const deals: NormalizedDeal[] = [];
    for (const product of pages.flat()) {
      if (seen.has(product.product_id)) continue;
      seen.add(product.product_id);
      const deal = normalizePrijsProfeet(product, storeId);
      if (deal) deals.push(deal);
    }
    return deals;
  }

  /** Checks the key against /partner/usage, the only endpoint that refuses an unknown key. */
  async keyStatus(): Promise<KeyStatus> {
    if (!this.apiKey) return { kind: "none" };
    const res = await this.fetchImpl(`${BASE_URL}/partner/usage`, { headers: this.headers() });
    if (res.status === 401 || res.status === 403) {
      const body = (await res.json().catch(() => ({}))) as { detail?: unknown };
      return { kind: "rejected", httpStatus: res.status, detail: typeof body.detail === "string" ? body.detail : "" };
    }
    if (!res.ok) return { kind: "error", httpStatus: res.status };
    const data = (await res.json()) as { plan: string; rate_limit: string };
    return { kind: "valid", plan: data.plan, rateLimit: data.rate_limit };
  }

  private headers(): Record<string, string> {
    return {
      accept: "application/json",
      "user-agent": "Potje/0.1 (weekmenu op basis van aanbiedingen)",
      ...(this.apiKey ? { "x-api-key": this.apiKey } : {}),
    };
  }

  private async searchAll(params: Record<string, string>): Promise<PrijsProfeetProduct[]> {
    const all: PrijsProfeetProduct[] = [];
    for (let page = 1; page <= 20; page++) {
      const query = new URLSearchParams({ q: "*", page: String(page), page_size: "100", ...params });
      const res = await this.fetchImpl(`${BASE_URL}/search?${query}`, { headers: this.headers() });
      const notice = res.headers.get("x-prijsprofeet-notice");
      if (notice && !this.noticeLogged) {
        this.noticeLogged = true;
        console.warn(`[deals] PrijsProfeet: ${notice}`);
      }
      if (!res.ok) throw new Error(`PrijsProfeet ${res.status} for ${query}`);
      const data = (await res.json()) as SearchResponse;
      all.push(...data.results);
      if (page * data.page_size >= data.total || data.results.length === 0) break;
    }
    return all;
  }
}
