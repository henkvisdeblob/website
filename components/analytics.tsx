import Script from "next/script";

/** Plausible (cookieless). Renders nothing unless NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC is set. */
export function Analytics() {
  const src = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC;
  if (!src) return null;
  return (
    <>
      <Script
        src={src}
        data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || undefined}
        strategy="afterInteractive"
      />
      <Script id="plausible-queue" strategy="afterInteractive">
        {`window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}`}
      </Script>
    </>
  );
}

type PlausibleWindow = Window & { plausible?: (event: string, options?: { props?: Record<string, string> }) => void };

/** Sends a custom event to Plausible if it is loaded. Safe to call anywhere on the client. */
export function trackEvent(event: string, props?: Record<string, string>) {
  if (typeof window === "undefined") return;
  (window as PlausibleWindow).plausible?.(event, props ? { props } : undefined);
}
