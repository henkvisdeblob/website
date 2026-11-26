import "server-only";
import Stripe from "stripe";
import { accountsEnabled } from "@/lib/auth/session";
import type { PlanInterval } from "./checkout";

export type BillingConfig = {
  secretKey: string;
  webhookSecret: string;
  prices: Record<PlanInterval, string>;
  /** Test keys (sk_test_…) never move real money. Live keys require a KvK registration first (docs/09). */
  testMode: boolean;
};

export function getBillingConfig(): BillingConfig | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const month = process.env.STRIPE_PRICE_MONTHLY;
  const year = process.env.STRIPE_PRICE_YEARLY;
  if (!secretKey || !webhookSecret || !month || !year) return null;
  return { secretKey, webhookSecret, prices: { month, year }, testMode: !/^(sk|rk)_live_/.test(secretKey) };
}

/**
 * Premium can only be bought when both accounts (Supabase) and Stripe are configured. Without them the
 * site behaves as before: the planner is free for everyone and no Premium limits apply.
 */
export function billingEnabled(): boolean {
  return accountsEnabled() && getBillingConfig() !== null;
}

let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  const config = getBillingConfig();
  if (!config) return null;
  client ??= new Stripe(config.secretKey, { appInfo: { name: "Potje" }, ...testApiOverride(config) });
  return client;
}

/**
 * Local end-to-end tests only: STRIPE_API_BASE_FOR_TESTS points the SDK at a mock API. Ignored with
 * live keys, so it can never redirect real payments.
 */
function testApiOverride(config: BillingConfig): Pick<Stripe.StripeConfig, "host" | "port" | "protocol"> {
  const base = process.env.STRIPE_API_BASE_FOR_TESTS;
  if (!base || !config.testMode) return {};
  const url = new URL(base);
  return { host: url.hostname, port: Number(url.port || (url.protocol === "https:" ? 443 : 80)), protocol: url.protocol === "https:" ? "https" : "http" };
}
