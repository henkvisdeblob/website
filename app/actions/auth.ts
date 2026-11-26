"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { safeNextPath } from "@/lib/auth/redirect";
import { accountsEnabled, createSupabaseServerClient } from "@/lib/auth/session";
import { createRateLimiter } from "@/lib/server/rate-limit";
import { siteConfig } from "@/lib/site-config";

export type LoginState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string; field?: "email" };

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "Dat e-mailadres is te lang.")
    .pipe(z.email("Vul een geldig e-mailadres in, bijvoorbeeld naam@voorbeeld.nl.")),
  next: z.string().optional(),
});

// Login links per IP per 10 minutes (Supabase also limits how many emails it sends).
const loginLimiter = createRateLimiter({ limit: Number(process.env.LOGIN_RATE_LIMIT ?? 5), windowMs: 10 * 60 * 1000 });

async function clientKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Sends a one-time login link (docs/04 US-3.1). New addresses get an account, with 14 days of Premium. */
export async function requestLoginLinkAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!accountsEnabled()) {
    return { status: "error", message: "Inloggen kan nog niet. Accounts komen binnenkort." };
  }
  const parsed = loginSchema.safeParse({ email: formData.get("email"), next: formData.get("next") ?? undefined });
  if (!parsed.success) {
    return { status: "error", field: "email", message: parsed.error.issues[0]?.message ?? "Vul je e-mailadres in." };
  }
  if (!loginLimiter(await clientKey())) {
    return { status: "error", message: "Je hebt net al een paar inloglinks aangevraagd. Probeer het over 10 minuten nog eens." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Inloggen lukt op dit moment niet. Probeer het later nog eens." };
  const next = safeNextPath(parsed.data.next);
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${siteConfig.url}/auth/confirm?next=${encodeURIComponent(next)}` },
  });
  if (error) {
    console.error("[auth] sending login link failed", error.status, error.message);
    if (error.status === 429) {
      return { status: "error", message: "Er zijn net veel inlogmails verstuurd. Probeer het over een paar minuten nog eens." };
    }
    return { status: "error", message: "Het versturen van de inloglink lukte niet. Probeer het later nog eens." };
  }
  // Same answer whether or not the address already had an account.
  return { status: "sent", email: parsed.data.email };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/");
}
