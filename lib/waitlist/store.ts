import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type WaitlistEntry = {
  email: string;
  referralCode: string;
  referredBy: string | null;
  utmSource: string | null;
  stores: string[];
  householdSize: number | null;
  tokenHash: string;
  tokenCreatedAt: Date;
  createdAt: Date;
  confirmedAt: Date | null;
};

export type NewWaitlistEntry = Omit<WaitlistEntry, "confirmedAt">;

export interface WaitlistStore {
  findByEmail(email: string): Promise<WaitlistEntry | null>;
  findByTokenHash(tokenHash: string): Promise<WaitlistEntry | null>;
  insert(entry: NewWaitlistEntry): Promise<void>;
  /** Replaces the token (e.g. when someone signs up again) and updates research fields. */
  refreshPending(
    email: string,
    update: Pick<WaitlistEntry, "tokenHash" | "tokenCreatedAt" | "stores" | "householdSize">,
  ): Promise<void>;
  rotateToken(email: string, tokenHash: string, tokenCreatedAt: Date): Promise<void>;
  confirm(email: string, at: Date): Promise<void>;
  delete(email: string): Promise<void>;
  countConfirmedBefore(at: Date): Promise<number>;
  countConfirmedReferrals(referralCode: string): Promise<number>;
  referralCodeExists(code: string): Promise<boolean>;
  /** Removes sign-ups that were never confirmed (privacy statement: after 30 days). */
  deleteUnconfirmedCreatedBefore(at: Date): Promise<void>;
}

/* ------------------------------------------------------------------------------------------ */
/* In-memory store: only for local development and tests. Data is lost on restart.           */
/* ------------------------------------------------------------------------------------------ */

export class MemoryWaitlistStore implements WaitlistStore {
  private entries = new Map<string, WaitlistEntry>();

  async findByEmail(email: string) {
    return this.entries.get(email) ?? null;
  }
  async findByTokenHash(tokenHash: string) {
    for (const e of this.entries.values()) if (e.tokenHash === tokenHash) return e;
    return null;
  }
  async insert(entry: NewWaitlistEntry) {
    if (this.entries.has(entry.email)) throw new Error("duplicate email");
    this.entries.set(entry.email, { ...entry, confirmedAt: null });
  }
  async refreshPending(email: string, update: Parameters<WaitlistStore["refreshPending"]>[1]) {
    const e = this.entries.get(email);
    if (e) this.entries.set(email, { ...e, ...update });
  }
  async rotateToken(email: string, tokenHash: string, tokenCreatedAt: Date) {
    const e = this.entries.get(email);
    if (e) this.entries.set(email, { ...e, tokenHash, tokenCreatedAt });
  }
  async confirm(email: string, at: Date) {
    const e = this.entries.get(email);
    if (e && !e.confirmedAt) this.entries.set(email, { ...e, confirmedAt: at });
  }
  async delete(email: string) {
    this.entries.delete(email);
  }
  async countConfirmedBefore(at: Date) {
    let n = 0;
    for (const e of this.entries.values()) if (e.confirmedAt && e.confirmedAt < at) n++;
    return n;
  }
  async countConfirmedReferrals(referralCode: string) {
    let n = 0;
    for (const e of this.entries.values()) if (e.confirmedAt && e.referredBy === referralCode) n++;
    return n;
  }
  async referralCodeExists(code: string) {
    for (const e of this.entries.values()) if (e.referralCode === code) return true;
    return false;
  }
  async deleteUnconfirmedCreatedBefore(at: Date) {
    for (const [email, e] of this.entries) if (!e.confirmedAt && e.createdAt < at) this.entries.delete(email);
  }
}

/* ------------------------------------------------------------------------------------------ */
/* Supabase store: table `waitlist` (see supabase/migrations). Uses the secret key, server only. */
/* ------------------------------------------------------------------------------------------ */

type WaitlistRow = {
  email: string;
  referral_code: string;
  referred_by: string | null;
  utm_source: string | null;
  stores: string[] | null;
  household_size: number | null;
  token_hash: string;
  token_created_at: string;
  created_at: string;
  confirmed_at: string | null;
};

function fromRow(row: WaitlistRow): WaitlistEntry {
  return {
    email: row.email,
    referralCode: row.referral_code,
    referredBy: row.referred_by,
    utmSource: row.utm_source,
    stores: row.stores ?? [],
    householdSize: row.household_size,
    tokenHash: row.token_hash,
    tokenCreatedAt: new Date(row.token_created_at),
    createdAt: new Date(row.created_at),
    confirmedAt: row.confirmed_at ? new Date(row.confirmed_at) : null,
  };
}

export class SupabaseWaitlistStore implements WaitlistStore {
  constructor(private db: SupabaseClient) {}

  private table() {
    return this.db.from("waitlist");
  }

  async findByEmail(email: string) {
    const { data, error } = await this.table().select("*").eq("email", email).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as WaitlistRow) : null;
  }
  async findByTokenHash(tokenHash: string) {
    const { data, error } = await this.table().select("*").eq("token_hash", tokenHash).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as WaitlistRow) : null;
  }
  async insert(entry: NewWaitlistEntry) {
    const { error } = await this.table().insert({
      email: entry.email,
      referral_code: entry.referralCode,
      referred_by: entry.referredBy,
      utm_source: entry.utmSource,
      stores: entry.stores,
      household_size: entry.householdSize,
      token_hash: entry.tokenHash,
      token_created_at: entry.tokenCreatedAt.toISOString(),
      created_at: entry.createdAt.toISOString(),
    });
    if (error) throw error;
  }
  async refreshPending(email: string, update: Parameters<WaitlistStore["refreshPending"]>[1]) {
    const { error } = await this.table()
      .update({
        token_hash: update.tokenHash,
        token_created_at: update.tokenCreatedAt.toISOString(),
        stores: update.stores,
        household_size: update.householdSize,
      })
      .eq("email", email);
    if (error) throw error;
  }
  async rotateToken(email: string, tokenHash: string, tokenCreatedAt: Date) {
    const { error } = await this.table()
      .update({ token_hash: tokenHash, token_created_at: tokenCreatedAt.toISOString() })
      .eq("email", email);
    if (error) throw error;
  }
  async confirm(email: string, at: Date) {
    const { error } = await this.table()
      .update({ confirmed_at: at.toISOString() })
      .eq("email", email)
      .is("confirmed_at", null);
    if (error) throw error;
  }
  async delete(email: string) {
    const { error } = await this.table().delete().eq("email", email);
    if (error) throw error;
  }
  async countConfirmedBefore(at: Date) {
    const { count, error } = await this.table()
      .select("email", { count: "exact", head: true })
      .not("confirmed_at", "is", null)
      .lt("confirmed_at", at.toISOString());
    if (error) throw error;
    return count ?? 0;
  }
  async countConfirmedReferrals(referralCode: string) {
    const { count, error } = await this.table()
      .select("email", { count: "exact", head: true })
      .not("confirmed_at", "is", null)
      .eq("referred_by", referralCode);
    if (error) throw error;
    return count ?? 0;
  }
  async referralCodeExists(code: string) {
    const { count, error } = await this.table()
      .select("email", { count: "exact", head: true })
      .eq("referral_code", code);
    if (error) throw error;
    return (count ?? 0) > 0;
  }
  async deleteUnconfirmedCreatedBefore(at: Date) {
    const { error } = await this.table().delete().is("confirmed_at", null).lt("created_at", at.toISOString());
    if (error) throw error;
  }
}

/* ------------------------------------------------------------------------------------------ */

const globalForStore = globalThis as unknown as { __waitlistMemoryStore?: MemoryWaitlistStore };

/**
 * Returns the configured store. In production without Supabase credentials this returns null,
 * so the form shows an error instead of silently losing sign-ups.
 */
export function getWaitlistStore(): WaitlistStore | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    return new SupabaseWaitlistStore(
      createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }),
    );
  }
  if (process.env.NODE_ENV === "production" && process.env.WAITLIST_ALLOW_MEMORY_STORE !== "1") {
    return null;
  }
  globalForStore.__waitlistMemoryStore ??= new MemoryWaitlistStore();
  return globalForStore.__waitlistMemoryStore;
}
