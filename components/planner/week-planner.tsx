"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, ChefHat, Clock, Info, Pencil, RefreshCw, ShoppingBasket, Tag, Users } from "lucide-react";
import { MealIcon } from "@/components/planner/meal-icon";
import { planWeekAction, type PlanState } from "@/app/actions/plan";
import { trackEvent } from "@/components/analytics";
import { Badge, ButtonLink, buttonStyles } from "@/components/ui";
import { getIngredient } from "@/lib/catalog/ingredients";
import { STORES } from "@/lib/catalog/stores";
import { AISLE_LABELS, AISLE_ORDER, ALLERGEN_LABELS, type Allergen, type RecipeUnit } from "@/lib/catalog/types";
import { formatDateNl, shortWeekdayNl, todayInAmsterdam, addDays } from "@/lib/dates";
import { formatEuro } from "@/lib/format";
import { suggestedBudgetCents } from "@/lib/planner/defaults";
import type { ChildAge, PlanResult, PlannedMeal, Purchase } from "@/lib/planner/types";

const initialState: PlanState = { status: "idle" };

const field = "mt-2 block h-12 w-full rounded-md border border-border-strong bg-surface px-3 text-base text-fg";
const labelCls = "block text-sm font-semibold text-fg";

/** `freeDinnerLimit` is set while Premium can be bought: more dinners are marked as Premium (the server checks). */
export function WeekPlanner({ emptyState, freeDinnerLimit = null }: { emptyState?: ReactNode; freeDinnerLimit?: number | null }) {
  const [state, formAction, pending] = useActionState(planWeekAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [variant, setVariant] = useState(0);
  // On phones the form folds away once there is a menu, so the result comes first.
  const [editingFor, setEditingFor] = useState<PlanState | null>(null);
  const collapsed = state.status === "ok" && editingFor !== state;

  const [adults, setAdults] = useState(2);
  const [kidsYoung, setKidsYoung] = useState(0);
  const [kidsOld, setKidsOld] = useState(0);
  const [dinners, setDinners] = useState(freeDinnerLimit === null ? 5 : Math.min(5, freeDinnerLimit));
  const [budgetTouched, setBudgetTouched] = useState(false);
  const [budget, setBudget] = useState("");
  const [dayLabels, setDayLabels] = useState<string[]>(["Vandaag", "Morgen", "Over 2 dagen", "Over 3 dagen", "Over 4 dagen", "Over 5 dagen", "Over 6 dagen"]);

  const children = useMemo<ChildAge[]>(
    () => [...Array<ChildAge>(kidsYoung).fill("4-8"), ...Array<ChildAge>(kidsOld).fill("9-13")],
    [kidsYoung, kidsOld],
  );
  const suggested = suggestedBudgetCents({ adults, children }, dinners) / 100;
  const budgetValue = budgetTouched ? budget : String(suggested);

  // Weekday names depend on the visitor's clock: fill them in after hydration.
  useEffect(() => {
    const today = todayInAmsterdam(new Date());
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time, client-only labels
    setDayLabels(
      Array.from({ length: 7 }, (_, i) => {
        const date = addDays(today, i);
        const prefix = i === 0 ? "Vandaag, " : i === 1 ? "Morgen, " : "";
        return `${prefix}${formatDateNl(date)}`;
      }),
    );
  }, []);

  useEffect(() => {
    if (state.status === "ok") trackEvent("Weekmenu gemaakt", { winkel: state.storeName });
  }, [state]);

  // Submit by hand instead of <form action>: React resets a form after an action, which would throw
  // away the visitor's choices (store, diet, day) after every menu.
  const submit = (nextVariant: number) => {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    data.set("variant", String(nextVariant));
    setVariant(nextVariant);
    startTransition(() => formAction(data));
  };
  const newVariant = () => submit(variant + 1);

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr] lg:gap-12">
      {state.status === "ok" && collapsed && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 lg:hidden">
          <p className="min-w-0 text-sm text-fg-muted">
            <span className="font-semibold text-fg">{state.storeName}</span> · {state.plan.meals.length} avonden ·{" "}
            {formatPortions(state.plan.portions)} porties
            {state.plan.budgetCents !== null && <> · budget {formatEuro(state.plan.budgetCents)}</>}
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingFor(state);
              requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("input, select")?.focus());
            }}
            className={`${buttonStyles.secondarySmall} shrink-0`}
          >
            <Pencil aria-hidden="true" className="size-4" />
            Aanpassen
          </button>
        </div>
      )}
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          submit(0);
        }}
        className={`h-fit rounded-xl border border-border bg-surface p-5 sm:p-6 lg:sticky lg:top-6 ${collapsed ? "max-lg:hidden" : ""}`}
      >
        <input type="hidden" name="variant" value={variant} readOnly />
        <fieldset>
          <legend className={labelCls}>Supermarkt</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {STORES.map((s, i) => (
              <label
                key={s.id}
                className="flex h-12 cursor-pointer items-center justify-center rounded-md border border-border-strong bg-surface px-2 text-center text-sm font-semibold text-fg has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-on-primary-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary"
              >
                <input type="radio" name="store" value={s.id} defaultChecked={i === 0} className="sr-only" />
                {s.name}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <NumberSelect label="Volwassenen" name="adults" value={adults} onChange={setAdults} min={1} max={6} />
          <NumberSelect label="Kind 1–8 jr" name="kidsYoung" value={kidsYoung} onChange={setKidsYoung} min={0} max={6} />
          <NumberSelect label="Kind 9+ jr" name="kidsOld" value={kidsOld} onChange={setKidsOld} min={0} max={6} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <NumberSelect label="Avonden" name="dinners" value={dinners} onChange={setDinners} min={3} max={7} premiumAbove={freeDinnerLimit} />
          <div>
            <label htmlFor="budgetEuro" className={labelCls}>
              Budget (€)
            </label>
            <input
              id="budgetEuro"
              name="budgetEuro"
              type="number"
              inputMode="decimal"
              min={0}
              max={1000}
              step={1}
              value={budgetValue}
              onChange={(e) => {
                setBudgetTouched(true);
                setBudget(e.target.value);
              }}
              aria-describedby="budget-hint"
              className={`${field} tabular-nums`}
            />
          </div>
        </div>
        <p id="budget-hint" className="mt-1.5 text-caption text-fg-subtle">
          Voor de avondmaaltijden van de hele week. Laat leeg voor geen grens.
        </p>

        <div className="mt-5">
          <label htmlFor="dayOffset" className={labelCls}>
            Wanneer doe je boodschappen?
          </label>
          <select id="dayOffset" name="dayOffset" defaultValue="0" className={field}>
            {dayLabels.map((label, i) => (
              <option key={i} value={i}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="diet" className={labelCls}>
              Dieet
            </label>
            <select id="diet" name="diet" defaultValue="none" className={field}>
              <option value="none">Alles</option>
              <option value="vegetarian">Vegetarisch</option>
              <option value="vegan">Veganistisch</option>
              <option value="no_pork">Geen varkensvlees</option>
              <option value="halal">Halal</option>
            </select>
          </div>
          <div>
            <label htmlFor="maxMinutes" className={labelCls}>
              Max. kooktijd
            </label>
            <select id="maxMinutes" name="maxMinutes" defaultValue="" className={field}>
              <option value="">Maakt niet uit</option>
              <option value="30">30 minuten</option>
              <option value="45">45 minuten</option>
            </select>
          </div>
        </div>

        <details className="mt-5 rounded-md border border-border px-3 py-2">
          <summary className="cursor-pointer py-1 text-sm font-semibold text-fg">Allergieën (optioneel)</summary>
          <div className="mt-2 grid grid-cols-2 gap-2 pb-1">
            {(Object.keys(ALLERGEN_LABELS) as Allergen[]).map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm text-fg">
                <input type="checkbox" name="allergens" value={a} className="size-4 accent-[var(--primary)]" />
                {ALLERGEN_LABELS[a]}
              </label>
            ))}
          </div>
          <p className="pb-1 text-caption text-fg-subtle">We bewaren dit niet. Controleer altijd het etiket.</p>
        </details>

        <button type="submit" disabled={pending} className={`${buttonStyles.primary} mt-6 w-full`}>
          <ChefHat aria-hidden="true" className="size-5" />
          {pending ? "Menu wordt gemaakt…" : "Maak mijn weekmenu"}
        </button>
      </form>

      <section aria-live="polite" aria-busy={pending} className="min-w-0">
        {state.status === "idle" && (emptyState ?? <EmptyState />)}
        {state.status === "error" &&
          (state.upgrade ? (
            // A plan limit, not an error: calm and informative, no red.
            <p role="alert" className="flex items-start gap-2 rounded-md bg-primary-soft px-4 py-3 text-on-primary-soft">
              <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <span>
                {state.message}{" "}
                <Link href="/account/abonnement" className="font-semibold underline underline-offset-4">
                  Premium bekijken
                </Link>
              </span>
            </p>
          ) : (
            <p role="alert" className="flex items-start gap-2 rounded-md bg-error-soft px-4 py-3 font-medium text-error">
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              {state.message}
            </p>
          ))}
        {state.status === "ok" && (
          <Results
            plan={state.plan}
            storeName={state.storeName}
            dataSource={state.dataSource}
            onNewVariant={newVariant}
            pending={pending}
          />
        )}
      </section>
    </div>
  );
}

function NumberSelect(props: {
  label: string;
  name: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  premiumAbove?: number | null;
}) {
  const id = `f-${props.name}`;
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {props.label}
      </label>
      <select id={id} name={props.name} value={props.value} onChange={(e) => props.onChange(Number(e.target.value))} className={field}>
        {Array.from({ length: props.max - props.min + 1 }, (_, i) => props.min + i).map((n) => (
          <option key={n} value={n}>
            {props.premiumAbove != null && n > props.premiumAbove ? `${n} (Premium)` : n}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Shown before the first menu: what happens, plus (server-rendered) this week's best deals. */
export function EmptyState({ children }: { children?: ReactNode }) {
  return (
    <div>
      <div className="flex items-start gap-4 rounded-xl bg-muted p-5 sm:p-6">
        <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-md bg-surface text-primary">
          <ShoppingBasket className="size-6" strokeWidth={1.75} />
        </span>
        <div>
          <p className="font-display text-h4 font-bold">Je weekmenu verschijnt hier</p>
          <p className="mt-1 max-w-prose text-fg-muted">
            Kies links je supermarkt en je huishouden. We zoeken de aanbiedingen van deze week erbij en maken een menu met
            boodschappenlijst, binnen je budget.
          </p>
        </div>
      </div>
      {children && (
        <div className="mt-8">
          <h2 className="text-h3 font-bold">Deze week in de aanbieding</h2>
          <p className="mt-1 text-fg-muted">De beste kook-aanbiedingen per supermarkt. Je menu wordt eromheen gebouwd.</p>
          <div className="mt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

function Results({
  plan,
  storeName,
  dataSource,
  onNewVariant,
  pending,
}: {
  plan: PlanResult;
  storeName: string;
  dataSource: "prijsprofeet" | "sample" | "none";
  onNewVariant: () => void;
  pending: boolean;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  // Bring the new results into view and move focus there, for keyboard and screen-reader users too.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    headingRef.current?.focus({ preventScroll: true });
  }, [plan]);
  const perPortion = plan.meals.length ? Math.round(plan.totalCents / (plan.portions * plan.meals.length)) : 0;
  return (
    <div ref={topRef} className="scroll-mt-4">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <h2 ref={headingRef} tabIndex={-1} className="text-sm font-semibold text-fg-subtle outline-none">
          Weekmenu · {storeName} · boodschappen op {formatDateNl(plan.shopDate)}
        </h2>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <p className="font-display text-h1 font-bold tabular-nums leading-none">{formatEuro(plan.totalCents)}</p>
          {plan.budgetCents !== null &&
            (plan.withinBudget ? (
              <Badge tone="savings" className="text-sm">
                binnen je budget van {formatEuro(plan.budgetCents)}
              </Badge>
            ) : (
              <Badge tone="warning" className="text-sm">
                boven je budget van {formatEuro(plan.budgetCents)}
              </Badge>
            ))}
        </div>
        {plan.budgetCents !== null && plan.budgetCents > 0 && <BudgetMeter total={plan.totalCents} budget={plan.budgetCents} />}
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-muted">
          <span className="inline-flex items-center gap-1">
            <Users aria-hidden="true" className="size-4" /> {formatPortions(plan.portions)} porties per avond
          </span>
          <span className="tabular-nums">≈ {formatEuro(perPortion)} per portie</span>
          {plan.savingsCents > 0 && (
            <span className="font-semibold text-savings">
              Je bespaart {formatEuro(plan.savingsCents)} met de aanbiedingen
              {plan.savingsIncludesEstimates ? " (deels geschat)" : ""}
            </span>
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={onNewVariant} disabled={pending} className={buttonStyles.secondarySmall}>
            <RefreshCw aria-hidden="true" className="size-4" />
            Ander menu
          </button>
          <a href="#boodschappenlijst" className={buttonStyles.secondarySmall}>
            <ShoppingBasket aria-hidden="true" className="size-4" />
            Naar de boodschappenlijst
          </a>
        </div>
      </div>

      {dataSource === "sample" && (
        <p className="mt-4 flex items-start gap-2 rounded-md bg-warning-soft px-4 py-3 text-sm font-medium text-warning">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Testmodus: dit menu gebruikt verzonnen voorbeeldaanbiedingen.
        </p>
      )}
      {plan.warnings.map((w) => (
        <p key={w} className="mt-4 flex items-start gap-2 rounded-md bg-warning-soft px-4 py-3 text-sm font-medium text-warning">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {w}
        </p>
      ))}

      <h2 className="mt-10 text-h3 font-bold">Wat eten we?</h2>
      <ol aria-label="Avondmaaltijden" className="mt-4 space-y-4">
        {plan.meals.map((meal) => (
          <MealCard key={meal.recipe.id} meal={meal} />
        ))}
      </ol>

      <ShoppingList plan={plan} />

      <p className="mt-6 text-caption text-fg-subtle">
        {dataSource === "prijsprofeet" && (
          <>
            Aanbiedingen via{" "}
            <a href="https://www.prijsprofeet.nl" rel="noopener" className="underline underline-offset-4 hover:text-fg">
              PrijsProfeet
            </a>
            .{" "}
          </>
        )}
        Prijzen met ~ zijn schattingen van de normale prijs. Prijzen en aanbiedingen kunnen in de winkel afwijken. Controleer bij allergieën
        altijd het etiket.
      </p>

      <div className="mt-10 rounded-xl bg-muted p-6">
        <p className="font-display text-h3 font-bold">Elke week vanzelf zo’n menu?</p>
        <p className="mt-2 max-w-prose text-fg-muted">
          Met een account maakt Potje dit elke week automatisch, op de avond voor je boodschappendag. Zet je op de wachtlijst, dan hoor je het
          als eerste.
        </p>
        <ButtonLink href="/#wachtlijst" className="mt-4">
          Zet me op de wachtlijst
        </ButtonLink>
      </div>
    </div>
  );
}

function MealCard({ meal }: { meal: PlannedMeal }) {
  const r = meal.recipe;
  const factor = meal.portions / r.servings;
  return (
    <li className="rounded-lg border border-border bg-surface">
      <div className="flex gap-4 p-4 sm:p-5">
        <div className="w-11 shrink-0 text-center">
          <span className="block text-sm font-bold uppercase text-fg-subtle">{shortWeekdayNl(meal.date)}</span>
          <span className="block font-display text-h4 font-bold tabular-nums">{Number(meal.date.slice(8))}</span>
        </div>
        <MealIcon recipe={r} className="hidden size-11 shrink-0 sm:grid" />
        <div className="min-w-0 flex-1">
          <h3 className="text-h4 font-bold leading-snug">{r.title}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-muted">
            <span className="inline-flex items-center gap-1">
              <Clock aria-hidden="true" className="size-3.5" /> {r.prepMinutes + r.cookMinutes} min
            </span>
            <span className="tabular-nums">± {formatEuro(meal.costCents)}</span>
          </p>
          {meal.reasons.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {meal.reasons.map((reason) => (
                <li key={reason}>
                  <Badge tone={reason.startsWith("Deelt") ? "neutral" : "savings"}>
                    {!reason.startsWith("Deelt") && <Tag aria-hidden="true" className="size-3" />} {reason}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <details className="group mt-3">
            <summary className="cursor-pointer text-sm font-semibold text-primary underline-offset-4 hover:underline">Recept bekijken</summary>
            <div className="mt-3 grid gap-5 sm:grid-cols-[minmax(0,14rem)_1fr]">
              <div>
                <p className="text-caption font-bold uppercase tracking-wide text-fg-subtle">Ingrediënten</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {r.ingredients.map((line) => (
                    <li key={line.id} className="flex justify-between gap-3">
                      <span>{getIngredient(line.id).name}</span>
                      <span className="shrink-0 tabular-nums text-fg-muted">{formatAmount(line.amount * factor, line.unit)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-caption font-bold uppercase tracking-wide text-fg-subtle">Bereiding</p>
                <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">
                  {r.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </details>
        </div>
      </div>
    </li>
  );
}

function ShoppingList({ plan }: { plan: PlanResult }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const groups = AISLE_ORDER.map((aisle) => ({ aisle, items: plan.purchases.filter((p) => p.aisle === aisle) })).filter((g) => g.items.length);

  return (
    <section aria-labelledby="boodschappenlijst" className="mt-10 scroll-mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="boodschappenlijst" className="text-h3 font-bold">
          Boodschappenlijst
        </h2>
        <p className="text-sm text-fg-subtle">
          {checked.size} van {plan.purchases.length} in je mandje
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Boodschappen in je mandje"
        aria-valuemin={0}
        aria-valuemax={plan.purchases.length}
        aria-valuenow={checked.size}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-savings transition-[width] duration-300"
          style={{ width: `${plan.purchases.length ? (checked.size / plan.purchases.length) * 100 : 0}%` }}
        />
      </div>
      <div className="mt-4 rounded-lg border border-border bg-surface px-4 py-2 sm:px-5">
        {groups.map((g) => (
          <div key={g.aisle} className="py-3">
            <p className="text-caption font-bold uppercase tracking-wide text-fg-subtle">{AISLE_LABELS[g.aisle]}</p>
            <ul className="mt-2 space-y-1">
              {g.items.map((p) => (
                <ListItem key={p.ingredientId} purchase={p} checked={checked.has(p.ingredientId)} onToggle={() => toggle(p.ingredientId)} />
              ))}
            </ul>
          </div>
        ))}
        {plan.pantry.length > 0 && (
          <div className="py-3">
            <p className="text-caption font-bold uppercase tracking-wide text-fg-subtle">Check of je dit in huis hebt</p>
            <p className="mt-2 text-sm text-fg-muted">{plan.pantry.map((p) => p.name).join(" · ")}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ListItem({ purchase: p, checked, onToggle }: { purchase: Purchase; checked: boolean; onToggle: () => void }) {
  return (
    <li>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md py-1.5">
        <input type="checkbox" checked={checked} onChange={onToggle} className="size-5 shrink-0 accent-[var(--savings)]" />
        <span className={`min-w-0 flex-1 ${checked ? "text-fg-subtle line-through" : "text-fg"}`}>
          <span className="font-medium">
            {p.packs}× {p.title}
          </span>{" "}
          <span className="text-sm text-fg-muted">({p.packLabel})</span>
          {p.freeExtraPacks > 0 && <span className="block text-caption text-savings">waarvan {p.freeExtraPacks} gratis extra: invriezen of bewaren</span>}
        </span>
        {p.deal && <Badge tone="savings">{p.deal.label}</Badge>}
        <span className="w-16 shrink-0 text-right text-sm tabular-nums text-fg-muted">
          {p.priceEstimated && (
            <span aria-hidden="true" title="Geschatte normale prijs">
              ~{" "}
            </span>
          )}
          {formatEuro(p.costCents)}
          {p.priceEstimated && <span className="sr-only"> (geschatte prijs)</span>}
        </span>
      </label>
    </li>
  );
}

function BudgetMeter({ total, budget }: { total: number; budget: number }) {
  const ratio = Math.min(1, total / budget);
  const over = total > budget;
  const left = budget - total;
  return (
    <div className="mt-4">
      <div
        role="meter"
        aria-label="Deel van je budget"
        aria-valuemin={0}
        aria-valuemax={budget / 100}
        aria-valuenow={total / 100}
        aria-valuetext={`${formatEuro(total)} van ${formatEuro(budget)}`}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div className={`h-full rounded-full ${over ? "bg-warning" : "bg-savings"}`} style={{ width: `${ratio * 100}%` }} />
      </div>
      <p className="mt-1.5 text-caption text-fg-subtle tabular-nums">
        {over ? `${formatEuro(-left)} boven je budget` : `Nog ${formatEuro(left)} over van je budget`}
      </p>
    </div>
  );
}

function formatPortions(n: number) {
  return n.toLocaleString("nl-NL", { maximumFractionDigits: 1 });
}

function formatAmount(amount: number, unit: RecipeUnit): string {
  if (unit === "el" || unit === "tl") return `${roundTo(amount, 0.5).toLocaleString("nl-NL")} ${unit}`;
  if (unit === "stuk") {
    const v = roundTo(amount, 0.5);
    const whole = Math.floor(v);
    const half = v - whole >= 0.5;
    return `${whole > 0 ? whole : ""}${half ? "½" : whole === 0 ? "½" : ""}`.trim() || "1";
  }
  if (amount >= 1000) return `${(roundTo(amount, 50) / 1000).toLocaleString("nl-NL")} ${unit === "g" ? "kg" : "l"}`;
  return `${roundTo(amount, amount >= 100 ? 10 : 5)} ${unit}`;
}

function roundTo(value: number, step: number) {
  return Math.max(step, Math.round(value / step) * step);
}
