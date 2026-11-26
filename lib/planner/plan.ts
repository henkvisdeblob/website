import type { Ingredient } from "@/lib/catalog/types";
import { addDays, daysBetween } from "@/lib/dates";
import { formatEuro } from "@/lib/format";
import { filterRecipes, type EffectiveRecipe } from "./filters";
import { portionEquivalents } from "./portions";
import { bestBuy, buyOptions, referencePackCents, type BestBuy, type BuyOption } from "./pricing";
import { createRng } from "./rng";
import { ALGORITHM_VERSION, type PlanContext, type PlanInput, type PlanResult, type PlannedMeal, type Purchase } from "./types";

/*
 * The week-menu algorithm (docs/05). Pure: no I/O, no clock, no Math.random — everything comes in
 * through `input` and `ctx`, randomness from `input.seed`.
 *
 * J(M) = cost + waste + variety penalty + repetition penalty − preference bonus (all in cents),
 * with the budget as a hard limit whenever a menu within budget exists.
 */

const WEIGHTS = {
  /** Price counts, but the budget is the limit, not the goal (docs/05 §3, step 4). */
  costWeight: 0.4,
  wasteFactor: 0.5,
  sameProtein: 300,
  pastaOverTwo: 200,
  sameCuisineOverTwo: 100,
  repeatedRecently: 200,
  liked: 200,
  /** Savings count partly as a bonus: the promise is a menu built from this week's deals. */
  savingsBonusFactor: 0.5,
  /** Diet "none"/"no_pork": vegetarian dinners beyond half the week. */
  extraPlantBased: 250,
  /** More than one soup-and-bread dinner. */
  extraBreadDinner: 200,
  /** With children at home: dinners not marked kid-friendly. */
  notKidFriendly: 150,
  /** Per-recipe preference noise from the seed, so different seeds give different (near-)optimal menus. */
  jitterMax: 150,
  greedyNoiseMax: 80,
  overBudget: 1_000_000,
  restarts: 8,
  maxImproveRounds: 50,
  maxCandidates: 60,
};

const PERISHABLE_DAYS = 7;
const VEGETARIAN_PROTEINS = new Set(["peulvruchten", "tofu", "vega", "ei", "kaas"]);

export function planWeek(input: PlanInput, ctx: PlanContext): PlanResult {
  const warnings: string[] = [];
  const portions = portionEquivalents(input.household);
  const ingredientsById = new Map(ctx.ingredients.map((i) => [i.id, i]));
  const rng = createRng(input.seed);

  // ── Candidates (hard requirements) ─────────────────────────────────────────────────────
  const allowed = filterRecipes(ctx.recipes, ingredientsById, input);
  const servedDaysAgo = new Map<string, number>();
  for (const h of input.history ?? []) {
    const ago = daysBetween(h.servedOn, input.shopDate);
    if (ago >= 0) servedDaysAgo.set(h.recipeId, Math.min(ago, servedDaysAgo.get(h.recipeId) ?? Infinity));
  }
  const liked = new Set((input.history ?? []).filter((h) => h.rating === "like").map((h) => h.recipeId));
  let candidates = allowed.filter((r) => (servedDaysAgo.get(r.recipe.id) ?? Infinity) >= 14);
  if (candidates.length < input.dinners) candidates = allowed;

  const dinners = Math.min(input.dinners, candidates.length);
  if (dinners < input.dinners) {
    warnings.push(
      candidates.length === 0
        ? "Met deze instellingen vonden we geen recepten. Probeer een langere kooktijd of minder uitsluitingen."
        : `Met deze instellingen vonden we maar ${candidates.length} ${candidates.length === 1 ? "recept" : "recepten"}. Versoepel bijvoorbeeld de kooktijd voor meer keuze.`,
    );
  }

  // ── Pricing helpers with caching ──────────────────────────────────────────────────────
  const optionsCache = new Map<string, BuyOption[]>();
  const optionsFor = (ingredient: Ingredient) => {
    let options = optionsCache.get(ingredient.id);
    if (!options) {
      options = buyOptions(ingredient, ctx.offers, input.shopDate, ctx.priceFactor);
      optionsCache.set(ingredient.id, options);
    }
    return options;
  };
  const buyCache = new Map<string, BestBuy>();
  const buy = (ingredient: Ingredient, need: number) => {
    const key = `${ingredient.id}:${need.toFixed(2)}`;
    let result = buyCache.get(key);
    if (!result) {
      result = bestBuy(optionsFor(ingredient), need);
      buyCache.set(key, result);
    }
    return result;
  };

  /** Saving on the packs you actually need, against the store's normal price or our reference estimate. */
  const savingsOf = (ingredient: Ingredient, b: BestBuy) => {
    const offer = b.option.offer;
    if (!offer) return 0;
    const regularPack =
      b.option.regularPackCents ??
      Math.round((referencePackCents(ingredient, ctx.priceFactor) / ingredient.refPack.amount) * offer.packAmount);
    return Math.max(0, regularPack * b.neededPacks - b.option.costForPacks(b.neededPacks));
  };

  const jitter = new Map(candidates.map((c) => [c.recipe.id, Math.round(rng() * WEIGHTS.jitterMax)]));

  const needsOf = (menu: EffectiveRecipe[]) => {
    const needs = new Map<string, { ingredient: Ingredient; amount: number }>();
    for (const r of menu) {
      const factor = portions / r.recipe.servings;
      for (const item of r.items) {
        const entry = needs.get(item.ingredient.id) ?? { ingredient: item.ingredient, amount: 0 };
        entry.amount += item.amount * factor;
        needs.set(item.ingredient.id, entry);
      }
    }
    return needs;
  };

  const evaluate = (menu: EffectiveRecipe[]) => {
    let cost = 0;
    let waste = 0;
    let savings = 0;
    for (const { ingredient, amount } of needsOf(menu).values()) {
      const b = buy(ingredient, amount);
      cost += b.costCents;
      savings += savingsOf(ingredient, b);
      if (ingredient.shelfLifeDays <= PERISHABLE_DAYS) {
        const leftover = b.neededPacks * b.option.packAmount - amount;
        const perPack = b.option.costForPacks(b.neededPacks) / b.neededPacks;
        waste += (leftover / b.option.packAmount) * perPack * WEIGHTS.wasteFactor;
      }
    }
    const count = <K>(key: (r: EffectiveRecipe) => K) => {
      const m = new Map<K, number>();
      for (const r of menu) m.set(key(r), (m.get(key(r)) ?? 0) + 1);
      return m;
    };
    let variety = 0;
    for (const n of count((r) => r.recipe.mainProtein).values()) variety += Math.max(0, n - 1) * WEIGHTS.sameProtein;
    variety += Math.max(0, (count((r) => r.recipe.carbBase).get("pasta") ?? 0) - 2) * WEIGHTS.pastaOverTwo;
    for (const n of count((r) => r.recipe.cuisine).values()) variety += Math.max(0, n - 2) * WEIGHTS.sameCuisineOverTwo;
    variety += Math.max(0, (count((r) => r.recipe.carbBase).get("brood") ?? 0) - 1) * WEIGHTS.extraBreadDinner;
    if (input.diet === "none" || input.diet === "no_pork") {
      const plantBased = menu.filter((r) => VEGETARIAN_PROTEINS.has(r.recipe.mainProtein)).length;
      variety += Math.max(0, plantBased - Math.ceil(menu.length / 2)) * WEIGHTS.extraPlantBased;
    }
    if (input.household.children.length > 0) {
      variety += menu.filter((r) => !r.recipe.kidFriendly).length * WEIGHTS.notKidFriendly;
    }

    let preference = 0;
    for (const r of menu) {
      const ago = servedDaysAgo.get(r.recipe.id);
      if (ago !== undefined && ago < 28) preference -= WEIGHTS.repeatedRecently;
      if (liked.has(r.recipe.id)) preference += WEIGHTS.liked;
      preference -= jitter.get(r.recipe.id) ?? 0;
    }
    const overBudget = input.budgetCents !== null && cost > input.budgetCents ? WEIGHTS.overBudget + (cost - input.budgetCents) : 0;
    const bonus = savings * WEIGHTS.savingsBonusFactor;
    return { j: cost * WEIGHTS.costWeight + waste + variety - preference - bonus + overBudget, cost };
  };

  // ── Search: greedy construction + local improvement, several restarts ────────────────
  const locked = candidates.filter((c) => input.lockedRecipeIds?.includes(c.recipe.id)).slice(0, dinners);
  let pool = candidates;
  if (pool.length > WEIGHTS.maxCandidates) {
    pool = [...pool].sort((a, b) => evaluate([a]).j - evaluate([b]).j).slice(0, WEIGHTS.maxCandidates);
    for (const l of locked) if (!pool.includes(l)) pool.push(l);
  }

  let best: { menu: EffectiveRecipe[]; j: number } | null = null;
  for (let restart = 0; restart < WEIGHTS.restarts && dinners > 0; restart++) {
    const menu = [...locked];
    while (menu.length < dinners) {
      let pick: EffectiveRecipe | null = null;
      let pickScore = Infinity;
      for (const c of pool) {
        if (menu.includes(c)) continue;
        const score = evaluate([...menu, c]).j + rng() * WEIGHTS.greedyNoiseMax;
        if (score < pickScore) {
          pick = c;
          pickScore = score;
        }
      }
      if (!pick) break;
      menu.push(pick);
    }

    let current = evaluate(menu).j;
    for (let round = 0; round < WEIGHTS.maxImproveRounds; round++) {
      let improved = false;
      for (let i = 0; i < menu.length; i++) {
        if (locked.includes(menu[i])) continue;
        for (const c of pool) {
          if (menu.includes(c)) continue;
          const trial = menu.slice();
          trial[i] = c;
          const j = evaluate(trial).j;
          if (j < current - 0.5) {
            menu[i] = c;
            current = j;
            improved = true;
          }
        }
      }
      if (!improved) break;
    }
    if (!best || current < best.j) best = { menu: menu.slice(), j: current };
  }

  const chosen = best?.menu ?? [];
  // Perishables first (fish and mince within two days), then the rest; stable for ties.
  chosen.sort((a, b) => a.minShelfLife - b.minShelfLife);

  // ── Shopping list ─────────────────────────────────────────────────────────────────────
  const needs = needsOf(chosen);
  const usedBy = new Map<string, string[]>();
  for (const r of chosen) for (const item of r.items) usedBy.set(item.ingredient.id, [...(usedBy.get(item.ingredient.id) ?? []), r.recipe.id]);

  const purchases: Purchase[] = [];
  const purchaseByIngredient = new Map<string, Purchase>();
  for (const { ingredient, amount } of needs.values()) {
    const b = buy(ingredient, amount);
    const offer = b.option.offer;
    let regularPack = b.option.regularPackCents;
    let savingsEstimated = false;
    if (offer && regularPack === null) {
      const refPerUnit = referencePackCents(ingredient, ctx.priceFactor) / ingredient.refPack.amount;
      regularPack = Math.round(refPerUnit * offer.packAmount);
      savingsEstimated = true;
    }
    const paidForNeeded = b.option.costForPacks(b.neededPacks);
    const savings = offer && regularPack !== null ? Math.max(0, regularPack * b.neededPacks - paidForNeeded) : 0;
    const purchase: Purchase = {
      ingredientId: ingredient.id,
      name: ingredient.name,
      aisle: ingredient.aisle,
      unit: ingredient.unit,
      title: offer ? offer.title : ingredient.name,
      packLabel: offer ? packLabel(offer.packAmount, ingredient) : ingredient.refPack.label,
      packs: b.packs,
      freeExtraPacks: b.packs - b.neededPacks,
      neededAmount: Math.round(amount * 10) / 10,
      costCents: b.costCents,
      savingsCents: savings,
      savingsEstimated: savings > 0 && savingsEstimated,
      priceEstimated: !offer,
      deal: offer ? { label: offer.label, validUntil: offer.validUntil } : null,
      usedBy: usedBy.get(ingredient.id) ?? [],
    };
    purchases.push(purchase);
    purchaseByIngredient.set(ingredient.id, purchase);
  }

  // ── Meals with cost share and reasons ────────────────────────────────────────────────
  const meals: PlannedMeal[] = chosen.map((r, index) => {
    const factor = portions / r.recipe.servings;
    let cost = 0;
    const reasons: string[] = [];
    const dealIngredientIds: string[] = [];
    for (const item of r.items) {
      const p = purchaseByIngredient.get(item.ingredient.id)!;
      const totalNeed = needs.get(item.ingredient.id)!.amount;
      cost += totalNeed > 0 ? (p.costCents * item.amount * factor) / totalNeed : 0;
      if (p.deal) {
        dealIngredientIds.push(item.ingredient.id);
        if (reasons.length < 2) reasons.push(`${item.ingredient.name}: ${p.deal.label}`);
      }
    }
    const shared = r.items.find(
      (item) => item.ingredient.shelfLifeDays <= PERISHABLE_DAYS && (usedBy.get(item.ingredient.id)?.length ?? 0) > 1,
    );
    if (shared) {
      const other = chosen.find((o) => o !== r && o.items.some((i) => i.ingredient.id === shared.ingredient.id));
      if (other) reasons.push(`Deelt de ${shared.ingredient.name.toLowerCase()} met ‘${other.recipe.title}’`);
    }
    if (liked.has(r.recipe.id)) reasons.push("Je vond dit eerder lekker");
    return {
      date: addDays(input.shopDate, index),
      recipe: r.recipe,
      portions,
      costCents: Math.round(cost),
      reasons,
      dealIngredientIds,
    };
  });

  const pantryMap = new Map<string, string>();
  for (const r of chosen) for (const p of r.pantry) pantryMap.set(p.id, p.name);

  const totalCents = purchases.reduce((s, p) => s + p.costCents, 0);
  const savingsCents = purchases.reduce((s, p) => s + p.savingsCents, 0);
  const withinBudget = input.budgetCents === null || totalCents <= input.budgetCents;
  if (!withinBudget && input.budgetCents !== null) {
    warnings.unshift(
      `Deze week lukt het niet binnen ${formatEuro(input.budgetCents)}. Dit is het goedkoopste menu dat we vonden: ${formatEuro(totalCents)}.`,
    );
  }
  if (!ctx.offers.length) {
    warnings.push("We konden de aanbiedingen niet ophalen. De prijzen hieronder zijn schattingen van normale prijzen.");
  }

  return {
    algorithmVersion: ALGORITHM_VERSION,
    storeId: input.storeId,
    shopDate: input.shopDate,
    portions,
    meals,
    purchases,
    pantry: [...pantryMap].map(([id, name]) => ({ id, name })),
    totalCents,
    savingsCents,
    savingsIncludesEstimates: purchases.some((p) => p.savingsEstimated),
    budgetCents: input.budgetCents,
    withinBudget,
    candidateCount: candidates.length,
    warnings,
  };
}

function packLabel(amount: number, ingredient: Ingredient): string {
  if (ingredient.unit === "stuk") return amount === 1 ? "1 stuk" : `${amount} stuks`;
  const unit = ingredient.unit;
  if (amount >= 1000 && amount % 100 === 0) return `${(amount / 1000).toString().replace(".", ",")} ${unit === "g" ? "kg" : "l"}`;
  return `${amount} ${unit}`;
}
