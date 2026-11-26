# 05 — Het weekmenu-algoritme

> **Status (november 2026):** versie 1.0.0 is gebouwd in `lib/planner/` en getest (`tests/unit/planner.test.ts`). Hieronder staat het ontwerp; de wegingen in de tabel bij stap 4 zijn de waarden zoals ze in de code staan.

Dit is het hart van het product. Het algoritme is **deterministisch en uitlegbaar**: geen AI per gebruiker, maar rekenregels die we kunnen testen, uitleggen ("waarom staat dit in mijn menu?") en die niets kosten per berekening. AI gebruiken we alleen eenmalig per week voor het koppelen van aanbiedingen aan ingrediënten (zie [06](06-data-en-aanbiedingen.md)).

## 1. Begrippen

| Begrip | Betekenis |
|---|---|
| **Ingrediënt** | Een algemeen ingrediënt uit onze vaste lijst, bijv. `rundergehakt`, `bloemkool`, `ui`. Niet een specifiek product. |
| **Product** | Een echt artikel in een winkel, bijv. "AH Rundergehakt 500 g". |
| **Aanbieding (deal)** | Een product met een actieprijs en geldigheid in een winkel. Gekoppeld aan één ingrediënt. |
| **Referentieprijs** | Onze schatting van de normale prijs van een gangbare verpakking van een ingrediënt, als er geen aanbieding is. |
| **Verpakking (pack)** | De hoeveelheid die je in de winkel koopt (500 g, 1 stuk, 1 l). Je kunt geen 380 g gehakt kopen. |
| **Basisvoorraad** | Ingrediënten die vrijwel iedereen in huis heeft (zout, peper, olie, bloem, bouillonblokjes). Niet meegerekend in de kosten. |
| **Portie-equivalent** | Hoeveel volwassen porties een huishouden eet. |

## 2. Invoer

```ts
type PlanInput = {
  household: { adults: number; children: { ageGroup: '1-3' | '4-8' | '9-13' | '14+' }[] };
  dinners: number;                  // 3..7
  budgetCents: number | null;       // null = geen harde grens (Gratis)
  storeIds: string[];               // gekozen winkels
  shopDate: string;                 // ISO-datum van de boodschappendag (Europe/Amsterdam)
  diet: 'none' | 'vegetarian' | 'vegan' | 'no_pork' | 'halal';
  allergens: string[];              // bijv. ['gluten', 'peanut', 'lactose']
  excludedIngredientIds: string[];  // "dit eet ik niet"
  maxCookMinutes: number | null;
  lockedMeals: { day: number; recipeId: string }[];
  skippedDays: number[];
  history: { recipeId: string; servedOn: string; rating: 'like' | 'dislike' | null }[];
  pantryIngredientIds: string[];    // "heb ik al in huis" (Should have)
  seed: string;                     // userId + week, voor reproduceerbare variatie
};
```

## 3. Stap voor stap

### Stap 1 — Portie-equivalenten

```
porties = volwassenen × 1,0 + Σ kinderen × factor(leeftijdsgroep)
factor: 1–3 jaar = 0,4 · 4–8 jaar = 0,6 · 9–13 jaar = 0,8 · 14+ = 1,0
```

Voorbeeld: 2 volwassenen + een kind van 6 = 2 + 0,6 = **2,6 porties**. Recepten zijn opgeslagen voor 4 porties en worden lineair geschaald. Deze factoren zijn een vuistregel; controleer ze tegen de adviezen van het Voedingscentrum.

### Stap 2 — Prijs per ingrediënt per winkel

Voor elke winkel `s` en elk ingrediënt `i` bepalen we de goedkoopste manier om het te kopen op de boodschappendag:

1. **Aanbiedingen:** alle deals met `valid_from ≤ shopDate ≤ valid_until` in winkel `s` die zijn gekoppeld aan `i` (koppeling goedgekeurd of zekerheid ≥ 0,85).
2. **Referentie:** de referentieverpakking van `i` met referentieprijs × winkelfactor (v1: AH 1,00 · Jumbo 0,97 · Lidl 0,90 — **schattingen**, te vervangen door echte schapprijzen zodra die beschikbaar zijn).

De kosten van `k` verpakkingen houden rekening met meerstuksacties:

```
kosten(k) = ⌊k / q⌋ × meerstuksprijs + (k mod q) × stukprijs
   q = aantal voor de actie (2 bij "1+1 gratis" of "2 voor €5"), anders 1
```

Als `kosten(k+1) ≤ kosten(k)`, bijv. bij "1+1 gratis", neem dan `k+1` verpakkingen. De extra verpakking komt op de lijst met het label "gratis extra, invriezen of bewaren".

### Stap 3 — Kandidaat-recepten filteren (harde eisen)

Een recept doet alleen mee als het:
- past bij het dieet (dieetlabels van het recept);
- geen enkel ingrediënt bevat met een van de allergenen of uit "dit eet ik niet";
- binnen de maximale kooktijd valt;
- niet "niet meer" is beoordeeld;
- niet in de afgelopen 2 weken op het menu stond (tenzij er anders te weinig recepten over zijn).

Daarna maken we een **voorselectie van de 60 beste kandidaten** per winkel op basis van de aanbiedingswaarde per portie. Zo blijft het rekenwerk klein.

### Stap 4 — Een menu beoordelen: de kostenfunctie

Een menu `M` is een lijst van `N` recepten. We tellen eerst alle ingrediënten van alle recepten **samen** op en ronden dan pas af op verpakkingen. Daardoor beloont het algoritme vanzelf recepten die ingrediënten delen.

We drukken alles uit in **euro-equivalenten**, zodat de afwegingen begrijpelijk en instelbaar zijn:

```
J(M) = Kosten(M)
     + Verspilling(M)
     + Variatiestraf(M)
     + Herhalingsstraf(M)
     − Voorkeursbonus(M)
```

| Term | Berekening | Startwaarde (instelbaar) |
|---|---|---|
| **Kosten** | Σ over ingrediënten (excl. basisvoorraad): kosten(aantal verpakkingen) × **0,4** — prijs telt mee, maar het budget is de grens | weging 0,4 |
| **Verspilling** | Σ over bederfelijke ingrediënten: (overgebleven deel van de laatste verpakking) × prijs van die verpakking × 0,5 | weging 0,5 |
| **Besparingsbonus** | − 0,5 × de besparing op de verpakkingen die je echt nodig hebt (normale prijs, of onze schatting als de winkel die niet geeft) | weging 0,5 |
| **Variatiestraf** | Zelfde hoofdeiwit 2× in de week: €3 per keer · meer dan 2× pasta: €2 per extra keer · meer dan 2× dezelfde keuken: €1 per extra keer · meer dan 1× soep met brood: €2 per extra keer | zie kolom |
| **Balans** (dieet "alles" / "geen varkensvlees") | Meer vegetarische avonden dan de helft van de week: €2,50 per extra avond | €2,50 |
| **Kinderen** | Met kinderen in huis: €1,50 per recept dat niet als kindvriendelijk is gemarkeerd | €1,50 |
| **Herhalingsstraf** | Recept stond 2–4 weken geleden op het menu: €2 (binnen 2 weken: uitgesloten) | €2 |
| **Voorkeursbonus** | Recept beoordeeld met "lekker": €2 · per recept een kleine willekeurige voorkeur uit de seed (0–€1,50), zodat "Ander menu" een ander menu geeft | zie kolom |

**Harde grens (Premium):** `Kosten(M) ≤ budget`. Menu's die daar overheen gaan, tellen niet mee. Als geen enkel menu binnen budget past, kiezen we het menu met de laagste kosten en tonen we de melding uit [04](04-functionele-specificatie.md) (US-4.1, AC6).

Waarom niet simpelweg "zo goedkoop mogelijk"? Dan krijg je zeven keer bonen met rijst. De straffen en bonussen zorgen voor variatie en smaak. Het budget is de grens, niet het doel.

### Stap 5 — Zoeken: gretig opbouwen + verbeteren

```
functie maakMenu(input, winkel):
    kandidaten = voorselectie(input, winkel)            # stap 3
    beste = null
    herhaal R = 8 keer (met seed voor variatie):
        M = vastgezette recepten
        zolang |M| < N:
            kies uit de kandidaten het recept r met de laagste J(M ∪ {r}),
            met een kleine willekeurige ruis (seed) zodat weken verschillen
            M = M ∪ {r}
        # lokale verbetering
        herhaal tot er niets meer verbetert (max. 50 rondes):
            voor elk niet-vastgezet recept m in M en elke kandidaat c buiten M:
                als J(M − m + c) < J(M) en budget-eis klopt: vervang m door c
        als J(M) < J(beste): beste = M
    return beste
```

Met `N ≤ 7` en 60 kandidaten zijn dit enkele duizenden evaluaties van een paar microseconden. Dat is ruim binnen de 3 seconden.

**Meerdere winkels (Premium, Should have):** draai `maakMenu` per gekozen winkel en toon de totalen naast elkaar. Standaard tonen we het menu van de winkel met de laagste `J`. In de eerste versie combineren we niet twee winkels in één lijst.

### Stap 6 — Volgorde van de week

Sorteer de recepten zo dat de ingrediënten met de kortste houdbaarheid het eerst gebruikt worden:
- vis en gehakt: binnen 2 dagen na de boodschappendag;
- recepten die een ingrediënt delen, staan zo dat het restje snel wordt gebruikt;
- het snelste recept staat op de drukste dag (als de gebruiker die invult; Could have).

### Stap 7 — Boodschappenlijst en besparing

Per ingrediënt: aantal verpakkingen, product (bij een aanbieding de productnaam), prijs, afdeling, aanbiedingslabel.

```
Besparing(M) = Σ over aanbiedingsregels: (normale prijs − actieprijs) × aantal verpakkingen
   normale prijs = de normale prijs uit de aanbiedingsdata als die bekend is,
                   anders de referentieprijs voor die winkel (gemarkeerd als "schatting")
```

De bespaarteller op het dashboard telt alleen afgevinkte regels mee (zie US-7.1).

## 4. Rekenvoorbeeld

> **Let op: alle prijzen in dit voorbeeld zijn verzonnen** en dienen alleen om de rekenregels te laten zien.

Huishouden: 2 volwassenen + 1 kind (6 jaar) = **2,6 porties**. 4 avonden, budget **€30**, winkel Lidl.

Gekozen menu:

| Dag | Recept (voor 4 porties) | Gedeelde ingrediënten |
|---|---|---|
| Ma | Gehaktballetjes in tomatensaus met pasta | gehakt, ui, tomatenblokjes |
| Di | Bloemkoolcurry met rijst | bloemkool, ui, kokosmelk |
| Do | Pasta met gehakt en spinazie | gehakt, ui, spinazie |
| Vr | Geroosterde bloemkool met kip en krieltjes | bloemkool |

Een deel van de boodschappenlijst:

| Ingrediënt | Nodig (geschaald) | Verpakking | Aantal | Prijs | Aanbieding? |
|---|---|---|---|---|---|
| Rundergehakt | 325 g + 260 g = 585 g | 500 g | 2 → **1+1 gratis**: kosten(2) = €4,49 | €4,49 | ✅ normaal €8,98, besparing €4,49 |
| Bloemkool | ¾ stuk per 4 porties × 0,65 = 0,49 stuk, twee recepten = 0,98 stuk | 1 stuk | 1 | €1,29 | ✅ normaal €1,79, besparing €0,50 |
| Ui | 3 stuks | net van 1 kg (±10 stuks) | 1 | €0,99 | – (referentie) |

Zonder samentellen had het algoritme twee bloemkolen (twee keer een halve) en twee pakken gehakt los gerekend; door de recepten met gedeelde ingrediënten te kiezen, daalt zowel de prijs als de verspilling.

Uitkomst bovenaan het menu: **"Totaal €27,85 · binnen je budget van €30 · je bespaart €6,12 met de aanbiedingen van deze week."**

## 5. Uitleg aan de gebruiker

Elk recept in het menu krijgt een korte reden, afgeleid uit de termen van `J`:
- "Gehakt is deze week 1+1 gratis bij Lidl"
- "Gebruikt de andere helft van je bloemkool"
- "Je vond dit recept eerder lekker"

Dit verhoogt het vertrouwen en maakt het verschil met een willekeurige receptenlijst zichtbaar.

## 6. Kwaliteit en tests

Het algoritme wordt een losse module zonder database- of netwerktoegang (`lib/planner/`), zodat het volledig met unit tests te testen is.

Verplichte testgevallen:
- [ ] Portie-equivalenten voor verschillende huishoudens.
- [ ] `kosten(k)` voor normale prijs, "1+1 gratis", "2 voor €5", "2e halve prijs".
- [ ] Afronden op verpakkingen na samentellen (585 g → 2 × 500 g).
- [ ] Dieet, allergenen en "eet ik niet" worden nooit geschonden (property-based test met willekeurige invoer).
- [ ] Budget wordt nooit overschreden als er een geldig menu bestaat.
- [ ] Geen geldig menu binnen budget → goedkoopste menu + melding.
- [ ] Vastgezette recepten blijven staan; overgeslagen dagen worden overgeslagen.
- [ ] Zelfde seed → zelfde menu (reproduceerbaar); andere week → ander menu.
- [ ] Te weinig kandidaten → zo veel mogelijk recepten + melding, geen crash.
- [ ] Prestatie: 7 avonden, 60 kandidaten, 3 winkels < 500 ms op de server.

**Versiebeheer:** elk opgeslagen weekmenu bewaart `algorithm_version`. Bij aanpassingen van wegingen kunnen we zo achteraf vergelijken (bijv. op aantal wissels per menu: minder wissels = betere menu's).

## 7. Latere verbeteringen

- Echte schapprijzen per winkel in plaats van winkelfactoren (PrijsProfeet Pro: `/shelf-prices`).
- Leren van wissels: recepten die vaak worden weggewisseld minder vaak voorstellen.
- Combinatie van twee winkels ("haal het vlees bij de Lidl en de rest bij de AH") als de besparing groter is dan een drempel.
- Lunch en ontbijt.
- Voorraadbeheer: restjes van vorige week meenemen in het menu van deze week.
