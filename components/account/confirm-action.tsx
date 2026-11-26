"use client";

import { AlertCircle, LoaderCircle } from "lucide-react";
import { useActionState, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { BillingActionState } from "@/app/actions/billing";
import { buttonStyles } from "@/components/ui";

/**
 * A button that asks once for confirmation before it runs a server action: two clicks in total,
 * as required for cancelling (docs/04 US-8.2). The confirmation is plain and neutral: no guilt-tripping.
 */
export function ConfirmAction({
  action,
  label,
  title,
  body,
  confirmLabel,
  variant = "secondary",
}: {
  action: (prev: BillingActionState) => Promise<BillingActionState>;
  label: string;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<BillingActionState, FormData>(action, { status: "idle" });
  const titleId = useId();
  const titleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (open) titleRef.current?.focus();
  }, [open]);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonStyles[variant]}>
        {label}
      </button>
    );
  }

  return (
    <div role="group" aria-labelledby={titleId} className="w-full rounded-lg border border-border-strong bg-surface p-4 sm:p-5">
      <p id={titleId} ref={titleRef} tabIndex={-1} className="font-semibold text-fg">
        {title}
      </p>
      <div className="mt-1 text-sm text-fg-muted">{body}</div>
      <form action={formAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={pending} className={buttonStyles.primary}>
          {pending && <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />}
          {confirmLabel}
        </button>
        <button type="button" onClick={() => setOpen(false)} disabled={pending} className={buttonStyles.secondary}>
          Nee, terug
        </button>
      </form>
      {state.status === "error" && (
        <p role="alert" className="mt-3 flex items-start gap-1.5 text-sm font-medium text-error">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      )}
    </div>
  );
}
