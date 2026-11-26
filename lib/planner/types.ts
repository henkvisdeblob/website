import type { Aisle, Allergen, BaseUnit, Ingredient, Recipe, StoreId } from "@/lib/catalog/types";
import type { IsoDate } from "@/lib/dates";

export const ALGORITHM_VERSION = "1.0.0";

export type ChildAge = "1-3" | "4-8" | "9-13" | "14+";
export type Diet = "none" | "vegetarian" | "vegan" | "no_pork" | "halal";

/** A purchasable promotion for one ingredient at one store (money in cents, pack in ingredient unit). */
export type Offer = {
  ingredientId: string;
  storeId: StoreId;
  title: string;
  packAmount: number;
  /** Price of one item while the promotion runs. */
  priceCents: number;
  /** Normal price of one item, when the source states it. */
  regularPriceCents: number | null;
  bundle: { quantity: number; priceCents: number } | null;
  label: string;
  validFrom: IsoDate;
  validUntil: IsoDate;
};

export type PlanInput = {
  household: { adults: number; children: ChildAge[] };
  dinners: number;
  budgetCents: number | null;
  storeId: StoreId;
  shopDate: IsoDate;
  diet: Diet;
  allergens: Allergen[];
  excludedIngredientIds: string[];
  maxCookMinutes: number | null;
  lockedRecipeIds?: string[];
  excludedRecipeIds?: string[];
  history?: { recipeId: string; servedOn: IsoDate; rating: "like" | "dislike" | null }[];
  seed: string;
};

export type PlanContext = {
  ingredients: Ingredient[];
  recipes: Recipe[];
  offers: Offer[];
  /** Price level for non-promoted products at this store (1.0 = reference). */
  priceFactor: number;
};

export type Purchase = {
  ingredientId: string;
  name: string;
  aisle: Aisle;
  unit: BaseUnit;
  /** Product title when bought on promotion, otherwise the ingredient name. */
  title: string;
  packLabel: string;
  packs: number;
  /** Packs that come free with a multi-buy deal (e.g. the second item of "1+1 gratis"). */
  freeExtraPacks: number;
  neededAmount: number;
  costCents: number;
  savingsCents: number;
  /** True when the saving is calculated against our reference price because the store gave no normal price. */
  savingsEstimated: boolean;
  /** True when no promotion was used and the price is our estimate of the normal price. */
  priceEstimated: boolean;
  deal: { label: string; validUntil: IsoDate } | null;
  usedBy: string[];
};

export type PlannedMeal = {
  date: IsoDate;
  recipe: Recipe;
  portions: number;
  costCents: number;
  reasons: string[];
  dealIngredientIds: string[];
};

export type PlanResult = {
  algorithmVersion: string;
  storeId: StoreId;
  shopDate: IsoDate;
  portions: number;
  meals: PlannedMeal[];
  purchases: Purchase[];
  pantry: { id: string; name: string }[];
  totalCents: number;
  savingsCents: number;
  savingsIncludesEstimates: boolean;
  budgetCents: number | null;
  withinBudget: boolean;
  candidateCount: number;
  warnings: string[];
};
