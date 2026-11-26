# Potje (werknaam)

**Elke week een weekmenu binnen je budget, uit de aanbiedingen van deze week.**

Potje is een Nederlandse website die huishoudens elke week een weekmenu en boodschappenlijst geeft, gebouwd rond de supermarktaanbiedingen van die week. Het menu blijft binnen je budget, gebruikt restjes slim en laat zien hoeveel je bespaart. Het verdienmodel is freemium met een Premium-abonnement.

> **Status:** de landingspagina met wachtlijst is klaar, en op **`/weekmenu`** kun je al een echt weekmenu maken uit de aanbiedingen van deze week (AH, Jumbo, Lidl), zonder account. Accounts en de wekelijkse mail volgen. Zie [11 — Roadmap](docs/11-roadmap-en-validatie.md#status-26-november-2026).

## In één minuut

| | |
|---|---|
| **Probleem** | Boodschappen kosten het doorsnee huishouden ~€150 per week, 38% zegt moeilijk rond te komen, en aanbiedingen staan verspreid over folders en apps. "Wat eten we en wat kost het?" kost elke week tijd en geld. |
| **Oplossing** | Kies je supermarkt, huishouden en budget. Potje maakt elke week automatisch een weekmenu met de aanbiedingen van die week, plus een boodschappenlijst in echte pakgroottes die je offline in de winkel afvinkt. |
| **Doelgroep** | Gezinnen en stellen (25–45) die op hun budget letten; daarnaast studenten en alleenstaanden. |
| **Onderscheid** | Bespaarteller in euro's · budget als harde grens · goedkoopste winkel voor je héle menu · restjesslim plannen · web-first (geen app nodig) · vindbaar via wekelijkse openbare pagina's. |
| **Concurrentie** | Stevig: de AH-app, Menutos, Goedkoopkoken.nl, Suppie, PortiePlanner, Hapklaar en meer. Mensen betalen al €5–6 per maand voor sommige daarvan. Het onderscheid wordt in fase 0 getoetst. |
| **Verdienmodel** | Gratis (3 avonden, 1 winkel) en Premium (€3,99 per maand of €34,99 per jaar). 14 dagen Premium gratis zonder betaalgegevens. |
| **Rendabel bij** | ~36 betalers dekt de kosten; ~930 betalers ≈ €2.500 winst per maand vóór belasting. |
| **Stack** | Next.js + TypeScript, Supabase (EU), Stripe (iDEAL \| Wero), Vercel, Claude API (nachtelijke datastap), PrijsProfeet-API voor aanbiedingen. |

## Documentatie

| # | Document | Inhoud |
|---|---|---|
| 01 | [Productvisie](docs/01-productvisie.md) | Probleem, oplossing, doelgroep, persona's, positionering, succesmetingen |
| 02 | [Markt en concurrentie](docs/02-markt-en-concurrentie.md) | Marktcijfers, benchmarks, 11 concurrenten, gaten in de markt, testchecklist |
| 03 | [Verdienmodel](docs/03-verdienmodel.md) | Gratis vs. Premium, prijzen, opbrengst per abonnee, kosten, break-even, betaalprovider |
| 04 | [Functionele specificatie](docs/04-functionele-specificatie.md) | Scope (MoSCoW), sitemap, user stories met acceptatiecriteria, flows, randgevallen |
| 05 | [Weekmenu-algoritme](docs/05-weekmenu-algoritme.md) | Het hart van het product: prijsberekening, kostenfunctie, zoekmethode, rekenvoorbeeld, tests |
| 06 | [Data en aanbiedingen](docs/06-data-en-aanbiedingen.md) | Databronnen, PrijsProfeet, datapijplijn, AI-koppeling, ingrediëntenlijst, recepten |
| 07 | [Technische architectuur](docs/07-technische-architectuur.md) | Stack, mappenstructuur, datamodel (SQL), Stripe, geplande taken, beveiliging, tests |
| 08 | [Ontwerp en merk](docs/08-ontwerp-en-merk.md) | Merkpersoonlijkheid, toon, visuele richting, schermschetsen, toegankelijkheid |
| 09 | [Juridisch en administratie](docs/09-juridisch-en-administratie.md) | KvK, btw/KOR, consumentenrecht (opzeggen, herroepingsknop), AVG, disclaimers |
| 10 | [Marketing en groei](docs/10-marketing-en-groei.md) | SEO, video, communities, e-mail, weekmenu-index, weekritme, funnel |
| 11 | [Roadmap en validatie](docs/11-roadmap-en-validatie.md) | Fase 0 met go/no-go-criteria, 6 MVP-sprints, bèta, lancering |
| 12 | [Risico's en open vragen](docs/12-risicos-en-open-vragen.md) | Risicoregister, beslissingen voor de maker, aannames om te controleren |

## Belangrijkste beslissingen

| Beslissing | Keuze |
|---|---|
| Web of app | Website + installeerbare webapp (PWA); geen App Store |
| Hoe het menu ontstaat | Deterministisch algoritme (testbaar, gratis per berekening); AI alleen voor de nachtelijke koppeling van aanbiedingen aan ingrediënten |
| Aanbiedingsdata | PrijsProfeet-API via een eigen tussenlaag, handmatige invoer als reserve; niet zelf scrapen |
| Eerste supermarkten | Albert Heijn, Jumbo, Lidl |
| Betalen | Stripe Checkout + Customer Portal, iDEAL \| Wero → SEPA-incasso |
| Proefperiode | 14 dagen Premium zonder betaalgegevens, geen automatische omzetting |
| Privacy | Data in de EU, geen tracking-cookies, dieet/allergieën alleen met uitdrukkelijke toestemming |

## Volgende stappen

1. **Fase 0 — Validatie** (4–6 weken): concurrenten testen, 10 interviews, landingspagina met wachtlijst, concierge-experiment met 10–15 huishoudens. Pas doorbouwen als de [go/no-go-criteria](docs/11-roadmap-en-validatie.md#go--no-go-criteria) gehaald zijn.
2. **Open vragen beantwoorden** uit [12 — Risico's en open vragen](docs/12-risicos-en-open-vragen.md).
3. **Sprint 0** van het MVP: projectbasis, `DESIGN.md`, CI.

## Lokaal draaien

Je hebt Node.js 22 of nieuwer nodig.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000 en http://localhost:3000/weekmenu. Zonder sleutels werkt de wachtlijst al: aanmeldingen staan tijdelijk in het geheugen en de bevestigingsmail (met link) verschijnt in de terminal. De aanbiedingen komen live van PrijsProfeet (geen sleutel nodig).

- Zonder internet of voor tests: zet `DEALS_SOURCE=sample` (verzonnen voorbeeldaanbiedingen).
- Zit je achter een proxy (zoals in sommige cloud-ontwikkelomgevingen)? Start dan met `NODE_USE_ENV_PROXY=1`, anders kan Node de API niet bereiken.

Controles: `npm run lint`, `npm run typecheck`, `npm test` (unit) en `npm run test:e2e` (browser).

## Live zetten (fase 0)

1. **Supabase** — maak een gratis project aan in regio *Central EU (Frankfurt)*. Open de SQL-editor en voer de bestanden in `supabase/migrations/` uit, op volgorde van naam. Noteer de project-URL, de *publishable key* en de *secret key* (Project Settings → API Keys). Voor de accounts (inloggen met een link in je mail):
   - *Authentication → URL Configuration*: zet *Site URL* op je domein en voeg `https://jouwdomein.nl/auth/confirm` toe bij *Redirect URLs*.
   - *Authentication → Emails → Magic link*: vervang de link in de mail door `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}`. Dan werkt de link ook als iemand hem op een ander apparaat opent. Zet de tekst van de mail in het Nederlands.
   - *Authentication → Emails → SMTP Settings*: stel Brevo in als afzender. De ingebouwde mailserver van Supabase verstuurt maar een paar mails per uur.
2. **Brevo** — maak een account, verifieer het afzenderadres (en liefst je domein), en maak een API-sleutel aan.
3. **PrijsProfeet** (de aanbiedingen) — werkt al zonder sleutel, maar met een gratis sleutel krijg je een eigen, hogere limiet. Zonder sleutel geldt de limiet per IP-adres, en dat deel je op Vercel met andere sites.
   1. Lees de voorwaarden op prijsprofeet.nl in je browser. Controleer dat hun data achter een betaalmuur (Premium) mag, met bronvermelding. Twijfel je, mail ze dan en bewaar het antwoord.
   2. Vraag een gratis sleutel aan via het formulier op https://www.prijsprofeet.nl/api#gratis-key: je e-mailadres en een projectnaam (bijvoorbeeld "Potje"). Je krijgt een mail met een link, en daarachter staat je sleutel. Dit kan alleen via dat formulier.
   3. Zet de sleutel in `.env.local` als `PRIJSPROFEET_API_KEY=…` (dat bestand gaat nooit mee in Git) en draai `npm run check:deals`. Je ziet of de sleutel geldig is, welk plan erbij hoort en per supermarkt hoeveel aanbiedingen binnenkomen. Staat er `Key OK` en drie keer `OK`, dan ben je klaar.
   4. Laat "Aanbiedingen via PrijsProfeet" op de site staan: die bronvermelding hoort bij het gratis plan.

   Deel de sleutel nooit in een chat, issue of commit. Je beheert hem op https://www.prijsprofeet.nl/api-account/.
4. **Vercel** — importeer deze GitHub-repository. Vul bij *Environment Variables* de waarden uit `.env.example` in: `NEXT_PUBLIC_SITE_URL` (je domein), `NEXT_PUBLIC_OWNER_NAME`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `BREVO_API_KEY`, `EMAIL_FROM` en `PRIJSPROFEET_API_KEY`. Laat `DEALS_SOURCE` leeg (dat is alleen voor tests). Let op: voor commercieel gebruik vraagt Vercel het Pro-plan.
5. **Plausible** (optioneel) — voeg je domein toe en zet de script-URL in `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC`.
6. **Controleer** de privacyverklaring op `/privacy`: zolang naam of contactadres ontbreekt, staat daar een gemarkeerd plekje.

Zonder Supabase- en Brevo-sleutels weigert de productieversie aanmeldingen, zodat er nooit stilletjes aanmeldingen verloren gaan.

### Premium (Stripe)

Het abonnementssysteem is ingebouwd, maar staat uit zolang de Stripe-sleutels ontbreken: dan is alles gratis en gelden er geen grenzen. Met sleutels kunnen ingelogde gebruikers Premium afsluiten (maand of jaar), online opzeggen in twee klikken, binnen 14 dagen herroepen (met volledige terugbetaling) en hun account verwijderen. Zonder Premium maak je een menu voor maximaal 3 avonden.

**Echte betalingen pas na inschrijving bij de KvK.** Er is geen omzetgrens: zodra je met winstoogmerk abonnementen verkoopt, ben je ondernemer en moet je ingeschreven zijn (zie [docs/09](docs/09-juridisch-en-administratie.md)). Tot die tijd test je met de testsleutels van Stripe; daarmee wordt geen echt geld afgeschreven.

1. Maak een Stripe-account. Werk in **testmodus** (schakelaar rechtsboven).
2. *Product catalog*: maak het product "Premium" met twee terugkerende prijzen in euro's, **inclusief btw**: €3,99 per maand en €34,99 per jaar. Noteer beide prijs-ID's (`price_…`).
3. *Settings → Payment methods*: zet iDEAL | Wero, kaart en SEPA-incasso aan.
4. *Settings → Billing → Customer portal*: zet "betaalmethode wijzigen" en "facturen bekijken" aan, en opzeggen "aan het einde van de periode".
5. *Settings → Billing → Subscriptions and emails*: zet de herinneringsmail vóór de verlenging van een jaarabonnement aan, en "Smart Retries" voor mislukte betalingen.
6. *Developers → Webhooks*: voeg `https://jouwdomein.nl/api/stripe/webhook` toe met de events `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted` en `invoice.payment_failed`. Noteer het *signing secret* (`whsec_…`).
7. Zet in Vercel: `STRIPE_SECRET_KEY` (`sk_test_…`), `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`, en vul `NEXT_PUBLIC_OWNER_ADDRESS` en `NEXT_PUBLIC_KVK_NUMBER` in zodra je die hebt. Op de accountpagina staat dan een melding "Testmodus".
8. Laat de [voorwaarden](app/voorwaarden/page.tsx) en de privacyverklaring nakijken door een jurist voordat je overstapt op de live sleutels (`sk_live_…`).

Staat er in de Vercel-logs `[deals] PrijsProfeet: Invalid API key`, dan klopt de sleutel in Vercel niet (tikfout of ingetrokken). De site blijft dan werken, maar zonder sleutel.

Richtlijnen voor wie (mens of AI) code schrijft in deze repository staan in [CLAUDE.md](CLAUDE.md). Het ontwerpsysteem staat in [DESIGN.md](DESIGN.md).
