import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  Package,
  PiggyBank,
  Shuffle,
  Smartphone,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ListPreview, MenuPreview } from "@/components/landing/previews";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Badge, Container } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — Elke week een weekmenu binnen je budget` },
  alternates: { canonical: "/" },
};

const STEPS = [
  {
    title: "Vertel wat je nodig hebt",
    body: "Voor hoeveel mensen je kookt, bij welke supermarkt je komt, wat je budget is en wat je niet eet. Dat stel je één keer in.",
  },
  {
    title: "Elke week een nieuw menu",
    body: "Op de avond voor je boodschappendag staat je weekmenu klaar, gebouwd rond de aanbiedingen die dan gelden.",
  },
  {
    title: "Afvinken in de winkel",
    body: "Eén lijst, per afdeling, in de verpakkingen die je echt koopt. Werkt ook als je in de winkel geen bereik hebt.",
  },
];

const DIFFERENCES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Wallet,
    title: "Je budget is de grens",
    body: "Het totaal telt alles mee, ook wat niet in de aanbieding is. Lukt het een week niet, dan zeggen we dat eerlijk en laten we het goedkoopste menu zien.",
  },
  {
    icon: PiggyBank,
    title: "Je ziet wat je bespaart",
    body: "Elke week in euro's, vergeleken met de normale prijs in dezelfde winkel.",
  },
  {
    icon: Package,
    title: "Rekenen in pakken, niet in grammen",
    body: "Op je lijst staat ‘Gehakt, 2\u00A0×\u00A0500\u00A0g’, niet ‘380 g gehakt’. Zo weet je wat je in je mandje legt en wat het kost.",
  },
  {
    icon: Shuffle,
    title: "Wissel wat je niet lust",
    body: "Vervang een recept met één tik. Je boodschappenlijst en het totaal passen zich meteen aan.",
  },
  {
    icon: Smartphone,
    title: "Geen app nodig",
    body: "Werkt in de browser op je telefoon, tablet en computer. Zet het op je beginscherm als je het als app wilt gebruiken.",
  },
];

const PLANS = [
  {
    name: "Gratis",
    price: "€0",
    period: "",
    intro: "Om te proberen of om af en toe te gebruiken.",
    features: ["Weekmenu voor 3 avonden", "Aanbiedingen van 1 supermarkt", "Boodschappenlijst om af te vinken"],
    highlight: false,
  },
  {
    name: "Premium",
    price: "€3,99",
    period: "per maand, of €34,99 per jaar",
    intro: "Voor wie elke week het hele menu wil.",
    features: [
      "Weekmenu voor tot 7 avonden",
      "Je budget als harde grens",
      "Dieet, allergieën en ‘dit eet ik niet’",
      "Recepten onbeperkt wisselen",
      "Overzicht van wat je bespaart",
    ],
    highlight: true,
  },
];

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "Wanneer kan ik beginnen?",
    a: "We bouwen Potje nu. Wie op de wachtlijst staat, krijgt als eerste toegang, in kleine groepjes. We mailen je zodra het jouw beurt is.",
  },
  {
    q: "Welke supermarkten doen mee?",
    a: "We beginnen met Albert Heijn, Jumbo en Lidl. Aldi en Plus staan daarna op de planning. Vertel bij je aanmelding waar jij boodschappen doet; dat helpt ons kiezen.",
  },
  {
    q: "Kloppen de prijzen altijd?",
    a: "We rekenen met de aanbiedingen en prijzen van die week. In de winkel kan een prijs soms afwijken, bijvoorbeeld als een actie alleen met de app of klantenkaart van de supermarkt geldt. Dat zetten we er dan bij.",
  },
  {
    q: "Ik eet vegetarisch of heb een allergie. Kan dat?",
    a: "Ja. Je stelt in wat je niet eet, en die recepten komen niet in je menu. Controleer bij een allergie wel altijd het etiket: wij kunnen niet garanderen wat er in een product zit.",
  },
  {
    q: "Moet ik een app downloaden?",
    a: "Nee. Potje werkt in de browser op je telefoon, tablet en computer. Wil je het als app gebruiken, dan zet je het op je beginscherm.",
  },
  {
    q: "Wat doen jullie met mijn e-mailadres?",
    a: (
      <>
        We gebruiken het alleen voor de wachtlijst: je aanmelding bevestigen en je laten weten wanneer je kunt beginnen.
        Uitschrijven kan met één klik onderaan elke mail. Lees ook onze{" "}
        <Link href="/privacy" className="text-primary underline underline-offset-4">
          privacyverklaring
        </Link>
        .
      </>
    ),
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="inhoud">
        {/* Hero */}
        <section className="pb-16 pt-10 md:pb-24 md:pt-16">
          <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div>
              <Badge tone="primary" className="text-sm">
                Binnenkort · nu op de wachtlijst
              </Badge>
              <h1 className="mt-5 text-h1 font-bold">Elke week een weekmenu binnen je budget.</h1>
              <p className="mt-5 max-w-prose text-lead text-fg-muted">
                Kies je supermarkt en je budget. {siteConfig.name} maakt een weekmenu met de aanbiedingen van deze
                week, plus een boodschappenlijst die je in de winkel afvinkt.
              </p>
              <div className="mt-8 max-w-xl">
                <WaitlistForm location="hero" />
              </div>
            </div>
            <div className="mx-auto w-full max-w-md lg:max-w-none">
              <MenuPreview />
            </div>
          </Container>
        </section>

        {/* Situation */}
        <section aria-labelledby="herkenbaar" className="bg-muted py-16 md:py-24">
          <Container className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 id="herkenbaar" className="text-h2 font-bold">
                Wat eten we deze week, en wat kost het?
              </h2>
              <p className="mt-5 max-w-prose text-lead text-fg-muted">
                Je bladert door de folder, ziet dat gehakt in de aanbieding is, en staat toch weer bij de kassa met
                meer dan je wilde uitgeven. {siteConfig.name} rekent het vooraf voor je uit: wat je kookt, wat je
                koopt en wat het samen kost.
              </p>
            </div>
            <div className="flex flex-col justify-center border-l-4 border-primary pl-6">
              <p className="font-display text-h1 font-bold tabular-nums">€150</p>
              <p className="mt-2 max-w-sm text-lead text-fg-muted">
                geeft een doorsnee huishouden per week uit aan boodschappen.
              </p>
              <p className="mt-3 text-caption text-fg-subtle">
                Bron:{" "}
                <a
                  href="https://www.abnamro.com/research/nl/onze-research/transactie-trends-bestaanszekerheid-toegenomen-ondanks-duurdere-boodschappen"
                  className="underline underline-offset-4 hover:text-fg"
                  rel="noopener noreferrer"
                >
                  ABN AMRO, transactiedata sept. 2024 – aug. 2025
                </a>
              </p>
            </div>
          </Container>
        </section>

        {/* How it works */}
        <section aria-labelledby="zo-werkt-het" className="py-16 md:py-24">
          <Container>
            <h2 id="zo-werkt-het" className="text-h2 font-bold">
              Zo werkt het
            </h2>
            <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((step, i) => (
                <li key={step.title} className="border-t border-border pt-6">
                  <span
                    aria-hidden="true"
                    className="grid size-10 place-items-center rounded-full bg-primary-soft font-display text-h4 font-bold text-on-primary-soft"
                  >
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-h3 font-bold">{step.title}</h3>
                  <p className="mt-2 text-fg-muted">{step.body}</p>
                </li>
              ))}
            </ol>
            <p className="mt-12 rounded-lg bg-muted px-5 py-4 text-fg-muted">
              We beginnen met de aanbiedingen van <strong className="text-fg">Albert Heijn</strong>,{" "}
              <strong className="text-fg">Jumbo</strong> en <strong className="text-fg">Lidl</strong>. Aldi en Plus
              staan daarna op de planning. {siteConfig.name} is onafhankelijk en niet verbonden aan een supermarkt.
            </p>
          </Container>
        </section>

        {/* Differences */}
        <section aria-labelledby="anders" className="bg-muted py-16 md:py-24">
          <Container className="grid items-start gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
            <div>
              <h2 id="anders" className="text-h2 font-bold">
                Wat {siteConfig.name} anders doet
              </h2>
              <ul className="mt-10 space-y-8">
                {DIFFERENCES.map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-md bg-surface text-primary ring-1 ring-border">
                      <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h3 className="text-h4 font-bold">{title}</h3>
                      <p className="mt-1 max-w-prose text-fg-muted">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mx-auto w-full max-w-md lg:sticky lg:top-8 lg:max-w-none">
              <ListPreview />
            </div>
          </Container>
        </section>

        {/* Pricing */}
        <section aria-labelledby="prijzen" className="py-16 md:py-24">
          <Container>
            <h2 id="prijzen" className="text-h2 font-bold">
              Gratis beginnen, of alles voor {PLANS[1].price} per maand
            </h2>
            <p className="mt-4 max-w-prose text-lead text-fg-muted">
              Je start met 14 dagen Premium, zonder betaalgegevens. Daarna kies je zelf: je gaat verder met Gratis, of
              je neemt Premium.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {PLANS.map((plan) => (
                <article
                  key={plan.name}
                  aria-labelledby={`plan-${plan.name}`}
                  className={`rounded-lg border bg-surface p-6 sm:p-8 ${
                    plan.highlight ? "border-primary ring-1 ring-primary" : "border-border"
                  }`}
                >
                  <h3 id={`plan-${plan.name}`} className="text-h3 font-bold">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-fg-muted">{plan.intro}</p>
                  <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
                    <span className="font-display text-h2 font-bold tabular-nums">{plan.price}</span>
                    {plan.period && <span className="text-fg-muted">{plan.period}</span>}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-savings-soft text-on-savings-soft"
                        >
                          <Check className="size-3.5" strokeWidth={2.5} />
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <p className="mt-6 text-sm text-fg-subtle">
              {siteConfig.name} is nog niet live. Dit zijn de prijzen waarmee we willen starten; je betaalt pas iets
              als je zelf Premium kiest.
            </p>
          </Container>
        </section>

        {/* FAQ */}
        <section aria-labelledby="vragen" className="bg-muted py-16 md:py-24">
          <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <h2 id="vragen" className="text-h2 font-bold">
              Vragen
            </h2>
            <div className="divide-y divide-border border-y border-border">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-h4 font-bold [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown
                      aria-hidden="true"
                      className="size-5 shrink-0 text-fg-subtle transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div className="max-w-prose pb-6 text-fg-muted">{a}</div>
                </details>
              ))}
            </div>
          </Container>
        </section>

        {/* Final call to action */}
        <section id="wachtlijst" aria-labelledby="meedoen" className="scroll-mt-4 py-16 md:py-24">
          <Container>
            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-6 text-center sm:p-10">
              <h2 id="meedoen" className="text-h2 font-bold">
                Doe mee vanaf het begin
              </h2>
              <p className="mx-auto mt-4 max-w-prose text-lead text-fg-muted">
                Meld je aan voor de wachtlijst. Vertel je erbij waar je boodschappen doet, dan weten we met welke
                supermarkten we moeten beginnen.
              </p>
              <div className="mt-8 text-left">
                <WaitlistForm variant="full" location="slot" />
              </div>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
