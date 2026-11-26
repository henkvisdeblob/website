# DESIGN.md — Potje

The visual system for every page. Values live as CSS variables in `app/globals.css` and are exposed to Tailwind as theme tokens; **pages use token names, never raw hex values or arbitrary sizes.** Brand background and tone: `docs/08-ontwerp-en-merk.md`.

**Direction:** warm, appetising and calm — a kitchen table, not a supermarket folder. Cream background, warm near-black text, one paprika accent for actions, fresh green reserved for money saved. The product UI (the week menu with its total and savings) is the hero image; no stock photos.

> Not based on a study of comparable live sites (UXKIN was not connected). Based on the brand brief in `docs/08` and general rules. Revisit once real food photography exists.

## Color

Light and dark values; dark follows `prefers-color-scheme`. All text pairs below meet WCAG AA (≥ 4.5:1); `border-strong` is for UI outlines only (≥ 3:1).

| Token (Tailwind) | Light | Dark | Role |
|---|---|---|---|
| `bg` | `#FBF7F1` | `#16120F` | Page background |
| `surface` | `#FFFFFF` | `#1F1A16` | Cards, inputs, the menu mockup |
| `muted` | `#F4EDE3` | `#29221D` | Alternate sections, footer, quiet fills |
| `border` | `#E5DBCD` | `#3A3029` | Dividers, card borders |
| `border-strong` | `#9C8E7E` | `#7A6B5E` | Input borders, checkboxes (UI only) |
| `fg` | `#1E1914` | `#F5EFE8` | Body text, headings |
| `fg-muted` | `#5C5148` | `#C2B5A8` | Secondary text, descriptions |
| `fg-subtle` | `#6F6358` | `#A89A8C` | Captions, footnotes, meta |
| `primary` | `#B83C0B` | `#F2804F` | Primary buttons, links, focus ring |
| `primary-hover` | `#9A3209` | `#F59A72` | Hover/pressed state of primary |
| `on-primary` | `#FFFFFF` | `#1B0E07` | Text on `primary` |
| `primary-soft` / `on-primary-soft` | `#FBE7DC` / `#8A2E08` | `#3A2116` / `#F8B596` | Highlight chips, step numbers |
| `savings` | `#1F7A45` | `#5FCB8C` | Amounts saved, "in de aanbieding" — **only** for savings |
| `savings-soft` / `on-savings-soft` | `#E2F3E8` / `#17603A` | `#15301F` / `#8BE0AE` | Deal badges, savings banner |
| `warning` / `warning-soft` | `#94570A` / `#FCEFD6` | `#F0B455` / `#33260F` | "Schatting", "met app/kaart" labels |
| `error` / `error-soft` | `#B42318` / `#FDE8E6` | `#F87171` / `#3B1715` | Form errors (always with icon + text) |

Rules: never use supermarket brand colors (AH blue, Jumbo yellow, Lidl blue/yellow/red). Meaning is never carried by color alone.

## Typography

- **Display:** Bricolage Grotesque (variable, optical size 12–96, weight 200–800) — headings, prices in the hero, the wordmark. Warm and a little quirky, like a market chalkboard.
- **Body:** Figtree (variable, weight 300–900) — everything else. Friendly and very legible on phones.
- **Numbers:** prices and amounts use `tabular-nums` (both fonts support `tnum`).
- Self-hosted from `app/fonts/` via `next/font/local` (SIL OFL 1.1; licenses alongside).

| Token | Size | Line height | Weight | Use |
|---|---|---|---|---|
| `text-h1` | 38 → 60px (fluid) | 1.02 | Display 750 | One per page |
| `text-h2` | 30 → 40px (fluid) | 1.1 | Display 700 | Section titles |
| `text-h3` | 24px | 1.25 | Display 650 | Card titles, sub-sections |
| `text-h4` | 20px | 1.35 | Body 700 | Small headings, list titles |
| `text-lead` | 19px | 1.55 | Body 400 | Intro paragraphs |
| `text-base` | 16px | 1.6 | Body 400 / 600 | Body text (never smaller for paragraphs) |
| `text-sm` | 14px | 1.45 | Body 500 | UI labels, secondary info |
| `text-caption` | 13px | 1.4 | Body 500 | Footnotes, sources, badges |

Line length: paragraphs max `max-w-prose` (~65 characters).

## Spacing and layout

- 4px base scale (Tailwind default: `1` = 4px). Common steps: 2, 3, 4, 6, 8, 12, 16, 24.
- Section padding: `py-16` (64px) on mobile, `md:py-24` (96px) from tablet up.
- Page width: `max-w-page` (72rem / 1152px) with `px-4` (16px) gutters on mobile, `sm:px-6`, `lg:px-8`.
- Mobile-first; breakpoints are Tailwind defaults (`sm` 640, `md` 768, `lg` 1024).
- Sections alternate `bg` and `muted` backgrounds. Not every section is centered: text is left-aligned by default; only the final call to action is centered.

## Shape and depth

| Token | Value | Use |
|---|---|---|
| `rounded-sm` | 6px | Badges, checkboxes |
| `rounded-md` | 10px | Buttons, inputs |
| `rounded-lg` | 16px | Cards |
| `rounded-xl` | 24px | The hero menu mockup, large panels |
| `rounded-full` | — | Pills, avatars, step numbers |
| `shadow-card` | soft two-layer shadow | Only for elevated product mockups; regular cards use a border |

## Components

- **Button — primary:** `bg-primary text-on-primary`, `rounded-md`, height 48px (`h-12`), `px-5`, `font-semibold`. Hover `bg-primary-hover`. Disabled: 50% opacity, no pointer. One primary button per view.
- **Button — secondary:** `bg-surface text-fg border border-border-strong`, hover `bg-muted`.
- **Button — quiet:** text only, `text-primary underline-offset-4 hover:underline`.
- **Button — small (`primarySmall`, `secondarySmall`):** height 40px (`h-10`), `px-4`, `text-sm`. Only in the header.
- **Focus (all interactive elements):** `outline-2 outline-offset-2 outline-primary` on `:focus-visible`. Never remove focus styles.
- **Link (in text):** `text-primary underline underline-offset-4 decoration-1 hover:decoration-2`.
- **Input:** height 48px, `bg-surface`, `border border-border-strong`, `rounded-md`, `px-4`, `text-base` (16px prevents iOS zoom). Label always visible above the field. Error: `border-error` + message with icon below, linked via `aria-describedby`.
- **Card:** `bg-surface border border-border rounded-lg p-6`.
- **Badge:** `text-caption font-semibold rounded-sm px-2 py-0.5`; variants `savings` (savings-soft), `warning` (warning-soft), `neutral` (muted), `primary` (primary-soft). Deal labels ("1+1 gratis", "−50%") are always `savings` with a `Tag` icon.
- **Budget meter:** `role="meter"` with `aria-valuenow/min/max`; 8px track in `bg-muted`, fill `bg-savings` within budget and `bg-error` over budget, amount in text next to it (never color alone).
- **Progress bar (shopping list):** `role="progressbar"`, same track as the meter, fill `bg-savings`, with "x van y in je mandje" as text.
- **Meal icon:** 40px tile `rounded-md bg-primary-soft text-on-primary-soft` with a Lucide icon chosen from the recipe's main protein (soup recipes get a bowl). Decorative: `aria-hidden`.
- **Deal list (`components/deals/top-deals.tsx`):** one card per store, rows with product name (truncated, full name in `title`), price, struck-through normal price and a savings badge. Always followed by the date and "Aanbiedingen via PrijsProfeet", or by the test-mode notice for sample data.
- **Feature tiles (bento):** cards in a 6-column grid (`md:col-span-3` / `md:col-span-2`), icon tile + title + one sentence, ending in a small piece of real-looking UI on `bg-muted`. Not a row of identical icon cards.
- **Navigation:** slim top bar: wordmark left, at most one text link and one small button right. On the planner the button points to the waitlist instead of the planner. No hamburger.
- **Footer:** `bg-muted`, small print in `fg-subtle`: independence disclaimer, privacy link, data source.

## Imagery and icons

- **Icons:** Lucide (`lucide-react`), stroke 1.75, 20px inline / 24px in feature lists, color `fg-muted` or `primary`. No emoji as icons.
- **Product visuals:** real UI rendered in HTML (week menu, shopping list), labeled "voorbeeld" when numbers are illustrative. The hero shows the week menu on a soft `primary-soft` glow with one floating savings pill; nothing may cover the menu's content.
- **Social preview:** `app/opengraph-image.tsx` renders the 1200×630 image with the light-mode colors and Bricolage 800 (`app/fonts/*.woff`, OFL).
- **Photos:** none until we have our own food photography (daylight, top-down). No stock photos of smiling families.
- **Logo:** wordmark "Potje" in Display 800 with a cooking-pot mark in a `primary` rounded square.
