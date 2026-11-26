import { addDays, todayInAmsterdam, type IsoDate } from "@/lib/dates";

/*
 * Who has Premium, and what they may do with their subscription. Pure: pass `now` in.
 * This is the only place that decides Premium access (CLAUDE.md: one isPremium() on the server).
 * Instants are ISO 8601 timestamps, as stored in the database.
 */

export type TrialState = { premiumTrialUntil: string | null };

export type SubscriptionState = {
  status: string;
  /** Start of the contract; the withdrawal period counts from here. */
  startedAt: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  withdrawnAt: string | null;
};

/** Premium stays on this long while Stripe retries a failed payment (docs/04 US-8.4). */
export const PAST_DUE_GRACE_DAYS = 7;
/** Statutory withdrawal period for contracts concluded online (docs/09). */
export const WITHDRAWAL_PERIOD_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;
const PAID_STATUSES = new Set(["active", "trialing"]);
const RUNNING_STATUSES = new Set(["active", "trialing", "past_due"]);

export type PremiumAccess =
  | { premium: false }
  | { premium: true; via: "subscription"; until: string; renews: boolean }
  | { premium: true; via: "grace"; until: string }
  | { premium: true; via: "trial"; until: string };

export function premiumAccess(
  trial: TrialState | null,
  subscription: SubscriptionState | null,
  now: Date,
): PremiumAccess {
  if (subscription && !subscription.withdrawnAt) {
    if (PAID_STATUSES.has(subscription.status)) {
      return {
        premium: true,
        via: "subscription",
        until: subscription.currentPeriodEnd,
        renews: !subscription.cancelAtPeriodEnd,
      };
    }
    if (subscription.status === "past_due") {
      const graceEnd = new Date(Date.parse(subscription.currentPeriodEnd) + PAST_DUE_GRACE_DAYS * DAY_MS);
      if (now < graceEnd) return { premium: true, via: "grace", until: graceEnd.toISOString() };
    }
  }
  if (trial?.premiumTrialUntil && now < new Date(trial.premiumTrialUntil)) {
    return { premium: true, via: "trial", until: trial.premiumTrialUntil };
  }
  return { premium: false };
}

export function isPremium(trial: TrialState | null, subscription: SubscriptionState | null, now: Date): boolean {
  return premiumAccess(trial, subscription, now).premium;
}

/** Whether the subscription is still running (it can be cancelled or withdrawn). */
export function isRunning(subscription: SubscriptionState | null): subscription is SubscriptionState {
  return Boolean(subscription && !subscription.withdrawnAt && RUNNING_STATUSES.has(subscription.status));
}

/**
 * Last Amsterdam calendar day on which the contract can be withdrawn: the period starts the day after
 * the contract was concluded and lasts 14 days, so it ends at the end of start day + 14.
 */
export function withdrawalLastDay(subscription: SubscriptionState): IsoDate {
  return addDays(todayInAmsterdam(new Date(subscription.startedAt)), WITHDRAWAL_PERIOD_DAYS);
}

export function canWithdraw(subscription: SubscriptionState | null, now: Date): boolean {
  if (!isRunning(subscription)) return false;
  return todayInAmsterdam(now) <= withdrawalLastDay(subscription);
}

export function canCancel(subscription: SubscriptionState | null): subscription is SubscriptionState {
  return isRunning(subscription) && !subscription.cancelAtPeriodEnd;
}

export function canResume(subscription: SubscriptionState | null): subscription is SubscriptionState {
  return isRunning(subscription) && subscription.cancelAtPeriodEnd;
}
