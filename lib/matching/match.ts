import type { BaseUnit, Ingredient } from "@/lib/catalog/types";
import type { NormalizedDeal } from "@/lib/deals/types";

export type DealMatch = {
  ingredientId: string;
  confidence: number;
  /** Pack size expressed in the ingredient's own unit (e.g. a 1 kg net of onions = 10 "stuk"). */
  packAmount: number;
};

/** Words that mark a ready-made or non-cooking product for every ingredient. */
const GLOBAL_EXCLUDE = [
  "maaltijd", "kant-en-klaar", "kant en klaar", "snack", "chips", "salade", "soep", "schotel", "slaverrijker",
  "verspakket", "burger", "schnitzel", "ovengroente", "spice", "kruidenmix", "bowl", "dip", "saus", "gemarineerd",
  "voorgegaard", "gourmet", "babyvoeding", "hondenvoer", "kattenvoer", "dier",
];

/** Lower-case and strip accents, so "Crème fraîche" matches "creme fraiche". */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function containsWord(haystack: string, phrase: string): boolean {
  const escaped = normalizeText(phrase).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(haystack);
}

/** Converts a pack size to the ingredient's unit. Returns null when that is not possible. */
export function packInIngredientUnit(
  pack: { amount: number; unit: BaseUnit },
  ingredient: Pick<Ingredient, "unit" | "gramsPerPiece">,
): number | null {
  if (pack.unit === ingredient.unit) return pack.amount;
  const massLike = (u: BaseUnit) => u === "g" || u === "ml";
  if (massLike(pack.unit) && massLike(ingredient.unit)) return pack.amount; // liquids: assume 1 g ≈ 1 ml
  if (ingredient.unit === "stuk" && massLike(pack.unit) && ingredient.gramsPerPiece) {
    return Math.max(1, Math.round(pack.amount / ingredient.gramsPerPiece));
  }
  if (massLike(ingredient.unit) && pack.unit === "stuk" && ingredient.gramsPerPiece) {
    return pack.amount * ingredient.gramsPerPiece;
  }
  return null;
}

/**
 * Rule-based matching (docs/06 §3, step 2): category must fit, a keyword must appear as whole words,
 * no exclude word may appear. The most specific (longest) keyword wins across ingredients.
 */
export function matchDeal(deal: Pick<NormalizedDeal, "title" | "brand" | "category" | "pack">, ingredients: Ingredient[]): DealMatch | null {
  if (!deal.pack) return null;
  const name = normalizeText(deal.title);
  if (GLOBAL_EXCLUDE.some((w) => name.includes(w))) return null;

  let best: { match: DealMatch; specificity: number } | null = null;
  for (const ingredient of ingredients) {
    const rules = ingredient.match;
    if (!rules || ingredient.pantry) continue;
    const categoryKnown = deal.category !== null;
    if (categoryKnown && !rules.categories.includes(deal.category as never)) continue;
    if (rules.exclude?.some((w) => name.includes(normalizeText(w)))) continue;

    const hit = rules.keywords.filter((k) => containsWord(name, k)).sort((a, b) => b.length - a.length)[0];
    if (!hit) continue;

    const packAmount = packInIngredientUnit(deal.pack, ingredient);
    if (packAmount === null || packAmount <= 0) continue;

    const specificity = hit.length;
    const confidence = categoryKnown ? 0.9 : 0.7;
    if (!best || specificity > best.specificity) {
      best = { match: { ingredientId: ingredient.id, confidence, packAmount }, specificity };
    }
  }
  return best?.match ?? null;
}
