import type Stripe from "stripe";

/*
 * Processing of verified Stripe webhook events (docs/07 "Stripe-koppeling").
 * - Stripe is the source of truth: on every subscription event we fetch the current subscription
 *   from Stripe instead of trusting the event payload, because events can arrive out of order.
 * - Idempotent: syncing state can safely run twice; side effects (emails) run only for the delivery
 *   that records the event first.
 * The signature is checked in the route handler before this runs.
 */

export type SubscriptionRow = {
  id: string;
  userId: string;
  status: string;
  priceId: string;
  interval: "month" | "year";
  startedAt: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
};

export interface BillingStore {
  isEventProcessed(eventId: string): Promise<boolean>;
  /** Records the event. Returns false when another delivery of the same event recorded it first. */
  recordEvent(eventId: string, type: string): Promise<boolean>;
  linkCustomer(userId: string, customerId: string): Promise<void>;
  userIdForCustomer(customerId: string): Promise<string | null>;
  /** Inserts or updates the mirror row. Never touches `withdrawn_at`. */
  upsertSubscription(row: SubscriptionRow): Promise<void>;
}

export type BillingNotice =
  | { kind: "started"; interval: "month" | "year" }
  | { kind: "cancel_scheduled"; endsAt: string }
  | { kind: "payment_failed" };

export type WebhookDeps = {
  store: BillingStore;
  retrieveSubscription(id: string): Promise<Stripe.Subscription>;
  notify(userId: string, notice: BillingNotice): Promise<void>;
};

export type WebhookOutcome = "processed" | "duplicate" | "ignored";

const fromUnix = (seconds: number) => new Date(seconds * 1000).toISOString();

const isPlanInterval = (value: unknown): value is "month" | "year" => value === "month" || value === "year";

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/** Maps a Stripe subscription to our mirror row; null when it isn't one of our monthly/yearly plans. */
export function toSubscriptionRow(subscription: Stripe.Subscription, userId: string): SubscriptionRow | null {
  const item = subscription.items.data[0];
  const interval = item?.price.recurring?.interval;
  if (!item || !isPlanInterval(interval)) return null;
  return {
    id: subscription.id,
    userId,
    status: subscription.status,
    priceId: item.price.id,
    interval,
    startedAt: fromUnix(subscription.start_date),
    currentPeriodEnd: fromUnix(item.current_period_end),
    // Cancelling in the Customer Portal can set `cancel_at` instead of `cancel_at_period_end`.
    cancelAtPeriodEnd: subscription.cancel_at_period_end || subscription.cancel_at !== null,
  };
}

async function syncSubscription(
  subscriptionId: string,
  deps: WebhookDeps,
  knownUserId: string | null = null,
): Promise<SubscriptionRow | null> {
  const subscription = await deps.retrieveSubscription(subscriptionId);
  const userId =
    knownUserId ??
    subscription.metadata?.user_id ??
    (await deps.store.userIdForCustomer(idOf(subscription.customer) ?? ""));
  if (!userId) {
    console.warn(`[billing] subscription ${subscription.id} has no known user`);
    return null;
  }
  const row = toSubscriptionRow(subscription, userId);
  if (row) await deps.store.upsertSubscription(row);
  return row;
}

/** True when this update switched the subscription to "ends at the end of the period". */
function cancellationWasScheduled(event: Stripe.CustomerSubscriptionUpdatedEvent, row: SubscriptionRow): boolean {
  const previous = event.data.previous_attributes ?? {};
  const flagChanged = "cancel_at_period_end" in previous || "cancel_at" in previous;
  const wasScheduled = previous.cancel_at_period_end === true || (previous.cancel_at ?? null) !== null;
  return flagChanged && !wasScheduled && row.cancelAtPeriodEnd;
}

export async function handleStripeEvent(event: Stripe.Event, deps: WebhookDeps): Promise<WebhookOutcome> {
  if (await deps.store.isEventProcessed(event.id)) return "duplicate";

  let notice: { userId: string; notice: BillingNotice } | null = null;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode !== "subscription") return "ignored";
      const userId = session.client_reference_id;
      const customerId = idOf(session.customer);
      if (userId && customerId) await deps.store.linkCustomer(userId, customerId);
      const subscriptionId = idOf(session.subscription);
      const row = subscriptionId ? await syncSubscription(subscriptionId, deps, userId) : null;
      if (row) notice = { userId: row.userId, notice: { kind: "started", interval: row.interval } };
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object.id, deps);
      break;
    case "customer.subscription.updated": {
      const row = await syncSubscription(event.data.object.id, deps);
      if (row && cancellationWasScheduled(event, row)) {
        notice = { userId: row.userId, notice: { kind: "cancel_scheduled", endsAt: row.currentPeriodEnd } };
      }
      break;
    }
    case "invoice.payment_failed": {
      const customerId = idOf(event.data.object.customer);
      const userId = customerId ? await deps.store.userIdForCustomer(customerId) : null;
      if (userId) notice = { userId, notice: { kind: "payment_failed" } };
      break;
    }
    default:
      return "ignored";
  }

  const first = await deps.store.recordEvent(event.id, event.type);
  if (!first) return "duplicate";
  if (notice) {
    // The event is recorded, so a failing email must not make Stripe retry the whole event.
    try {
      await deps.notify(notice.userId, notice.notice);
    } catch (error) {
      console.error(`[billing] notification for ${event.id} failed`, error);
    }
  }
  return "processed";
}
