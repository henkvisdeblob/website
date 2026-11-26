import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { TopDeals } from "@/components/deals/top-deals";
import { FeatureBento } from "@/components/landing/feature-bento";
import { HeroVisual } from "@/components/landing/previews";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Badge, ButtonLink, Container } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — Elke week een weekmenu binnen je budget` },
  alternates: { canonical: "/" },
};

const STEPS = [
  {
    title: "Vertel wat je nodig hebt",
    body: "Voor hoeveel mensen je kookt, bij welke supermarkt je komt, wat je budget is en wat je niet eet.",
  },
  {
    title: "Krijg een menu uit de aanbiedingen",
    body: "Potje zoekt de aanbiedingen die op jouw boodschappendag gelden en bouwt daar een gevarieerd weekmenu omheen.",
  },
  {
    title: "Afvinken in de winkel",
    body: "Eén lijst, per afdeling, in de verpakkingen die je echt koopt. Met de prijzen erbij.",
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
    intro: "Voor wie elke week vanzelf het hele menu wil.",
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
    q: "Kan ik het nu al gebruiken?",
    a: (
      <>
        Ja. Je kunt nu gratis een{" "}
        <Link href="/weekmenu" className="text-primary underline underline-offset-4">
          weekmenu maken
        </Link>{" "}
        met de aanbiedingen van deze week, zonder account. Accounts, waarmee je elke week vanzelf een menu krijgt, bouwen we nu. Wie op de
        wachtlijst staat, krijgt daar als eerste toegang toe.
      </>
    ),
  },
  {
    q: "Welke supermarkten doen mee?",
    a: "Albert Heijn, Jumbo en Lidl. Aldi en Plus staan daarna op de planning.",
  },
  {
    q: "Kloppen de prijzen altijd?",
    a: "We rekenen met de aanbiedingen en prijzen van die week. In de winkel kan een prijs soms afwijken, bijvoorbeeld als een actie alleen met de app of klantenkaart van de supermarkt geldt. Prijzen die we schatten, markeren we met ~.",
  },
  {
    q: "Ik eet vegetarisch of heb een allergie. Kan dat?",
    a: "Ja. Je stelt in wat je niet eet, en die recepten komen niet in je menu. Controleer bij een allergie wel altijd het etiket: wij kunnen niet garanderen wat er in een product zit.",
  },
  {
    q: "Moet ik een app downloaden?",
    a: "Nee. Potje werkt in de browser op je telefoon, tablet en computer.",
  },
  {
    q: "Wat doen jullie met mijn e-mailadres?",
    a: (
      <>
        Als je je aanmeldt voor de wachtlijst, gebruiken we het alleen om je aanmelding te bevestigen en je te laten weten wanneer accounts
        klaar zijn. Uitschrijven kan met één klik onderaan elke mail. Lees ook onze{" "}
        <Link href="/privacy" className="text-primary underline underline-offset-4">
          privacyverklaring
        </Link>
        .
      </>
    ),
  },
];

function DealsSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-4 md:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-72 animate-pulse rounded-lg border border-border bg-surface" />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="inhoud">
        {/* Hero */}
        <section className="overflow-x-clip pb-20 pt-10 md:pb-28 md:pt-16">
          <Container className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div>
              <Badge tone="primary" className="text-sm">
                Gratis · zonder account
              </Badge>
              <h1 className="mt-5 text-h1 font-bold">Elke week een weekmenu binnen je budget.</h1>
              <p className="mt-5 max-w-prose text-lead text-fg-muted">
                Kies je supermarkt en je budget. {siteConfig.name} maakt een weekmenu met de aanbiedingen van deze week, plus een
                boodschappenlijst die je in de winkel afvinkt.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <ButtonLink href="/weekmenu" className="w-full shrink-0 whitespace-nowrap sm:w-auto">
                  Maak gratis je weekmenu
                  <ArrowRight aria-hidden="true" className="size-5" />
                </ButtonLink>
                <p className="text-sm text-fg-subtle">Met de echte aanbiedingen van Albert Heijn, Jumbo en Lidl.</p>
              </div>
              <p className="mt-6 text-sm text-fg-muted">
                Elke week vanzelf een menu in je mail?{" "}
                {/* A native in-page anchor, so keyboard focus continues from the waitlist form. */}
                <a href="#wachtlijst" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Zet je op de wachtlijst
                </a>
              </p>
            </div>
            <div className="mx-auto w-full max-w-md lg:max-w-none">
              <HeroVisual />
            </div>
          </Container>
        </section>

        {/* Live deals */}
        <section aria-labelledby="aanbiedingen" className="border-y border-border bg-muted py-16 md:py-20">
          <Container>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 id="aanbiedingen" className="text-h2 font-bold">
                  Deze week in de aanbieding
                </h2>
                <p className="mt-3 max-w-prose text-lead text-fg-muted">
                  De beste kook-aanbiedingen van deze week, per supermarkt. Potje bouwt je menu eromheen.
                </p>
              </div>
              <ButtonLink href="/weekmenu" variant="secondary" className="shrink-0 self-start md:self-auto">
                Maak hier een menu van
                <ArrowRight aria-hidden="true" className="size-5" />
              </ButtonLink>
            </div>
            <div className="mt-10">
              <Suspense fallback={<DealsSkeleton />}>
                <TopDeals />
              </Suspense>
            </div>
          </Container>
        </section>

        {/* Situation */}
        <section aria-labelledby="herkenbaar" className="py-16 md:py-24">
          <Container className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 id="herkenbaar" className="text-h2 font-bold">
                Wat eten we deze week, en wat kost het?
              </h2>
              <p className="mt-5 max-w-prose text-lead text-fg-muted">
                Je bladert door de folder, ziet dat gehakt in de aanbieding is, en staat toch weer bij de kassa met meer dan je wilde
                uitgeven. {siteConfig.name} rekent het vooraf voor je uit: wat je kookt, wat je koopt en wat het samen kost.
              </p>
            </div>
            <div className="flex flex-col justify-center rounded-xl bg-primary-soft p-8">
              <p className="font-display text-h1 font-bold tabular-nums text-on-primary-soft">€150</p>
              <p className="mt-2 max-w-sm text-lead text-on-primary-soft">geeft een doorsnee huishouden per week uit aan boodschappen.</p>
              <p className="mt-4 text-caption text-on-primary-soft/80">
                Bron:{" "}
                <a
                  href="https://www.abnamro.com/research/nl/onze-research/transactie-trends-bestaanszekerheid-toegenomen-ondanks-duurdere-boodschappen"
                  className="underline underline-offset-4"
                  rel="noopener noreferrer"
                >
                  ABN AMRO, transactiedata sept. 2024 – aug. 2025
                </a>
              </p>
            </div>
          </Container>
        </section>

        {/* How it works */}
        <section aria-labelledby="zo-werkt-het" className="bg-muted py-16 md:py-24">
          <Container>
            <h2 id="zo-werkt-het" className="text-h2 font-bold">
              Zo werkt het
            </h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.title} className="rounded-xl border border-border bg-surface p-6">
                  <span className="font-display text-h2 font-bold tabular-nums text-primary">0{i + 1}</span>
                  <h3 className="mt-3 text-h4 font-bold">{step.title}</h3>
                  <p className="mt-2 text-fg-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* Differences */}
        <section aria-labelledby="anders" className="py-16 md:py-24">
          <Container>
            <h2 id="anders" className="text-h2 font-bold">
              Wat {siteConfig.name} anders doet
            </h2>
            <p className="mt-3 max-w-prose text-lead text-fg-muted">Niet alleen recepten, maar een plan dat klopt met je portemonnee.</p>
            <div className="mt-10">
              <FeatureBento />
            </div>
            <p className="mt-4 text-caption text-fg-subtle">Bedragen in de voorbeelden zijn ter illustratie.</p>
          </Container>
        </section>

        {/* Pricing */}
        <section aria-labelledby="prijzen" className="bg-muted py-16 md:py-24">
          <Container>
            <h2 id="prijzen" className="text-h2 font-bold">
              Gratis beginnen, of alles voor {PLANS[1].price} per maand
            </h2>
            <p className="mt-4 max-w-prose text-lead text-fg-muted">
              Een weekmenu maken kan nu al gratis. Met een account straks krijg je het elke week vanzelf, en start je met 14 dagen Premium
              zonder betaalgegevens.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {PLANS.map((plan) => (
                <article
                  key={plan.name}
                  aria-labelledby={`plan-${plan.name}`}
                  className={`rounded-xl border bg-surface p-6 sm:p-8 ${plan.highlight ? "border-primary ring-1 ring-primary" : "border-border"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 id={`plan-${plan.name}`} className="text-h3 font-bold">
                      {plan.name}
                    </h3>
                    {plan.highlight && <Badge tone="primary">Binnenkort</Badge>}
                  </div>
                  <p className="mt-1 text-fg-muted">{plan.intro}</p>
                  <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
                    <span className="font-display text-h2 font-bold tabular-nums">{plan.price}</span>
                    {plan.period && <span className="text-fg-muted">{plan.period}</span>}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-3">
                        <span aria-hidden="true" className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-savings-soft text-on-savings-soft">
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
              Premium komt er binnenkort. Dit zijn de prijzen waarmee we willen starten; je betaalt pas iets als je zelf Premium kiest.
            </p>
          </Container>
        </section>

        {/* FAQ */}
        <section aria-labelledby="vragen" className="py-16 md:py-24">
          <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <h2 id="vragen" className="text-h2 font-bold">
              Vragen
            </h2>
            <div className="divide-y divide-border border-y border-border">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-h4 font-bold [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-fg-subtle transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="max-w-prose pb-6 text-fg-muted">{a}</div>
                </details>
              ))}
            </div>
          </Container>
        </section>

        {/* Waitlist */}
        <section id="wachtlijst" aria-labelledby="meedoen" className="scroll-mt-4 bg-muted py-16 md:py-24">
          <Container>
            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-6 text-center shadow-card sm:p-10">
              <h2 id="meedoen" className="text-h2 font-bold">
                Elke week vanzelf je menu?
              </h2>
              <p className="mx-auto mt-4 max-w-prose text-lead text-fg-muted">
                Met een account maakt {siteConfig.name} je menu elke week automatisch, op de avond voor je boodschappendag. Zet je op de
                wachtlijst, dan hoor je het als eerste.
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
