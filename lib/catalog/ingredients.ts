import type { Allergen, DealCategory, Ingredient } from "./types";

/*
 * The fixed ingredient list: the hinge between deals and recipes (docs/06 §4).
 * Reference prices are estimates of normal shelf prices (late 2026) and are shown as "schatting".
 */

const MEAT = { meat: true, animal: true };
const PORK = { meat: true, pork: true, animal: true };
const FISH = { fish: true, animal: true };
const ANIMAL = { animal: true };
const VEGAN = {};

const VLEES: DealCategory[] = ["vlees"];
const GROENTE: DealCategory[] = ["groente-fruit"];
const ZUIVEL: DealCategory[] = ["zuivel-eieren"];
const KAAS: DealCategory[] = ["kaas", "zuivel-eieren"];
const HOUDBAAR: DealCategory[] = ["pasta-rijst-wereldkeuken", "soepen-conserven-sauzen"];

function pantry(id: string, name: string, allergens: Allergen[] = [], diet: Ingredient["diet"] = VEGAN): Ingredient {
  return {
    id,
    name,
    aisle: "houdbaar",
    unit: "g",
    refPack: { amount: 1, priceCents: 0, label: "" },
    shelfLifeDays: 365,
    pantry: true,
    allergens,
    diet,
  };
}

export const INGREDIENTS: Ingredient[] = [
  // ── Vlees ──────────────────────────────────────────────────────────────────────────────
  {
    id: "rundergehakt", name: "Rundergehakt", aisle: "vlees_vis", unit: "g",
    refPack: { amount: 500, priceCents: 599, label: "500 g" }, shelfLifeDays: 2, pantry: false,
    allergens: [], diet: MEAT,
    match: { keywords: ["rundergehakt", "runder gehakt", "rundgehakt"], exclude: ["bal", "balletjes", "burger", "saus", "kruiden"], categories: VLEES },
  },
  {
    id: "gehakt_hoh", name: "Half-om-half gehakt", aisle: "vlees_vis", unit: "g",
    refPack: { amount: 500, priceCents: 449, label: "500 g" }, shelfLifeDays: 2, pantry: false,
    allergens: [], diet: PORK,
    match: { keywords: ["half om half gehakt", "half-om-half gehakt", "h-o-h gehakt", "gemengd gehakt", "gehakt half om half"], exclude: ["bal", "balletjes", "burger", "saus"], categories: VLEES },
  },
  {
    id: "kipfilet", name: "Kipfilet", aisle: "vlees_vis", unit: "g",
    refPack: { amount: 500, priceCents: 649, label: "500 g" }, shelfLifeDays: 2, pantry: false,
    allergens: [], diet: MEAT,
    match: { keywords: ["kipfilet", "kippenfilet", "kipfiletblokjes", "kipfiletreepjes", "kipfilet blokjes", "kipfilet reepjes", "kipfilethaasjes", "kiphaasjes"], exclude: ["schnitzel", "burger", "gepaneerd", "cordon", "nuggets", "krokant", "beleg", "gerookt", "plakjes", "salade", "spies"], categories: VLEES },
  },
  {
    id: "kipdijfilet", name: "Kipdijfilet", aisle: "vlees_vis", unit: "g",
    refPack: { amount: 500, priceCents: 599, label: "500 g" }, shelfLifeDays: 2, pantry: false,
    allergens: [], diet: MEAT,
    match: { keywords: ["kipdijfilet", "kippendijfilet", "kippendij", "kipdij", "dijfilet"], exclude: ["schnitzel", "burger", "gepaneerd", "spies", "saté", "sate"], categories: VLEES },
  },
  {
    id: "spekblokjes", name: "Spekblokjes", aisle: "vlees_vis", unit: "g",
    refPack: { amount: 150, priceCents: 199, label: "150 g" }, shelfLifeDays: 10, pantry: false,
    allergens: [], diet: PORK,
    match: { keywords: ["spekblokjes", "spekjes", "vetspek blokjes", "ontbijtspek blokjes", "pancetta blokjes", "gerookte spekblokjes", "spekreepjes", "guanciale blokjes"], categories: VLEES },
  },
  {
    id: "rookworst", name: "Rookworst", aisle: "vlees_vis", unit: "g",
    refPack: { amount: 275, priceCents: 349, label: "275 g" }, shelfLifeDays: 14, pantry: false,
    allergens: [], diet: PORK,
    match: { keywords: ["rookworst", "rookworsten"], exclude: ["kip", "vega", "plantaardig", "soep", "snack", "mini"], categories: ["vlees", "kaas"] },
  },
  {
    id: "hamblokjes", name: "Hamblokjes", aisle: "vlees_vis", unit: "g",
    refPack: { amount: 150, priceCents: 229, label: "150 g" }, shelfLifeDays: 10, pantry: false,
    allergens: [], diet: PORK,
    match: { keywords: ["hamblokjes", "ham blokjes", "hamreepjes"], categories: ["vlees", "kaas"] },
  },
  // ── Vis ────────────────────────────────────────────────────────────────────────────────
  {
    id: "zalmfilet", name: "Zalmfilet", aisle: "vlees_vis", unit: "g",
    refPack: { amount: 250, priceCents: 649, label: "250 g" }, shelfLifeDays: 2, pantry: false,
    allergens: ["vis"], diet: FISH,
    match: { keywords: ["zalmfilet", "zalmfilets", "zalm filet", "zalmmoot", "zalmmoten", "zalmstukjes"], exclude: ["gerookt", "gerookte", "salade", "spread", "sushi"], categories: ["vis", "diepvries"] },
  },
  {
    id: "witvis", name: "Witvisfilet", aisle: "vlees_vis", unit: "g",
    refPack: { amount: 400, priceCents: 599, label: "400 g" }, shelfLifeDays: 2, pantry: false,
    allergens: ["vis"], diet: FISH,
    match: { keywords: ["kabeljauw", "kabeljauwfilet", "koolvis", "koolvisfilet", "pangasius", "pangasiusfilet", "witvis", "witvisfilet", "schelvis", "heek"], exclude: ["kibbeling", "gepaneerd", "lekkerbek", "vissticks", "stick", "saus", "ovenschotel", "gerookt"], categories: ["vis", "diepvries"] },
  },
  {
    id: "garnalen", name: "Garnalen", aisle: "vlees_vis", unit: "g",
    refPack: { amount: 200, priceCents: 499, label: "200 g" }, shelfLifeDays: 2, pantry: false,
    allergens: ["schaaldieren"], diet: FISH,
    match: { keywords: ["garnalen", "scampi", "gamba", "gamba's"], exclude: ["cocktail", "salade", "kroket", "chips", "kroepoek"], categories: ["vis", "diepvries"] },
  },
  {
    id: "tonijn", name: "Tonijn (blik)", aisle: "houdbaar", unit: "g",
    refPack: { amount: 160, priceCents: 229, label: "blik 160 g" }, shelfLifeDays: 365, pantry: false,
    allergens: ["vis"], diet: FISH,
    match: { keywords: ["tonijn", "tonijnstukken"], exclude: ["salade", "steak", "spread", "pizza"], categories: ["soepen-conserven-sauzen", "vis"] },
  },
  // ── Vega & eieren ──────────────────────────────────────────────────────────────────────
  {
    id: "kikkererwten", name: "Kikkererwten", aisle: "houdbaar", unit: "g",
    refPack: { amount: 400, priceCents: 99, label: "blik 400 g" }, shelfLifeDays: 365, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["kikkererwten"], exclude: ["hummus", "chips", "snack", "curry", "mix"], categories: [...HOUDBAAR, "vega", "groente-fruit"] },
  },
  {
    id: "kidneybonen", name: "Kidneybonen", aisle: "houdbaar", unit: "g",
    refPack: { amount: 400, priceCents: 99, label: "blik 400 g" }, shelfLifeDays: 365, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["kidneybonen", "rode kidneybonen"], exclude: ["chili", "mix", "curry"], categories: [...HOUDBAAR, "vega", "groente-fruit"] },
  },
  {
    id: "linzen", name: "Linzen", aisle: "houdbaar", unit: "g",
    refPack: { amount: 400, priceCents: 109, label: "blik 400 g" }, shelfLifeDays: 365, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["linzen", "groene linzen", "rode linzen"], exclude: ["chips", "pasta", "soep", "curry", "tomatensaus", "mix"], categories: [...HOUDBAAR, "vega", "groente-fruit"] },
  },
  {
    id: "tofu", name: "Tofu", aisle: "zuivel", unit: "g",
    refPack: { amount: 375, priceCents: 249, label: "375 g" }, shelfLifeDays: 10, pantry: false,
    allergens: ["soja"], diet: VEGAN,
    match: { keywords: ["tofu"], exclude: ["dessert"], categories: ["vega", "zuivel-eieren"] },
  },
  {
    id: "vega_gehakt", name: "Vegetarisch gehakt", aisle: "vlees_vis", unit: "g",
    refPack: { amount: 200, priceCents: 299, label: "200 g" }, shelfLifeDays: 7, pantry: false,
    allergens: ["soja"], diet: VEGAN,
    match: { keywords: ["vegetarisch gehakt", "vega gehakt", "vegan gehakt", "plantaardig gehakt", "gehakt vegan", "vegetarische gehakt"], exclude: ["bal", "balletjes", "burger"], categories: ["vega", "vlees"] },
  },
  {
    id: "eieren", name: "Eieren", aisle: "zuivel", unit: "stuk", gramsPerPiece: 60,
    refPack: { amount: 10, priceCents: 349, label: "doos van 10" }, shelfLifeDays: 21, pantry: false,
    allergens: ["ei"], diet: ANIMAL,
    match: { keywords: ["eieren", "scharreleieren", "vrije uitloop eieren", "biologische eieren"], exclude: ["chocolade", "paaseieren", "salade", "gekookte", "spiegel"], categories: ZUIVEL },
  },
  // ── Zuivel & kaas ──────────────────────────────────────────────────────────────────────
  {
    id: "melk", name: "Melk", aisle: "zuivel", unit: "ml",
    refPack: { amount: 1000, priceCents: 119, label: "1 liter" }, shelfLifeDays: 7, pantry: false,
    allergens: ["melk"], diet: ANIMAL,
    match: { keywords: ["halfvolle melk", "volle melk", "magere melk"], exclude: ["choco", "chocomel", "koffie", "karnemelk", "kokos", "haver", "soja", "amandel", "drink", "poeder", "lactosevrij"], categories: ZUIVEL },
  },
  {
    id: "kookroom", name: "Kookroom", aisle: "zuivel", unit: "ml",
    refPack: { amount: 250, priceCents: 139, label: "250 ml" }, shelfLifeDays: 10, pantry: false,
    allergens: ["melk"], diet: ANIMAL,
    match: { keywords: ["kookroom", "culinaire room", "koksroom"], exclude: ["kokos", "soja", "haver"], categories: ZUIVEL },
  },
  {
    id: "creme_fraiche", name: "Crème fraîche", aisle: "zuivel", unit: "ml",
    refPack: { amount: 200, priceCents: 149, label: "200 ml" }, shelfLifeDays: 10, pantry: false,
    allergens: ["melk"], diet: ANIMAL,
    match: { keywords: ["crème fraîche", "creme fraiche", "crème fraiche"], exclude: ["dip", "saus"], categories: ZUIVEL },
  },
  {
    id: "geraspte_kaas", name: "Geraspte kaas", aisle: "zuivel", unit: "g",
    refPack: { amount: 200, priceCents: 319, label: "200 g" }, shelfLifeDays: 21, pantry: false,
    allergens: ["melk"], diet: ANIMAL,
    match: { keywords: ["geraspte kaas", "geraspt", "geraspte", "raspkaas", "gratin kaas", "kaas geraspt"], exclude: ["parmezaan", "parmigiano", "mozzarella"], categories: KAAS },
  },
  {
    id: "feta", name: "Feta", aisle: "zuivel", unit: "g",
    refPack: { amount: 200, priceCents: 279, label: "200 g" }, shelfLifeDays: 14, pantry: false,
    allergens: ["melk"], diet: ANIMAL,
    match: { keywords: ["feta", "fetakaas", "witte kaas"], exclude: ["salade", "dip", "spread", "olijven"], categories: KAAS },
  },
  {
    id: "mozzarella", name: "Mozzarella", aisle: "zuivel", unit: "g",
    refPack: { amount: 125, priceCents: 129, label: "125 g" }, shelfLifeDays: 7, pantry: false,
    allergens: ["melk"], diet: ANIMAL,
    match: { keywords: ["mozzarella"], exclude: ["sticks", "pizza", "salade", "snack"], categories: KAAS },
  },
  {
    id: "ricotta", name: "Ricotta", aisle: "zuivel", unit: "g",
    refPack: { amount: 250, priceCents: 219, label: "250 g" }, shelfLifeDays: 7, pantry: false,
    allergens: ["melk"], diet: ANIMAL,
    match: { keywords: ["ricotta"], exclude: ["roomkaas", "pastakaas", "dip", "honey"], categories: KAAS },
  },
  // ── Groente & aardappelen ──────────────────────────────────────────────────────────────
  {
    id: "ui", name: "Uien", aisle: "groente_fruit", unit: "stuk", gramsPerPiece: 100,
    refPack: { amount: 10, priceCents: 139, label: "net van 1 kg" }, shelfLifeDays: 30, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["uien", "gele uien", "rode uien", "ui", "rode ui"], exclude: ["soep", "gebakken", "gefrituurde", "chips", "ringen", "lente", "lenteui", "bosui", "zilverui", "sjalot", "poeder", "saus", "uienring"], categories: GROENTE },
  },
  {
    id: "winterpeen", name: "Winterpeen", aisle: "groente_fruit", unit: "g", gramsPerPiece: 500,
    refPack: { amount: 1000, priceCents: 149, label: "1 kg" }, shelfLifeDays: 21, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["winterpeen", "wortelen", "wortels", "peen", "bospeen", "waspeen"], exclude: ["sap", "salade", "rauwkost", "taart", "cake", "chips"], categories: GROENTE },
  },
  {
    id: "aardappelen", name: "Aardappelen", aisle: "groente_fruit", unit: "g",
    refPack: { amount: 2000, priceCents: 299, label: "2 kg" }, shelfLifeDays: 30, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["aardappelen", "stamppotaardappelen", "kruimige aardappelen", "vastkokende aardappelen", "kruimig", "vastkokend"], exclude: ["partjes", "schijfjes", "puree", "frites", "friet", "kroket", "gekruid", "rösti", "rosti", "zoete", "kriel", "krieltjes", "chips", "salade", "wedges", "blokjes", "hasselback", "gratin", "bak"], categories: GROENTE },
  },
  {
    id: "krieltjes", name: "Krieltjes", aisle: "groente_fruit", unit: "g",
    refPack: { amount: 450, priceCents: 199, label: "450 g" }, shelfLifeDays: 7, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["krieltjes", "kriel", "minikriel", "mini krieltjes", "baby aardappeltjes"], exclude: ["salade"], categories: GROENTE },
  },
  {
    id: "zoete_aardappel", name: "Zoete aardappel", aisle: "groente_fruit", unit: "g",
    refPack: { amount: 500, priceCents: 199, label: "500 g" }, shelfLifeDays: 21, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["zoete aardappel", "zoete aardappelen", "bataat"], exclude: ["friet", "frites", "chips", "puree", "wedges"], categories: GROENTE },
  },
  {
    id: "broccoli", name: "Broccoli", aisle: "groente_fruit", unit: "g", gramsPerPiece: 500,
    refPack: { amount: 500, priceCents: 179, label: "500 g" }, shelfLifeDays: 5, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["broccoli", "broccoliroosjes"], exclude: ["soep", "rijst", "salade", "mix"], categories: GROENTE },
  },
  {
    id: "bloemkool", name: "Bloemkool", aisle: "groente_fruit", unit: "stuk", gramsPerPiece: 800,
    refPack: { amount: 1, priceCents: 229, label: "1 stuk" }, shelfLifeDays: 5, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["bloemkool", "bloemkoolroosjes"], exclude: ["rijst", "soep", "gratin", "kaas", "salade", "puree"], categories: GROENTE },
  },
  {
    id: "spinazie", name: "Spinazie", aisle: "groente_fruit", unit: "g", gramsPerPiece: 300,
    refPack: { amount: 300, priceCents: 199, label: "300 g" }, shelfLifeDays: 3, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["spinazie", "verse spinazie", "baby spinazie", "babyspinazie"], exclude: ["crème", "creme", "à la", "a la", "soep", "pizza", "wrap"], categories: GROENTE },
  },
  {
    id: "paprika", name: "Paprika", aisle: "groente_fruit", unit: "stuk", gramsPerPiece: 150,
    refPack: { amount: 3, priceCents: 249, label: "3 stuks" }, shelfLifeDays: 7, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["paprika", "paprika's", "rode paprika", "gele paprika", "groene paprika", "paprika mix", "puntpaprika", "puntpaprika's"], exclude: ["poeder", "chips", "saus", "gegrild", "gegrilde", "spread", "salade", "humus", "hummus", "paprikachips", "aardappel", "aardappeltjes", "wavy", "blends", "friet", "patat"], categories: GROENTE },
  },
  {
    id: "courgette", name: "Courgette", aisle: "groente_fruit", unit: "stuk", gramsPerPiece: 300,
    refPack: { amount: 1, priceCents: 99, label: "1 stuk" }, shelfLifeDays: 7, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["courgette", "courgettes"], exclude: ["spaghetti", "noedels", "soep"], categories: GROENTE },
  },
  {
    id: "champignons", name: "Champignons", aisle: "groente_fruit", unit: "g",
    refPack: { amount: 250, priceCents: 149, label: "250 g" }, shelfLifeDays: 4, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["champignons", "kastanjechampignons", "witte champignons", "champignon"], exclude: ["soep", "saus", "pizza", "roomsaus"], categories: GROENTE },
  },
  {
    id: "prei", name: "Prei", aisle: "groente_fruit", unit: "stuk", gramsPerPiece: 300,
    refPack: { amount: 1, priceCents: 99, label: "1 stuk" }, shelfLifeDays: 7, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["prei", "preien"], exclude: ["soep", "ringen"], categories: GROENTE },
  },
  {
    id: "tomaten", name: "Tomaten", aisle: "groente_fruit", unit: "g",
    refPack: { amount: 500, priceCents: 199, label: "500 g" }, shelfLifeDays: 5, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["tomaten", "trostomaten", "tomaat", "snoeptomaten", "cherrytomaten", "romatomaten", "vleestomaten", "snacktomaten", "cocktailtomaten", "cocktailtrostomaten"], exclude: ["blokjes", "gezeefd", "gezeefde", "passata", "puree", "gedroogd", "gedroogde", "saus", "soep", "ketchup", "frito", "sap", "pastasaus"], categories: GROENTE },
  },
  {
    id: "komkommer", name: "Komkommer", aisle: "groente_fruit", unit: "stuk", gramsPerPiece: 400,
    refPack: { amount: 1, priceCents: 89, label: "1 stuk" }, shelfLifeDays: 7, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["komkommer", "komkommers"], exclude: ["salade", "zuur", "augurk"], categories: GROENTE },
  },
  {
    id: "sla", name: "Sla", aisle: "groente_fruit", unit: "g", gramsPerPiece: 400,
    refPack: { amount: 200, priceCents: 129, label: "zak 200 g" }, shelfLifeDays: 4, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["ijsbergsla", "sla", "slamix", "rucola", "veldsla", "romaine", "kropsla"], exclude: ["salade", "maaltijdsalade"], categories: GROENTE },
  },
  {
    id: "zuurkool", name: "Zuurkool", aisle: "groente_fruit", unit: "g",
    refPack: { amount: 520, priceCents: 109, label: "520 g" }, shelfLifeDays: 30, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["zuurkool", "kruidenzuurkool", "wijnzuurkool"], exclude: ["stamppot", "maaltijd"], categories: GROENTE },
  },
  {
    id: "boerenkool", name: "Boerenkool", aisle: "groente_fruit", unit: "g", gramsPerPiece: 500,
    refPack: { amount: 500, priceCents: 199, label: "500 g" }, shelfLifeDays: 4, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["boerenkool", "gesneden boerenkool"], exclude: ["stamppot", "maaltijd", "chips"], categories: GROENTE },
  },
  {
    id: "andijvie", name: "Andijvie", aisle: "groente_fruit", unit: "g", gramsPerPiece: 400,
    refPack: { amount: 400, priceCents: 179, label: "400 g" }, shelfLifeDays: 4, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["andijvie", "gesneden andijvie"], exclude: ["stamppot", "maaltijd"], categories: GROENTE },
  },
  {
    id: "sperziebonen", name: "Sperziebonen", aisle: "groente_fruit", unit: "g",
    refPack: { amount: 400, priceCents: 249, label: "400 g" }, shelfLifeDays: 4, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["sperziebonen", "haricots verts", "boontjes"], exclude: ["salade", "pot", "glas"], categories: GROENTE },
  },
  {
    id: "spitskool", name: "Spitskool", aisle: "groente_fruit", unit: "stuk", gramsPerPiece: 700,
    refPack: { amount: 1, priceCents: 149, label: "1 stuk" }, shelfLifeDays: 7, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["spitskool"], exclude: ["salade", "maaltijd"], categories: GROENTE },
  },
  {
    id: "wokgroente", name: "Wokgroente", aisle: "groente_fruit", unit: "g",
    refPack: { amount: 400, priceCents: 229, label: "400 g" }, shelfLifeDays: 4, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["wokgroente", "wokgroenten", "roerbakgroente", "roerbakgroenten", "roerbak groente", "wokmix", "roerbakmix"], exclude: ["saus", "kip", "noedels", "maaltijd"], categories: GROENTE },
  },
  {
    id: "nasigroente", name: "Nasi- of bamigroente", aisle: "groente_fruit", unit: "g",
    refPack: { amount: 400, priceCents: 199, label: "400 g" }, shelfLifeDays: 4, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["nasigroente", "nasi groente", "bamigroente", "bami groente", "nasi pakket", "bami pakket", "nasigroenten", "bamigroenten"], exclude: ["kruiden", "mix voor", "saus", "maaltijd"], categories: GROENTE },
  },
  // ── Houdbaar ───────────────────────────────────────────────────────────────────────────
  {
    id: "tomatenblokjes", name: "Tomatenblokjes", aisle: "houdbaar", unit: "g",
    refPack: { amount: 400, priceCents: 79, label: "blik 400 g" }, shelfLifeDays: 365, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["tomatenblokjes", "tomaten in blokjes", "gehakte tomaten", "tomaten blokjes", "gepelde tomaten"], exclude: ["saus", "soep"], categories: HOUDBAAR },
  },
  {
    id: "passata", name: "Passata", aisle: "houdbaar", unit: "g",
    refPack: { amount: 500, priceCents: 129, label: "500 g" }, shelfLifeDays: 365, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["passata", "gezeefde tomaten", "tomaten frito", "tomato frito"], exclude: ["pizza"], categories: HOUDBAAR },
  },
  {
    id: "kokosmelk", name: "Kokosmelk", aisle: "houdbaar", unit: "ml",
    refPack: { amount: 400, priceCents: 179, label: "blik 400 ml" }, shelfLifeDays: 365, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["kokosmelk", "coconut milk", "kokosroom"], exclude: ["drink", "drank", "yoghurt", "ijs"], categories: HOUDBAAR },
  },
  {
    id: "mais", name: "Maïs", aisle: "houdbaar", unit: "g",
    refPack: { amount: 300, priceCents: 99, label: "blik 300 g" }, shelfLifeDays: 365, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["maïs", "mais", "suikermaïs", "suikermais", "maiskorrels", "maïskorrels"], exclude: ["chips", "wafels", "zetmeel", "tortilla", "popcorn", "kolf", "kolven", "mix", "bonen"], categories: [...HOUDBAAR, "groente-fruit"] },
  },
  {
    id: "doperwten", name: "Doperwten", aisle: "diepvries", unit: "g",
    refPack: { amount: 450, priceCents: 159, label: "450 g" }, shelfLifeDays: 180, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["doperwten", "erwten", "doperwtjes", "erwtjes"], exclude: ["soep", "snack", "wasabi", "kikkererwten", "spliterwten"], categories: ["diepvries", "soepen-conserven-sauzen", "groente-fruit"] },
  },
  {
    id: "pasta", name: "Pasta (spaghetti, penne, macaroni)", aisle: "houdbaar", unit: "g",
    refPack: { amount: 500, priceCents: 129, label: "500 g" }, shelfLifeDays: 365, pantry: false,
    allergens: ["gluten"], diet: VEGAN,
    match: { keywords: ["spaghetti", "penne", "macaroni", "fusilli", "farfalle", "tagliatelle", "rigatoni", "pasta", "linguine", "volkoren pasta", "spaghettini"], exclude: ["saus", "mix voor", "salade", "pesto", "lasagne", "maaltijd", "kant-en-klaar", "verse", "gevuld", "gevulde", "ravioli", "tortellini", "sauce", "pastasaus", "kruiden", "bolognese", "snelle", "carbonara", "pesto"], categories: ["pasta-rijst-wereldkeuken"] },
  },
  {
    id: "lasagnebladen", name: "Lasagnebladen", aisle: "houdbaar", unit: "g",
    refPack: { amount: 250, priceCents: 159, label: "250 g" }, shelfLifeDays: 365, pantry: false,
    allergens: ["gluten", "ei"], diet: ANIMAL,
    match: { keywords: ["lasagnebladen", "lasagne bladen", "lasagnevellen"], categories: ["pasta-rijst-wereldkeuken"] },
  },
  {
    id: "rijst", name: "Rijst", aisle: "houdbaar", unit: "g",
    refPack: { amount: 1000, priceCents: 229, label: "1 kg" }, shelfLifeDays: 365, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["rijst", "zilvervliesrijst", "basmatirijst", "basmati", "pandanrijst", "jasmijnrijst", "toverrijst", "witte rijst", "langkorrelrijst"], exclude: ["wafels", "wafel", "pudding", "mix", "crackers", "melk", "drink", "risotto", "sushi", "kant-en-klaar", "magnetron", "rijstpap", "zakjes"], categories: ["pasta-rijst-wereldkeuken"] },
  },
  {
    id: "mie", name: "Mie of noedels", aisle: "houdbaar", unit: "g",
    refPack: { amount: 250, priceCents: 129, label: "250 g" }, shelfLifeDays: 365, pantry: false,
    allergens: ["gluten", "ei"], diet: ANIMAL,
    match: { keywords: ["mie", "eiermie", "mienestjes", "noedels", "udon", "woknoedels", "rijstnoedels", "mihoen"], exclude: ["soep", "mix", "snack", "cup", "kip", "instant", "saus", "maaltijd"], categories: ["pasta-rijst-wereldkeuken"] },
  },
  {
    id: "couscous", name: "Couscous", aisle: "houdbaar", unit: "g",
    refPack: { amount: 500, priceCents: 159, label: "500 g" }, shelfLifeDays: 365, pantry: false,
    allergens: ["gluten"], diet: VEGAN,
    match: { keywords: ["couscous", "parelcouscous"], exclude: ["salade", "maaltijd"], categories: ["pasta-rijst-wereldkeuken"] },
  },
  {
    id: "gnocchi", name: "Gnocchi", aisle: "houdbaar", unit: "g",
    refPack: { amount: 500, priceCents: 199, label: "500 g" }, shelfLifeDays: 60, pantry: false,
    allergens: ["gluten"], diet: VEGAN,
    match: { keywords: ["gnocchi"], exclude: ["gevuld", "gevulde", "maaltijd"], categories: ["pasta-rijst-wereldkeuken", "maaltijden"] },
  },
  {
    id: "wraps", name: "Wraps", aisle: "brood", unit: "stuk", gramsPerPiece: 60,
    refPack: { amount: 8, priceCents: 199, label: "8 stuks" }, shelfLifeDays: 14, pantry: false,
    allergens: ["gluten"], diet: VEGAN,
    match: { keywords: ["wraps", "wrap", "tortilla", "tortillas", "tortilla wraps"], exclude: ["chips", "kip", "maaltijd", "pizza", "pack"], categories: ["brood-bakkerij", "pasta-rijst-wereldkeuken"] },
  },
  {
    id: "stokbrood", name: "Stokbrood", aisle: "brood", unit: "stuk", gramsPerPiece: 250,
    refPack: { amount: 1, priceCents: 129, label: "1 stuk" }, shelfLifeDays: 2, pantry: false,
    allergens: ["gluten"], diet: VEGAN,
    match: { keywords: ["stokbrood", "stokbroden", "baguette", "afbakstokbrood", "afbak stokbrood"], exclude: ["kruidenboter", "pizza", "knoflook", "kaas"], categories: ["brood-bakkerij"] },
  },
  {
    id: "pesto", name: "Pesto", aisle: "houdbaar", unit: "g",
    refPack: { amount: 190, priceCents: 229, label: "pot 190 g" }, shelfLifeDays: 60, pantry: false,
    allergens: ["melk", "noten"], diet: ANIMAL,
    match: { keywords: ["pesto", "pesto genovese", "groene pesto", "rode pesto", "pesto rosso"], exclude: ["chips", "dip", "brood", "kaas"], categories: HOUDBAAR },
  },
  {
    id: "currypasta", name: "Currypasta", aisle: "houdbaar", unit: "g",
    refPack: { amount: 100, priceCents: 229, label: "pot 100 g" }, shelfLifeDays: 90, pantry: false,
    allergens: [], diet: VEGAN,
    match: { keywords: ["currypasta", "curry pasta", "rode currypasta", "groene currypasta", "gele currypasta"], exclude: ["saus"], categories: HOUDBAAR },
  },
  // ── Basisvoorraad (niet meegerekend) ──────────────────────────────────────────────────
  pantry("olie", "Olie of olijfolie"),
  pantry("roomboter", "Roomboter", ["melk"], ANIMAL),
  pantry("zout_peper", "Zout en peper"),
  pantry("knoflook", "Knoflook"),
  pantry("bloem", "Bloem", ["gluten"]),
  pantry("bouillon", "Bouillonblokje"),
  pantry("kerrie", "Kerriepoeder"),
  pantry("paprikapoeder", "Paprikapoeder"),
  pantry("italiaanse_kruiden", "Italiaanse kruiden"),
  pantry("nootmuskaat", "Nootmuskaat"),
  pantry("ketjap", "Ketjap", ["soja", "gluten"]),
  pantry("sojasaus", "Sojasaus", ["soja", "gluten"]),
  pantry("tomatenpuree", "Tomatenpuree"),
  pantry("mosterd", "Mosterd"),
  pantry("komijn", "Komijn"),
  pantry("chilipoeder", "Chilipoeder"),
];

const BY_ID = new Map(INGREDIENTS.map((i) => [i.id, i]));

export function getIngredient(id: string): Ingredient {
  const ingredient = BY_ID.get(id);
  if (!ingredient) throw new Error(`Unknown ingredient: ${id}`);
  return ingredient;
}

export function hasIngredient(id: string): boolean {
  return BY_ID.has(id);
}
