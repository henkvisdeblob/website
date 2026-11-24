# CLAUDE.md

Guidance for AI assistants (and humans) writing code in this repository.

## What this is

**Potje** (working name): a Dutch consumer website that generates a weekly meal plan + shopping list within the user's budget, built around this week's supermarket promotions (Albert Heijn, Jumbo, Lidl first). Freemium with a Premium subscription (Stripe).

The full product specification lives in `docs/` (in Dutch). Read the relevant document before working on a feature:

| Working on… | Read first |
|---|---|
| Any feature / scope question | `docs/04-functionele-specificatie.md` (user stories + acceptance criteria) |
| The meal-plan algorithm (`lib/planner/`) | `docs/05-weekmenu-algoritme.md` |
| Deals ingestion, matching, recipes, ingredients | `docs/06-data-en-aanbiedingen.md` |
| Stack, schema, folders, jobs, Stripe, security | `docs/07-technische-architectuur.md` |
| UI, copy, tone of voice | `docs/08-ontwerp-en-merk.md` (+ `DESIGN.md` once it exists) |
| Subscriptions, cancellation, privacy, consent | `docs/09-juridisch-en-administratie.md` |
| What to build next | `docs/11-roadmap-en-validatie.md` |

## Language

- **UI copy:** Dutch, informal "je/jij", tone as in `docs/08`.
- **Code, identifiers, comments, commit messages, PR descriptions:** English.
- **Docs in `docs/`:** Dutch.

## Stack

Next.js (App Router, TypeScript, strict) · Tailwind CSS + shadcn/ui · Supabase (Postgres + RLS, Auth with magic links, Realtime; EU region) · Stripe (Checkout, Billing, Customer Portal) · Vercel · GitHub Actions (CI + scheduled jobs) · Claude API (nightly batch matching only) · Brevo (email) · Plausible (cookieless analytics) · Sentry · Serwist (PWA) · Zod · Vitest · Playwright.

## Non-negotiable conventions

1. **Money is integer cents** (`price_cents: number`). Never floats for money. Format only at the edge (`formatEuro(cents)` → "€3,99").
2. **Dates are Europe/Amsterdam calendar dates** (`YYYY-MM-DD` strings) for shop dates and deal validity. Use one date utility module; never `new Date()` arithmetic scattered around.
3. **`lib/planner/` is pure.** No database, network, `Date.now()` or `Math.random()` inside — pass time and a seed in. Every behaviour change needs a unit test; the test list in `docs/05` §6 is the minimum.
4. **Row Level Security on every table.** The service role key is used only in server code (route handlers, server actions, jobs), never shipped to the client.
5. **Validate all input with Zod** in server actions and API routes.
6. **Premium checks happen on the server** via a single `isPremium()` function (see `docs/07`). UI checks are cosmetic only.
7. **Schema changes go through `supabase/migrations/`.** Never edit a migration that has been applied; add a new one.
8. **Jobs are idempotent** and log to `job_runs`. Cron routes require `CRON_SECRET`.
9. **Stripe webhooks:** verify the signature, process idempotently by event ID, and treat Stripe as the source of truth for subscription state.
10. **Secrets only in environment variables.** Keep `.env.example` up to date (names only, no values).

## Product and legal guardrails

- **No supermarket logos or brand colours**, and nothing suggesting affiliation with a supermarket.
- **Show "Aanbiedingen via PrijsProfeet"** (with link) on every screen that displays deal data, as long as we use their free plan.
- **Never scrape supermarket websites or apps.** Deal data comes only through the `DealSource` interface (`lib/deals/`).
- **Never copy recipe text or photos** from other sites.
- **Cancelling must stay easy:** the "Abonnement opzeggen" button and the "Overeenkomst herroepen" function (first 14 days) must stay visible and work in ≤ 2 clicks. Don't add dark patterns (pre-checked boxes, fake urgency, guilt-tripping copy).
- **Diet and allergy data are sensitive** (GDPR art. 9): only store them with recorded explicit consent; withdrawing consent deletes them.
- **No personal data goes to the Claude API** — only product names and recipe drafts.
- **No tracking cookies.** If that ever changes, a consent banner is required first.

## Definition of done

- Acceptance criteria of the user story (`docs/04`) are met.
- Lint, typecheck and tests pass; new logic has tests.
- Works at 360 px width and with keyboard only; contrast meets WCAG 2.1 AA.
- Loading, empty and error states exist.
- Docs updated if behaviour or schema changed.

## Commands

The project has not been scaffolded yet (sprint 0 in `docs/11`). Once it is, keep this section current, for example:

```bash
npm run dev          # local dev server
npm run lint
npm run typecheck
npm test             # Vitest
npm run test:e2e     # Playwright
npx supabase start   # local Supabase (Docker)
```
