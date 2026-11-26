/**
 * Central place for names and contact details, so the working name "Potje"
 * and the owner's details can be changed in one place (or via env vars).
 */
export const siteConfig = {
  name: "Potje",
  tagline: "Elke week een weekmenu binnen je budget.",
  description:
    "Potje maakt elke week een weekmenu met boodschappenlijst uit de aanbiedingen van jouw supermarkt, binnen jouw budget. Meld je aan voor de wachtlijst.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Shown in the privacy statement and footer. Leave unset until decided; pages show a placeholder. */
  ownerName: process.env.NEXT_PUBLIC_OWNER_NAME ?? null,
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null,
  /** Required before selling Premium (docs/09): who the seller is. A correspondence address is fine. */
  ownerAddress: process.env.NEXT_PUBLIC_OWNER_ADDRESS ?? null,
  kvkNumber: process.env.NEXT_PUBLIC_KVK_NUMBER ?? null,
  /** Places you move up on the waitlist for every friend who confirms. */
  referralBoost: 10,
} as const;

export const SUPERMARKETS = [
  { id: "ah", label: "Albert Heijn" },
  { id: "jumbo", label: "Jumbo" },
  { id: "lidl", label: "Lidl" },
  { id: "aldi", label: "Aldi" },
  { id: "plus", label: "Plus" },
  { id: "dirk", label: "Dirk" },
  { id: "anders", label: "Andere" },
] as const;

export type SupermarketId = (typeof SUPERMARKETS)[number]["id"];
