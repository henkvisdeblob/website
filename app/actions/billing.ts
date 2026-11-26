"use server";

import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { z } from "zod";
import { getSessionUser, createSupabaseServerClient } from "@/lib/auth/session";
import { checkoutSessionParams } from "@/lib/billing/checkout";
import { canCancel, canResume, canWithdraw, isRunning } from "@/lib/billing/entitlements";
import { sendWithdrawalConfirmation } from "@/lib/billing/notify";
import { getAccountBilling, SupabaseBillingStore } from "@/lib/billing/store";
import { billingEnabled, getBillingConfig, getStripe } from "@/lib/billing/stripe";
import { toSubscriptionRow } from "@/lib/billing/webhook";
import { withdrawSubscription } from "@/lib/billing/withdraw";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { siteConfig } from "@/lib/site-config";

/*
 * Premium subscription actions (docs/04 E8). Every check happens here on the server, with the
 * subscription as Stripe knows it; the buttons on the page are only a convenience.
 */

export type BillingActionState = { status: "idle" } | { status: "error"; message: string };

const PAGE = "/account/abonnement";
const TRY_AGAIN: BillingActionState = {
  status: "error",
  message: "Dat lukte niet. Probeer het over een paar minuten nog eens, of mail ons als het blijft mislukken.",
};

async function billingContext() {
  if (!billingEnabled()) return null;
  const [user, stripe, config, admin] = [await getSessionUser(), getStripe(), getBillingConfig(), getSupabaseAdmin()];
  if (!user || !stripe || !config || !admin) return null;
  const billing = await getAccountBilling(admin, user.id);
  return { user, stripe, config, admin, store: new SupabaseBillingStore(admin), billing };
}

/** Saves Stripe's answer right away, so the page is correct before the webhook arrives. */
async function mirror(store: SupabaseBillingStore, subscription: Stripe.Subscription, userId: string) {
  const row = toSubscriptionRow(subscription, userId);
  if (row) await store.upsertSubscription(row);
}

export async function startCheckoutAction(formData: FormData): Promise<void> {
  const interval = z.enum(["month", "year"]).safeParse(formData.get("interval"));
  const ctx = await billingContext();
  if (!ctx || !interval.success) redirect(`${PAGE}?fout=1`);
  if (isRunning(ctx.billing?.subscription ?? null)) redirect(PAGE);

  const session = await ctx.stripe.checkout.sessions.create(
    checkoutSessionParams({
      userId: ctx.user.id,
      email: ctx.user.email,
      customerId: ctx.billing?.customerId ?? null,
      priceId: ctx.config.prices[interval.data],
      siteUrl: siteConfig.url,
    }),
  );
  if (!session.url) redirect(`${PAGE}?fout=1`);
  redirect(session.url);
}

/** Stripe's Customer Portal: payment method and invoices. */
export async function openBillingPortalAction(): Promise<void> {
  const ctx = await billingContext();
  const customer = ctx?.billing?.customerId;
  if (!ctx || !customer) redirect(`${PAGE}?fout=1`);
  const session = await ctx.stripe.billingPortal.sessions.create({
    customer,
    return_url: `${siteConfig.url}${PAGE}`,
    locale: "nl",
  });
  redirect(session.url);
}

/** "Abonnement opzeggen": Premium continues until the end of the paid period (US-8.2). */
export async function cancelSubscriptionAction(): Promise<BillingActionState> {
  const ctx = await billingContext();
  const subscription = ctx?.billing?.subscription ?? null;
  if (!ctx || !canCancel(subscription)) {
    return { status: "error", message: "Er is geen lopend abonnement om op te zeggen." };
  }
  try {
    const updated = await ctx.stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true });
    await mirror(ctx.store, updated, ctx.user.id);
  } catch (error) {
    console.error("[billing] cancel failed", error);
    return TRY_AGAIN;
  }
  // The confirmation email is sent by the webhook, also when someone cancels in the Customer Portal.
  redirect(`${PAGE}?opgezegd=1`);
}

/** Undo a cancellation before the period ends. */
export async function resumeSubscriptionAction(): Promise<BillingActionState> {
  const ctx = await billingContext();
  const subscription = ctx?.billing?.subscription ?? null;
  if (!ctx || !canResume(subscription)) return { status: "error", message: "Er is geen opzegging om in te trekken." };
  try {
    const current = await ctx.stripe.subscriptions.retrieve(subscription.id);
    // The Customer Portal may have set a cancel date instead of the "end of period" flag.
    const updated = await ctx.stripe.subscriptions.update(
      subscription.id,
      current.cancel_at !== null && !current.cancel_at_period_end ? { cancel_at: "" } : { cancel_at_period_end: false },
    );
    await mirror(ctx.store, updated, ctx.user.id);
  } catch (error) {
    console.error("[billing] resume failed", error);
    return TRY_AGAIN;
  }
  redirect(`${PAGE}?hervat=1`);
}

/** "Overeenkomst herroepen" within 14 days: stop now and refund everything (US-8.3, docs/09). */
export async function withdrawContractAction(): Promise<BillingActionState> {
  const ctx = await billingContext();
  const subscription = ctx?.billing?.subscription ?? null;
  if (!ctx || !subscription) return { status: "error", message: "Er is geen abonnement om te herroepen." };

  const { stripe, store, user } = ctx;
  let refundedCents = 0;
  try {
    // Decide on Stripe's current data, not on our mirror.
    const row = toSubscriptionRow(await stripe.subscriptions.retrieve(subscription.id), user.id);
    if (!row || !canWithdraw({ ...row, withdrawnAt: subscription.withdrawnAt }, new Date())) {
      return {
        status: "error",
        message: "De termijn van 14 dagen om te herroepen is voorbij. Je kunt het abonnement wel opzeggen.",
      };
    }
    ({ refundedCents } = await withdrawSubscription(subscription.id, new Date(), {
      paidPaymentIntents: async (subscriptionId) => {
        const intents: string[] = [];
        const invoices = await stripe.invoices.list({ subscription: subscriptionId, status: "paid", limit: 10 });
        for (const invoice of invoices.data) {
          if (!invoice.id) continue;
          const payments = await stripe.invoicePayments.list({ invoice: invoice.id, status: "paid" });
          for (const payment of payments.data) {
            const intent = payment.payment.payment_intent;
            if (intent) intents.push(typeof intent === "string" ? intent : intent.id);
          }
        }
        return intents;
      },
      refund: async (paymentIntentId, idempotencyKey) => {
        const refund = await stripe.refunds.create(
          { payment_intent: paymentIntentId, reason: "requested_by_customer", metadata: { reden: "herroeping" } },
          { idempotencyKey },
        );
        return { amountCents: refund.amount };
      },
      cancelNow: async (subscriptionId, idempotencyKey) => {
        await stripe.subscriptions.cancel(subscriptionId, {}, { idempotencyKey });
      },
      markWithdrawn: (subscriptionId, at) => store.markWithdrawn(subscriptionId, at),
    }));
  } catch (error) {
    console.error("[billing] withdrawal failed", error);
    return TRY_AGAIN;
  }

  try {
    await sendWithdrawalConfirmation(user.email, refundedCents);
  } catch (error) {
    console.error("[billing] withdrawal confirmation failed", error);
  }
  redirect(`${PAGE}?herroepen=1`);
}

/**
 * "Verwijder mijn account" (docs/04 US-11.1): ends a running subscription right away and deletes the
 * account; the database removes profile and subscriptions with it. Stripe keeps the invoices, which
 * must be kept for 7 years.
 */
export async function deleteAccountAction(): Promise<BillingActionState> {
  const user = await getSessionUser();
  const admin = getSupabaseAdmin();
  if (!user || !admin) return { status: "error", message: "Je bent niet (meer) ingelogd." };
  try {
    const billing = await getAccountBilling(admin, user.id);
    const subscription = billing?.subscription ?? null;
    const stripe = getStripe();
    if (stripe && isRunning(subscription)) {
      await stripe.subscriptions.cancel(subscription.id, {}, { idempotencyKey: `delete-account:${subscription.id}` });
    }
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
  } catch (error) {
    console.error("[account] delete failed", error);
    return TRY_AGAIN;
  }
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/?account=verwijderd");
}
