"use server";

import { headers } from "next/headers";
import { siteConfig } from "@/lib/site-config";
import { getMailer } from "@/lib/email/mailer";
import { createRateLimiter } from "@/lib/server/rate-limit";
import { formDataToJoinInput, joinWaitlistSchema, tokenSchema } from "@/lib/waitlist/schema";
import {
  confirmWaitlist,
  joinWaitlist,
  leaveWaitlist,
  type WaitlistStatus,
} from "@/lib/waitlist/service";
import { getWaitlistStore } from "@/lib/waitlist/store";

export type JoinState =
  | { status: "idle" }
  | { status: "success"; email: string }
  | { status: "error"; message: string; field?: "email" };

const joinLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });
const tokenLimiter = createRateLimiter({ limit: 30, windowMs: 10 * 60 * 1000 });

async function clientKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

const NOT_CONFIGURED: JoinState = {
  status: "error",
  message: "Aanmelden lukt op dit moment niet. Probeer het later nog eens.",
};

export async function joinWaitlistAction(_prev: JoinState, formData: FormData): Promise<JoinState> {
  const parsed = joinWaitlistSchema.safeParse(formDataToJoinInput(formData));
  if (!parsed.success) {
    const emailIssue = parsed.error.issues.find((i) => i.path[0] === "email");
    if (emailIssue) return { status: "error", field: "email", message: emailIssue.message };
    // Honeypot filled or tampered fields: pretend it worked, so bots learn nothing.
    return { status: "success", email: String(formData.get("email") ?? "") };
  }

  if (!joinLimiter(await clientKey())) {
    return {
      status: "error",
      message: "Je hebt het net een paar keer geprobeerd. Wacht een paar minuten en probeer het opnieuw.",
    };
  }

  const store = getWaitlistStore();
  const mailer = getMailer();
  if (!store || !mailer) {
    console.error("[waitlist] Supabase or email is not configured.");
    return NOT_CONFIGURED;
  }

  try {
    await joinWaitlist(parsed.data, { store, mailer, siteUrl: siteConfig.url });
    return { status: "success", email: parsed.data.email };
  } catch (error) {
    console.error("[waitlist] join failed", error);
    return {
      status: "error",
      message: "Dat ging mis aan onze kant. Probeer het over een minuutje opnieuw.",
    };
  }
}

export async function confirmWaitlistAction(token: string): Promise<WaitlistStatus> {
  if (!tokenSchema.safeParse(token).success) return { state: "invalid" };
  if (!tokenLimiter(await clientKey())) return { state: "invalid" };
  const store = getWaitlistStore();
  if (!store) return { state: "invalid" };
  return confirmWaitlist(token, { store });
}

export async function leaveWaitlistAction(token: string): Promise<{ ok: boolean }> {
  if (!tokenSchema.safeParse(token).success) return { ok: false };
  if (!tokenLimiter(await clientKey())) return { ok: false };
  const store = getWaitlistStore();
  if (!store) return { ok: false };
  return { ok: await leaveWaitlist(token, { store }) };
}
