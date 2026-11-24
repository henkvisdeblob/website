# 01 — Productvisie

> Werknaam: **Potje** — van "een potje koken" én "een potje geld" (de potjesmethode om je budget te verdelen). De naam is nog niet gecontroleerd op domein en merkregistratie, zie [09 — Juridisch](09-juridisch-en-administratie.md).

## In één zin

**Potje is een website die je elke week een weekmenu en boodschappenlijst geeft die binnen jouw budget blijft, gebouwd rond de aanbiedingen van jouw supermarkt, en die laat zien hoeveel euro je daarmee bespaart.**

## Het probleem

| Probleem | Onderbouwing |
|---|---|
| Boodschappen zijn de grootste variabele uitgave | Het doorsnee huishouden geeft ongeveer €585 per maand (~€150 per week) uit aan boodschappen ([ABN AMRO](https://www.abnamro.com/research/nl/onze-research/transactie-trends-bestaanszekerheid-toegenomen-ondanks-duurdere-boodschappen)). |
| Veel mensen moeten elke euro laten tellen | 38% zegt moeilijk rond te komen ([Nibud via NOS](https://nos.nl/l/2619854)). |
| Aanbiedingen zijn er genoeg, maar het overzicht ontbreekt | Ongeveer een kwart van de supermarktomzet gaat via aanbiedingen ([NOS](https://nos.nl/l/2511897)), maar ze staan verspreid over folders en apps per keten. |
| Een groot deel van de aanbiedingen is ongezond | Het overgrote deel van de supermarktaanbiedingen stimuleert ongezonde voeding ([NOS](https://nos.nl/l/2404320)). De bruikbare, verse aanbiedingen (groente, vlees, vis) zoeken kost tijd. |
| "Wat eten we vandaag?" | Elke dag opnieuw bedenken wat je kookt, kost tijd en leidt tot dure impulsaankopen. |
| Verspilling | Je koopt een hele bloemkool of een pak van 500 g gehakt voor één recept en de rest belandt in de prullenbak. |

## De oplossing

```
1. Instellen (1x, 2 minuten)   → huishouden, budget, supermarkt(en), dieet, kooktijd
2. Elke week automatisch       → weekmenu op basis van de aanbiedingen van die week
3. Boodschappenlijst           → per winkel, in pakgroottes, met prijzen, af te vinken in de winkel
4. Koken                       → simpele recepten met stappen, geschaald naar je huishouden
5. Bespaaroverzicht            → "deze week bespaarde je €23,40 t.o.v. normale prijzen"
```

De kern is geen receptensite, maar **een rekenmachine met smaak**: het algoritme (zie [05 — Weekmenu-algoritme](05-weekmenu-algoritme.md)) kiest de combinatie van recepten die het goedkoopst is, binnen je budget blijft, gevarieerd is en zo min mogelijk restjes oplevert.

## Doelgroep

**Primair: gezinnen en stellen (25–45 jaar) die 4–7 keer per week thuis koken en op hun budget letten.** Zij hebben het grootste boodschappenbedrag (dus de grootste besparing) en de meeste "wat eten we"-stress.

**Secundair:** studenten en starters (krap budget, weinig kookervaring) en alleenstaanden (porties en verspilling zijn hun grootste ergernis).

### Persona's

**Sanne (34), moeder van twee, parttime werkend**
- Doet één keer per week grote boodschappen bij de Lidl en haalt soms iets bij de AH.
- Wil per week zo'n €110 kwijt zijn aan avondeten en lunch, en gaat daar nu vaak overheen.
- Bladert in de folder-app, maar weet niet wat ze van de aanbiedingen moet koken.
- *Citaat:* "Als iemand me gewoon vertelt wat ik deze week moet koken en wat het kost, ben ik al blij."

**Daan (23), student, woont op kamers**
- Kookt 5x per week voor zichzelf, budget €40 per week.
- Gooit vaak halve verpakkingen weg.
- *Citaat:* "Ik wil goedkoop eten dat niet elke dag pasta is."

**Marieke & Joost (41/43), samenwonend, vegetarisch**
- Doen boodschappen bij de Jumbo, willen gevarieerd vegetarisch koken zonder dure vleesvervangers.
- Delen de boodschappenlijst; wie het eerst langs de winkel komt, doet de boodschappen.
- *Citaat:* "We willen samen één lijst, op onze telefoons."

## Belofte en positionering

> **Voor huishoudens die elke euro willen laten tellen, is Potje de weekmenu-planner die binnen je budget blijft, laat zien hoeveel je bespaart en zorgt dat je niets weggooit — bij de supermarkt waar jij al komt.**

Kernboodschap op de site: **"Elke week een weekmenu binnen je budget. Uit de aanbiedingen van deze week."**

## Waar we ons op onderscheiden

Er bestaan al meerdere Nederlandse apps die recepten aan aanbiedingen koppelen (zie [02 — Markt en concurrentie](02-markt-en-concurrentie.md)). Losse features zijn daarom niet uniek. Ons onderscheid zit in de **combinatie en de uitvoering**. Dit zijn hypotheses die we in fase 0 toetsen (zie [11 — Roadmap](11-roadmap-en-validatie.md)):

1. **De bespaarteller.** Elke week en elke maand zie je in euro's wat Potje je opleverde. Daarmee verdient het abonnement zichzelf zichtbaar terug ("Premium kost €3,99, je bespaarde in november €86").
2. **Budget als harde grens.** Het menu past altijd binnen je weekbudget, inclusief de dingen die níet in de aanbieding zijn, en houdt rekening met pakgroottes.
3. **De goedkoopste winkel voor jouw hele menu.** Niet per product vergelijken, maar uitrekenen in welke van jouw winkels het hele weekmenu deze week het goedkoopst is.
4. **Restjesslim plannen.** Recepten worden zo gekozen dat ze ingrediënten delen: de halve bloemkool van maandag gaat donderdag in de curry.
5. **Web-first.** Geen app nodig: werkt op elke telefoon en laptop, installeerbaar als webapp (PWA), en de lijst is te delen met je huisgenoot via een link.
6. **Nuchtere toon zonder schaamte.** Besparen is slim, niet zielig.

## Wat Potje níet is

- **Geen bezorg- of bestelservice.** We plaatsen geen bestellingen bij supermarkten.
- **Geen dieet- of afvalapp.** We houden rekening met dieetwensen, maar geven geen medisch of voedingsadvies.
- **Geen prijsvergelijker voor alle producten.** We vergelijken alleen wat nodig is voor jouw menu.
- **Niet verbonden aan een supermarkt.** We zijn onafhankelijk en gebruiken geen logo's van supermarkten.

## Succes meten

**North Star Metric:** het aantal *wekelijks actieve planners*, dus huishoudens die in een week hun weekmenu openen of hun boodschappenlijst gebruiken.

| Metric | Doel 3 maanden na lancering | Doel 12 maanden na lancering |
|---|---|---|
| Geregistreerde accounts | 2.000 | 15.000 |
| Wekelijks actieve planners | 600 | 5.000 |
| Betalende abonnees | 100 | 600–900 |
| Conversie gratis → betaald (van actieve gebruikers) | 3% | 5% |
| Maandelijkse churn betalers | < 10% | < 7% |
| Gemiddelde gerapporteerde besparing per week | ≥ €10 | ≥ €15 |

Deze doelen zijn ambitieus. Ter vergelijking: de mediaan van indie-producten blijft onder de $1.000 per maand ([Futurion](https://futurion.blog/the-indie-hacker-reality-check-what-micro-saas-actually-looks-like-in-2026/)), en een succesvolle consumentenapp als HabitKit deed 2,5 jaar over de eerste $10.000 per maand ([Sebastian Röhl](https://sebastianroehl.substack.com/p/2025-the-year-that-changed-everything)). Reken op een traject van jaren, niet maanden.
