import type { Metadata } from "next";
import { Suspense } from "react";
import { SimplePage } from "@/components/site-chrome";
import { siteConfig } from "@/lib/site-config";
import { tokenSchema } from "@/lib/waitlist/schema";
import { getWaitlistStatus, type WaitlistStatus } from "@/lib/waitlist/service";
import { getWaitlistStore } from "@/lib/waitlist/store";
import { ConfirmPanel } from "./confirm-panel";

export const metadata: Metadata = {
  title: "Aanmelding bevestigen",
  robots: { index: false, follow: false },
};

export default function ConfirmPage({ searchParams }: PageProps<"/wachtlijst/bevestigen">) {
  return (
    <SimplePage>
      <Suspense fallback={<p className="text-fg-muted">Even kijken…</p>}>
        <ConfirmContent searchParams={searchParams} />
      </Suspense>
    </SimplePage>
  );
}

async function ConfirmContent({ searchParams }: Pick<PageProps<"/wachtlijst/bevestigen">, "searchParams">) {
  const { token } = await searchParams;
  const value = typeof token === "string" ? token : "";
  const store = getWaitlistStore();
  const status: WaitlistStatus =
    store && tokenSchema.safeParse(value).success
      ? await getWaitlistStatus(value, { store })
      : { state: "invalid" };

  return <ConfirmPanel token={value} initialStatus={status} siteUrl={siteConfig.url} />;
}
