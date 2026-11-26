/**
 * Development tool: plans a week from a deal dump, to sanity-check prices and choices.
 * Usage: npx tsx scripts/plan-preview.ts <dump.json> <storeId> [shopDate] [dinners] [budgetEuro]
 */
import { readFileSync } from "node:fs";
import { INGREDIENTS } from "@/lib/catalog/ingredients";
import { RECIPES } from "@/lib/catalog/recipes";
import { getStore } from "@/lib/catalog/stores";
import type { StoreId } from "@/lib/catalog/types";
import { normalizePrijsProfeet } from "@/lib/deals/normalize";
import { buildOffers } from "@/lib/deals/offers";
import type { PrijsProfeetProduct } from "@/lib/deals/types";
import { formatEuro } from "@/lib/format";
import { planWeek } from "@/lib/planner";

const [file, storeId, shopDate = "2026-11-28", dinners = "5", budget] = process.argv.slice(2);
const store = getStore(storeId)!;
const products = JSON.parse(readFileSync(file, "utf8")) as PrijsProfeetProduct[];
const deals = products.map((p) => normalizePrijsProfeet(p, store.id as StoreId)).filter((d) => d !== null);
const offers = buildOffers(deals, INGREDIENTS);

const plan = planWeek(
  {
    household: { adults: 2, children: ["4-8"] },
    dinners: Number(dinners),
    budgetCents: budget ? Number(budget) * 100 : null,
    storeId: store.id,
    shopDate,
    diet: "none",
    allergens: [],
    excludedIngredientIds: [],
    maxCookMinutes: null,
    seed: `preview-${shopDate}`,
  },
  { ingredients: INGREDIENTS, recipes: RECIPES, offers, priceFactor: store.priceFactor },
);

console.log(`${store.name} · ${shopDate} · ${offers.length} usable offers · ${plan.portions} porties`);
console.log(`Totaal ${formatEuro(plan.totalCents)} · bespaard ${formatEuro(plan.savingsCents)}${plan.savingsIncludesEstimates ? " (deels geschat)" : ""}`);
for (const w of plan.warnings) console.log(`! ${w}`);
for (const m of plan.meals) console.log(`- ${m.date} ${m.recipe.title} · ${formatEuro(m.costCents)} · ${m.reasons.join(" | ")}`);
console.log("Boodschappen:");
for (const p of plan.purchases) {
  console.log(`  ${p.packs}× ${p.title} (${p.packLabel}) ${formatEuro(p.costCents)}${p.deal ? ` [${p.deal.label}]` : " ~"}${p.freeExtraPacks ? ` +${p.freeExtraPacks} gratis` : ""}${p.savingsCents ? ` bespaar ${formatEuro(p.savingsCents)}` : ""} · nodig ${p.neededAmount} ${p.unit}`);
}
console.log(`Check thuis: ${plan.pantry.map((p) => p.name).join(", ")}`);
