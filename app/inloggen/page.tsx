import { AlertCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/account/login-form";
import { SimplePage } from "@/components/site-chrome";
import { ButtonLink } from "@/components/ui";
import { safeNextPath } from "@/lib/auth/redirect";
import { accountsEnabled } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Inloggen",
  description: "Log in met een link in je mail, zonder wachtwoord.",
  robots: { index: false, follow: true },
};

export default function LoginPage({ searchParams }: PageProps<"/inloggen">) {
  if (!accountsEnabled()) {
    return (
      <SimplePage>
        <h1 className="text-h1 font-bold">Accounts komen binnenkort</h1>
        <p className="mt-4 text-lead text-fg-muted">
          Een weekmenu maken kan nu al, zonder account. Wil je bericht als je een account kunt maken? Zet je dan op de
          wachtlijst.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/weekmenu">Maak gratis je weekmenu</ButtonLink>
          <ButtonLink href="/#wachtlijst" variant="secondary">
            Op de wachtlijst
          </ButtonLink>
        </div>
      </SimplePage>
    );
  }

  return (
    <SimplePage>
      <h1 className="text-h1 font-bold">Inloggen of account maken</h1>
      <p className="mt-4 text-lead text-fg-muted">
        Vul je e-mailadres in. Je krijgt een link waarmee je meteen bent ingelogd, zonder wachtwoord. Nieuw hier? Dan
        maken we direct je account, met 14 dagen Premium gratis. Je hoeft geen betaalgegevens in te vullen.
      </p>
      <div className="mt-8">
        <Suspense fallback={<LoginForm next="/account/abonnement" />}>
          <LoginContent searchParams={searchParams} />
        </Suspense>
      </div>
      <p className="mt-6 text-sm text-fg-subtle">
        Een account is voor mensen van 16 jaar en ouder. Lees hoe we omgaan met je gegevens in de{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-fg">
          privacyverklaring
        </Link>
        .
      </p>
    </SimplePage>
  );
}

async function LoginContent({ searchParams }: Pick<PageProps<"/inloggen">, "searchParams">) {
  const { next, fout } = await searchParams;
  return (
    <>
      {fout === "link" && (
        <p role="alert" className="mb-6 flex items-start gap-2 rounded-md bg-warning-soft p-4 text-sm text-fg">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
          Deze inloglink werkt niet (meer). Een link is een uur geldig en werkt één keer. Vraag hieronder een nieuwe aan.
        </p>
      )}
      <LoginForm next={safeNextPath(next)} />
    </>
  );
}
