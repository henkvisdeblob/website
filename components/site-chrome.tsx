import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { Container, ButtonLink } from "@/components/ui";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader({ cta = true, current }: { cta?: boolean; current?: "weekmenu" }) {
  return (
    <header className="border-b border-border/70">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label={`${siteConfig.name}, naar de homepage`} className="rounded-md">
          <Logo />
        </Link>
        {cta && (
          <nav aria-label="Hoofdmenu" className="flex items-center gap-3 sm:gap-5">
            {current === "weekmenu" ? (
              <ButtonLink href="/#wachtlijst" variant="secondarySmall">
                Op de wachtlijst
              </ButtonLink>
            ) : (
              <>
                <Link href="/#wachtlijst" className="hidden text-sm font-semibold text-fg underline-offset-4 hover:underline sm:inline">
                  Wachtlijst
                </Link>
                <ButtonLink href="/weekmenu" variant="primarySmall">
                  Weekmenu maken
                </ButtonLink>
              </>
            )}
          </nav>
        )}
      </Container>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-muted">
      <Container className="flex flex-col gap-6 py-10 text-sm text-fg-subtle md:flex-row md:items-start md:justify-between">
        <div className="max-w-prose space-y-2">
          <Logo />
          <p>
            {siteConfig.name} is onafhankelijk en niet verbonden aan Albert Heijn, Jumbo, Lidl of andere
            supermarkten.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2 md:items-end">
          <Link href="/weekmenu" className="underline-offset-4 hover:text-fg hover:underline">
            Weekmenu maken
          </Link>
          <Link href="/#wachtlijst" className="underline-offset-4 hover:text-fg hover:underline">
            Wachtlijst
          </Link>
          <Link href="/privacy" className="underline-offset-4 hover:text-fg hover:underline">
            Privacyverklaring
          </Link>
          {siteConfig.contactEmail && (
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="underline-offset-4 hover:text-fg hover:underline"
            >
              {siteConfig.contactEmail}
            </a>
          )}
          <span>
            © <CopyrightYear /> {siteConfig.name}
          </span>
        </nav>
      </Container>
    </footer>
  );
}

/** The year is captured once at build time (Cache Components requires an explicit choice). */
async function CopyrightYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

/** Layout for small utility pages (confirm, unsubscribe, privacy, 404). */
export function SimplePage({ children, narrow = true }: { children: ReactNode; narrow?: boolean }) {
  return (
    <>
      <SiteHeader cta={false} />
      <main id="inhoud" className="flex-1 py-12 md:py-20">
        <Container className={narrow ? "max-w-2xl" : ""}>{children}</Container>
      </main>
      <SiteFooter />
    </>
  );
}
