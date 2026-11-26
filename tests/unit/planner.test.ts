import { describe, expect, it } from "vitest";
import { INGREDIENTS, getIngredient } from "@/lib/catalog/ingredients";
import { RECIPES } from "@/lib/catalog/recipes";
import type { Allergen } from "@/lib/catalog/types";
import { offerCost, planWeek, portionEquivalents, type Offer, type PlanInput } from "@/lib/planner";
import { bestBuy, buyOptions } from "@/lib/planner/pricing";
import { isForbidden } from "@/lib/planner/filters";

const SHOP_DATE = "2026-11-28";

function offer(partial: Partial<Offer> & Pick<Offer, "ingredientId" | "packAmount" | "priceCents">): Offer {
  return {
    storeId: "ah",
    title: partial.title ?? `Aanbieding ${partial.ingredientId}`,
    regularPriceCents: null,
    bundle: null,
    label: "Aanbieding",
    validFrom: "2026-11-23",
    validUntil: "2026-11-29",
    ...partial,
  };
}

function input(overrides: Partial<PlanInput> = {}): PlanInput {
  return {
    household: { adults: 2, children: ["4-8"] },
    dinners: 4,
    budgetCents: null,
    storeId: "ah",
    shopDate: SHOP_DATE,
    diet: "none",
    allergens: [],
    excludedIngredientIds: [],
    maxCookMinutes: null,
    seed: "test-seed",
    ...overrides,
  };
}

const ctx = (offers: Offer[] = []) => ({ ingredients: INGREDIENTS, recipes: RECIPES, offers, priceFactor: 1 });

describe("catalog integrity", () => {
  it("every recipe ingredient exists and every recipe has steps", () => {
    for (const r of RECIPES) {
      expect(r.steps.length).toBeGreaterThan(1);
      for (const line of r.ingredients) expect(() => getIngredient(line.id)).not.toThrow();
    }
  });

  it("recipe ids are unique", () => {
    expect(new Set(RECIPES.map((r) => r.id)).size).toBe(RECIPES.length);
  });
});

describe("portion equivalents", () => {
  it("adds children as part of an adult portion", () => {
    expect(portionEquivalents({ adults: 2, children: ["4-8"] })).toBe(2.6);
    expect(portionEquivalents({ adults: 1, children: [] })).toBe(1);
    expect(portionEquivalents({ adults: 2, children: ["1-3", "9-13", "14+"] })).toBe(4.2);
  });
});

describe("offerCost", () => {
  it("normal price", () => {
    expect(offerCost({ priceCents: 199, regularPriceCents: null, bundle: null }, 3)).toBe(597);
  });
  it("1+1 gratis: one item alone costs the normal price, two cost the same", () => {
    const o = { priceCents: 225, regularPriceCents: 449, bundle: { quantity: 2, priceCents: 449 } };
    expect(offerCost(o, 1)).toBe(449);
    expect(offerCost(o, 2)).toBe(449);
    expect(offerCost(o, 3)).toBe(898);
  });
  it("2 voor €5", () => {
    const o = { priceCents: 250, regularPriceCents: 329, bundle: { quantity: 2, priceCents: 500 } };
    expect(offerCost(o, 2)).toBe(500);
    expect(offerCost(o, 3)).toBe(829);
  });
  it("2e halve prijs", () => {
    const o = { priceCents: 150, regularPriceCents: 200, bundle: { quantity: 2, priceCents: 300 } };
    expect(offerCost(o, 2)).toBe(300);
  });
});

describe("buying packs", () => {
  const gehakt = getIngredient("rundergehakt");

  it("rounds the summed need up to whole packs (585 g → 2 × 500 g)", () => {
    const b = bestBuy(buyOptions(gehakt, [], SHOP_DATE, 1), 585);
    expect(b.packs).toBe(2);
    expect(b.costCents).toBe(2 * 599);
  });

  it("takes a free extra pack with 1+1 gratis", () => {
    const deal = offer({ ingredientId: "rundergehakt", packAmount: 500, priceCents: 300, regularPriceCents: 599, bundle: { quantity: 2, priceCents: 599 } });
    const b = bestBuy(buyOptions(gehakt, [deal], SHOP_DATE, 1), 400);
    expect(b.packs).toBe(2);
    expect(b.neededPacks).toBe(1);
    expect(b.costCents).toBe(599);
  });

  it("ignores promotions that are not valid on the shop date", () => {
    const expired = offer({ ingredientId: "rundergehakt", packAmount: 500, priceCents: 100, validUntil: "2026-11-27" });
    expect(bestBuy(buyOptions(gehakt, [expired], SHOP_DATE, 1), 400).option.offer).toBeNull();
  });
});

describe("planWeek", () => {
  it("returns the requested number of dinners with a shopping list and totals", () => {
    const plan = planWeek(input(), ctx());
    expect(plan.meals).toHaveLength(4);
    expect(plan.purchases.length).toBeGreaterThan(0);
    expect(plan.totalCents).toBe(plan.purchases.reduce((s, p) => s + p.costCents, 0));
    expect(plan.meals.map((m) => m.date)).toEqual(["2026-11-28", "2026-11-29", "2026-11-30", "2026-12-01"]);
  });

  it("is reproducible: same seed, same menu", () => {
    const a = planWeek(input({ seed: "x" }), ctx());
    const b = planWeek(input({ seed: "x" }), ctx());
    expect(a.meals.map((m) => m.recipe.id)).toEqual(b.meals.map((m) => m.recipe.id));
  });

  it("different seeds can give different menus", () => {
    const menus = new Set(
      ["a", "b", "c", "d", "e", "f"].map((seed) => planWeek(input({ seed, dinners: 5 }), ctx()).meals.map((m) => m.recipe.id).sort().join()),
    );
    expect(menus.size).toBeGreaterThan(1);
  });

  it("never violates diet, allergies or excluded ingredients (random inputs)", () => {
    const diets = ["none", "vegetarian", "vegan", "no_pork", "halal"] as const;
    const allergenSets: Allergen[][] = [[], ["gluten"], ["melk"], ["ei", "vis"], ["soja", "noten"]];
    for (let i = 0; i < 40; i++) {
      const diet = diets[i % diets.length];
      const allergens = allergenSets[i % allergenSets.length];
      const excluded = i % 3 === 0 ? ["ui", "paprika"] : [];
      const plan = planWeek(input({ seed: `p${i}`, diet, allergens, excludedIngredientIds: excluded, dinners: 1 + (i % 7) }), ctx());
      for (const meal of plan.meals) {
        for (const line of meal.recipe.ingredients) {
          const ingredient = getIngredient(line.id);
          if (isForbidden(ingredient, { diet, allergens, excludedIngredientIds: excluded })) {
            // Only allowed when optional: the planner drops it from the shopping list.
            expect(line.optional).toBe(true);
            expect(plan.purchases.some((p) => p.ingredientId === line.id)).toBe(false);
          }
        }
      }
    }
  });

  it("stays within budget when a menu within budget exists", () => {
    const cheapest = planWeek(input({ budgetCents: 1, seed: "cheap" }), ctx());
    const budget = cheapest.totalCents + 300;
    for (const seed of ["b1", "b2", "b3", "b4"]) {
      const plan = planWeek(input({ budgetCents: budget, seed }), ctx());
      expect(plan.withinBudget).toBe(true);
      expect(plan.totalCents).toBeLessThanOrEqual(budget);
    }
  });

  it("when no menu fits the budget: returns the cheapest menu and a warning", () => {
    const plan = planWeek(input({ budgetCents: 500 }), ctx());
    expect(plan.withinBudget).toBe(false);
    expect(plan.warnings[0]).toMatch(/lukt het niet binnen €5,00/);
    const unconstrained = planWeek(input(), ctx());
    expect(plan.totalCents).toBeLessThanOrEqual(unconstrained.totalCents);
  });

  it("keeps locked recipes", () => {
    const plan = planWeek(input({ lockedRecipeIds: ["lasagne", "linzensoep"] }), ctx());
    const ids = plan.meals.map((m) => m.recipe.id);
    expect(ids).toContain("lasagne");
    expect(ids).toContain("linzensoep");
  });

  it("uses promotions and reports savings against the normal price", () => {
    const deal = offer({ ingredientId: "rijst", packAmount: 1000, priceCents: 115, regularPriceCents: 229, label: "−50%" });
    const plan = planWeek(input({ lockedRecipeIds: ["kip-kerrie-rijst"], dinners: 1 }), ctx([deal]));
    const rice = plan.purchases.find((p) => p.ingredientId === "rijst")!;
    expect(rice.deal?.label).toBe("−50%");
    expect(rice.costCents).toBe(115);
    expect(rice.savingsCents).toBe(229 - 115);
    expect(plan.meals[0].reasons.some((r) => r.includes("Rijst: −50%"))).toBe(true);
  });

  it("does not count a free extra item as savings you did not need", () => {
    const deal = offer({ ingredientId: "rijst", packAmount: 1000, priceCents: 115, regularPriceCents: 229, bundle: { quantity: 2, priceCents: 229 }, label: "1+1 gratis" });
    const plan = planWeek(input({ lockedRecipeIds: ["kip-kerrie-rijst"], dinners: 1 }), ctx([deal]));
    const rice = plan.purchases.find((p) => p.ingredientId === "rijst")!;
    expect(rice.packs).toBe(2);
    expect(rice.freeExtraPacks).toBe(1);
    expect(rice.savingsCents).toBe(0);
  });

  it("puts perishable dinners (fish, mince) early in the week", () => {
    const plan = planWeek(input({ lockedRecipeIds: ["linzensoep", "zalm-broccoli-ovenschotel"], dinners: 2 }), ctx());
    expect(plan.meals[0].recipe.id).toBe("zalm-broccoli-ovenschotel");
  });

  it("handles too few candidates without crashing", () => {
    const plan = planWeek(input({ maxCookMinutes: 25, dinners: 7, diet: "vegan" }), ctx());
    expect(plan.meals.length).toBeLessThan(7);
    expect(plan.warnings.join(" ")).toMatch(/vonden we/);
  });

  it("is fast: 7 dinners in well under a second", () => {
    const start = performance.now();
    planWeek(input({ dinners: 7, household: { adults: 2, children: ["1-3", "9-13"] } }), ctx());
    expect(performance.now() - start).toBeLessThan(1000);
  });
});
