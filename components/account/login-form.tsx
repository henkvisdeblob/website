"use client";

import { AlertCircle, ArrowRight, LoaderCircle, MailCheck } from "lucide-react";
import { useActionState, useId } from "react";
import { requestLoginLinkAction, type LoginState } from "@/app/actions/auth";
import { buttonStyles } from "@/components/ui";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(requestLoginLinkAction, { status: "idle" });
  const emailId = useId();
  const errorId = `${emailId}-error`;

  if (state.status === "sent") {
    return (
      <div role="status" className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <MailCheck aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-savings" strokeWidth={1.75} />
          <div>
            <p className="font-display text-h4 font-bold">Check je mail</p>
            <p className="mt-1 text-fg-muted">
              We hebben een inloglink gestuurd naar <strong className="text-fg">{state.email}</strong>. De link werkt één
              keer en is een uur geldig.
            </p>
            <p className="mt-2 text-sm text-fg-subtle">Niets ontvangen? Kijk ook even in je spam of ongewenste mail.</p>
          </div>
        </div>
      </div>
    );
  }

  const fieldError = state.status === "error" && state.field === "email";
  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="next" value={next} />
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
          aria-invalid={fieldError || undefined}
          aria-describedby={state.status === "error" ? errorId : undefined}
          className={`h-12 w-full min-w-0 rounded-md border bg-surface px-4 text-base text-fg placeholder:text-fg-subtle sm:flex-1 ${
            fieldError ? "border-error" : "border-border-strong"
          }`}
        />
        <button type="submit" disabled={pending} className={`${buttonStyles.primary} shrink-0`}>
          {pending ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : null}
          Stuur mij een inloglink
          {!pending && <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />}
        </button>
      </div>
      {state.status === "error" && (
        <p id={errorId} role="alert" className="mt-2 flex items-start gap-1.5 text-sm font-medium text-error">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      )}
    </form>
  );
}
