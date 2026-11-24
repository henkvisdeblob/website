"use client";

import { useState, useTransition } from "react";
import { Check, Copy, PartyPopper, Share2 } from "lucide-react";
import { confirmWaitlistAction } from "@/app/actions/waitlist";
import { trackEvent } from "@/components/analytics";
import { ButtonLink, buttonStyles } from "@/components/ui";
import { siteConfig } from "@/lib/site-config";
import type { WaitlistStatus } from "@/lib/waitlist/service";

export function ConfirmPanel({
  token,
  initialStatus,
  siteUrl,
}: {
  token: string;
  initialStatus: WaitlistStatus;
  siteUrl: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();

  if (status.state === "invalid" || status.state === "expired") {
    return (
      <div>
        <h1 className="text-h2 font-bold">
          {status.state === "expired" ? "Deze link is verlopen" : "Deze link werkt niet (meer)"}
        </h1>
        <p className="mt-4 text-lead text-fg-muted">
          {status.state === "expired"
            ? "Bevestigingslinks zijn 7 dagen geldig. Meld je opnieuw aan, dan sturen we je een nieuwe."
            : "Misschien heb je je daarna opnieuw aangemeld; dan werkt alleen de link in de nieuwste mail."}
        </p>
        <ButtonLink href="/#wachtlijst" className="mt-8">
          Opnieuw aanmelden
        </ButtonLink>
      </div>
    );
  }

  if (status.state === "pending") {
    return (
      <div>
        <h1 className="text-h2 font-bold">Nog één klik</h1>
        <p className="mt-4 text-lead text-fg-muted">
          Bevestig dat <strong className="text-fg">{status.email}</strong> op de wachtlijst van {siteConfig.name}{" "}
          mag.
        </p>
        <button
          type="button"
          disabled={pending}
          className={`${buttonStyles.primary} mt-8`}
          onClick={() =>
            startTransition(async () => {
              const result = await confirmWaitlistAction(token);
              if (result.state === "confirmed") trackEvent("Wachtlijst bevestigd");
              setStatus(result);
            })
          }
        >
          {pending ? "Even geduld…" : "Bevestig mijn aanmelding"}
        </button>
      </div>
    );
  }

  return <Confirmed status={status} siteUrl={siteUrl} />;
}

function Confirmed({
  status,
  siteUrl,
}: {
  status: Extract<WaitlistStatus, { state: "confirmed" }>;
  siteUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const referralUrl = `${siteUrl.replace(/\/$/, "")}/?ref=${status.referralCode}`;
  const shareText = `Ik sta op de wachtlijst van ${siteConfig.name}: elke week een weekmenu binnen je budget, uit de aanbiedingen van die week. Doe je mee? ${referralUrl}`;

  return (
    <div>
      <PartyPopper aria-hidden="true" className="size-10 text-primary" strokeWidth={1.75} />
      <h1 className="mt-4 text-h2 font-bold">Je staat op de wachtlijst</h1>
      <p className="mt-4 text-lead text-fg-muted">
        Je bent nummer{" "}
        <strong className="font-display text-h3 font-bold tabular-nums text-fg">{status.position}</strong>. We
        mailen je zodra je kunt beginnen.
      </p>

      <section aria-labelledby="delen" className="mt-10 rounded-lg border border-border bg-surface p-5 sm:p-6">
        <h2 id="delen" className="text-h4 font-bold">
          Sneller aan de beurt?
        </h2>
        <p className="mt-2 text-fg-muted">
          Voor elke vriend die zich via jouw link aanmeldt en bevestigt, schuif je {siteConfig.referralBoost}{" "}
          plekken op.
          {status.referrals > 0 && (
            <>
              {" "}
              Via jou meldden zich al <strong className="text-fg">{status.referrals}</strong>{" "}
              {status.referrals === 1 ? "persoon" : "mensen"} aan.
            </>
          )}
        </p>
        <label htmlFor="referral-link" className="mt-5 block text-sm font-semibold">
          Jouw persoonlijke link
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="referral-link"
            readOnly
            value={referralUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="h-12 w-full min-w-0 rounded-md sm:flex-1 border border-border-strong bg-muted px-4 text-base text-fg"
          />
          <button
            type="button"
            className={buttonStyles.secondary}
            onClick={async () => {
              await navigator.clipboard.writeText(referralUrl).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }}
          >
            {copied ? <Check aria-hidden="true" className="size-5" /> : <Copy aria-hidden="true" className="size-5" />}
            {copied ? "Gekopieerd" : "Kopieer"}
          </button>
        </div>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonStyles.quiet} mt-4`}
        >
          <Share2 aria-hidden="true" className="size-4" />
          Deel via WhatsApp
        </a>
        <p aria-live="polite" className="sr-only">
          {copied ? "Link gekopieerd" : ""}
        </p>
      </section>
    </div>
  );
}
