import { Tag } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatDateNl } from "@/lib/dates";
import { getTopCookingDeals, type TopDealsResult } from "@/lib/deals/live";
import { formatEuro } from "@/lib/format";

/** Server component: this week's best cooking deals per store (live data, cached for an hour). */
export async function TopDeals({ compact = false }: { compact?: boolean }) {
  const data = await getTopCookingDeals(compact ? 4 : 5);
  if (data.stores.every((s) => s.deals.length === 0)) return null;
  return <TopDealsGrid data={data} compact={compact} />;
}

export function TopDealsGrid({ data, compact }: { data: TopDealsResult; compact: boolean }) {
  const stores = data.stores.filter((s) => s.deals.length > 0);
  return (
    <div>
      <ul className={`grid gap-4 ${compact ? "" : "md:grid-cols-3"}`}>
        {stores.map((store) => (
          <li key={store.storeId} className="rounded-lg border border-border bg-surface">
            <p className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-display text-h4 font-bold">{store.storeName}</span>
              <span className="text-caption text-fg-subtle">{store.deals.length} toppers</span>
            </p>
            <ul className={compact ? "grid sm:grid-cols-2" : ""}>
              {store.deals.map((deal) => (
                <li
                  key={deal.title}
                  className={`flex items-start gap-3 border-t border-border px-4 py-3 first:border-t-0 ${compact ? "sm:[&:nth-child(2)]:border-t-0" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-fg" title={deal.title}>
                      {deal.title}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-caption text-fg-subtle">
                      <span className="tabular-nums font-semibold text-fg">{formatEuro(deal.priceCents)}</span>
                      {deal.regularPriceCents && deal.regularPriceCents > deal.priceCents && (
                        <s className="tabular-nums">
                          <span className="sr-only">normaal </span>
                          {formatEuro(deal.regularPriceCents)}
                        </s>
                      )}
                    </p>
                  </div>
                  <Badge tone="savings" className="shrink-0">
                    <Tag aria-hidden="true" className="size-3" />
                    {deal.label}
                  </Badge>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-caption text-fg-subtle">
        {data.source === "sample" ? (
          "Testmodus: verzonnen voorbeeldaanbiedingen."
        ) : (
          <>
            Stand van {formatDateNl(data.date)} · Aanbiedingen via{" "}
            <a href="https://www.prijsprofeet.nl" rel="noopener" className="underline underline-offset-4 hover:text-fg">
              PrijsProfeet
            </a>{" "}
            · prijzen kunnen in de winkel afwijken
          </>
        )}
      </p>
    </div>
  );
}
