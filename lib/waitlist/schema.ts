import { z } from "zod";
import { SUPERMARKETS } from "@/lib/site-config";

const supermarketIds = SUPERMARKETS.map((s) => s.id) as [string, ...string[]];

export const REFERRAL_CODE_PATTERN = /^[a-z0-9]{8}$/;

/** Validates the waitlist sign-up form. All optional fields are for research only. */
export const joinWaitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "Dat e-mailadres is te lang.")
    .pipe(z.email("Vul een geldig e-mailadres in, bijvoorbeeld naam@voorbeeld.nl.")),
  stores: z.array(z.enum(supermarketIds)).max(supermarketIds.length).default([]),
  householdSize: z.coerce.number().int().min(1).max(8).optional(),
  ref: z
    .string()
    .trim()
    .toLowerCase()
    .regex(REFERRAL_CODE_PATTERN)
    .optional()
    .catch(undefined),
  utmSource: z
    .string()
    .trim()
    .max(64)
    .regex(/^[\w.\-]+$/)
    .optional()
    .catch(undefined),
  /** Honeypot: real people never fill this hidden field. */
  website: z.string().max(0).optional().default(""),
});

export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;

/** Turns FormData into a plain object the schema understands. */
export function formDataToJoinInput(formData: FormData): Record<string, unknown> {
  const optional = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" && value.trim() !== "" ? value : undefined;
  };
  return {
    email: formData.get("email") ?? "",
    stores: formData.getAll("stores").filter((v): v is string => typeof v === "string"),
    householdSize: optional("householdSize"),
    ref: optional("ref"),
    utmSource: optional("utmSource"),
    website: formData.get("website") ?? "",
  };
}

export const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
