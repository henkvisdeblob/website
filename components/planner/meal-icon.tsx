import { Bean, Beef, Drumstick, EggFried, Fish, Ham, Leaf, Soup, Sprout, UtensilsCrossed, type LucideIcon } from "lucide-react";
import type { Recipe } from "@/lib/catalog/types";

const BY_PROTEIN: Record<Recipe["mainProtein"], LucideIcon> = {
  gehakt: Beef,
  rund: Beef,
  varken: Ham,
  kip: Drumstick,
  vis: Fish,
  peulvruchten: Bean,
  tofu: Leaf,
  vega: Sprout,
  ei: EggFried,
  kaas: UtensilsCrossed,
};

/** A recognisable icon tile per dinner, so a week can be scanned at a glance. */
export function MealIcon({ recipe, className = "" }: { recipe: Recipe; className?: string }) {
  const Icon = recipe.id.includes("soep") ? Soup : BY_PROTEIN[recipe.mainProtein];
  return (
    <span aria-hidden="true" className={`grid place-items-center rounded-md bg-primary-soft text-on-primary-soft ${className}`}>
      <Icon className="size-5" strokeWidth={1.75} />
    </span>
  );
}
