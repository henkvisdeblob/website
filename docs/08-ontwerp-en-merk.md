# 08 — Ontwerp en merk

Dit document legt de richting vast. Vóór de eerste schermen worden gebouwd, werken we dit uit tot een `DESIGN.md` met exacte kleuren, lettertypes en componenten (stap in sprint 0, zie [11](11-roadmap-en-validatie.md)).

## Merkpersoonlijkheid

**Potje is de slimme buurvrouw of buurman die altijd weet waar het goedkoop is, en die het je zonder gedoe vertelt.**

| Wel | Niet |
|---|---|
| Nuchter en eerlijk ("Deze week lukt €30 niet; het goedkoopste is €33") | Schreeuwerig ("MEGA DEAL!!! 🔥🔥") |
| Warm en een beetje grappig | Betuttelend over gezond eten of geld |
| Slim besparen is iets om trots op te zijn | Besparen als iets zieligs of armoedigs |
| Concreet: euro's, minuten, porties | Vaag: "bespaar veel", "super makkelijk" |
| Je / jij | U, of juist overdreven jolig |

### Voorbeeldteksten

**Kop op de landingspagina (opties om te testen):**
1. "Elke week een weekmenu binnen je budget. Uit de aanbiedingen van deze week."
2. "Wat eten we deze week? En wat kost het? Potje rekent het voor je uit."
3. "Bespaar elke week op je boodschappen, zonder folders door te bladeren."

**Subkop:** "Kies je supermarkt en je budget. Potje maakt een weekmenu met de aanbiedingen van deze week, plus een boodschappenlijst die je in de winkel afvinkt."

**Knop:** "Maak mijn eerste weekmenu" (niet: "Aanmelden" of "Start nu").

**Lege staat (nog geen menu):** "Je eerste weekmenu staat bijna klaar. Vertel ons eerst even voor hoeveel mensen je kookt."

**Foutmelding:** "Dat ging mis aan onze kant. Je lijst is veilig opgeslagen; probeer het over een minuutje opnieuw."

**Opzeggen:** "Jammer dat je gaat! Je bespaarde €212 met Potje. Je Premium loopt nog tot 14 januari." (Geen schuldgevoel, geen verstopte knoppen.)

## Visuele richting

- **Smakelijk en rustig.** Veel wit, warme ondertoon, één opvallende accentkleur.
- **Kleuren:** een warme accentkleur (tomaat/paprika) voor acties, fris groen alleen voor besparingen en "in de aanbieding", warme neutrale tinten voor achtergronden. **Vermijd de huisstijlkleuren van supermarkten** (het blauw van AH, het geel van Jumbo, de blauw-geel-rode combinatie van Lidl), zodat niemand denkt dat we bij een keten horen.
- **Typografie:** een vriendelijke, licht afgeronde schreefloze letter voor koppen; een goed leesbare schreefloze letter voor tekst; **cijfers met vaste breedte** (tabular figures) voor prijzen, zodat bedragen netjes onder elkaar staan.
- **Beeld:** echte, eenvoudige foto's van eten (bovenaanzicht, daglicht) of nette illustraties per receptcategorie. Geen stockfoto's van lachende gezinnen.
- **Donkere modus:** ja, voor koken 's avonds en in de winkel.

## Ontwerpprincipes

1. **Het getal eerst.** Totaalprijs, budget en besparing staan altijd bovenaan, groot.
2. **Eén duim.** Alles wat je in de winkel doet (lijst afvinken), werkt met één hand, met grote aanraakvlakken onderin het scherm.
3. **Goede standaarden, weinig keuzes.** De gebruiker hoeft niets in te stellen om een goed menu te krijgen.
4. **Eerlijk over onzekerheid.** Geschatte prijzen krijgen het label "schatting"; aanbiedingen met klantenkaart het label "met app/kaart".
5. **Snel.** Elke pagina voelt direct; skeletons in plaats van spinners.

## Belangrijkste schermen (schetsen)

### Weekmenu (`/week`)

```
┌──────────────────────────────────┐
│ Potje            week 48   ☰     │
├──────────────────────────────────┤
│  €41,20          ✓ binnen €45    │
│  Je bespaart €9,85 deze week     │
│  [Lidl ▾]  goedkoopste van jouw  │
│            winkels               │
├──────────────────────────────────┤
│ ZA  Gehaktballetjes in tomaten-  │
│     saus · 30 min · €6,40        │
│     🏷 Gehakt 1+1 gratis          │
│     [Wissel]  [Vastzetten]       │
├──────────────────────────────────┤
│ ZO  Bloemkoolcurry · 35 min      │
│     €5,10 · 🌱                    │
│     ↻ gebruikt de andere helft   │
│       van je bloemkool           │
├──────────────────────────────────┤
│ …                                │
├──────────────────────────────────┤
│ [   Open boodschappenlijst   ]   │
└──────────────────────────────────┘
```

### Boodschappenlijst (`/lijst`)

```
┌──────────────────────────────────┐
│ ← Lijst · Lidl         [Deel]    │
│ 14 van 22 · nog €18,40           │
├──────────────────────────────────┤
│ GROENTE & FRUIT                  │
│ ☐ Bloemkool, 1 st     €1,29 🏷   │
│ ☐ Uien, net 1 kg      €0,99      │
│ VLEES & VIS                      │
│ ☐ Rundergehakt 2×500g €4,49 🏷   │
│   1+1 gratis                     │
│ …                                │
│ CHECK OF JE DIT IN HUIS HEBT     │
│ ☐ Olijfolie  ☐ Currypasta        │
│ ─────────────────────────────    │
│ ☑ Rijst 1 kg          €1,19      │
├──────────────────────────────────┤
│ [ + Iets toevoegen ]             │
│ Aanbiedingen via PrijsProfeet    │
└──────────────────────────────────┘
```

### Bespaarteller (`/besparing`)

```
┌──────────────────────────────────┐
│ Je bespaarde met Potje           │
│                                  │
│   deze week     €9,85            │
│   november      €38,20           │
│   totaal        €212,45          │
│                                  │
│  ▁▃▅▂▆▇▅  per week               │
│                                  │
│ Premium kost €3,99 per maand.    │
│ Je verdiende het 9× terug.       │
└──────────────────────────────────┘
```

### Abonnement (`/account/abonnement`)

```
┌──────────────────────────────────┐
│ Jouw abonnement                  │
│ Premium · maandelijks · €3,99    │
│ Volgende betaling: 14 januari    │
│                                  │
│ [Betaalmethode wijzigen]         │
│ [Facturen]                       │
│ [Abonnement opzeggen]            │
│                                  │
│ Afgesloten op 3 januari.         │
│ [Overeenkomst herroepen]         │ ← zichtbaar binnen 14 dagen
└──────────────────────────────────┘
```

## Componenten (eerste set)

Knop (primair, secundair, tekst) · Kaart (maaltijd, recept) · Prijslabel (normaal, actie, schatting) · Aanbiedingslabel · Lijstregel met afvinkvak · Segmentkeuze (winkel, maand/jaar) · Stappenindicator (onboarding) · Melding (info, waarschuwing, fout) · Lege staat · Skeleton · Onderste navigatiebalk (Week, Lijst, Besparing, Account).

## Toegankelijkheid (WCAG 2.1 AA)

- Contrast minimaal 4,5:1 voor tekst, ook voor groene besparingslabels.
- Betekenis nooit alleen met kleur ("🏷 aanbieding" als tekst en icoon, niet alleen groen).
- Alle knoppen en afvinkvakken bereikbaar met het toetsenbord en voorzien van labels voor schermlezers.
- Aanraakvlakken minimaal 44 × 44 px.
- Respecteer "verminderde beweging" (`prefers-reduced-motion`).
- Prijzen voorlezen als "41 euro 20", niet als "41 komma 2".
