import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@/components/analytics";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const display = localFont({
  src: "./fonts/BricolageGrotesque-latin-opsz.woff2",
  variable: "--font-heading",
  weight: "200 800",
  display: "swap",
});

const body = localFont({
  src: "./fonts/Figtree-latin-wght.woff2",
  variable: "--font-body",
  weight: "300 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF7F1" },
    { media: "(prefers-color-scheme: dark)", color: "#16120F" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#inhoud"
          className="sr-only rounded-md bg-surface px-4 py-2 font-semibold text-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
        >
          Naar de inhoud
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
