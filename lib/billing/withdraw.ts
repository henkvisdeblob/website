/*
 * "Overeenkomst herroepen" (docs/04 US-8.3, docs/09): refund everything that was paid, then end the
 * subscription immediately. Every Stripe call carries an idempotency key, so a retry after a failure
 * or a double click never refunds twice. The caller checks canWithdraw() on fresh Stripe data first.
 */

export type WithdrawDeps = {
  /** IDs of the paid PaymentIntents of this subscription's invoices. */
  paidPaymentIntents(subscriptionId: string): Promise<string[]>;
  refund(paymentIntentId: string, idempotencyKey: string): Promise<{ amountCents: number }>;
  cancelNow(subscriptionId: string, idempotencyKey: string): Promise<void>;
  markWithdrawn(subscriptionId: string, at: Date): Promise<void>;
};

export async function withdrawSubscription(
  subscriptionId: string,
  now: Date,
  deps: WithdrawDeps,
): Promise<{ refundedCents: number }> {
  let refundedCents = 0;
  for (const paymentIntentId of await deps.paidPaymentIntents(subscriptionId)) {
    const refund = await deps.refund(paymentIntentId, `withdraw-refund:${subscriptionId}:${paymentIntentId}`);
    refundedCents += refund.amountCents;
  }
  // Refund first: if cancelling fails, the visitor can try again and the refund isn't repeated.
  await deps.cancelNow(subscriptionId, `withdraw-cancel:${subscriptionId}`);
  await deps.markWithdrawn(subscriptionId, now);
  return { refundedCents };
}
