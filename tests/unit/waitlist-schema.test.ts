import { describe, expect, it } from "vitest";
import { formDataToJoinInput, joinWaitlistSchema, tokenSchema } from "@/lib/waitlist/schema";

function form(fields: Record<string, string | string[]>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    for (const value of Array.isArray(v) ? v : [v]) fd.append(k, value);
  }
  return joinWaitlistSchema.safeParse(formDataToJoinInput(fd));
}

describe("joinWaitlistSchema", () => {
  it("normalises the email address", () => {
    const r = form({ email: "  Sanne@Voorbeeld.NL " });
    expect(r.success && r.data.email).toBe("sanne@voorbeeld.nl");
  });

  it("rejects an invalid email with a Dutch message", () => {
    const r = form({ email: "sanne@" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["email"]);
    expect(r.error?.issues[0].message).toMatch(/geldig e-mailadres/);
  });

  it("accepts known supermarkets and a household size", () => {
    const r = form({ email: "a@b.nl", stores: ["lidl", "ah"], householdSize: "4" });
    expect(r.success && r.data).toMatchObject({ stores: ["lidl", "ah"], householdSize: 4 });
  });

  it("rejects unknown supermarkets", () => {
    expect(form({ email: "a@b.nl", stores: ["costco"] }).success).toBe(false);
  });

  it("ignores a malformed referral code or utm source instead of failing", () => {
    const r = form({ email: "a@b.nl", ref: "<script>", utmSource: "a b c" });
    expect(r.success && r.data.ref).toBeUndefined();
    expect(r.success && r.data.utmSource).toBeUndefined();
  });

  it("fails when the honeypot field is filled", () => {
    expect(form({ email: "a@b.nl", website: "http://spam.example" }).success).toBe(false);
  });

  it("validates link tokens", () => {
    expect(tokenSchema.safeParse("a".repeat(43)).success).toBe(true);
    expect(tokenSchema.safeParse("short").success).toBe(false);
    expect(tokenSchema.safeParse("a".repeat(42) + "!").success).toBe(false);
  });
});
