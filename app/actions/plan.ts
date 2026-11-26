"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { INGREDIENTS } from "@/lib/catalog/ingredients";
import { RECIPES } from "@/lib/catalog/recipes";
import { STORES, getStore } from "@/lib/catalog/stores";
import type { Allergen, StoreId } from "@/lib/catalog/types";
import { addDays, todayInAmsterdam } from "@/lib/dates";
import { getStoreDeals } from "@/lib/deals/live";
import { buildOffers } from "@/lib/deals/offers";
import { planWeek, type ChildAge, type PlanResult } from "@/lib/planner";
import { createRateLimiter } from "@/lib/server/rate-limit";
import { currentVisitorIsPremium } from "@/lib/billing/access";
import { FREE_DINNER_LIMIT } from "@/lib/billing/limits";
import { billingEnabled } from "@/lib/billing/stripe";

const ALLERGENS = ["gluten", "melk", "ei", "vis", "schaaldieren", "soja", "noten"] as const;

const planFormSchema = z.object({
  store: z.enum(STORES.map((s) => s.id) as [StoreId, ...StoreId[]]),
  adults: z.coerce.number().int().min(1).max(6),
  kidsYoung: z.coerce.number().int().min(0).max(6),
  kidsOld: z.coerce.number().int().min(0).max(6),
  dinners: z.coerce.number().int().min(3).max(7),
  budgetEuro: z.preprocess((v) => (v === "" || v === null ? undefined : v), z.coerce.number().min(0).max(1000).optional()),
  diet: z.enum(["none", "vegetarian", "vegan", "no_pork", "halal"]),
  allergens: z.array(z.enum(ALLERGENS)).default([]),
  maxMinutes: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().int().min(15).max(120).optional()),
  dayOffset: z.coerce.number().int().min(0).max(6),
  variant: z.coerce.number().int().min(0).max(1000).default(0),
});

export type PlanState =
  | { status: "idle" }
  | { status: "error"; message: string; upgrade?: boolean }
  | { status: "ok"; plan: PlanResult; storeName: string; dataSource: "prijsprofeet" | "sample" | "none"; variant: number };

const limiter = createRateLimiter({ limit: Number(process.env.PLAN_RATE_LIMIT ?? 60), windowMs: 10 * 60 * 1000 });

export async function planWeekAction(_prev: PlanState, formData: FormData): Promise<PlanState> {
  const parsed = planFormSchema.safeParse({
    store: formData.get("store"),
    adults: formData.get("adults"),
    kidsYoung: formData.get("kidsYoung"),
    kidsOld: formData.get("kidsOld"),
    dinners: formData.get("dinners"),
    budgetEuro: formData.get("budgetEuro"),
    diet: formData.get("diet"),
    allergens: formData.getAll("allergens"),
    maxMinutes: formData.get("maxMinutes"),
    dayOffset: formData.get("dayOffset"),
    variant: formData.get("variant") ?? 0,
  });
  if (!parsed.success) {
    return { status: "error", message: "Er klopt iets niet in het formulier. Controleer de velden en probeer het opnieuw." };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter(ip)) {
    return { status: "error", message: "Je hebt al heel wat menu's gemaakt. Wacht een paar minuten en probeer het opnieuw." };
  }

  const input = parsed.data;
  const now = new Date();
  // Premium limit, checked on the server. Only while Premium can actually be bought; otherwise all free.
  if (input.dinners > FREE_DINNER_LIMIT && billingEnabled() && !(await currentVisitorIsPremium(now))) {
    return {
      status: "error",
      upgrade: true,
      message: `Met Gratis maak je een menu voor ${FREE_DINNER_LIMIT} avonden. Voor 4 tot 7 avonden heb je Premium nodig; een nieuw account krijgt 14 dagen Premium gratis.`,
    };
  }
  const store = getStore(input.store)!;
  const today = todayInAmsterdam(now);
  const shopDate = addDays(today, input.dayOffset);

  let dataSource: "prijsprofeet" | "sample" | "none" = "none";
  let offers: ReturnType<typeof buildOffers> = [];
  try {
    const result = await getStoreDeals(store.id, today);
    if (!result.failed) {
      dataSource = result.source;
      offers = buildOffers(result.deals, INGREDIENTS);
    }
  } catch (error) {
    console.error("[plan] could not load deals", error);
  }

  const children: ChildAge[] = [
    ...Array<ChildAge>(input.kidsYoung).fill("4-8"),
    ...Array<ChildAge>(input.kidsOld).fill("9-13"),
  ];

  const plan = planWeek(
    {
      household: { adults: input.adults, children },
      dinners: input.dinners,
      budgetCents: input.budgetEuro !== undefined ? Math.round(input.budgetEuro * 100) : null,
      storeId: store.id,
      shopDate,
      diet: input.diet,
      allergens: input.allergens as Allergen[],
      excludedIngredientIds: [],
      maxCookMinutes: input.maxMinutes ?? null,
      seed: `${shopDate}:${store.id}:${input.variant}`,
    },
    { ingredients: INGREDIENTS, recipes: RECIPES, offers, priceFactor: store.priceFactor },
  );

  return { status: "ok", plan, storeName: store.name, dataSource, variant: input.variant };
}
