"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useState } from "react";
import { AlertCircle, ArrowRight, MailCheck } from "lucide-react";
import { joinWaitlistAction, type JoinState } from "@/app/actions/waitlist";
import { trackEvent } from "@/components/analytics";
import { buttonStyles } from "@/components/ui";
import { SUPERMARKETS } from "@/lib/site-config";

const initialState: JoinState = { status: "idle" };

type Props = {
  /** "compact": email only. "full": email plus optional research questions. */
  variant?: "compact" | "full";
  /** Used for analytics, to see which form converts. */
  location: string;
  submitLabel?: string;
};

export function WaitlistForm({ variant = "compact", location, submitLabel = "Zet me op de wachtlijst" }: Props) {
  const [state, formAction, pending] = useActionState(joinWaitlistAction, initialState);
  const [tracking, setTracking] = useState({ ref: "", utmSource: "" });
  const id = useId();
  const emailId = `${id}-email`;
  const errorId = `${id}-error`;
  const noteId = `${id}-note`;

  // Pick up ?ref= (referral) and ?utm_source= from the URL the visitor arrived with.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL after hydration
    setTracking({ ref: params.get("ref") ?? "", utmSource: params.get("utm_source") ?? "" });
  }, []);

  useEffect(() => {
    if (state.status === "success") trackEvent("Wachtlijst aanmelding", { plek: location });
  }, [state, location]);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <MailCheck aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-savings" strokeWidth={1.75} />
          <div>
            <p className="font-display text-h4 font-bold">Check je mail</p>
            <p className="mt-1 text-fg-muted">
              We hebben een bevestigingslink gestuurd naar <strong className="text-fg">{state.email}</strong>. Klik
              erop om je plek op de wachtlijst vast te leggen.
            </p>
            <p className="mt-2 text-sm text-fg-subtle">Niets ontvangen? Kijk ook even in je spam of ongewenste mail.</p>
          </div>
        </div>
      </div>
    );
  }

  const emailError = state.status === "error" && state.field === "email";
  const generalError = state.status === "error" && !state.field;

  return (
    <form action={formAction} noValidate className="w-full">
      <input type="hidden" name="ref" value={tracking.ref} />
      <input type="hidden" name="utmSource" value={tracking.utmSource} />
      {/* Honeypot: hidden from people and screen readers, bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <label htmlFor={emailId} className="mb-2 block text-sm font-semibold text-fg">
        Je e-mailadres
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="naam@voorbeeld.nl"
          aria-invalid={emailError || undefined}
          aria-describedby={`${emailError ? errorId : ""} ${noteId}`.trim()}
          className={`h-12 w-full min-w-0 flex-1 rounded-md border bg-surface px-4 text-base text-fg placeholder:text-fg-subtle ${
            emailError ? "border-error" : "border-border-strong"
          }`}
        />
        {variant === "compact" && (
          <button type="submit" disabled={pending} className={`${buttonStyles.primary} shrink-0`}>
            {pending ? "Even geduld…" : submitLabel}
            {!pending && <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />}
          </button>
        )}
      </div>

      {(emailError || generalError) && (
        <p id={errorId} role="alert" className="mt-2 flex items-start gap-1.5 text-sm font-medium text-error">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {state.status === "error" && state.message}
        </p>
      )}

      {variant === "full" && (
        <>
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-fg">
              Waar doe je meestal boodschappen? <span className="font-normal text-fg-subtle">(optioneel)</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUPERMARKETS.map((s) => (
                <label
                  key={s.id}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-strong bg-surface px-3.5 py-2 text-sm font-medium text-fg has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-on-primary-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary"
                >
                  <input type="checkbox" name="stores" value={s.id} className="sr-only" />
                  {s.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-5">
            <label htmlFor={`${id}-household`} className="text-sm font-semibold text-fg">
              Voor hoeveel mensen kook je? <span className="font-normal text-fg-subtle">(optioneel)</span>
            </label>
            <select
              id={`${id}-household`}
              name="householdSize"
              defaultValue=""
              className="mt-2 block h-12 w-full rounded-md border border-border-strong bg-surface px-4 text-base text-fg sm:w-56"
            >
              <option value="">Kies…</option>
              <option value="1">1 persoon</option>
              <option value="2">2 personen</option>
              <option value="3">3 personen</option>
              <option value="4">4 personen</option>
              <option value="5">5 personen</option>
              <option value="6">6 of meer</option>
            </select>
          </div>

          <button type="submit" disabled={pending} className={`${buttonStyles.primary} mt-6 w-full sm:w-auto`}>
            {pending ? "Even geduld…" : submitLabel}
            {!pending && <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />}
          </button>
        </>
      )}

      <p id={noteId} className="mt-3 text-sm text-fg-subtle">
        Gratis en vrijblijvend. Je krijgt één mail om te bevestigen en daarna alleen bericht als je kunt beginnen.{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-fg">
          Zo gaan we om met je gegevens
        </Link>
      </p>
    </form>
  );
}
