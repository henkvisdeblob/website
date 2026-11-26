import type { BaseUnit } from "@/lib/catalog/types";

export type ParsedQuantity = { amount: number; unit: BaseUnit };

const num = (s: string) => Number(s.replace(",", "."));

/**
 * Parses the pack size from a supermarket quantity text into grams, millilitres or pieces.
 * Examples: "400 g", "1,5 l", "2 x 250 g", "los per 500 g", "per kilo", "1 Stk.", "Per stuk", "6 stuks".
 * Returns null when the text is missing or ambiguous.
 */
export function parseQuantity(text: string | null | undefined): ParsedQuantity | null {
  if (!text) return null;
  const t = text
    .toLowerCase()
    .replace(/ /g, " ")
    .replace(/ca\.?\s*/g, "")
    .replace(/±/g, "")
    .trim();

  // Multipacks: "2 x 250 g", "4x125 gram"
  const multi = t.match(/(\d+)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(kilogram|kg|kilo|gram|gr|g|liter|l|cl|ml)\b/);
  if (multi) {
    const single = toBase(num(multi[2]), multi[3]);
    return single ? { amount: round(single.amount * Number(multi[1])), unit: single.unit } : null;
  }

  // "per kilo", "per kg", "los per kilo"
  if (/\bper\s*(kilo|kg)\b/.test(t)) return { amount: 1000, unit: "g" };

  // Amount with unit anywhere: "400 g", "los per 500 g", "1,5 l", "750ml"
  const single = t.match(/(\d+(?:[.,]\d+)?)\s*(kilogram|kg|kilo|gram|gr|g|liter|l|cl|ml)\b/);
  if (single) return toBase(num(single[1]), single[2]);

  // Pieces: "6 stuks", "1 stk.", "per stuk", "per bos", "3 st"
  const pieces = t.match(/(\d+)\s*(stuks?|stk|st)\b/);
  if (pieces) return { amount: Number(pieces[1]), unit: "stuk" };
  if (/\bper\s*(stuk|stk|bos|krop|net|zak)\b/.test(t) || t === "stuk" || t === "1 stuk") {
    return { amount: 1, unit: "stuk" };
  }
  return null;
}

function toBase(value: number, unit: string): ParsedQuantity | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  switch (unit) {
    case "kg":
    case "kilo":
    case "kilogram":
      return { amount: round(value * 1000), unit: "g" };
    case "g":
    case "gr":
    case "gram":
      return { amount: round(value), unit: "g" };
    case "l":
    case "liter":
      return { amount: round(value * 1000), unit: "ml" };
    case "cl":
      return { amount: round(value * 10), unit: "ml" };
    case "ml":
      return { amount: round(value), unit: "ml" };
    default:
      return null;
  }
}

const round = (n: number) => Math.round(n * 100) / 100;
