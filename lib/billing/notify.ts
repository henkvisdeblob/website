import "server-only";
import { formatInstantNl } from "@/lib/dates";
import { getMailer } from "@/lib/email/mailer";
import {
  cancellationScheduledEmail,
  paymentFailedEmail,
  premiumStartedEmail,
  withdrawalConfirmedEmail,
} from "@/lib/email/templates";
import { formatEuro } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { siteConfig } from "@/lib/site-config";
import type { BillingNotice } from "./webhook";

const manageUrl = () => `${siteConfig.url}/account/abonnement`;

async function emailForUser(userId: string): Promise<string | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error) throw error;
  return data.user?.email ?? null;
}

/** Sends the email that belongs to a webhook notice. Throws when sending fails (the caller logs it). */
export async function sendBillingNotice(userId: string, notice: BillingNotice): Promise<void> {
  const to = await emailForUser(userId);
  const mailer = getMailer();
  if (!to || !mailer) {
    console.warn(`[billing] no email sent for ${notice.kind}: ${!to ? "no address" : "no mailer configured"}`);
    return;
  }
  switch (notice.kind) {
    case "started":
      return mailer.send(
        premiumStartedEmail({ to, interval: notice.interval, manageUrl: manageUrl(), termsUrl: `${siteConfig.url}/voorwaarden` }),
      );
    case "cancel_scheduled":
      return mailer.send(cancellationScheduledEmail({ to, endsOn: formatInstantNl(notice.endsAt), manageUrl: manageUrl() }));
    case "payment_failed":
      return mailer.send(paymentFailedEmail({ to, manageUrl: manageUrl() }));
  }
}

export async function sendWithdrawalConfirmation(to: string, refundedCents: number): Promise<void> {
  const mailer = getMailer();
  if (!mailer) {
    console.warn("[billing] withdrawal confirmation not sent: no mailer configured");
    return;
  }
  await mailer.send(withdrawalConfirmedEmail({ to, refunded: refundedCents > 0 ? formatEuro(refundedCents) : null }));
}
