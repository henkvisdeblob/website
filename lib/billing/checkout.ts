import type Stripe from "stripe";

export type PlanInterval = "month" | "year";

/**
 * Parameters for the Stripe Checkout page (docs/07, docs/09). Pure, so the legally relevant parts are
 * tested: the user is linked through client_reference_id and the subscription metadata, the page is in
 * Dutch, and the text above the pay button repeats renewal, cancellation and the withdrawal right.
 * Payment methods (iDEAL | Wero, card) are chosen in the Stripe Dashboard.
 */
export function checkoutSessionParams(input: {
  userId: string;
  email: string;
  customerId: string | null;
  priceId: string;
  siteUrl: string;
}): Stripe.Checkout.SessionCreateParams {
  return {
    mode: "subscription",
    line_items: [{ price: input.priceId, quantity: 1 }],
    client_reference_id: input.userId,
    ...(input.customerId ? { customer: input.customerId } : { customer_email: input.email }),
    subscription_data: { metadata: { user_id: input.userId } },
    locale: "nl",
    success_url: `${input.siteUrl}/account/abonnement?gestart=1`,
    cancel_url: `${input.siteUrl}/account/abonnement`,
    custom_text: {
      submit: {
        message:
          "Je abonnement wordt automatisch verlengd. Opzeggen kan altijd via je account. " +
          "Binnen 14 dagen kun je de overeenkomst herroepen en krijg je het hele bedrag terug.",
      },
    },
  };
}
