import { AlertCircle, CheckCircle2, FlaskConical } from "lucide-react";
import type { Metadata } from "next";
import { io } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { signOutAction } from "@/app/actions/auth";
import {
  cancelSubscriptionAction,
  deleteAccountAction,
  openBillingPortalAction,
  resumeSubscriptionAction,
  startCheckoutAction,
  withdrawContractAction,
} from "@/app/actions/billing";
import { ConfirmAction } from "@/components/account/confirm-action";
import { SimplePage } from "@/components/site-chrome";
import { Badge, ButtonLink, Missing, buttonStyles } from "@/components/ui";
import { accountsEnabled, createSupabaseServerClient, getSessionUser } from "@/lib/auth/session";
import type { PlanInterval } from "@/lib/billing/checkout";
import {
  canCancel,
  canResume,
  canWithdraw,
  isRunning,
  premiumAccess,
  withdrawalLastDay,
  type PremiumAccess,
} from "@/lib/billing/entitlements";
import { getPlanPrices, type PlanPrices } from "@/lib/billing/prices";
import { getAccountBilling, type CurrentSubscription } from "@/lib/billing/store";
import { billingEnabled, getBillingConfig } from "@/lib/billing/stripe";
import { formatDateNl, formatInstantNl } from "@/lib/dates";
import { formatEuro } from "@/lib/format";
import { FREE_DINNER_LIMIT } from "@/lib/billing/limits";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Je account",
  robots: { index: false, follow: false },
};

const PAGE = "/account/abonnement";
const PER: Record<PlanInterval, string> = { month: "per maand", year: "per jaar" };

export default function SubscriptionPage({ searchParams }: PageProps<"/account/abonnement">) {
  return (
    <SimplePage>
      <h1 className="text-h1 font-bold">Je account</h1>
      <Suspense fallback={<p className="mt-6 text-fg-muted">Even laden…</p>}>
        <AccountContent searchParams={searchParams} />
      </Suspense>
    </SimplePage>
  );
}

async function AccountContent({ searchParams }: Pick<PageProps<"/account/abonnement">, "searchParams">) {
  if (!accountsEnabled()) {
    return (
      <div className="mt-4">
        <p className="text-lead text-fg-muted">Accounts komen binnenkort. Een weekmenu maken kan nu al, zonder account.</p>
        <ButtonLink href="/weekmenu" className="mt-6">
          Maak gratis je weekmenu
        </ButtonLink>
      </div>
    );
  }

  const user = await getSessionUser();
  if (!user) redirect(`/inloggen?next=${PAGE}`);
  const supabase = await createSupabaseServerClient();
  const billing = supabase ? await getAccountBilling(supabase, user.id) : null;
  const params = await searchParams;
  await io();
  const now = new Date();

  const subscription = billing?.subscription ?? null;
  const access = premiumAccess(billing?.trial ?? null, subscription, now);
  const canBuy = billingEnabled();
  const prices = canBuy && !isRunning(subscription) ? await getPlanPrices().catch(() => null) : null;

  return (
    <>
      <p className="mt-3 text-fg-muted">
        Ingelogd als <strong className="text-fg">{user.email}</strong>
      </p>
      <Notices params={params} />
      {canBuy && getBillingConfig()?.testMode && (
        <p className="mt-6 flex items-start gap-2 rounded-md bg-warning-soft p-4 text-sm text-fg">
          <FlaskConical aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
          <span>
            <strong>Testmodus:</strong> er wordt geen echt geld afgeschreven. Betaal met testkaart 4242 4242 4242 4242,
            een datum in de toekomst en een willekeurige CVC.
          </span>
        </p>
      )}

      <section aria-labelledby="abonnement" className="mt-10">
        <h2 id="abonnement" className="text-h3 font-bold">
          Je abonnement
        </h2>
        <StatusCard access={access} subscription={subscription} />
        {isRunning(subscription) ? (
          <ManageSubscription subscription={subscription} now={now} hasCustomer={Boolean(billing?.customerId)} />
        ) : canBuy ? (
          prices ? (
            <Plans prices={prices} />
          ) : (
            <p className="mt-4 text-fg-muted">Premium afsluiten lukt nu even niet. Probeer het later nog eens.</p>
          )
        ) : (
          <p className="mt-4 text-fg-muted">Premium afsluiten kan binnenkort.</p>
        )}
      </section>

      <section aria-labelledby="gegevens" className="mt-12 border-t border-border pt-10">
        <h2 id="gegevens" className="text-h3 font-bold">
          Je gegevens
        </h2>
        <div className="mt-4 flex flex-col items-start gap-4">
          <form action={signOutAction}>
            <button type="submit" className={buttonStyles.secondary}>
              Uitloggen
            </button>
          </form>
          <ConfirmAction
            action={deleteAccountAction}
            label="Account verwijderen"
            title="Je account verwijderen?"
            body={
              <>
                We verwijderen je account en je gegevens. Heb je een abonnement, dan stopt dat direct, zonder terugbetaling.
                {canWithdraw(subscription, now) && " Wil je je geld terug? Gebruik dan eerst “Overeenkomst herroepen”."}{" "}
                Facturen bewaren we 7 jaar, omdat dat wettelijk moet.
              </>
            }
            confirmLabel="Ja, verwijder mijn account"
          />
        </div>
      </section>
    </>
  );
}

function Notices({ params }: { params: Record<string, string | string[] | undefined> }) {
  const success = (text: string) => (
    <p role="status" className="mt-6 flex items-start gap-2 rounded-md bg-savings-soft p-4 text-sm text-on-savings-soft">
      <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {text}
    </p>
  );
  if (params.gestart) {
    return success(
      "Bedankt! Je betaling is gelukt. Je Premium wordt binnen een paar seconden actief; zie je het hieronder nog niet, ververs dan de pagina.",
    );
  }
  if (params.opgezegd) return success("Je abonnement is opgezegd. Je krijgt een bevestiging per mail.");
  if (params.hervat) return success("Je opzegging is ingetrokken. Je abonnement loopt gewoon door.");
  if (params.herroepen) {
    return success("Je hebt de overeenkomst herroepen. Het abonnement is gestopt en je krijgt je geld terug. De bevestiging staat in je mail.");
  }
  if (params.fout) {
    return (
      <p role="alert" className="mt-6 flex items-start gap-2 rounded-md bg-error-soft p-4 text-sm text-fg">
        <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-error" />
        Er ging iets mis. Probeer het nog eens; lukt het niet, mail ons dan.
      </p>
    );
  }
  return null;
}

function StatusCard({ access, subscription }: { access: PremiumAccess; subscription: CurrentSubscription | null }) {
  let badge: ReactNode;
  let title: string;
  let text: string;
  if (!access.premium) {
    badge = <Badge>Gratis</Badge>;
    title = `Je gebruikt ${siteConfig.name} gratis`;
    text = `Met Gratis maak je een weekmenu voor maximaal ${FREE_DINNER_LIMIT} avonden.`;
  } else if (access.via === "trial") {
    badge = <Badge tone="primary">Premium · proefperiode</Badge>;
    title = `Je probeert Premium gratis tot en met ${formatInstantNl(access.until)}`;
    text = "Daarna ga je vanzelf naar Gratis. Je betaalt niets, tenzij je zelf Premium afsluit.";
  } else if (access.via === "grace") {
    badge = <Badge tone="warning">Betaling mislukt</Badge>;
    title = "Je laatste betaling is niet gelukt";
    text = `We proberen het automatisch opnieuw. Je Premium loopt door tot en met ${formatInstantNl(access.until)}. Controleer je betaalmethode.`;
  } else {
    const per = subscription ? PER[subscription.interval] : "";
    badge = <Badge tone="savings">Premium {per}</Badge>;
    title = access.renews
      ? `Je abonnement wordt verlengd op ${formatInstantNl(access.until)}`
      : `Opgezegd: je houdt Premium tot en met ${formatInstantNl(access.until)}`;
    text = access.renews
      ? "Opzeggen kan altijd, hieronder."
      : "Daarna ga je naar Gratis en betaal je niets meer. Je gegevens blijven bewaard.";
  }
  return (
    <div className="mt-4 rounded-lg border border-border bg-surface p-5 sm:p-6">
      {badge}
      <p className="mt-3 font-display text-h4 font-bold">{title}</p>
      <p className="mt-1 text-fg-muted">{text}</p>
    </div>
  );
}

function ManageSubscription({
  subscription,
  now,
  hasCustomer,
}: {
  subscription: CurrentSubscription;
  now: Date;
  hasCustomer: boolean;
}) {
  const periodEnd = formatInstantNl(subscription.currentPeriodEnd);
  return (
    <div className="mt-6 space-y-8">
      <div className="flex flex-col items-start gap-3">
        {canCancel(subscription) && (
          <ConfirmAction
            action={cancelSubscriptionAction}
            label="Abonnement opzeggen"
            title="Abonnement opzeggen?"
            body={`Je houdt Premium tot en met ${periodEnd}. Daarna betaal je niets meer en ga je naar Gratis.`}
            confirmLabel="Ja, zeg mijn abonnement op"
          />
        )}
        {canResume(subscription) && (
          <ConfirmAction
            action={resumeSubscriptionAction}
            label="Opzegging intrekken"
            title="Opzegging intrekken?"
            body={`Je abonnement loopt dan door en wordt op ${periodEnd} verlengd.`}
            confirmLabel="Ja, laat mijn abonnement doorlopen"
          />
        )}
        {hasCustomer && (
          <form action={openBillingPortalAction}>
            <button type="submit" className={buttonStyles.quiet}>
              Betaalmethode en facturen
            </button>
          </form>
        )}
      </div>

      {canWithdraw(subscription, now) && (
        <div className="rounded-lg border border-border bg-muted p-5 sm:p-6">
          <h3 className="text-h4 font-bold">Overeenkomst herroepen</h3>
          <p className="mt-1 text-fg-muted">
            Binnen 14 dagen na het afsluiten mag je de overeenkomst herroepen, zonder reden. Dat kan tot en met{" "}
            {formatDateNl(withdrawalLastDay(subscription), { year: true })}. Je abonnement stopt dan direct en je krijgt
            het hele bedrag terug.
          </p>
          <div className="mt-4">
            <ConfirmAction
              action={withdrawContractAction}
              label="Overeenkomst herroepen"
              title="Wil je de overeenkomst herroepen?"
              body="Je abonnement stopt direct, je krijgt het hele bedrag terug en we sturen je een bevestiging per mail."
              confirmLabel="Herroeping bevestigen"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Plans({ prices }: { prices: PlanPrices }) {
  const yearPerMonth = Math.round(prices.year.amountCents / 12);
  const owner = siteConfig.ownerName ?? <Missing>[naam]</Missing>;
  const address = siteConfig.ownerAddress ?? <Missing>[adres]</Missing>;
  const kvk = siteConfig.kvkNumber ?? <Missing>[KvK-nummer]</Missing>;
  const email = siteConfig.contactEmail ?? <Missing>[e-mailadres]</Missing>;

  return (
    <div className="mt-6">
      <h3 className="text-h4 font-bold">Word Premium</h3>
      <ul className="mt-3 space-y-1.5 text-fg-muted">
        <li>Weekmenu&apos;s voor 4 tot 7 avonden per week (met Gratis: {FREE_DINNER_LIMIT})</li>
        <li>Nieuwe Premium-functies krijg je zonder extra kosten</li>
      </ul>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {(["month", "year"] as const).map((interval) => (
          <li key={interval} className="flex flex-col rounded-lg border border-border bg-surface p-5">
            <p className="text-sm font-semibold text-fg-muted">{interval === "month" ? "Maandabonnement" : "Jaarabonnement"}</p>
            <p className="mt-2">
              <span className="font-display text-h2 font-bold tabular-nums">{formatEuro(prices[interval].amountCents)}</span>{" "}
              <span className="text-fg-muted">{PER[interval]}</span>
            </p>
            <p className="mt-1 text-sm text-fg-subtle">
              {interval === "month" ? "Maandelijks opzegbaar" : `Komt neer op ${formatEuro(yearPerMonth)} per maand`}
            </p>
            <form action={startCheckoutAction} className="mt-5">
              <input type="hidden" name="interval" value={interval} />
              <button type="submit" className={`${buttonStyles[interval === "month" ? "primary" : "secondary"]} w-full`}>
                Word Premium {PER[interval]}
              </button>
            </form>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-lg bg-muted p-5 text-sm text-fg-muted sm:p-6">
        <p className="font-semibold text-fg">Goed om te weten voordat je begint</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Prijzen zijn inclusief btw. Je betaalt vooraf, per maand of per jaar.</li>
          <li>Je abonnement wordt automatisch verlengd tot je opzegt.</li>
          <li>Opzeggen kan altijd online, in twee klikken. Je houdt Premium tot het einde van de betaalde periode.</li>
          <li>
            Na het eerste jaar kun je een jaarabonnement op elk moment opzeggen; je krijgt dan het niet-gebruikte deel
            terug.
          </li>
          <li>Binnen 14 dagen kun je de overeenkomst herroepen. Je krijgt dan het hele bedrag terug.</li>
          <li>Je betaalt veilig via Stripe. Wij zien en bewaren je betaalgegevens niet.</li>
        </ul>
        <p className="mt-4">
          Aanbieder: {owner} · {address} · KvK {kvk} · {email}. Lees ook de{" "}
          <Link href="/voorwaarden" className="text-primary underline underline-offset-4">
            voorwaarden
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
