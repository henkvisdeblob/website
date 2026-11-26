import "server-only";
import { createSupabaseServerClient, getSessionUser } from "@/lib/auth/session";
import { isPremium } from "./entitlements";
import { getAccountBilling } from "./store";

/** Whether the visitor of this request has Premium. The server-side check behind every Premium limit. */
export async function currentVisitorIsPremium(now: Date): Promise<boolean> {
  const user = await getSessionUser();
  if (!user) return false;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;
  const billing = await getAccountBilling(supabase, user.id);
  return isPremium(billing?.trial ?? null, billing?.subscription ?? null, now);
}
