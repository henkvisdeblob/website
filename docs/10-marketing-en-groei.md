# 10 — Marketing en groei

## Strategie in het kort

Concurrenten zitten vooral in apps die je eerst moet vinden en installeren. **Potje wint op distributie:** elke week nieuwe, openbare, nuttige inhoud die gevonden wordt in Google en gedeeld wordt op sociale media, en die bezoekers naar een gratis account leidt.

| Kanaal | Rol | Kosten | Wanneer |
|---|---|---|---|
| **Zoekmachines (SEO)** | Duurzame stroom bezoekers via wekelijkse aanbiedingspagina's en recepten | Tijd | Vanaf de MVP; resultaat na 3–6 maanden |
| **Korte video's** (TikTok, Instagram Reels, YouTube Shorts, Facebook) | Bereik en herkenning: "weekmenu onder €50 met de aanbiedingen van deze week" | Tijd | Vanaf fase 0 |
| **Communities** (Facebook-groepen, Reddit, fora over besparen en gezinnen) | Eerste gebruikers en feedback | Tijd | Vanaf fase 0 |
| **E-mail** | Terugkerend gebruik en doorsturen | ~€0 | Vanaf de MVP |
| **Pers en partners** | Geloofwaardigheid en pieken in bezoekers | Tijd | Rond de lancering |
| **Betaalde advertenties** | Alleen om te testen (fase 0) | €100–€200 | Fase 0, daarna alleen als de cijfers kloppen |

## 1. Zoekmachines (SEO)

### Paginatypen

| Pagina | Voorbeeld | Zoekintentie |
|---|---|---|
| Aanbiedingen per supermarkt (wekelijks bijgewerkt, **vaste URL**) | `/aanbiedingen/lidl` — "Goedkoop koken met de Lidl-aanbiedingen van deze week" | "lidl aanbiedingen deze week recepten" |
| Receptpagina's | `/recepten/bloemkoolcurry-met-rijst` | "bloemkoolcurry", "goedkope curry" |
| Themapagina's | `/goedkoop-koken/onder-2-euro-per-persoon`, `/goedkoop-koken/studenten`, `/goedkoop-koken/gezin` | "goedkoop koken voor gezin" |
| Gidsen | "Zo bespaar je €100 per maand op boodschappen", "Weekmenu maken: zo doe je het" | "besparen op boodschappen tips" |

**Vaste URL per supermarkt:** werk dezelfde pagina elke week bij in plaats van elke week een nieuwe URL te maken. Zo bouwt één pagina gezag op in Google.

### Zoekwoorden om mee te beginnen
"aanbiedingen deze week", "ah bonus recepten", "jumbo aanbiedingen recepten", "lidl aanbiedingen recepten", "goedkoop koken", "goedkope recepten", "weekmenu goedkoop", "weekmenu gezin", "besparen op boodschappen", "budget weekmenu". **Controleer het zoekvolume en de concurrentie** met een zoekwoordtool voordat je de lijst definitief maakt.

### Techniek
- Snelle pagina's (Core Web Vitals in het groen).
- Gestructureerde data: `Recipe` op receptpagina's, `ItemList` op overzichtspagina's, `FAQPage` op veelgestelde vragen.
- XML-sitemap en interne links (recept ↔ aanbiedingspagina ↔ themapagina).
- Unieke titels en beschrijvingen, ook voor automatisch gegenereerde pagina's.

## 2. Korte video's

**Wekelijkse serie:** "Weekmenu voor 4 personen onder €50 — met de [Lidl/AH/Jumbo]-aanbiedingen van deze week."
- 30–60 seconden: de 5 gerechten in beeld, het totaal, de besparing, en "het hele menu met boodschappenlijst staat op de site (link in bio)".
- Eén opname, vier platforms.
- Varianten: "Studentenweek voor €25", "Vegetarisch onder €40", "Wat kook ik van de 1+1-gratis-aanbiedingen".
- Bouw in het openbaar ("build in public"): laat zien hoe je de site bouwt. Dat trekt een tweede publiek en geeft geloofwaardigheid.

## 3. Communities

- Facebook-groepen over besparen, budgetteren, gezinnen en koken; Nederlandstalige subreddits over geld en koken; fora.
- **Regel:** geef eerst waarde (een gratis weekmenu-afbeelding, een tip), lees de groepsregels, en plaats pas een link als dat mag of als erom gevraagd wordt.
- Gebruik deze plekken ook voor interviews in fase 0.

## 4. E-mail

| Mail | Doel |
|---|---|
| Weekmenumail (avond vóór boodschappendag) | Belangrijkste reden om terug te komen; makkelijk door te sturen |
| Maandoverzicht "je bespaarde €74 in november" | Waarde zichtbaar maken; verlaagt opzeggingen |
| Proefperiode dag 12 en dag 15 | Omzetten naar Premium met de eigen besparing als argument |
| Heractivering na 3 weken stilte | "De aanbiedingen van deze week: 3 gerechten voor jou" |

Pushmeldingen via de webapp (PWA) zijn een aanvulling, ook op iPhone als de app op het beginscherm is gezet.

## 5. Doorverwijzen

"Geef een maand Premium, krijg een maand Premium": een persoonlijke link in de app en onder elke weekmenumail. Al in fase 0 gebruiken we de variant "schuif op op de wachtlijst" (US-1.2).

## 6. Pers en partners

- **De Potje-weekmenu-index:** elke week publiceren in welke supermarkt een vast standaardweekmenu (4 personen, 5 avonden) het goedkoopst is. Dat is uniek, terugkerend nieuws voor consumentenprogramma's, nieuwssites en sociale media. **Let op:** de berekening moet eerlijk, transparant en controleerbaar zijn (zie vergelijkende uitspraken in [09](09-juridisch-en-administratie.md)).
- **Persbericht bij de lancering:** het verhaal van de solo-maker, de besparing in euro's en één sterke cijferclaim.
- **Partners:** geldbloggers, gezins- en mamablogs, budgetcoaches en schuldhulpverleners. Overweeg gratis Premium voor cliënten van schuldhulpverlening: maatschappelijk nuttig, goed voor de naamsbekendheid, en mogelijk de opstap naar B2B-licenties (zie [03](03-verdienmodel.md)).

## 7. Weekritme (vanaf de MVP)

| Dag | Activiteit |
|---|---|
| Ma | Aanbiedingen controleren in de beheeromgeving (< 30 min); openbare pagina's live |
| Di | Video's opnemen en plaatsen (1 per supermarkt) |
| Wo | Weekmenu-index publiceren; posten in communities |
| Do | 3–5 nieuwe recepten toevoegen |
| Vr | Cijfers bekijken (zie hieronder) en 1 verbetering kiezen voor volgende week |
| Weekend | Weekmenumails gaan automatisch; reageren op vragen en reviews |

## 8. Funnel en doelen

| Stap | Doel |
|---|---|
| Bezoeker → account | 5–10% |
| Account → eerste weekmenu (geactiveerd) | ≥ 70% |
| Geactiveerd → nog actief in week 4 | ≥ 30% |
| Actief → betalend (na de proefperiode) | 3–5% |
| Maandelijkse opzeggingen van betalers | < 7–10% |

Meet elke stap in Plausible (doelen) en in de eigen database (activering, retentie, betaling). Kies elke week **één** stap om te verbeteren, liefst de grootste lekkage.
