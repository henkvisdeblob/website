/**
 * Development tool: shows how this week's deals are matched to ingredients.
 * Usage: npx tsx scripts/match-report.ts <dump.json> <storeId> [--unmatched <category>]
 * The dump is an array of PrijsProfeet products (never commit such dumps: see docs/06).
 */
import { readFileSync } from "node:fs";
import { INGREDIENTS } from "@/lib/catalog/ingredients";
import type { StoreId } from "@/lib/catalog/types";
import { dealLabel, normalizePrijsProfeet } from "@/lib/deals/normalize";
import type { PrijsProfeetProduct } from "@/lib/deals/types";
import { matchDeal } from "@/lib/matching/match";

const [file, storeId, flag, flagValue] = process.argv.slice(2);
const products = JSON.parse(readFileSync(file, "utf8")) as PrijsProfeetProduct[];
const deals = products.map((p) => normalizePrijsProfeet(p, storeId as StoreId)).filter((d) => d !== null);

const byIngredient = new Map<string, string[]>();
const unmatched: string[] = [];
for (const deal of deals) {
  const m = matchDeal(deal, INGREDIENTS);
  if (m) {
    const list = byIngredient.get(m.ingredientId) ?? [];
    list.push(`${deal.title} | ${deal.quantityText} → ${m.packAmount} | €${(deal.priceCents / 100).toFixed(2)} | ${dealLabel(deal)}`);
    byIngredient.set(m.ingredientId, list);
  } else if (flag === "--unmatched" && deal.category === flagValue) {
    unmatched.push(`${deal.title} | ${deal.quantityText}`);
  }
}

console.log(`${storeId}: ${deals.length} deals, ${[...byIngredient.values()].flat().length} matched to ${byIngredient.size} ingredients`);
for (const [id, list] of [...byIngredient.entries()].sort()) {
  console.log(`\n## ${id} (${list.length})`);
  for (const line of list.slice(0, 6)) console.log(`  ${line}`);
}
if (unmatched.length) {
  console.log(`\n## unmatched in ${flagValue} (${unmatched.length})`);
  for (const line of unmatched.slice(0, 60)) console.log(`  ${line}`);
}
