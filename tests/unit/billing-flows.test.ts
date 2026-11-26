import { describe, expect, it, vi } from "vitest";
import { safeNextPath } from "@/lib/auth/redirect";
import { checkoutSessionParams } from "@/lib/billing/checkout";
import { pickCurrentSubscription, type CurrentSubscription } from "@/lib/billing/store";
import { withdrawSubscription, type WithdrawDeps } from "@/lib/billing/withdraw";

describe("checkoutSessionParams", () => {
  const base = { userId: "user_1", email: "sanne@voorbeeld.nl", priceId: "price_month", siteUrl: "https://potje.nl" };

  it("creates a Dutch subscription checkout linked to the user", () => {
    const params = checkoutSessionParams({ ...base, customerId: null });
    expect(params).toMatchObject({
      mode: "subscription",
      line_items: [{ price: "price_month", quantity: 1 }],
      client_reference_id: "user_1",
      customer_email: "sanne@voorbeeld.nl",
      subscription_data: { metadata: { user_id: "user_1" } },
      locale: "nl",
      success_url: "https://potje.nl/account/abonnement?gestart=1",
      cancel_url: "https://potje.nl/account/abonnement",
    });
    expect(params.customer).toBeUndefined();
  });

  it("reuses an existing Stripe customer instead of the email address", () => {
    const params = checkoutSessionParams({ ...base, customerId: "cus_1" });
    expect(params.customer).toBe("cus_1");
    expect(params.customer_email).toBeUndefined();
  });

  it("mentions renewal, cancelling and the withdrawal right above the pay button", () => {
    const submit = checkoutSessionParams({ ...base, customerId: null }).custom_text?.submit;
    const message = submit && typeof submit === "object" ? submit.message : "";
    expect(message).toMatch(/automatisch verlengd/);
    expect(message).toMatch(/[Oo]pzeggen/);
    expect(message).toMatch(/14 dagen/);
  });
});

describe("withdrawSubscription", () => {
  function deps(overrides: Partial<WithdrawDeps> = {}) {
    const calls: string[] = [];
    const d: WithdrawDeps = {
      paidPaymentIntents: async () => ["pi_1"],
      refund: vi.fn(async (pi: string, key: string) => {
        calls.push(`refund ${pi} ${key}`);
        return { amountCents: 399 };
      }),
      cancelNow: vi.fn(async (id: string, key: string) => {
        calls.push(`cancel ${id} ${key}`);
      }),
      markWithdrawn: vi.fn(async (id: string) => {
        calls.push(`mark ${id}`);
      }),
      ...overrides,
    };
    return { d, calls };
  }

  it("refunds what was paid, then cancels, then records the withdrawal", async () => {
    const { d, calls } = deps();
    const result = await withdrawSubscription("sub_1", new Date("2026-11-26T12:00:00Z"), d);
    expect(result).toEqual({ refundedCents: 399 });
    expect(calls).toEqual([
      "refund pi_1 withdraw-refund:sub_1:pi_1",
      "cancel sub_1 withdraw-cancel:sub_1",
      "mark sub_1",
    ]);
  });

  it("uses the same idempotency keys on a retry, so nothing is refunded twice", async () => {
    const first = deps();
    const second = deps();
    await withdrawSubscription("sub_1", new Date(), first.d);
    await withdrawSubscription("sub_1", new Date(), second.d);
    expect(second.calls).toEqual(first.calls);
  });

  it("does not cancel or record anything when the refund fails", async () => {
    const { d } = deps({
      refund: async () => {
        throw new Error("refund failed");
      },
    });
    await expect(withdrawSubscription("sub_1", new Date(), d)).rejects.toThrow("refund failed");
    expect(d.cancelNow).not.toHaveBeenCalled();
    expect(d.markWithdrawn).not.toHaveBeenCalled();
  });

  it("still cancels when nothing was paid yet", async () => {
    const { d } = deps({ paidPaymentIntents: async () => [] });
    expect(await withdrawSubscription("sub_1", new Date(), d)).toEqual({ refundedCents: 0 });
    expect(d.cancelNow).toHaveBeenCalled();
  });
});

describe("pickCurrentSubscription", () => {
  const row = (partial: Partial<CurrentSubscription>): CurrentSubscription => ({
    id: "sub",
    interval: "month",
    status: "active",
    startedAt: "2026-01-01T00:00:00Z",
    currentPeriodEnd: "2026-02-01T00:00:00Z",
    cancelAtPeriodEnd: false,
    withdrawnAt: null,
    ...partial,
  });

  it("prefers a running subscription over a newer ended one", () => {
    const running = row({ id: "running", currentPeriodEnd: "2026-12-01T00:00:00Z" });
    const ended = row({ id: "ended", status: "canceled", currentPeriodEnd: "2027-01-01T00:00:00Z" });
    expect(pickCurrentSubscription([ended, running])?.id).toBe("running");
  });

  it("falls back to the most recent one, or null", () => {
    const old = row({ id: "old", status: "canceled", currentPeriodEnd: "2026-01-01T00:00:00Z" });
    const recent = row({ id: "recent", status: "canceled", currentPeriodEnd: "2026-06-01T00:00:00Z" });
    expect(pickCurrentSubscription([old, recent])?.id).toBe("recent");
    expect(pickCurrentSubscription([])).toBeNull();
  });
});

describe("safeNextPath", () => {
  it.each([
    ["/account/abonnement", "/account/abonnement"],
    ["/weekmenu?x=1", "/weekmenu?x=1"],
    ["https://evil.example", "/account/abonnement"],
    ["//evil.example", "/account/abonnement"],
    ["/\\evil.example", "/account/abonnement"],
    ["account", "/account/abonnement"],
    [null, "/account/abonnement"],
  ])("%s → %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });
});
