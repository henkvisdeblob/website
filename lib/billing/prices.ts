import "server-only";
import { cacheLife } from "next/cache";
import type { PlanInterval } from "./checkout";
import { getBillingConfig, getStripe } from "./stripe";

export type PlanPrices = Record<PlanInterval, { amountCents: number }>;

/**
 * Prices as Stripe charges them, so the page always shows exactly what people pay. The Stripe prices
 * must be the consumer price including 21% btw (docs/09). Cached for an hour.
 */
export async function getPlanPrices(): Promise<PlanPrices | null> {
  "use cache";
  cacheLife("hours");
  const stripe = getStripe();
  const config = getBillingConfig();
  if (!stripe || !config) return null;
  const [month, year] = await Promise.all([
    stripe.prices.retrieve(config.prices.month),
    stripe.prices.retrieve(config.prices.year),
  ]);
  if (month.currency !== "eur" || year.currency !== "eur" || month.unit_amount === null || year.unit_amount === null) {
    console.error("[billing] the Stripe prices must be fixed amounts in euros");
    return null;
  }
  return { month: { amountCents: month.unit_amount }, year: { amountCents: year.unit_amount } };
}
