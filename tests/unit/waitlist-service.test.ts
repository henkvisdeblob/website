import { beforeEach, describe, expect, it } from "vitest";
import { ConsoleMailer } from "@/lib/email/mailer";
import { waitlistPosition } from "@/lib/waitlist/position";
import {
  PENDING_TOKEN_TTL_MS,
  confirmWaitlist,
  getWaitlistStatus,
  joinWaitlist,
  leaveWaitlist,
} from "@/lib/waitlist/service";
import { MemoryWaitlistStore } from "@/lib/waitlist/store";
import { createRateLimiter } from "@/lib/server/rate-limit";

const SITE = "https://potje.test";

class QuietMailer extends ConsoleMailer {
  async send(email: Parameters<ConsoleMailer["send"]>[0]) {
    this.sent.push(email);
  }
}

function tokenFrom(text: string) {
  const match = text.match(/token=([A-Za-z0-9_-]{43})/);
  if (!match) throw new Error("no token in email");
  return match[1];
}

describe("waitlist service", () => {
  let store: MemoryWaitlistStore;
  let mailer: QuietMailer;
  let clock: Date;
  const deps = () => ({ store, mailer, siteUrl: SITE, now: () => clock });

  beforeEach(() => {
    store = new MemoryWaitlistStore();
    mailer = new QuietMailer();
    clock = new Date("2026-12-01T10:00:00Z");
  });

  async function signUp(email: string, extra: { ref?: string } = {}) {
    await joinWaitlist({ email, stores: [], website: "", ...extra }, deps());
    return tokenFrom(mailer.sent.at(-1)!.text);
  }

  it("sends a confirmation email with confirm and leave links", async () => {
    await signUp("sanne@voorbeeld.nl");
    const mail = mailer.sent[0];
    expect(mail.to).toBe("sanne@voorbeeld.nl");
    expect(mail.text).toContain(`${SITE}/wachtlijst/bevestigen?token=`);
    expect(mail.text).toContain(`${SITE}/wachtlijst/uitschrijven?token=`);
  });

  it("stores only a hash of the token", async () => {
    const token = await signUp("sanne@voorbeeld.nl");
    const entry = await store.findByEmail("sanne@voorbeeld.nl");
    expect(entry?.tokenHash).not.toContain(token);
    expect(entry?.tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is pending until confirmed, then gets a position", async () => {
    const token = await signUp("sanne@voorbeeld.nl");
    expect(await getWaitlistStatus(token, deps())).toEqual({ state: "pending", email: "sanne@voorbeeld.nl" });

    const status = await confirmWaitlist(token, deps());
    expect(status).toMatchObject({ state: "confirmed", position: 1, referrals: 0 });

    // Confirming twice is harmless.
    expect(await confirmWaitlist(token, deps())).toMatchObject({ state: "confirmed", position: 1 });
  });

  it("orders positions by confirmation time and rewards referrals", async () => {
    const tokens: string[] = [];
    for (const name of ["a", "b", "c"]) {
      tokens.push(await signUp(`${name}@voorbeeld.nl`));
      clock = new Date(clock.getTime() + 60_000);
      await confirmWaitlist(tokens.at(-1)!, deps());
    }
    const c = await getWaitlistStatus(tokens[2], deps());
    expect(c).toMatchObject({ state: "confirmed", position: 3 });
    if (c.state !== "confirmed") throw new Error();

    // A friend of c confirms → c moves up 10 places (but never above 1).
    clock = new Date(clock.getTime() + 60_000);
    const friend = await signUp("vriend@voorbeeld.nl", { ref: c.referralCode });
    await confirmWaitlist(friend, deps());
    expect(await getWaitlistStatus(tokens[2], deps())).toMatchObject({ position: 1, referrals: 1 });
  });

  it("ignores referral codes that don't exist", async () => {
    await signUp("a@voorbeeld.nl", { ref: "zzzzzzzz" });
    expect((await store.findByEmail("a@voorbeeld.nl"))?.referredBy).toBeNull();
  });

  it("signing up again re-sends a fresh link and invalidates the old one", async () => {
    const first = await signUp("sanne@voorbeeld.nl");
    const second = await signUp("sanne@voorbeeld.nl");
    expect(second).not.toBe(first);
    expect(await getWaitlistStatus(first, deps())).toEqual({ state: "invalid" });
    expect(await getWaitlistStatus(second, deps())).toMatchObject({ state: "pending" });
  });

  it("tells confirmed people they are already on the list", async () => {
    const token = await signUp("sanne@voorbeeld.nl");
    await confirmWaitlist(token, deps());
    await signUp("sanne@voorbeeld.nl");
    expect(mailer.sent.at(-1)!.subject).toMatch(/al op de wachtlijst/);
  });

  it("expires pending links after 7 days", async () => {
    const token = await signUp("sanne@voorbeeld.nl");
    clock = new Date(clock.getTime() + PENDING_TOKEN_TTL_MS + 1);
    expect(await confirmWaitlist(token, deps())).toEqual({ state: "expired" });
  });

  it("deletes unconfirmed sign-ups after 30 days", async () => {
    await signUp("vergeten@voorbeeld.nl");
    const kept = await signUp("bevestigd@voorbeeld.nl");
    await confirmWaitlist(kept, deps());
    clock = new Date(clock.getTime() + 31 * 24 * 60 * 60 * 1000);
    await signUp("nieuw@voorbeeld.nl");
    expect(await store.findByEmail("vergeten@voorbeeld.nl")).toBeNull();
    expect(await store.findByEmail("bevestigd@voorbeeld.nl")).not.toBeNull();
  });

  it("deletes all data when leaving", async () => {
    const token = await signUp("sanne@voorbeeld.nl");
    expect(await leaveWaitlist(token, deps())).toBe(true);
    expect(await store.findByEmail("sanne@voorbeeld.nl")).toBeNull();
    expect(await leaveWaitlist(token, deps())).toBe(false);
  });

  it("returns invalid for unknown tokens", async () => {
    expect(await getWaitlistStatus("x".repeat(43), deps())).toEqual({ state: "invalid" });
  });
});

describe("waitlistPosition", () => {
  it("never goes below 1", () => {
    expect(waitlistPosition({ confirmedBefore: 4, confirmedReferrals: 3, boost: 10 })).toBe(1);
    expect(waitlistPosition({ confirmedBefore: 40, confirmedReferrals: 2, boost: 10 })).toBe(21);
  });
});

describe("rate limiter", () => {
  it("allows `limit` hits per window", () => {
    const check = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(check("ip", 0)).toBe(true);
    expect(check("ip", 10)).toBe(true);
    expect(check("ip", 20)).toBe(false);
    expect(check("other", 20)).toBe(true);
    expect(check("ip", 1500)).toBe(true);
  });
});
