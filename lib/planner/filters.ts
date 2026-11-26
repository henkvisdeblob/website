import type { Ingredient, Recipe, RecipeUnit } from "@/lib/catalog/types";
import type { PlanInput } from "./types";

/** Spoons in grams/millilitres (rule of thumb). */
const SPOON = { el: 15, tl: 5 } as const;

/** Converts a recipe amount to the ingredient's own unit. */
export function toIngredientUnit(amount: number, unit: RecipeUnit, ingredient: Ingredient): number {
  if (unit === "el" || unit === "tl") {
    const grams = amount * SPOON[unit];
    return ingredient.unit === "stuk" ? grams / (ingredient.gramsPerPiece ?? 100) : grams;
  }
  if (unit === ingredient.unit) return amount;
  if (unit === "stuk" && ingredient.gramsPerPiece) return amount * ingredient.gramsPerPiece;
  if (ingredient.unit === "stuk" && ingredient.gramsPerPiece) return amount / ingredient.gramsPerPiece;
  return amount; // g ↔ ml: assume 1:1
}

export type EffectiveRecipe = {
  recipe: Recipe;
  /** Costed ingredients, amounts in ingredient units for the recipe's own servings. */
  items: { ingredient: Ingredient; amount: number }[];
  pantry: Ingredient[];
  minShelfLife: number;
};

/** True when this ingredient is not allowed for the user (diet, allergy, "dit eet ik niet"). */
export function isForbidden(ingredient: Ingredient, input: Pick<PlanInput, "diet" | "allergens" | "excludedIngredientIds">): boolean {
  const d = ingredient.diet;
  switch (input.diet) {
    case "vegetarian":
      if (d.meat || d.fish) return true;
      break;
    case "vegan":
      if (d.animal) return true;
      break;
    case "no_pork":
      if (d.pork) return true;
      break;
    case "halal":
      // Supermarket meat is rarely halal-certified: v1 offers vegetarian and fish dishes (docs/06 §4).
      if (d.pork || d.meat) return true;
      break;
  }
  if (ingredient.allergens.some((a) => input.allergens.includes(a))) return true;
  if (input.excludedIngredientIds.includes(ingredient.id)) return true;
  return false;
}

/**
 * Hard requirements (docs/05 §3, step 3). Optional ingredients that are not allowed are dropped;
 * a forbidden required ingredient excludes the whole recipe.
 */
export function filterRecipes(
  recipes: Recipe[],
  ingredientsById: Map<string, Ingredient>,
  input: Pick<PlanInput, "diet" | "allergens" | "excludedIngredientIds" | "maxCookMinutes" | "excludedRecipeIds">,
): EffectiveRecipe[] {
  const result: EffectiveRecipe[] = [];
  for (const recipe of recipes) {
    if (input.excludedRecipeIds?.includes(recipe.id)) continue;
    if (input.maxCookMinutes && recipe.prepMinutes + recipe.cookMinutes > input.maxCookMinutes) continue;

    const items: EffectiveRecipe["items"] = [];
    const pantry: Ingredient[] = [];
    let allowed = true;
    for (const line of recipe.ingredients) {
      const ingredient = ingredientsById.get(line.id);
      if (!ingredient) throw new Error(`Recipe ${recipe.id} uses unknown ingredient ${line.id}`);
      if (isForbidden(ingredient, input)) {
        if (line.optional) continue;
        allowed = false;
        break;
      }
      if (ingredient.pantry) pantry.push(ingredient);
      else items.push({ ingredient, amount: toIngredientUnit(line.amount, line.unit, ingredient) });
    }
    if (!allowed) continue;
    const minShelfLife = Math.min(...items.map((i) => i.ingredient.shelfLifeDays), 365);
    result.push({ recipe, items, pantry, minShelfLife });
  }
  return result;
}
