"use client";

import { useState, useTransition } from "react";
import { leaveWaitlistAction } from "@/app/actions/waitlist";
import { ButtonLink, buttonStyles } from "@/components/ui";

export function LeavePanel({ token }: { token: string }) {
  const [result, setResult] = useState<"idle" | "done" | "failed">("idle");
  const [pending, startTransition] = useTransition();

  if (result === "done") {
    return (
      <div role="status">
        <h1 className="text-h2 font-bold">Je bent uitgeschreven</h1>
        <p className="mt-4 text-lead text-fg-muted">
          We hebben je e-mailadres en de rest van je wachtlijstgegevens verwijderd. Je hoort niets meer van ons.
        </p>
        <ButtonLink href="/" variant="secondary" className="mt-8">
          Naar de homepage
        </ButtonLink>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-h2 font-bold">Uitschrijven van de wachtlijst</h1>
      <p className="mt-4 text-lead text-fg-muted">
        Hiermee verwijder je je e-mailadres en alle andere gegevens die je bij de wachtlijst hebt ingevuld. Dat kun
        je niet ongedaan maken.
      </p>
      {result === "failed" && (
        <p role="alert" className="mt-6 rounded-md bg-error-soft px-4 py-3 font-medium text-error">
          Deze link werkt niet (meer). Misschien ben je al uitgeschreven, of heb je je daarna opnieuw aangemeld; gebruik
          dan de link uit de nieuwste mail.
        </p>
      )}
      <button
        type="button"
        disabled={pending || !token}
        className={`${buttonStyles.primary} mt-8`}
        onClick={() =>
          startTransition(async () => {
            const { ok } = await leaveWaitlistAction(token);
            setResult(ok ? "done" : "failed");
          })
        }
      >
        {pending ? "Even geduld…" : "Verwijder mijn gegevens"}
      </button>
    </div>
  );
}
