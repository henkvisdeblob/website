import type Stripe from "stripe";
import { sendBillingNotice } from "@/lib/billing/notify";
import { SupabaseBillingStore } from "@/lib/billing/store";
import { getBillingConfig, getStripe } from "@/lib/billing/stripe";
import { handleStripeEvent } from "@/lib/billing/webhook";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

/**
 * Stripe webhook (docs/07). Only events with a valid signature are processed; processing is
 * idempotent per event ID. A 500 makes Stripe retry later.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const config = getBillingConfig();
  const db = getSupabaseAdmin();
  if (!stripe || !config || !db) return new Response("Billing is not configured", { status: 503 });

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      request.headers.get("stripe-signature") ?? "",
      config.webhookSecret,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    const outcome = await handleStripeEvent(event, {
      store: new SupabaseBillingStore(db),
      retrieveSubscription: (id) => stripe.subscriptions.retrieve(id),
      notify: sendBillingNotice,
    });
    return Response.json({ received: true, outcome });
  } catch (error) {
    console.error(`[billing] webhook ${event.type} ${event.id} failed`, error);
    return new Response("Processing failed", { status: 500 });
  }
}
