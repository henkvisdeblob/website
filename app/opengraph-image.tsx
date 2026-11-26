import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Potje — elke week een weekmenu binnen je budget, uit de aanbiedingen van deze week";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Colors mirror the light-mode tokens in app/globals.css (CSS variables don't exist in this renderer).
const BG = "#FBF7F1";
const FG = "#1E1914";
const MUTED = "#5C5148";
const PRIMARY = "#B83C0B";
const SAVINGS = "#1F7A45";
const SAVINGS_SOFT = "#E2F3E8";

export default async function OpengraphImage() {
  const display = await readFile(join(process.cwd(), "app/fonts/BricolageGrotesque-latin-800.woff"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: BG, padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 14, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h20" />
              <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
              <path d="m4 8 16-4" />
              <path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8" />
            </svg>
          </div>
          <span style={{ fontFamily: "Bricolage", fontSize: 44, color: FG }}>Potje</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: "Bricolage", fontSize: 76, lineHeight: 1.02, color: FG, letterSpacing: -1.5 }}>
            Elke week een weekmenu binnen je budget.
          </span>
          <span style={{ marginTop: 24, fontSize: 32, color: MUTED }}>Uit de aanbiedingen van Albert Heijn, Jumbo en Lidl.</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {["Gratis", "Zonder account", "Met boodschappenlijst"].map((t) => (
            <span key={t} style={{ fontSize: 26, color: SAVINGS, background: SAVINGS_SOFT, padding: "10px 20px", borderRadius: 999 }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Bricolage", data: display, style: "normal", weight: 800 }] },
  );
}
