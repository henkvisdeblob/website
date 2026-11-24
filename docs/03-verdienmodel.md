# 03 — Verdienmodel

## Model: freemium met "omgekeerde proefperiode"

Iedereen die een account maakt, krijgt **14 dagen Premium gratis, zonder betaalgegevens**. Daarna val je automatisch terug naar Gratis, tenzij je zelf een abonnement start.

Waarom zo:
- Geen betaalgegevens vooraf, dus een lage drempel om te beginnen.
- Gebruikers ervaren de volledige waarde (inclusief de bespaarteller) voordat ze beslissen.
- Geen automatische omzetting van proef naar betaald. Dat voorkomt juridische risico's rond proefabonnementen en boze klanten (zie [09 — Juridisch](09-juridisch-en-administratie.md)).

## Gratis vs. Premium

| Functie | Gratis | Premium |
|---|---|---|
| Openbare wekelijkse aanbiedingsrecepten per supermarkt | ✅ | ✅ |
| Weekmenu | 3 avonden per week | Tot 7 avonden per week |
| Supermarkten | 1 | Alle beschikbare, met goedkoopste-winkel-keuze |
| Huishoudgrootte | Vast: 2 of 4 personen | Elke samenstelling (volwassenen + kinderen) |
| Weekbudget als harde grens | – | ✅ |
| Dieet, allergieën, "dit lust ik niet", max. kooktijd | Alleen vegetarisch ja/nee | ✅ Volledig |
| Recept wisselen in het menu | 1x per week | Onbeperkt |
| Boodschappenlijst (afvinken, offline in de winkel) | ✅ | ✅ |
| Restjesslimme planning | – | ✅ |
| Gedeelde lijst met huisgenoot | – | ✅ |
| Bespaarteller | Alleen deze week | Week, maand, jaar en totaal |
| Wekelijkse mail "je weekmenu staat klaar" | Algemene aanbiedingsmail | Persoonlijk menu in de mail |
| Favorieten en recepten beoordelen | ✅ | ✅ |

Ontwerpregel: **Gratis moet echt nuttig zijn** (anders komt niemand terug), maar **Premium moet voelen als "het hele plan"**. De grens ligt bij personalisatie en budget, want daar zit de besparing.

## Prijzen

| Plan | Prijs (incl. btw) | Per maand |
|---|---|---|
| Premium maandelijks | **€3,99 per maand** | €3,99 |
| Premium jaarlijks | **€34,99 per jaar** | €2,92 (27% korting) |
| Early adopter (alleen voor de wachtlijst) | €2,99 per maand, zolang je lid blijft | €2,99 |

Overwegingen:
- Concurrenten vragen €4,99 (PortiePlanner) tot €5,99 (Suppie) per maand. Met €3,99 zitten we eronder, maar niet op de bodem.
- Indie-apps zijn vaak 2–5× te goedkoop geprijsd. **Test na 3 maanden €4,99** voor nieuwe gebruikers (A/B-test of per cohort).
- Een jaarabonnement levert cashflow vooraf en minder churn, en verlaagt het aantal betalingen, dus ook de transactiekosten.
- Geen weekabonnement. Dat is duur in transactiekosten en voelt opdringerig.

## Opbrengst per abonnee

### Zonder kleineondernemersregeling (KOR), met 21% btw

| | Maand (€3,99) | Jaar (€34,99) |
|---|---|---|
| Prijs incl. btw | €3,99 | €34,99 |
| Btw (21%) | –€0,69 | –€6,07 |
| Transactiekosten (SEPA-incasso / iDEAL, ±€0,35) | –€0,35 | –€0,35 |
| Extra kosten Stripe Billing (% van omzet; **actueel tarief nog controleren**) | ±–€0,03 | ±–€0,25 |
| **Netto opbrengst** | **±€2,92 per maand** | **±€28,32 per jaar = €2,36 per maand** |

### Met KOR (omzet onder €20.000 per jaar)

Met de KOR reken je geen btw. De €0,69 per maand blijft dan bij jou, dus ongeveer **€3,60 netto per maandabonnee**. Je kunt dan wel geen btw terugvragen over je kosten. Zie [09 — Juridisch](09-juridisch-en-administratie.md).

Rekenwaarde in de rest van dit document: **€2,80 netto per betalende abonnee per maand**. Dat is een gemengd gemiddelde van maand- en jaarabonnementen, zonder KOR.

## Vaste kosten per maand (productie)

| Post | Kosten per maand | Toelichting |
|---|---|---|
| Hosting website (Vercel Pro) | ~€20 | Het gratis Hobby-plan is niet bedoeld voor commercieel gebruik. |
| Database + auth (Supabase Pro, EU) | ~€25 | Het gratis plan pauzeert bij inactiviteit, dus is niet geschikt voor productie. |
| E-mail (Brevo of vergelijkbaar) | €0–€10 | Gratis tot een paar honderd mails per dag. |
| Analytics zonder cookies (Plausible) | ~€9 | Of zelf gehost (Umami), dan gratis. |
| Aanbiedingsdata (PrijsProfeet) | €0 (gratis plan) tot ? (Pro) | Prijzen van Pro staan op prijsprofeet.nl/api en moeten nog worden opgevraagd. |
| AI (Claude API, batchverwerking) | ~€5–€15 | Zie [06 — Data en aanbiedingen](06-data-en-aanbiedingen.md). |
| Domeinnaam | ~€1 | |
| Boekhoudsoftware | ~€10 | |
| **Totaal** | **~€70–€100** | Exclusief een eventueel Pro-plan bij PrijsProfeet. |

In de validatiefase (alleen landingspagina en wachtlijst) zijn de kosten bijna nul.

## Wanneer is het rendabel?

| Doel | Benodigde betalende abonnees | Actieve gratis gebruikers nodig bij 3% conversie | Bij 5% conversie |
|---|---|---|---|
| Kosten dekken (~€100 per maand) | ~36 | ~1.200 | ~720 |
| €500 winst per maand | ~215 | ~7.200 | ~4.300 |
| €1.000 winst per maand | ~390 | ~13.000 | ~7.800 |
| **€2.500 winst per maand** (een bescheiden inkomen) | **~930** | **~31.000** | **~18.600** |

Let op:
- "Winst" is hier vóór inkomstenbelasting. Wat je netto overhoudt, hangt af van je persoonlijke situatie.
- Bij €2.500 winst per maand zit je boven de KOR-grens van €20.000 omzet per jaar. Dan moet je btw rekenen.
- Churn (opzeggers) betekent dat je elke maand nieuwe abonnees nodig hebt om op hetzelfde niveau te blijven. Bij 7% churn en 900 abonnees zijn dat ~63 nieuwe betalers per maand.

## Extra inkomstenbronnen (later, optioneel)

| Bron | Wanneer | Let op |
|---|---|---|
| Affiliate-links naar keukenspullen of maaltijdboxen | Na lancering | Moet passen bij het merk; niet opdringerig. |
| B2B: licentie voor budgetcoaches, schuldhulpverlening of gemeenten ("Potje voor je cliënten") | Na 6–12 maanden | Mogelijk een grote kans: organisaties betalen per cliënt. Vraagt sales-tijd. |
| Gesponsorde recepten van merken | Pas bij veel bereik | Kan het vertrouwen ("onafhankelijk") schaden. Voorzichtig mee omgaan. |
| Advertenties | Liever niet | Brengt bij weinig bezoekers bijna niets op en maakt de site slechter. |

## Betaalprovider: Stripe (aanbevolen) of Mollie

| | Stripe | Mollie |
|---|---|---|
| iDEAL \| Wero | ~€0,29 per betaling | ~€0,32 per betaling |
| SEPA-incasso (voor terugkerende betalingen) | ~€0,35 (Stripe noemt ook ~€0,145 + batchkosten) | ~€0,35 |
| Kaarten (EER) | 1,5% + €0,25 | 1,80% + €0,25 |
| Abonnementen | Stripe Billing: kant-en-klaar, met automatisch opnieuw proberen bij mislukte betalingen | Subscriptions API: eenvoudiger, maar je bouwt meer zelf |
| Klantportaal (zelf opzeggen, betaalmethode wijzigen, facturen) | ✅ Kant-en-klaar (Customer Portal) | Voor zover bekend niet kant-en-klaar |
| Afrekenpagina | ✅ Stripe Checkout | ✅ Mollie Checkout |

**Keuze: Stripe.** Stripe Checkout plus het Customer Portal scheelt een solo-maker weken werk. Online opzeggen, wat wettelijk verplicht is, zit er dan al in. De werking: de eerste betaling gaat via iDEAL | Wero, en Stripe maakt daar een SEPA-incassomachtiging van voor de volgende maanden.

> iDEAL gaat over naar Wero; volgens Stripe is de overgang eind 2027 afgerond. De betaalprovider regelt dit, maar check of de teksten op de site ("betaal met iDEAL") dan nog kloppen.

Bronnen: [Stripe — Direct debit via iDEAL](https://stripe.com/nl/resources/more/direct-debit-initiated-via-ideal) · [Over Online Betalen — Mollie-tarieven 2026](https://overonlinebetalen.nl/mollie/) · [Bedrijfssoftwaregids — Mollie vs Stripe vs Adyen](https://bedrijfssoftwaregids.nl/blog/mollie-vs-stripe-vs-adyen/) · [Payment provider vergelijken 2026](https://www.webwinkelsucces.nl/payment-providers-vergelijken/). Controleer de actuele tarieven op de sites van de providers zelf vóór je kiest.
