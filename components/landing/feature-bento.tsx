import { ArrowRight, Laptop, Package, PiggyBank, Shuffle, Smartphone, Wallet, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { formatEuro } from "@/lib/format";

/*
 * "Wat Potje anders doet" as a grid of tiles, each with a small piece of real-looking UI.
 * All amounts are illustrative; the section caption says so.
 */

function Tile({
  icon: Icon,
  title,
  body,
  visual,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  visual: ReactNode;
  className?: string;
}) {
  return (
    <li className={`flex flex-col rounded-xl border border-border bg-surface p-5 sm:p-6 ${className}`}>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid size-10 place-items-center rounded-md bg-primary-soft text-on-primary-soft">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <h3 className="text-h4 font-bold">{title}</h3>
      </div>
      <p className="mt-3 max-w-prose text-fg-muted">{body}</p>
      <div aria-hidden="true" className="mt-5 flex flex-1 items-end">
        <div className="w-full">{visual}</div>
      </div>
    </li>
  );
}

function BudgetVisual() {
  return (
    <div className="rounded-lg bg-muted p-4">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-h3 font-bold tabular-nums">{formatEuro(2630)}</span>
        <span className="text-sm text-fg-muted tabular-nums">van {formatEuro(3000)}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
        <div className="h-full w-[88%] rounded-full bg-savings" />
      </div>
      <p className="mt-2 text-caption text-fg-subtle">Nog {formatEuro(370)} over van je budget</p>
    </div>
  );
}

function SavingsVisual() {
  const weeks = [42, 65, 38, 80, 56, 92, 70];
  return (
    <div className="rounded-lg bg-muted p-4">
      <p className="text-caption font-semibold text-fg-subtle">Bespaard deze maand</p>
      <p className="mt-1 font-display text-h3 font-bold tabular-nums text-savings">{formatEuro(3820)}</p>
      <div className="mt-3 flex h-14 items-end gap-1.5">
        {weeks.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-savings/80" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function PacksVisual() {
  return (
    <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
      <p className="text-fg-subtle line-through decoration-error/60">380 g rundergehakt</p>
      <p className="flex items-center gap-2 font-semibold text-fg">
        <ArrowRight className="size-4 text-primary" />
        Rundergehakt, 1 × 500 g
      </p>
    </div>
  );
}

function SwapVisual() {
  return (
    <div className="rounded-lg bg-muted p-4 text-sm">
      <p className="font-semibold text-fg">Pasta met tonijn en tomaat</p>
      <div className="mt-3 flex items-center justify-between rounded-md bg-surface px-3 py-2">
        <span className="text-fg-muted">Kip kerrie met rijst</span>
        <span className="font-semibold tabular-nums text-fg">+{formatEuro(80)}</span>
      </div>
    </div>
  );
}

function DevicesVisual() {
  return (
    <div className="flex items-center justify-center gap-4 rounded-lg bg-muted p-4 text-primary">
      <Smartphone className="size-8" strokeWidth={1.5} />
      <Laptop className="size-10" strokeWidth={1.5} />
    </div>
  );
}

export function FeatureBento() {
  return (
    <ul className="grid gap-4 md:grid-cols-6">
      <Tile
        className="md:col-span-3"
        icon={Wallet}
        title="Je budget is de grens"
        body="Het totaal telt alles mee, ook wat niet in de aanbieding is. Lukt het een week niet, dan zeggen we dat eerlijk en laten we het goedkoopste menu zien."
        visual={<BudgetVisual />}
      />
      <Tile
        className="md:col-span-3"
        icon={PiggyBank}
        title="Je ziet wat je bespaart"
        body="Elke week in euro's, vergeleken met de normale prijs in dezelfde winkel."
        visual={<SavingsVisual />}
      />
      <Tile
        className="md:col-span-2"
        icon={Package}
        title="Rekenen in pakken"
        body="Op je lijst staat wat je echt in je mandje legt, niet hoeveel gram een recept vraagt."
        visual={<PacksVisual />}
      />
      <Tile
        className="md:col-span-2"
        icon={Shuffle}
        title="Wissel wat je niet lust"
        body="Vervang een recept met één tik. Je lijst en het totaal passen zich meteen aan."
        visual={<SwapVisual />}
      />
      <Tile
        className="md:col-span-2"
        icon={Smartphone}
        title="Geen app nodig"
        body="Werkt in de browser op je telefoon, tablet en computer."
        visual={<DevicesVisual />}
      />
    </ul>
  );
}
