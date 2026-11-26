/** Units the planner calculates in. Recipes may also use spoons for small amounts. */
export type BaseUnit = "g" | "ml" | "stuk";
export type RecipeUnit = BaseUnit | "el" | "tl";

export type Aisle = "groente_fruit" | "vlees_vis" | "zuivel" | "houdbaar" | "diepvries" | "brood";

export const AISLE_LABELS: Record<Aisle, string> = {
  groente_fruit: "Groente & fruit",
  vlees_vis: "Vlees & vis",
  zuivel: "Zuivel, kaas & eieren",
  brood: "Brood",
  houdbaar: "Houdbaar",
  diepvries: "Diepvries",
};

export const AISLE_ORDER: Aisle[] = ["groente_fruit", "vlees_vis", "zuivel", "brood", "houdbaar", "diepvries"];

export type Allergen = "gluten" | "melk" | "ei" | "vis" | "schaaldieren" | "soja" | "noten";

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  gluten: "Gluten",
  melk: "Melk (lactose)",
  ei: "Ei",
  vis: "Vis",
  schaaldieren: "Schaaldieren",
  soja: "Soja",
  noten: "Noten",
};

/** Unified category slugs used by the deal source (PrijsProfeet). */
export type DealCategory =
  | "groente-fruit"
  | "zuivel-eieren"
  | "vega"
  | "kaas"
  | "vlees"
  | "vis"
  | "brood-bakkerij"
  | "pasta-rijst-wereldkeuken"
  | "soepen-conserven-sauzen"
  | "maaltijden"
  | "diepvries";

export type Ingredient = {
  id: string;
  name: string;
  aisle: Aisle;
  unit: BaseUnit;
  /** For "stuk" ingredients: average weight of one piece, to compare with packs sold by weight. */
  gramsPerPiece?: number;
  /** A common pack and its normal price (estimate), used when the ingredient is not on promotion. */
  refPack: { amount: number; priceCents: number; label: string };
  shelfLifeDays: number;
  /** Basics most people have at home (salt, oil …): not costed, listed under "check of je dit in huis hebt". */
  pantry: boolean;
  allergens: Allergen[];
  diet: { meat?: boolean; pork?: boolean; fish?: boolean; animal?: boolean };
  /** How deals are recognised as this ingredient. Keywords match whole words in the product name. */
  match?: { keywords: string[]; exclude?: string[]; categories: DealCategory[] };
};

export type MainProtein = "gehakt" | "kip" | "varken" | "rund" | "vis" | "peulvruchten" | "ei" | "kaas" | "tofu" | "vega";
export type CarbBase = "pasta" | "rijst" | "aardappel" | "mie" | "brood" | "wrap" | "couscous" | "gnocchi";

export type Recipe = {
  id: string;
  title: string;
  /** Servings the amounts are written for. */
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  mainProtein: MainProtein;
  carbBase: CarbBase;
  cuisine: "hollands" | "italiaans" | "aziatisch" | "mexicaans" | "midden-oosten";
  kidFriendly: boolean;
  ingredients: { id: string; amount: number; unit: RecipeUnit; optional?: boolean; note?: string }[];
  steps: string[];
};

export type StoreId = "ah" | "jumbo" | "lidl";

export type Store = {
  id: StoreId;
  name: string;
  /** Key at the deal source. */
  sourceKey: string;
  /** Rough price level for non-promoted products, relative to Albert Heijn (estimate). */
  priceFactor: number;
};
