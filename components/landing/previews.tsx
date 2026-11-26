import { Check, Clock, PiggyBank, Tag } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatEuro } from "@/lib/format";

/*
 * Illustrative product previews for the landing page. All amounts are made up and the
 * components are always shown with a "Voorbeeld" label — never present them as real data.
 */

type Meal = { day: string; title: string; minutes: number; cents: number; deal?: string };

const EXAMPLE_MEALS: Meal[] = [
  { day: "Za", title: "Gehaktballetjes in tomatensaus met pasta", minutes: 30, cents: 640, deal: "Gehakt 1+1 gratis" },
  { day: "Zo", title: "Bloemkoolcurry met rijst", minutes: 35, cents: 510, deal: "Bloemkool −30%" },
  { day: "Di", title: "Pasta met spinazie en ricotta", minutes: 25, cents: 490 },
  { day: "Do", title: "Kip met krieltjes uit de oven", minutes: 40, cents: 730, deal: "Kipdijfilet −25%" },
];

const EXAMPLE_BUDGET_CENTS = 3000;
const EXAMPLE_SAVINGS_CENTS = 612;

export function MenuPreview() {
  const total = EXAMPLE_MEALS.reduce((sum, m) => sum + m.cents, 0);

  return (
    <figure className="w-full">
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        <div className="border-b border-border px-5 pb-5 pt-4 sm:px-6">
          <div className="flex items-center justify-between text-sm text-fg-subtle">
            <span className="font-semibold">Weekmenu · Lidl</span>
            <span>3 personen · 4 avonden</span>
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
            <p className="font-display text-h2 font-bold tabular-nums leading-none text-fg">{formatEuro(total)}</p>
            <Badge tone="savings" className="text-sm">
              <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
              binnen je budget van {formatEuro(EXAMPLE_BUDGET_CENTS)}
            </Badge>
          </div>
          <p className="mt-2 text-sm font-semibold text-savings">
            Je bespaart {formatEuro(EXAMPLE_SAVINGS_CENTS)} met de aanbiedingen van deze week
          </p>
        </div>
        <ul className="divide-y divide-border">
          {EXAMPLE_MEALS.map((meal) => (
            <li key={meal.day} className="flex gap-4 px-5 py-4 sm:px-6">
              <span className="w-7 shrink-0 pt-0.5 text-sm font-bold uppercase text-fg-subtle">{meal.day}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug text-fg">{meal.title}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-muted">
                  <span className="inline-flex items-center gap-1">
                    <Clock aria-hidden="true" className="size-3.5" /> {meal.minutes} min
                  </span>
                  <span className="tabular-nums">{formatEuro(meal.cents)}</span>
                  {meal.deal && (
                    <Badge tone="savings">
                      <Tag aria-hidden="true" className="size-3" /> {meal.deal}
                    </Badge>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="mt-3 text-center text-caption text-fg-subtle">
        Voorbeeld van een weekmenu · bedragen ter illustratie
      </figcaption>
    </figure>
  );
}

/** Hero visual: the week menu with a savings note and a slice of the shopping list floating around it. */
export function HeroVisual() {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-xl bg-primary-soft/60 blur-2xl lg:-inset-10" />
      <MenuPreview />
      <div
        aria-hidden="true"
        className="absolute -right-3 -top-5 hidden items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-savings shadow-card sm:flex lg:-right-8"
      >
        <PiggyBank className="size-4" strokeWidth={2} />
        Je bespaart {formatEuro(EXAMPLE_SAVINGS_CENTS)}
      </div>
    </div>
  );
}

type ListItem = { label: string; cents: number; deal?: string; checked?: boolean };

const EXAMPLE_LIST: { aisle: string; items: ListItem[] }[] = [
  {
    aisle: "Groente & fruit",
    items: [
      { label: "Bloemkool, 1 stuk", cents: 129, deal: "−30%" },
      { label: "Uien, net van 1 kg", cents: 99 },
      { label: "Spinazie, 400 g", cents: 149 },
    ],
  },
  {
    aisle: "Vlees & vis",
    items: [
      { label: "Rundergehakt, 2\u00A0×\u00A0500\u00A0g", cents: 449, deal: "1+1 gratis" },
      { label: "Kipdijfilet, 600 g", cents: 549, deal: "−25%" },
    ],
  },
  {
    aisle: "Houdbaar",
    items: [{ label: "Rijst, 1 kg", cents: 119, checked: true }],
  },
];

export function ListPreview() {
  return (
    <figure className="w-full">
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <span className="font-display text-h4 font-bold">Boodschappenlijst</span>
          <span className="text-sm text-fg-subtle">1 van 6 in je mandje</span>
        </div>
        <div className="px-5 py-2 sm:px-6">
          {EXAMPLE_LIST.map((group) => (
            <div key={group.aisle} className="py-3">
              <p className="text-caption font-bold uppercase tracking-wide text-fg-subtle">{group.aisle}</p>
              <ul className="mt-2 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`grid size-5 shrink-0 place-items-center rounded-sm border ${
                        item.checked ? "border-savings bg-savings text-surface" : "border-border-strong"
                      }`}
                    >
                      {item.checked && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                    <span
                      className={`min-w-0 flex-1 ${item.checked ? "text-fg-subtle line-through" : "text-fg"}`}
                    >
                      {item.label}
                      {item.checked && <span className="sr-only"> (afgevinkt)</span>}
                    </span>
                    {item.deal && <Badge tone="savings">{item.deal}</Badge>}
                    <span className="w-14 text-right text-sm tabular-nums text-fg-muted">{formatEuro(item.cents)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 text-center text-caption text-fg-subtle">
        Voorbeeld · bedragen ter illustratie
      </figcaption>
    </figure>
  );
}
