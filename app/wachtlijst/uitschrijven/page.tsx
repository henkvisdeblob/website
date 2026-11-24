import type { Metadata } from "next";
import { Suspense } from "react";
import { SimplePage } from "@/components/site-chrome";
import { LeavePanel } from "./leave-panel";

export const metadata: Metadata = {
  title: "Uitschrijven",
  robots: { index: false, follow: false },
};

export default function LeavePage({ searchParams }: PageProps<"/wachtlijst/uitschrijven">) {
  return (
    <SimplePage>
      <Suspense fallback={<p className="text-fg-muted">Even kijken…</p>}>
        <LeaveContent searchParams={searchParams} />
      </Suspense>
    </SimplePage>
  );
}

async function LeaveContent({ searchParams }: Pick<PageProps<"/wachtlijst/uitschrijven">, "searchParams">) {
  const { token } = await searchParams;
  return <LeavePanel token={typeof token === "string" ? token : ""} />;
}
