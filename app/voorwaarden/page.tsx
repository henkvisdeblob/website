import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { SimplePage } from "@/components/site-chrome";
import { Missing } from "@/components/ui";
import { FREE_DINNER_LIMIT } from "@/lib/billing/limits";
import { PAST_DUE_GRACE_DAYS, WITHDRAWAL_PERIOD_DAYS } from "@/lib/billing/entitlements";
import { siteConfig } from "@/lib/site-config";

/*
 * Terms for the Premium subscription, in plain Dutch. Draft based on docs/09: have a lawyer review it
 * before taking real payments. Keep it in line with the behaviour in lib/billing.
 */

export const metadata: Metadata = {
  title: "Voorwaarden",
  description: `De voorwaarden van ${siteConfig.name} Premium: prijs, verlengen, opzeggen en herroepen.`,
};

const VERSION = "26 november 2026";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-h3 font-bold">{title}</h2>
      <div className="mt-3 space-y-3 text-fg-muted [&_strong]:text-fg">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  const name = siteConfig.name;
  const owner = siteConfig.ownerName ?? <Missing>[naam nog invullen]</Missing>;
  const address = siteConfig.ownerAddress ?? <Missing>[adres nog invullen]</Missing>;
  const kvk = siteConfig.kvkNumber ?? <Missing>[KvK-nummer nog invullen]</Missing>;
  const email = siteConfig.contactEmail ? (
    <a className="text-primary underline underline-offset-4" href={`mailto:${siteConfig.contactEmail}`}>
      {siteConfig.contactEmail}
    </a>
  ) : (
    <Missing>[e-mailadres nog invullen]</Missing>
  );

  return (
    <SimplePage>
      <h1 className="text-h1 font-bold">Voorwaarden</h1>
      <p className="mt-3 text-fg-subtle">Versie van {VERSION}</p>
      <p className="mt-6 text-lead text-fg-muted">
        Hier staat wat je van {name} mag verwachten als je een account hebt of Premium afsluit. In gewone taal, zonder
        kleine lettertjes.
      </p>

      <Section title="1. Wie we zijn">
        <p>
          {name} wordt gemaakt door {owner}, {address}, KvK {kvk}. Je bereikt ons via {email}.
        </p>
      </Section>

      <Section title="2. Gratis en Premium">
        <p>
          Met <strong>Gratis</strong> maak je een weekmenu voor maximaal {FREE_DINNER_LIMIT} avonden per week, met een
          boodschappenlijst. Met <strong>Premium</strong> maak je weekmenu&apos;s voor 4 tot 7 avonden. Nieuwe
          Premium-functies krijg je zonder extra kosten.
        </p>
        <p>
          Een nieuw account krijgt 14 dagen Premium gratis. Daarvoor vul je geen betaalgegevens in, en de proefperiode
          gaat <strong>niet</strong> vanzelf over in een betaald abonnement: daarna heb je gewoon Gratis, tenzij je zelf
          Premium afsluit.
        </p>
      </Section>

      <Section title="3. Prijs en betalen">
        <p>
          De prijs zie je voordat je afsluit, op je accountpagina. Alle prijzen zijn inclusief btw. Je betaalt vooraf,
          per maand of per jaar, via onze betaalpartner Stripe. Wij zien en bewaren je betaalgegevens niet.
        </p>
        <p>
          Willen we de prijs verhogen, dan laten we je dat minstens 30 dagen van tevoren weten. Ben je het er niet mee
          eens, dan kun je opzeggen voordat de nieuwe prijs ingaat.
        </p>
      </Section>

      <Section title="4. Verlengen en opzeggen">
        <p>
          Je abonnement wordt automatisch verlengd: een maandabonnement elke maand, een jaarabonnement elk jaar. Een
          maand voordat een jaarabonnement wordt verlengd, sturen we je een herinnering.
        </p>
        <p>
          <strong>Opzeggen kan altijd online</strong>, op je accountpagina, in twee klikken. Je krijgt direct een
          bevestiging per mail. Je houdt Premium tot het einde van de periode die je al hebt betaald; daarna betaal je
          niets meer. Na het eerste jaar kun je een jaarabonnement op elk moment opzeggen; je krijgt dan het
          niet-gebruikte deel terug.
        </p>
        <p>
          Lukt een betaling niet, dan proberen we het een paar keer opnieuw en houd je Premium nog {PAST_DUE_GRACE_DAYS}{" "}
          dagen. Lukt het daarna nog steeds niet, dan ga je naar Gratis. Je raakt geen gegevens kwijt.
        </p>
      </Section>

      <Section title="5. Herroepingsrecht (bedenktijd)">
        <p>
          Je mag de overeenkomst binnen {WITHDRAWAL_PERIOD_DAYS} dagen na het afsluiten herroepen, zonder reden op te
          geven. De termijn begint de dag na het afsluiten. Gebruik daarvoor de knop{" "}
          <strong>&ldquo;Overeenkomst herroepen&rdquo;</strong> op je accountpagina, of stuur ons een mail of het
          formulier hieronder.
        </p>
        <p>
          Na het herroepen stopt je abonnement direct en betalen we <strong>het hele bedrag</strong> terug, binnen 14
          dagen, op dezelfde manier als je hebt betaald.
        </p>
        <div className="rounded-lg border border-border bg-muted p-4 text-sm">
          <p className="font-semibold text-fg">Modelformulier voor herroeping</p>
          <p className="mt-2">
            (Alleen invullen en terugsturen als je de overeenkomst wilt herroepen.)
            <br />
            Aan: {owner}, {address}, {email}
            <br />
            Ik deel hierbij mee dat ik onze overeenkomst betreffende de levering van de volgende dienst herroep:{" "}
            {name} Premium.
            <br />
            Gesloten op: …
            <br />
            Naam en e-mailadres van mijn account: …
            <br />
            Datum: …
          </p>
        </div>
      </Section>

      <Section title="6. Weekmenu's, prijzen en aanbiedingen">
        <p>
          We maken de weekmenu&apos;s zo goed mogelijk, maar prijzen en aanbiedingen komen van de supermarkten (via
          PrijsProfeet) en kunnen in de winkel afwijken. Prijzen zonder actie zijn schattingen. Controleer bij een
          allergie altijd het etiket. We zijn niet verbonden aan Albert Heijn, Jumbo, Lidl of andere supermarkten.
        </p>
        <p>
          We zijn niet aansprakelijk voor schade door een afwijkende prijs of een ontbrekend product, behalve bij opzet
          of grove nalatigheid. Je wettelijke rechten als consument blijven altijd gelden.
        </p>
      </Section>

      <Section title="7. Je account en je gegevens">
        <p>
          Een account is voor mensen van 16 jaar en ouder. Je kunt je account altijd zelf verwijderen op je
          accountpagina. Hoe we met je gegevens omgaan, lees je in de{" "}
          <Link href="/privacy" className="text-primary underline underline-offset-4">
            privacyverklaring
          </Link>
          .
        </p>
      </Section>

      <Section title="8. Klachten">
        <p>
          Heb je een klacht? Mail ons; je krijgt binnen 14 dagen antwoord. Komen we er samen niet uit, dan kun je naar de
          rechter. Op deze voorwaarden is Nederlands recht van toepassing.
        </p>
      </Section>
    </SimplePage>
  );
}
