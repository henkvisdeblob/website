/** Formats integer cents as Dutch euros without a space: 399 → "€3,99", 4120 → "€41,20". */
export function formatEuro(cents: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" })
    .format(cents / 100)
    .replace(/\s/g, "");
}
