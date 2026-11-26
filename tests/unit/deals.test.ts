import { describe, expect, it } from "vitest";
import { INGREDIENTS } from "@/lib/catalog/ingredients";
import { dealLabel, normalizePrijsProfeet } from "@/lib/deals/normalize";
import { parseQuantity } from "@/lib/deals/quantity";
import type { PrijsProfeetProduct } from "@/lib/deals/types";
import { matchDeal, normalizeText } from "@/lib/matching/match";

describe("parseQuantity", () => {
  it.each([
    ["400 g", { amount: 400, unit: "g" }],
    ["1 kg", { amount: 1000, unit: "g" }],
    ["1 KILO", { amount: 1000, unit: "g" }],
    ["1 kilogram", { amount: 1000, unit: "g" }],
    ["600 GRAM", { amount: 600, unit: "g" }],
    ["390gr", { amount: 390, unit: "g" }],
    ["1,5 l", { amount: 1500, unit: "ml" }],
    ["750ml", { amount: 750, unit: "ml" }],
    ["2 x 250 g", { amount: 500, unit: "g" }],
    ["8 x 125 g", { amount: 1000, unit: "g" }],
    ["4 x 2.4 liter", { amount: 9600, unit: "ml" }],
    ["los per 500 g", { amount: 500, unit: "g" }],
    ["ca. 310 g", { amount: 310, unit: "g" }],
    ["per kilo", { amount: 1000, unit: "g" }],
    ["Per stuk", { amount: 1, unit: "stuk" }],
    ["1 Stk.", { amount: 1, unit: "stuk" }],
    ["6 stuks", { amount: 6, unit: "stuk" }],
  ])("%s", (text, expected) => {
    expect(parseQuantity(text)).toEqual(expected);
  });

  it("returns null when unclear", () => {
    expect(parseQuantity(null)).toBeNull();
    expect(parseQuantity("4 pers | 25 min")).toBeNull();
  });
});

function product(partial: Partial<PrijsProfeetProduct>): PrijsProfeetProduct {
  return {
    product_id: "x_2026-11-23",
    base_product_id: "x",
    name: "Product",
    brand: null,
    ean: null,
    image_url: null,
    price: 1,
    original_price: null,
    multi_buy_quantity: null,
    multi_buy_price: null,
    quantity: "500 g",
    unified_category: "groente-fruit",
    product_url: null,
    retailer: "albert_heijn",
    promotion_type: null,
    promotion_status: "active",
    valid_from: "2026-11-23",
    valid_until: "2026-11-29",
    valid_until_estimated: null,
    loyalty_price: null,
    loyalty_program: null,
    ...partial,
  };
}

describe("normalizePrijsProfeet", () => {
  it("converts euros to cents and keeps bundles", () => {
    const d = normalizePrijsProfeet(
      product({ name: "AH Witte champignons", price: 1.24, original_price: 2.49, multi_buy_quantity: 2, multi_buy_price: 2.49, quantity: "400 g", promotion_type: "one_plus_one" }),
      "ah",
    )!;
    expect(d.priceCents).toBe(124);
    expect(d.regularPriceCents).toBe(249);
    expect(d.bundle).toEqual({ quantity: 2, priceCents: 249 });
    expect(d.pack).toEqual({ amount: 400, unit: "g" });
    expect(dealLabel(d)).toBe("1+1 gratis");
  });

  it("labels other mechanisms", () => {
    expect(dealLabel({ bundle: { quantity: 3, priceCents: 230 }, priceCents: 77, regularPriceCents: 115, promotionType: "one_plus_one" })).toBe("2+1 gratis");
    expect(dealLabel({ bundle: { quantity: 2, priceCents: 300 }, priceCents: 150, regularPriceCents: 200, promotionType: "one_plus_one" })).toBe("2e halve prijs");
    expect(dealLabel({ bundle: { quantity: 2, priceCents: 500 }, priceCents: 250, regularPriceCents: 329, promotionType: "multi_buy" })).toBe("2 voor €5,00");
    expect(dealLabel({ bundle: null, priceCents: 99, regularPriceCents: 139, promotionType: "percentage" })).toBe("−29%");
    expect(dealLabel({ bundle: null, priceCents: 99, regularPriceCents: null, promotionType: null })).toBe("Aanbieding");
  });

  it("drops rows without a usable price or dates", () => {
    expect(normalizePrijsProfeet(product({ price: 0 }), "ah")).toBeNull();
    expect(normalizePrijsProfeet(product({ valid_from: null }), "ah")).toBeNull();
  });
});

describe("matchDeal", () => {
  const m = (name: string, category: string | null, quantity = "500 g") =>
    matchDeal(normalizePrijsProfeet(product({ name, unified_category: category, quantity }), "ah")!, INGREDIENTS)?.ingredientId ?? null;

  it.each([
    ["AH Broccoli", "groente-fruit", "broccoli"],
    ["Jumbo Gemengd Gehakt 2 x 500g", "vlees", "gehakt_hoh"],
    ["AH Scharrel kipfilet 2 stuks", "vlees", "kipfilet"],
    ["Hak Kikkererwten", "soepen-conserven-sauzen", "kikkererwten"],
    ["Lassie Zilvervlies rijst", "pasta-rijst-wereldkeuken", "rijst"],
    ["AH Biologisch Zuurkool naturel", "groente-fruit", "zuurkool"],
    ["Crème fraîche", "zuivel-eieren", "creme_fraiche"],
    ["Stamppotaardappelen", "groente-fruit", "aardappelen"],
  ])("%s → %s", (name, category, expected) => {
    expect(m(name, category)).toBe(expected);
  });

  it.each([
    ["AH Ovenschotel kipfilet champignon room", "vlees"],
    ["AH Slaverrijker bloemkool/mango", "groente-fruit"],
    ["AH Bakaardappeltjes paprika en knoflook", "groente-fruit"],
    ["Boon Kidneybonen in Chilisaus", "soepen-conserven-sauzen"],
    ["Verstegen World Spice Meal Couscous", "pasta-rijst-wereldkeuken"],
    ["Hak Kikkererwten", "snoep-koek-chips"],
    ["Paprikachips", "groente-fruit"],
  ])("does not match %s", (name, category) => {
    expect(m(name, category)).toBeNull();
  });

  it("converts packs to the ingredient unit (1 kg of onions = 10 pieces)", () => {
    const d = normalizePrijsProfeet(product({ name: "AH Uien", quantity: "1 kg" }), "ah")!;
    expect(matchDeal(d, INGREDIENTS)).toMatchObject({ ingredientId: "ui", packAmount: 10 });
  });

  it("normalises accents and case", () => {
    expect(normalizeText("Crème Fraîche")).toBe("creme fraiche");
  });
});
