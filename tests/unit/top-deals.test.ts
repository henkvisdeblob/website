import { describe, expect, it } from "vitest";
import { topDeals } from "@/lib/deals/top";
import type { Offer } from "@/lib/planner/types";

function offer(partial: Partial<Offer> & Pick<Offer, "ingredientId" | "title">): Offer {
  return {
    storeId: "ah",
    packAmount: 500,
    priceCents: 300,
    regularPriceCents: 400,
    bundle: null,
    label: "Aanbieding",
    validFrom: "2026-11-23",
    validUntil: "2026-11-29",
    ...partial,
  };
}

describe("topDeals", () => {
  it("sorts by relative saving and counts bundles per item", () => {
    const result = topDeals(
      [
        offer({ ingredientId: "ui", title: "Uien", priceCents: 90, regularPriceCents: 100 }), // 10%
        // 1+1 gratis: 2 for 199 against 199 each → about 50% per item.
        offer({ ingredientId: "gehakt", title: "Gehakt", priceCents: 199, regularPriceCents: 199, bundle: { quantity: 2, priceCents: 199 } }),
        offer({ ingredientId: "prei", title: "Prei", priceCents: 70, regularPriceCents: 100 }), // 30%
      ],
      "2026-11-26",
      5,
    );
    expect(result.map((d) => d.title)).toEqual(["Gehakt", "Prei", "Uien"]);
  });

  it("keeps one deal per ingredient, the best one", () => {
    const result = topDeals(
      [
        offer({ ingredientId: "kip", title: "Kip klein", priceCents: 350, regularPriceCents: 400 }),
        offer({ ingredientId: "kip", title: "Kip groot", priceCents: 500, regularPriceCents: 800 }),
      ],
      "2026-11-26",
      5,
    );
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Kip groot");
  });

  it("puts deals without a normal price last, cheapest first", () => {
    const result = topDeals(
      [
        offer({ ingredientId: "a", title: "Duur zonder prijs", priceCents: 300, regularPriceCents: null }),
        offer({ ingredientId: "b", title: "Goedkoop zonder prijs", priceCents: 100, regularPriceCents: null }),
        offer({ ingredientId: "c", title: "Met korting", priceCents: 380, regularPriceCents: 400 }),
      ],
      "2026-11-26",
      5,
    );
    expect(result.map((d) => d.title)).toEqual(["Met korting", "Goedkoop zonder prijs", "Duur zonder prijs"]);
  });

  it("skips deals that are not valid on the date and respects the limit", () => {
    const offers = [
      offer({ ingredientId: "oud", title: "Verlopen", validFrom: "2026-11-16", validUntil: "2026-11-22", priceCents: 1 }),
      offer({ ingredientId: "nieuw", title: "Volgende week", validFrom: "2026-11-30", validUntil: "2026-12-06", priceCents: 1 }),
      ...["a", "b", "c", "d"].map((id) => offer({ ingredientId: id, title: id })),
    ];
    const result = topDeals(offers, "2026-11-26", 3);
    expect(result).toHaveLength(3);
    expect(result.map((d) => d.title)).not.toContain("Verlopen");
    expect(result.map((d) => d.title)).not.toContain("Volgende week");
  });
});
