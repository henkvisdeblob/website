import type Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import {
  canCancel,
  canResume,
  canWithdraw,
  isPremium,
  premiumAccess,
  withdrawalLastDay,
  type SubscriptionState,
} from "@/lib/billing/entitlements";
import { handleStripeEvent, toSubscriptionRow, type BillingNotice, type BillingStore, type SubscriptionRow } from "@/lib/billing/webhook";

const sub = (partial: Partial<SubscriptionState> = {}): SubscriptionState => ({
  status: "active",
  startedAt: "2026-11-20T10:00:00Z",
  currentPeriodEnd: "2026-12-20T10:00:00Z",
  cancelAtPeriodEnd: false,
  withdrawnAt: null,
  ...partial,
});

describe("premium access", () => {
  const now = new Date("2026-11-26T12:00:00Z");

  it("is off without a trial or subscription", () => {
    expect(isPremium(null, null, now)).toBe(false);
    expect(isPremium({ premiumTrialUntil: null }, null, now)).toBe(false);
  });

  it("is on during the 14-day trial and off after it", () => {
    expect(premiumAccess({ premiumTrialUntil: "2026-12-01T00:00:00Z" }, null, now)).toEqual({
      premium: true,
      via: "trial",
      until: "2026-12-01T00:00:00Z",
    });
    expect(isPremium({ premiumTrialUntil: "2026-11-26T11:59:59Z" }, null, now)).toBe(false);
  });

  it("is on for an active subscription and says whether it renews", () => {
    expect(premiumAccess(null, sub(), now)).toMatchObject({ premium: true, via: "subscription", renews: true });
    expect(premiumAccess(null, sub({ cancelAtPeriodEnd: true }), now)).toMatchObject({ renews: false });
  });

  it("keeps Premium for 7 days after a failed payment, then stops", () => {
    const pastDue = sub({ status: "past_due", currentPeriodEnd: "2026-11-22T12:00:00Z" });
    expect(premiumAccess(null, pastDue, now)).toMatchObject({ premium: true, via: "grace", until: "2026-11-29T12:00:00.000Z" });
    expect(isPremium(null, pastDue, new Date("2026-11-29T12:00:01Z"))).toBe(false);
  });

  it("is off when the subscription is cancelled, unpaid or withdrawn", () => {
    expect(isPremium(null, sub({ status: "canceled" }), now)).toBe(false);
    expect(isPremium(null, sub({ status: "unpaid" }), now)).toBe(false);
    expect(isPremium(null, sub({ withdrawnAt: "2026-11-25T09:00:00Z" }), now)).toBe(false);
  });

  it("falls back to the trial when the subscription no longer gives access", () => {
    expect(premiumAccess({ premiumTrialUntil: "2026-12-01T00:00:00Z" }, sub({ status: "canceled" }), now)).toMatchObject({
      via: "trial",
    });
  });
});

describe("withdrawal and cancellation", () => {
  it("allows withdrawal up to and including the 14th day after the start (Amsterdam dates)", () => {
    // Started on 20 November (Amsterdam), so the last day is 4 December.
    const s = sub({ startedAt: "2026-11-20T10:00:00Z" });
    expect(withdrawalLastDay(s)).toBe("2026-12-04");
    expect(canWithdraw(s, new Date("2026-12-04T22:59:00Z"))).toBe(true); // 23:59 in Amsterdam
    expect(canWithdraw(s, new Date("2026-12-04T23:00:00Z"))).toBe(false); // 5 December, 00:00
  });

  it("uses the Amsterdam date of the start, not UTC", () => {
    // 23:30 UTC on 19 November is already 20 November in Amsterdam.
    expect(withdrawalLastDay(sub({ startedAt: "2026-11-19T23:30:00Z" }))).toBe("2026-12-04");
  });

  it("does not allow withdrawing twice or after the subscription ended", () => {
    const now = new Date("2026-11-26T12:00:00Z");
    expect(canWithdraw(sub({ withdrawnAt: "2026-11-21T10:00:00Z" }), now)).toBe(false);
    expect(canWithdraw(sub({ status: "canceled" }), now)).toBe(false);
    expect(canWithdraw(null, now)).toBe(false);
  });

  it("offers cancel while running and resume after cancelling", () => {
    expect(canCancel(sub())).toBe(true);
    expect(canResume(sub())).toBe(false);
    expect(canCancel(sub({ cancelAtPeriodEnd: true }))).toBe(false);
    expect(canResume(sub({ cancelAtPeriodEnd: true }))).toBe(true);
    expect(canCancel(sub({ status: "canceled" }))).toBe(false);
  });
});

/* ---------------------------------------------------------------------------------------- */
/* Webhook processing                                                                      */
/* ---------------------------------------------------------------------------------------- */

const T = (iso: string) => Math.floor(Date.parse(iso) / 1000);

function stripeSubscription(partial: {
  id?: string;
  status?: string;
  interval?: string;
  cancelAtPeriodEnd?: boolean;
  cancelAt?: number | null;
  userId?: string;
  customer?: string;
} = {}): Stripe.Subscription {
  return {
    id: partial.id ?? "sub_1",
    object: "subscription",
    status: partial.status ?? "active",
    customer: partial.customer ?? "cus_1",
    start_date: T("2026-11-20T10:00:00Z"),
    cancel_at_period_end: partial.cancelAtPeriodEnd ?? false,
    cancel_at: partial.cancelAt ?? null,
    metadata: partial.userId ? { user_id: partial.userId } : {},
    items: {
      object: "list",
      data: [
        {
          id: "si_1",
          current_period_end: T("2026-12-20T10:00:00Z"),
          price: { id: "price_month", recurring: { interval: partial.interval ?? "month" } },
        },
      ],
    },
  } as unknown as Stripe.Subscription;
}

function event(type: string, object: unknown, extra: Record<string, unknown> = {}, id = `evt_${Math.random()}`) {
  return { id, type, data: { object, ...extra } } as unknown as Stripe.Event;
}

class MemoryBillingStore implements BillingStore {
  events = new Set<string>();
  customers = new Map<string, string>(); // customerId -> userId
  rows = new Map<string, SubscriptionRow>();
  async isEventProcessed(id: string) {
    return this.events.has(id);
  }
  async recordEvent(id: string) {
    if (this.events.has(id)) return false;
    this.events.add(id);
    return true;
  }
  async linkCustomer(userId: string, customerId: string) {
    this.customers.set(customerId, userId);
  }
  async userIdForCustomer(customerId: string) {
    return this.customers.get(customerId) ?? null;
  }
  async upsertSubscription(row: SubscriptionRow) {
    this.rows.set(row.id, row);
  }
}

function setup(current: Stripe.Subscription) {
  const store = new MemoryBillingStore();
  const notices: { userId: string; notice: BillingNotice }[] = [];
  const retrieveSubscription = vi.fn(async () => current);
  const deps = {
    store,
    retrieveSubscription,
    notify: async (userId: string, notice: BillingNotice) => {
      notices.push({ userId, notice });
    },
  };
  return { store, notices, deps, retrieveSubscription };
}

describe("toSubscriptionRow", () => {
  it("reads the period end from the subscription item and maps timestamps", () => {
    expect(toSubscriptionRow(stripeSubscription(), "user_1")).toEqual({
      id: "sub_1",
      userId: "user_1",
      status: "active",
      priceId: "price_month",
      interval: "month",
      startedAt: "2026-11-20T10:00:00.000Z",
      currentPeriodEnd: "2026-12-20T10:00:00.000Z",
      cancelAtPeriodEnd: false,
    });
  });

  it("treats a cancel_at date as cancelling at the end of the period", () => {
    expect(toSubscriptionRow(stripeSubscription({ cancelAt: T("2026-12-20T10:00:00Z") }), "u")?.cancelAtPeriodEnd).toBe(true);
  });

  it("ignores plans that are not monthly or yearly", () => {
    expect(toSubscriptionRow(stripeSubscription({ interval: "week" }), "u")).toBeNull();
  });
});

describe("handleStripeEvent", () => {
  it("links the customer, stores the subscription and sends one welcome notice after checkout", async () => {
    const { store, notices, deps } = setup(stripeSubscription());
    const completed = event("checkout.session.completed", {
      mode: "subscription",
      client_reference_id: "user_1",
      customer: "cus_1",
      subscription: "sub_1",
    });
    expect(await handleStripeEvent(completed, deps)).toBe("processed");
    expect(store.customers.get("cus_1")).toBe("user_1");
    expect(store.rows.get("sub_1")).toMatchObject({ userId: "user_1", status: "active" });
    expect(notices).toEqual([{ userId: "user_1", notice: { kind: "started", interval: "month" } }]);
  });

  it("processes a redelivered event only once", async () => {
    const { notices, deps } = setup(stripeSubscription());
    const completed = event(
      "checkout.session.completed",
      { mode: "subscription", client_reference_id: "user_1", customer: "cus_1", subscription: "sub_1" },
      {},
      "evt_same",
    );
    expect(await handleStripeEvent(completed, deps)).toBe("processed");
    expect(await handleStripeEvent(completed, deps)).toBe("duplicate");
    expect(notices).toHaveLength(1);
  });

  it("syncs from Stripe instead of trusting the (possibly outdated) event payload", async () => {
    const { store, deps, retrieveSubscription } = setup(stripeSubscription({ status: "past_due", userId: "user_1" }));
    await handleStripeEvent(event("customer.subscription.updated", stripeSubscription({ status: "active" })), deps);
    expect(retrieveSubscription).toHaveBeenCalledWith("sub_1");
    expect(store.rows.get("sub_1")?.status).toBe("past_due");
  });

  it("finds the user through the subscription metadata, even before checkout completed", async () => {
    const { store, deps } = setup(stripeSubscription({ userId: "user_1" }));
    await handleStripeEvent(event("customer.subscription.created", stripeSubscription()), deps);
    expect(store.rows.get("sub_1")?.userId).toBe("user_1");
  });

  it("sends a confirmation when a cancellation is scheduled, wherever it was done", async () => {
    const { notices, deps } = setup(stripeSubscription({ userId: "user_1", cancelAtPeriodEnd: true }));
    await handleStripeEvent(
      event("customer.subscription.updated", stripeSubscription(), { previous_attributes: { cancel_at_period_end: false } }),
      deps,
    );
    expect(notices).toEqual([
      { userId: "user_1", notice: { kind: "cancel_scheduled", endsAt: "2026-12-20T10:00:00.000Z" } },
    ]);
  });

  it("sends no cancellation notice for other updates", async () => {
    const { notices, deps } = setup(stripeSubscription({ userId: "user_1", cancelAtPeriodEnd: true }));
    await handleStripeEvent(
      event("customer.subscription.updated", stripeSubscription(), { previous_attributes: { status: "past_due" } }),
      deps,
    );
    expect(notices).toEqual([]);
  });

  it("marks a deleted subscription as cancelled", async () => {
    const { store, deps } = setup(stripeSubscription({ userId: "user_1", status: "canceled" }));
    await handleStripeEvent(event("customer.subscription.deleted", stripeSubscription()), deps);
    expect(store.rows.get("sub_1")?.status).toBe("canceled");
  });

  it("notifies the customer about a failed payment", async () => {
    const { store, notices, deps } = setup(stripeSubscription());
    await store.linkCustomer("user_1", "cus_1");
    await handleStripeEvent(event("invoice.payment_failed", { customer: "cus_1" }), deps);
    expect(notices).toEqual([{ userId: "user_1", notice: { kind: "payment_failed" } }]);
  });

  it("ignores events it does not handle and one-off payments", async () => {
    const { store, deps } = setup(stripeSubscription());
    expect(await handleStripeEvent(event("charge.succeeded", {}), deps)).toBe("ignored");
    expect(await handleStripeEvent(event("checkout.session.completed", { mode: "payment" }), deps)).toBe("ignored");
    expect(store.events.size).toBe(0);
  });

  it("does not ask Stripe to retry when only the email fails", async () => {
    const { deps } = setup(stripeSubscription());
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    deps.notify = async () => {
      throw new Error("mail down");
    };
    const completed = event("checkout.session.completed", {
      mode: "subscription",
      client_reference_id: "user_1",
      customer: "cus_1",
      subscription: "sub_1",
    });
    expect(await handleStripeEvent(completed, deps)).toBe("processed");
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
