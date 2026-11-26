import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlanInterval } from "./checkout";
import { isRunning, type SubscriptionState, type TrialState } from "./entitlements";
import type { BillingStore, SubscriptionRow } from "./webhook";

type SubscriptionDbRow = {
  id: string;
  user_id: string;
  status: string;
  price_id: string;
  interval: PlanInterval;
  started_at: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  withdrawn_at: string | null;
};

/** Writes the Stripe mirror. Needs the admin (secret key) client: users can only read these tables. */
export class SupabaseBillingStore implements BillingStore {
  constructor(private db: SupabaseClient) {}

  async isEventProcessed(eventId: string) {
    const { data, error } = await this.db.from("stripe_events").select("id").eq("id", eventId).maybeSingle();
    if (error) throw error;
    return data !== null;
  }

  async recordEvent(eventId: string, type: string) {
    const { data, error } = await this.db
      .from("stripe_events")
      .upsert({ id: eventId, type }, { onConflict: "id", ignoreDuplicates: true })
      .select("id");
    if (error) throw error;
    return (data ?? []).length === 1;
  }

  async linkCustomer(userId: string, customerId: string) {
    const { error } = await this.db.from("profiles").update({ stripe_customer_id: customerId }).eq("id", userId);
    if (error) throw error;
  }

  async userIdForCustomer(customerId: string) {
    if (!customerId) return null;
    const { data, error } = await this.db
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (error) throw error;
    return (data?.id as string | undefined) ?? null;
  }

  async upsertSubscription(row: SubscriptionRow) {
    const { error } = await this.db.from("subscriptions").upsert(
      {
        id: row.id,
        user_id: row.userId,
        status: row.status,
        price_id: row.priceId,
        interval: row.interval,
        started_at: row.startedAt,
        current_period_end: row.currentPeriodEnd,
        cancel_at_period_end: row.cancelAtPeriodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) throw error;
  }

  async markWithdrawn(subscriptionId: string, at: Date) {
    const { error } = await this.db
      .from("subscriptions")
      .update({ withdrawn_at: at.toISOString(), updated_at: new Date().toISOString() })
      .eq("id", subscriptionId);
    if (error) throw error;
  }
}

export type CurrentSubscription = SubscriptionState & { id: string; interval: PlanInterval };

export type AccountBilling = {
  trial: TrialState;
  customerId: string | null;
  subscription: CurrentSubscription | null;
};

/** The subscription that matters for a user: a running one if any, otherwise the most recent. */
export function pickCurrentSubscription(rows: CurrentSubscription[]): CurrentSubscription | null {
  const sorted = [...rows].sort((a, b) => Date.parse(b.currentPeriodEnd) - Date.parse(a.currentPeriodEnd));
  return sorted.find((s) => isRunning(s)) ?? sorted[0] ?? null;
}

/**
 * Billing state of one user. Works with the visitor's own client (Row Level Security: own rows only)
 * and with the admin client.
 */
export async function getAccountBilling(db: SupabaseClient, userId: string): Promise<AccountBilling | null> {
  const [profile, subscriptions] = await Promise.all([
    db.from("profiles").select("premium_trial_until, stripe_customer_id").eq("id", userId).maybeSingle(),
    db.from("subscriptions").select("*").eq("user_id", userId),
  ]);
  if (profile.error) throw profile.error;
  if (subscriptions.error) throw subscriptions.error;
  if (!profile.data) return null;

  const rows = ((subscriptions.data ?? []) as SubscriptionDbRow[]).map(
    (r): CurrentSubscription => ({
      id: r.id,
      interval: r.interval,
      status: r.status,
      startedAt: r.started_at,
      currentPeriodEnd: r.current_period_end,
      cancelAtPeriodEnd: r.cancel_at_period_end,
      withdrawnAt: r.withdrawn_at,
    }),
  );
  return {
    trial: { premiumTrialUntil: (profile.data.premium_trial_until as string | null) ?? null },
    customerId: (profile.data.stripe_customer_id as string | null) ?? null,
    subscription: pickCurrentSubscription(rows),
  };
}
