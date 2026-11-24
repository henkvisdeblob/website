import "server-only";
import { siteConfig } from "@/lib/site-config";
import { alreadyConfirmedEmail, confirmationEmail } from "@/lib/email/templates";
import type { Mailer } from "@/lib/email/mailer";
import { generateReferralCode, generateToken, hashToken } from "./codes";
import { waitlistPosition } from "./position";
import type { JoinWaitlistInput } from "./schema";
import type { WaitlistEntry, WaitlistStore } from "./store";

/** A pending (unconfirmed) sign-up link stays valid for 7 days. */
export const PENDING_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** Unconfirmed sign-ups are deleted after 30 days (promised in the privacy statement). */
export const UNCONFIRMED_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export type WaitlistDeps = {
  store: WaitlistStore;
  mailer: Mailer;
  siteUrl: string;
  now?: () => Date;
};

function links(siteUrl: string, token: string) {
  const base = siteUrl.replace(/\/$/, "");
  return {
    confirmUrl: `${base}/wachtlijst/bevestigen?token=${token}`,
    leaveUrl: `${base}/wachtlijst/uitschrijven?token=${token}`,
  };
}

/**
 * Adds someone to the waitlist (or re-sends their link) and emails them.
 * Always behaves the same from the outside, so nobody can find out whether an address is on the list.
 */
export async function joinWaitlist(input: JoinWaitlistInput, deps: WaitlistDeps): Promise<void> {
  const now = deps.now?.() ?? new Date();
  const token = generateToken();
  const tokenHash = hashToken(token);
  const { confirmUrl, leaveUrl } = links(deps.siteUrl, token);

  // Housekeeping on every sign-up keeps the privacy promise without a separate scheduled job.
  await deps.store.deleteUnconfirmedCreatedBefore(new Date(now.getTime() - UNCONFIRMED_RETENTION_MS));

  const existing = await deps.store.findByEmail(input.email);

  if (existing?.confirmedAt) {
    await deps.store.rotateToken(existing.email, tokenHash, now);
    await deps.mailer.send(alreadyConfirmedEmail({ to: existing.email, statusUrl: confirmUrl, leaveUrl }));
    return;
  }

  if (existing) {
    await deps.store.refreshPending(existing.email, {
      tokenHash,
      tokenCreatedAt: now,
      stores: input.stores.length > 0 ? input.stores : existing.stores,
      householdSize: input.householdSize ?? existing.householdSize,
    });
  } else {
    let referralCode = generateReferralCode();
    while (await deps.store.referralCodeExists(referralCode)) referralCode = generateReferralCode();
    const referredBy =
      input.ref && (await deps.store.referralCodeExists(input.ref)) ? input.ref : null;
    await deps.store.insert({
      email: input.email,
      referralCode,
      referredBy,
      utmSource: input.utmSource ?? null,
      stores: input.stores,
      householdSize: input.householdSize ?? null,
      tokenHash,
      tokenCreatedAt: now,
      createdAt: now,
    });
  }

  await deps.mailer.send(confirmationEmail({ to: input.email, confirmUrl, leaveUrl }));
}

export type WaitlistStatus =
  | { state: "invalid" }
  | { state: "expired" }
  | { state: "pending"; email: string }
  | { state: "confirmed"; email: string; position: number; referralCode: string; referrals: number };

function isExpired(entry: WaitlistEntry, now: Date) {
  return !entry.confirmedAt && now.getTime() - entry.tokenCreatedAt.getTime() > PENDING_TOKEN_TTL_MS;
}

async function statusFor(entry: WaitlistEntry, store: WaitlistStore): Promise<WaitlistStatus> {
  if (!entry.confirmedAt) return { state: "pending", email: entry.email };
  const [confirmedBefore, referrals] = await Promise.all([
    store.countConfirmedBefore(entry.confirmedAt),
    store.countConfirmedReferrals(entry.referralCode),
  ]);
  return {
    state: "confirmed",
    email: entry.email,
    referralCode: entry.referralCode,
    referrals,
    position: waitlistPosition({
      confirmedBefore,
      confirmedReferrals: referrals,
      boost: siteConfig.referralBoost,
    }),
  };
}

/** Looks up a sign-up by the token from the email link, without changing anything. */
export async function getWaitlistStatus(
  token: string,
  deps: Pick<WaitlistDeps, "store" | "now">,
): Promise<WaitlistStatus> {
  const entry = await deps.store.findByTokenHash(hashToken(token));
  if (!entry) return { state: "invalid" };
  if (isExpired(entry, deps.now?.() ?? new Date())) return { state: "expired" };
  return statusFor(entry, deps.store);
}

/** Confirms a sign-up (double opt-in). Confirming twice is harmless. */
export async function confirmWaitlist(
  token: string,
  deps: Pick<WaitlistDeps, "store" | "now">,
): Promise<WaitlistStatus> {
  const now = deps.now?.() ?? new Date();
  const entry = await deps.store.findByTokenHash(hashToken(token));
  if (!entry) return { state: "invalid" };
  if (isExpired(entry, now)) return { state: "expired" };
  if (!entry.confirmedAt) await deps.store.confirm(entry.email, now);
  const updated = await deps.store.findByEmail(entry.email);
  return updated ? statusFor(updated, deps.store) : { state: "invalid" };
}

/** Removes someone from the waitlist and deletes their data. */
export async function leaveWaitlist(
  token: string,
  deps: Pick<WaitlistDeps, "store">,
): Promise<boolean> {
  const entry = await deps.store.findByTokenHash(hashToken(token));
  if (!entry) return false;
  await deps.store.delete(entry.email);
  return true;
}
