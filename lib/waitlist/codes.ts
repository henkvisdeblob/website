import { createHash, randomBytes, randomInt } from "node:crypto";

const REFERRAL_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o, 1/l/i

/** 8-character referral code, e.g. "k7m2xq9a". */
export function generateReferralCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += REFERRAL_ALPHABET[randomInt(REFERRAL_ALPHABET.length)];
  }
  return code;
}

/** 256-bit random token for confirm/unsubscribe links (base64url, 43 chars). */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** We only store a hash of the token, so a database leak doesn't expose working links. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
