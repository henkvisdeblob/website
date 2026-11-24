# 12 — Risico's en open vragen

## Risico's

Kans en impact: L = laag, M = middel, H = hoog.

| # | Risico | Kans | Impact | Wat we eraan doen |
|---|---|---|---|---|
| 1 | **Te veel concurrentie.** De AH-app en gratis apps zijn "goed genoeg"; niemand ziet het verschil. | H | H | Scherpe positionering (bespaarteller, budget als harde grens), validatie in fase 0 met harde go/no-go-criteria, winnen op distributie (SEO, video). |
| 2 | **Afhankelijk van één databron.** PrijsProfeet wijzigt voorwaarden, prijzen of stopt. | M | H | Eigen `DealSource`-tussenlaag; handmatige invoer als reserve; vóór de lancering schriftelijke bevestiging van het gebruik; eventueel een Pro-contract. |
| 3 | **Foute aanbiedingen of prijzen** → gebruiker staat voor verrassingen aan de kassa → vertrouwen weg. | H | M | Zekerheidsdrempel, menselijke controle, knop "Klopt niet", labels "schatting" en "met app/kaart", duidelijke disclaimers. |
| 4 | **Lage conversie naar betaald** (< 2%). | H | H | Omgekeerde proefperiode, bespaarteller als bewijs van waarde, duidelijke grens Gratis/Premium, prijstests. |
| 5 | **Snel afhaken** na de eerste weken (nieuwigheid gaat eraf). | H | H | Wekelijkse mail, maandoverzicht besparing, recepten blijven wisselen, beoordelingen verbeteren het menu. |
| 6 | **Recepten vallen tegen** (smaak, tijden kloppen niet). | M | H | Steekproef zelf koken, beoordelingen, slecht beoordeelde recepten automatisch minder vaak. |
| 7 | **Juridische fouten** (opzeggen, herroepen, privacy). | M | M | Functies vanaf het begin ingebouwd (zie [09](09-juridisch-en-administratie.md)); jurist laat voorwaarden en privacyverklaring vóór de lancering nakijken. |
| 8 | **Bezwaar van een supermarkt** (naam, data, vergelijkingen). | L | M | Geen logo's, geen schijn van samenwerking, data via een aanbieder met licentie, eerlijke en controleerbare vergelijkingen. |
| 9 | **Tijd en motivatie** van een solo-maker. | H | H | Kleine scope per sprint, iets werkends na elke sprint, bouwen in het openbaar, harde beslismomenten in plaats van eindeloos doorbouwen. |
| 10 | **Kosten lopen op** (AI, hosting). | L | L | Batchverwerking, geheugen voor koppelingen, gratis plannen tot er omzet is; verbruik maandelijks bekijken. |
| 11 | **Seizoenseffect** (zomer, feestdagen: minder thuis koken). | M | L | Jaarabonnementen promoten; speciale menu's (bbq, kerst) als marketingmoment. |
| 12 | **Platformrisico Google** (zoekverkeer valt weg door een update of AI-antwoorden). | M | M | Niet alleen op SEO leunen: e-mail, video en doorverwijzen opbouwen. |

## Open vragen voor de maker

Deze beslissingen zijn niet door onderzoek te beantwoorden. Ze moeten genomen zijn vóór of tijdens sprint 0.

| # | Vraag | Voorstel in deze documenten |
|---|---|---|
| 1 | Wordt "Potje" de naam? Is het domein beschikbaar? | Werknaam "Potje"; alternatieven: Weekpotje, Kookpotje, Bordbudget. Controleren in fase 0. |
| 2 | Hoeveel uur per week kun je hieraan besteden? | 10–15 uur (planning in [11](11-roadmap-en-validatie.md)). |
| 3 | Hoeveel geld wil je in het eerste jaar uitgeven? | €100–€200 in fase 0, daarna ~€70–€100 per maand vaste kosten. |
| 4 | Ben je 18 jaar of ouder, en heb je al een KvK-inschrijving? | Bepaalt hoe je je inschrijft en welke betaalprovider kan (zie [09](09-juridisch-en-administratie.md)). |
| 5 | Met welke supermarkten beginnen we? | AH, Jumbo, Lidl; daarna Aldi en Plus. |
| 6 | Prijs: €3,99 per maand / €34,99 per jaar? | Ja, met een test van €4,99 na 3 maanden. |
| 7 | Doe je het concierge-experiment (3 weken met de hand menu's maken)? | Sterk aanbevolen: het goedkoopste bewijs dat mensen betalen. |
| 8 | Wie kookt en fotografeert de recepten? | De maker kookt een steekproef; foto's in eerste instantie eenvoudig met de telefoon. |
| 9 | Halal vanaf het begin, of later? | Vanaf het begin met een beperkt aanbod en eerlijke uitleg (zie [06](06-data-en-aanbiedingen.md)). |
| 10 | Stripe of Mollie? | Stripe (zie [03](03-verdienmodel.md)). |

## Aannames die we moeten controleren

| Aanname | Hoe controleren | Wanneer |
|---|---|---|
| Gebruik van PrijsProfeet-data achter een betaalmuur is toegestaan (met bronvermelding) | Nederlandstalige voorwaarden lezen + mail aan PrijsProfeet | Fase 0 |
| Prijzen van PrijsProfeet Pro passen in het budget | Prijzen opvragen | Fase 0 |
| De dekking van verse producten (vlees, vis, groente) in de aanbiedingsdata is voldoende | Gratis sleutel aanvragen en een week aanbiedingen van AH, Jumbo, Lidl ophalen en bekijken | Fase 0 |
| Concurrenten doen ons onderscheid niet al | Checklist in [02](02-markt-en-concurrentie.md) | Fase 0 |
| Stripe Billing-tarief en betaalmethoden voor Nederland | stripe.com/nl/pricing | Sprint 5 |
| Nederlandse invoering van de herroepingsknop en regels voor jaarabonnementen | ACM ConsuWijzer, wetten.overheid.nl, jurist | Sprint 5 |
| Portiefactoren voor kinderen zijn redelijk | Vergelijken met adviezen van het Voedingscentrum | Sprint 3 |
