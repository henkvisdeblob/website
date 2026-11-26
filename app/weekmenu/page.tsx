import type { Metadata } from "next";
import { Suspense } from "react";
import { TopDeals } from "@/components/deals/top-deals";
import { EmptyState, WeekPlanner } from "@/components/planner/week-planner";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Weekmenu uit de aanbiedingen van deze week",
  description:
    "Maak gratis een weekmenu met boodschappenlijst uit de aanbiedingen van deze week bij Albert Heijn, Jumbo of Lidl, binnen je eigen budget.",
  alternates: { canonical: "/weekmenu" },
};

export default function WeekmenuPage() {
  return (
    <>
      <SiteHeader current="weekmenu" />
      <main id="inhoud" className="flex-1 py-10 md:py-14">
        <Container>
          <h1 className="text-h2 font-bold">Je weekmenu uit de aanbiedingen van deze week</h1>
          <p className="mt-3 max-w-prose text-lead text-fg-muted">
            Kies je supermarkt, je huishouden en je budget. Potje zoekt de aanbiedingen van deze week erbij en maakt een menu met
            boodschappenlijst.
          </p>
          <div className="mt-8">
            <WeekPlanner
              emptyState={
                <EmptyState>
                  <Suspense fallback={<p className="text-sm text-fg-subtle">Aanbiedingen laden…</p>}>
                    <TopDeals compact />
                  </Suspense>
                </EmptyState>
              }
            />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
