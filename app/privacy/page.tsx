import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SimplePage } from "@/components/site-chrome";
import { Missing } from "@/components/ui";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description: `Hoe ${siteConfig.name} omgaat met de gegevens die je achterlaat op de wachtlijst.`,
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-h3 font-bold">{title}</h2>
      <div className="mt-3 space-y-3 text-fg-muted [&_strong]:text-fg">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  const owner = siteConfig.ownerName ?? <Missing>[naam nog invullen]</Missing>;
  const contact = siteConfig.contactEmail ? (
    <a className="text-primary underline underline-offset-4" href={`mailto:${siteConfig.contactEmail}`}>
      {siteConfig.contactEmail}
    </a>
  ) : (
    <Missing>[contactadres nog invullen]</Missing>
  );

  return (
    <SimplePage>
      <article className="max-w-prose">
        <p className="text-sm font-semibold text-fg-subtle">Laatst bijgewerkt: 24 november 2026</p>
        <h1 className="mt-2 text-h1 font-bold">Privacyverklaring</h1>
        <p className="mt-6 text-lead text-fg-muted">
          {siteConfig.name} is nog in ontwikkeling. Op dit moment verzamelen we alleen gegevens voor de wachtlijst. In
          deze verklaring lees je welke gegevens dat zijn, waarvoor we ze gebruiken en hoe je ze laat verwijderen.
        </p>

        <Section title="Wie is verantwoordelijk?">
          <p>
            {siteConfig.name} wordt gemaakt door {owner}. Vragen over je gegevens stuur je naar {contact}.
          </p>
        </Section>

        <Section title="Welke gegevens we bewaren">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Je e-mailadres</strong>, om je aanmelding te bevestigen en je te laten weten wanneer je kunt
              beginnen.
            </li>
            <li>
              <strong>Optioneel:</strong> bij welke supermarkten je boodschappen doet en voor hoeveel mensen je kookt.
              Daarmee bepalen we met welke supermarkten we beginnen.
            </li>
            <li>
              <strong>Hoe je bij ons kwam</strong>: de bron uit de link (bijvoorbeeld een bericht op sociale media) en,
              als een vriend je uitnodigde, diens uitnodigingscode.
            </li>
            <li>
              <strong>Wanneer</strong> je je aanmeldde en bevestigde, voor je plek op de wachtlijst.
            </li>
          </ul>
        </Section>

        <Section title="Waarvoor we ze gebruiken, en waarvoor niet">
          <p>
            We gebruiken je gegevens alleen voor de wachtlijst: je aanmelding bevestigen, je plek bijhouden en je mailen
            als je kunt beginnen. Daarnaast tellen we de aanmeldingen om te zien of er genoeg belangstelling is.
          </p>
          <p>
            We verkopen je gegevens niet, we gebruiken ze niet voor advertenties en we sturen je geen nieuwsbrief zonder
            dat je daar apart voor kiest.
          </p>
          <p>
            De grondslag is je <strong>toestemming</strong>. Die geef je door je aan te melden en je aanmelding te
            bevestigen, en je kunt hem altijd intrekken.
          </p>
        </Section>

        <Section title="Hoe lang we ze bewaren">
          <p>
            Tot je je uitschrijft, en uiterlijk 6 maanden nadat {siteConfig.name} van start is gegaan. Bevestig je je
            aanmelding niet, dan verwijderen we je gegevens na 30 dagen.
          </p>
        </Section>

        <Section title="Met wie we ze delen">
          <p>Alleen met de diensten die we nodig hebben om de wachtlijst te laten werken:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Supabase</strong>: opslag van de wachtlijst, in een datacenter in de EU (Frankfurt).
            </li>
            <li>
              <strong>Brevo</strong>: het versturen van de e-mails (EU).
            </li>
            <li>
              <strong>Vercel</strong>: het hosten van deze website.
            </li>
          </ul>
          <p>Met deze partijen gelden afspraken over hoe zij met gegevens omgaan.</p>
        </Section>

        <Section title="Cookies en statistieken">
          <p>
            We gebruiken geen tracking- of advertentiecookies. Om te zien hoeveel mensen de site bezoeken, gebruiken we
            Plausible: dat telt bezoeken zonder cookies en zonder je persoonlijk te volgen.
          </p>
        </Section>

        <Section title="Jouw rechten">
          <p>
            Je mag je gegevens inzien, laten aanpassen of laten verwijderen. Verwijderen kan direct via de link
            &ldquo;Gegevens verwijderen&rdquo; onderaan elke mail van ons, of door te mailen naar {contact}.
          </p>
          <p>
            Ben je niet tevreden over hoe we met je gegevens omgaan? Dan kun je een klacht indienen bij de{" "}
            <a
              className="text-primary underline underline-offset-4"
              href="https://autoriteitpersoonsgegevens.nl"
              rel="noopener noreferrer"
            >
              Autoriteit Persoonsgegevens
            </a>
            .
          </p>
        </Section>
      </article>
    </SimplePage>
  );
}
