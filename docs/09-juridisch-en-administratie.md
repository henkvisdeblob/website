# 09 — Juridisch en administratie

> **Dit is geen juridisch of fiscaal advies.** Het is een checklist op basis van openbare bronnen (november 2026). Controleer de punten bij de KvK, de Belastingdienst, ACM ConsuWijzer en de Autoriteit Persoonsgegevens, en laat algemene voorwaarden en privacyverklaring vóór de lancering nakijken door een jurist.

## 1. Onderneming starten

- [ ] **Inschrijven bij de KvK** (eenmanszaak) zodra je met winstoogmerk abonnementen gaat verkopen. Kies een SBI-code die past bij een online dienst/platform.
- [ ] **Ben je jonger dan 18?** Dan gelden er aparte regels voor inschrijving en kunnen betaalproviders je mogelijk niet als rekeninghouder accepteren. Vraag dit vooraf na bij de KvK en de betaalprovider.
- [ ] **Zakelijke bankrekening** (niet verplicht voor een eenmanszaak, wel overzichtelijk).
- [ ] **Naam controleren** vóór je investeert in een logo of domein:
  - Handelsnamenregister (KvK)
  - Merkenregister (BOIP) voor de Benelux
  - Domeinnaam (.nl) en de belangrijkste sociale media-namen
- [ ] **Administratie:** bewaar facturen, bankafschriften en Stripe-overzichten **7 jaar** (fiscale bewaarplicht).

## 2. Btw en belasting

| Onderwerp | Wat te weten |
|---|---|
| Btw-tarief | Digitale diensten aan Nederlandse consumenten: 21%. Toon prijzen altijd **inclusief btw**. |
| Kleineondernemersregeling (KOR) | Bij een omzet tot **€20.000 per jaar** kun je kiezen voor de KOR: je rekent dan geen btw, maar kunt ook geen btw terugvragen over je kosten. Aanmelden via de Belastingdienst, ná de KvK-inschrijving. Voor deelname per 1 januari 2027 moet de aanmelding vóór de datum die de Belastingdienst noemt binnen zijn (volgens de Belastingdienst 4 december 2026). Overschrijd je de €20.000, dan val je eruit. |
| Klanten in andere EU-landen | Voor digitale diensten aan consumenten in andere EU-landen geldt de btw van dat land (via de OSS-regeling) zodra je boven de Europese drempel komt. **Advies:** richt je in de eerste versie alleen op Nederland. |
| Inkomstenbelasting | Winst uit onderneming. Voor ondernemersaftrek (zoals zelfstandigenaftrek) geldt onder meer het urencriterium. Laat je eerste aangifte eventueel door een boekhouder doen. |

## 3. Consumentenrecht (abonnementen)

### Vóór het afsluiten
- [ ] Duidelijk vermeld: wie je bent (naam, adres, KvK-nummer, e-mail), wat Premium is, de **prijs incl. btw**, de looptijd, automatische verlenging, hoe je opzegt en het herroepingsrecht.
- [ ] De betaalknop zegt duidelijk dat je een betalingsverplichting aangaat, bijv. **"Betalen en Premium starten"** (niet alleen "Doorgaan").
- [ ] Geen vooraf aangevinkte vakjes en geen misleidende urgentie (dark patterns).
- [ ] Algemene voorwaarden vóór het afsluiten beschikbaar en opslaanbaar (link + PDF in de bevestigingsmail).

### Online opzeggen
- **Wat online is afgesloten, moet online kunnen worden opgezegd**, zonder drempels (zoals alleen telefonisch opzeggen of de opzegknop verstoppen). Na een online opzegging stuur je een bevestiging met de datum waarop het abonnement stopt ([ACM](https://www.acm.nl/nl/publicaties/acm-online-afgesloten-abonnement-moet-je-online-kunnen-opzeggen)).
- **Uitvoering:** knop "Abonnement opzeggen" op `/account/abonnement`, maximaal 2 klikken, direct een bevestigingsmail (zie US-8.2).

### Stilzwijgende verlenging
- Een maandabonnement mag doorlopen en is maandelijks opzegbaar.
- **Jaarabonnement:** na de eerste periode mag een consumentenabonnement alleen stilzwijgend worden verlengd als de klant daarna op elk moment kan opzeggen met een opzegtermijn van maximaal één maand ([Rijksoverheid](https://www.rijksoverheid.nl/vraag-en-antwoord/bescherming-van-consumenten/mogen-abonnementen-stilzwijgend-verlengd-worden)). Praktische keuze voor Potje: **na het eerste jaar loopt het abonnement door, en bij opzeggen betalen we het niet-gebruikte deel terug.** Stuur daarnaast een maand vóór de verlenging een herinneringsmail. Laat deze aanpak door een jurist toetsen.

### Herroepingsrecht en de herroepingsknop
- Consumenten hebben bij online afgesloten diensten **14 dagen bedenktijd**.
- **Sinds 19 juni 2026** moet een website met online afgesloten overeenkomsten waarop het herroepingsrecht van toepassing is, een duidelijk gelabelde **herroepingsfunctie** hebben ("Overeenkomst herroepen"), met een bevestiging na gebruik (EU-richtlijn 2023/2673, artikel 11a van de Richtlijn consumentenrechten). Volgens juristen geldt dit ook voor abonnementen via websites en apps ([Hogan Lovells](https://www.hoganlovells.com/en/publications/eu-consumer-protection-law-update-new-mandatory-withdrawal-button-what-online-traders-need-to-know), [iubenda](https://www.iubenda.com/en/blog/online-withdrawal-function-eu-directive-2023-2673/)). Controleer hoe Nederland dit precies heeft ingevoerd.
- **Keuze voor Potje:** bij herroepen binnen 14 dagen betalen we **het volledige bedrag** terug. Dat is klantvriendelijk, eenvoudig en het gaat om kleine bedragen. (Wettelijk mag je bij een dienst die op verzoek van de klant al is gestart, een evenredig deel in rekening brengen, maar dat levert vooral administratie op.)
- **Uitvoering:** knop "Overeenkomst herroepen" op `/account/abonnement`, zichtbaar in de eerste 14 dagen (zie US-8.3). Voeg het modelformulier voor herroeping toe aan de voorwaarden.

### Gratis proefperiode
- Potje gebruikt een proefperiode **zonder betaalgegevens en zonder automatische omzetting** naar betaald. Daarmee vermijden we de risico's van proefabonnementen die ongemerkt betaald worden.

## 4. Privacy (AVG)

### Welke gegevens en waarom

| Gegeven | Doel | Grondslag | Bewaartermijn |
|---|---|---|---|
| E-mailadres | Account, inloggen, dienstmails | Overeenkomst | Tot verwijdering account |
| Huishouden, budget, winkels, boodschappendag, kooktijd | Weekmenu maken | Overeenkomst | Tot verwijdering account |
| **Allergieën** | Recepten uitsluiten | **Uitdrukkelijke toestemming** (gezondheidsgegevens, art. 9 AVG) | Tot intrekking toestemming of verwijdering |
| **Dieet** (vooral halal, of "geen varkensvlees") | Recepten uitsluiten | **Uitdrukkelijke toestemming** (kan iets zeggen over geloof, art. 9 AVG) | Idem |
| Weekmenu's, beoordelingen, afgevinkte producten | Dienst, bespaarteller | Overeenkomst | Tot verwijdering account |
| Abonnementsstatus, Stripe-klant-ID | Betalen | Overeenkomst + wettelijke plicht (facturen 7 jaar) | 7 jaar voor facturen |
| Wachtlijst-e-mail | Lanceringsbericht | Toestemming (double opt-in) | Tot lancering + 6 maanden, of eerder uitschrijven |
| Weekmail en nieuwsbrief | Informeren | Toestemming (uitschrijven met één klik) | Tot uitschrijven |

**Minimaliseren:** dieet en allergieën zijn optioneel; zonder toestemming werkt de dienst gewoon, alleen zonder die filters. Leg het tijdstip van toestemming vast (`sensitive_data_consent_at`) en laat intrekken in één klik toe (de gegevens worden dan gewist).

### Checklist
- [ ] Privacyverklaring in begrijpelijk Nederlands (wie, wat, waarom, hoe lang, met wie gedeeld, rechten, klachten bij de Autoriteit Persoonsgegevens).
- [ ] **Verwerkersovereenkomsten** met Supabase, Vercel, Brevo, Plausible en Sentry (meestal standaard in hun voorwaarden). Stripe is voor betalingen deels zelf verantwoordelijk.
- [ ] Controleer of data buiten de EU gaat (bij Amerikaanse diensten) en op welke grondslag (EU-VS Data Privacy Framework of standaardcontractbepalingen).
- [ ] **De Claude API krijgt geen persoonsgegevens:** alleen productnamen en receptconcepten.
- [ ] Verwerkingsregister (een eenvoudige tabel zoals hierboven volstaat voor een kleine onderneming).
- [ ] Procedure voor datalekken: binnen 72 uur melden bij de Autoriteit Persoonsgegevens als dat nodig is.
- [ ] Rechten van gebruikers ingebouwd: gegevens downloaden en account verwijderen (US-11.1).
- [ ] **Minimumleeftijd 16 jaar** voor een account (in Nederland de leeftijdsgrens voor toestemming bij online diensten).

### Cookies
- Alleen functionele cookies (inlogsessie) en Plausible (zonder cookies). Daardoor is **geen cookiebanner nodig**. Zet wel een korte cookieverklaring op de site.
- Voeg je later advertentie- of trackingpixels toe (bijv. Meta), dan is toestemming vooraf verplicht.

## 5. Merken, data en inhoud

- [ ] **Geen logo's of huisstijl van supermarkten.** Supermarktnamen noemen om te beschrijven waar een aanbieding geldt, mag; wek geen indruk van samenwerking. Op `/over` en in de footer: *"Potje is onafhankelijk en niet verbonden aan Albert Heijn, Jumbo, Lidl of andere supermarkten."*
- [ ] **Bronvermelding PrijsProfeet** op elk scherm met hun data (gratis plan) en hun voorwaarden naleven (zie [06](06-data-en-aanbiedingen.md)).
- [ ] **Geen teksten of foto's van andere receptensites** overnemen.
- [ ] **Vergelijkende uitspraken** ("Lidl is deze week het goedkoopst") moeten eerlijk, controleerbaar en niet misleidend zijn. Vermeld de berekeningswijze.

## 6. Aansprakelijkheid en disclaimers

- **Prijzen:** "Prijzen en aanbiedingen zijn indicatief en kunnen afwijken van de prijs in de winkel."
- **Allergenen:** "Controleer altijd het etiket. Potje kan niet garanderen dat een product vrij is van allergenen."
- **Voedselveiligheid:** recepten noemen kerntemperaturen of duidelijke gaartijden voor kip, gehakt en vis.
- **Besparingen:** "De besparing is een berekening ten opzichte van de normale prijs en geen garantie."

## 7. Documenten die klaar moeten zijn vóór lancering

| Document | Pagina |
|---|---|
| Algemene voorwaarden (incl. herroeping en modelformulier) | `/voorwaarden` |
| Privacyverklaring | `/privacy` |
| Cookieverklaring | `/cookies` |
| Contactgegevens en colofon (naam, adres of correspondentieadres, KvK-nummer, e-mail) | Footer + `/over` |
| Bevestigingsmails: aanmelding, betaling, opzegging, herroeping | E-mailsjablonen |

## Bronnen

- [ACM — Online afgesloten abonnement moet je online kunnen opzeggen](https://www.acm.nl/nl/publicaties/acm-online-afgesloten-abonnement-moet-je-online-kunnen-opzeggen)
- [Rijksoverheid — Mogen abonnementen stilzwijgend verlengd worden?](https://www.rijksoverheid.nl/vraag-en-antwoord/bescherming-van-consumenten/mogen-abonnementen-stilzwijgend-verlengd-worden)
- [Hogan Lovells — Mandatory withdrawal button](https://www.hoganlovells.com/en/publications/eu-consumer-protection-law-update-new-mandatory-withdrawal-button-what-online-traders-need-to-know)
- [iubenda — Online withdrawal function, Directive 2023/2673](https://www.iubenda.com/en/blog/online-withdrawal-function-eu-directive-2023-2673/)
- [KvK — Starter: zo werkt de KOR](https://www.kvk.nl/starten/starter-zo-werkt-de-kleineondernemersregeling-kor/)
- [Belastingdienst — Aanmelden voor de KOR](https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/aanmelden-kor)
