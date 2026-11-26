import { siteConfig } from "@/lib/site-config";
import type { Email } from "./mailer";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function layout(params: { preheader: string; bodyHtml: string; footerHtml: string }) {
  // Inline styles only: email clients ignore <style> blocks and CSS variables.
  return `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(siteConfig.name)}</title></head>
<body style="margin:0;background:#FBF7F1;font-family:Helvetica,Arial,sans-serif;color:#1E1914;">
<span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(params.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF7F1;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border:1px solid #E5DBCD;border-radius:16px;">
<tr><td style="padding:32px 28px 8px 28px;font-size:22px;font-weight:800;letter-spacing:-0.3px;">${escapeHtml(siteConfig.name)}</td></tr>
<tr><td style="padding:8px 28px 28px 28px;font-size:16px;line-height:1.6;">${params.bodyHtml}</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="padding:16px 28px;font-size:13px;line-height:1.5;color:#6F6358;">${params.footerHtml}</td></tr>
</table>
</td></tr></table></body></html>`;
}

function button(href: string, label: string) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#B83C0B;color:#FFFFFF;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:10px;">${escapeHtml(label)}</a>`;
}

export function confirmationEmail(params: { to: string; confirmUrl: string; leaveUrl: string }): Email {
  const { to, confirmUrl, leaveUrl } = params;
  const html = layout({
    preheader: "Nog één klik en je staat op de wachtlijst.",
    bodyHtml: `
<p style="margin:0 0 16px 0;">Leuk dat je Potje wilt proberen! Bevestig je aanmelding, dan laten we je weten zodra je kunt beginnen.</p>
<p style="margin:0 0 24px 0;">${button(confirmUrl, "Bevestig mijn aanmelding")}</p>
<p style="margin:0;font-size:14px;color:#5C5148;">Werkt de knop niet? Kopieer deze link in je browser:<br><a href="${escapeHtml(confirmUrl)}" style="color:#B83C0B;word-break:break-all;">${escapeHtml(confirmUrl)}</a></p>`,
    footerHtml: `Je krijgt deze mail omdat ${escapeHtml(to)} is aangemeld voor de wachtlijst van ${escapeHtml(siteConfig.name)}. Was jij dit niet? Dan hoef je niets te doen: zonder bevestiging sturen we je niets meer. <a href="${escapeHtml(leaveUrl)}" style="color:#6F6358;">Gegevens direct verwijderen</a>.`,
  });
  const text = `Leuk dat je ${siteConfig.name} wilt proberen!

Bevestig je aanmelding via deze link:
${confirmUrl}

Was jij dit niet? Dan hoef je niets te doen: zonder bevestiging sturen we je niets meer.
Gegevens direct verwijderen: ${leaveUrl}`;
  return { to, subject: `Bevestig je plek op de wachtlijst van ${siteConfig.name}`, html, text };
}

export function alreadyConfirmedEmail(params: { to: string; statusUrl: string; leaveUrl: string }): Email {
  const { to, statusUrl, leaveUrl } = params;
  const html = layout({
    preheader: "Je stond al op de wachtlijst.",
    bodyHtml: `
<p style="margin:0 0 16px 0;">Goed nieuws: je staat al op de wachtlijst van ${escapeHtml(siteConfig.name)}. Je hoeft niets meer te doen.</p>
<p style="margin:0 0 24px 0;">${button(statusUrl, "Bekijk mijn plek")}</p>`,
    footerHtml: `Je krijgt deze mail omdat iemand ${escapeHtml(to)} opnieuw aanmeldde voor de wachtlijst. <a href="${escapeHtml(leaveUrl)}" style="color:#6F6358;">Uitschrijven en gegevens verwijderen</a>.`,
  });
  const text = `Je staat al op de wachtlijst van ${siteConfig.name}. Je hoeft niets meer te doen.

Bekijk je plek: ${statusUrl}

Uitschrijven en gegevens verwijderen: ${leaveUrl}`;
  return { to, subject: `Je staat al op de wachtlijst van ${siteConfig.name}`, html, text };
}

/* ------------------------------------------------------------------------------------------ */
/* Premium subscription (docs/04 E8). Amounts and dates arrive formatted.                      */
/* ------------------------------------------------------------------------------------------ */

function billingEmail(params: {
  to: string;
  subject: string;
  preheader: string;
  paragraphs: string[];
  action?: { url: string; label: string };
}): Email {
  const { to, subject, preheader, paragraphs, action } = params;
  const html = layout({
    preheader,
    bodyHtml:
      paragraphs.map((p) => `<p style="margin:0 0 16px 0;">${escapeHtml(p)}</p>`).join("") +
      (action ? `<p style="margin:8px 0 0 0;">${button(action.url, action.label)}</p>` : ""),
    footerHtml: `Je krijgt deze mail omdat ${escapeHtml(to)} een account heeft bij ${escapeHtml(siteConfig.name)}. Dit is een mail over je abonnement; die sturen we ook als je de wekelijkse mail hebt uitgezet.`,
  });
  const text = [...paragraphs, ...(action ? [`${action.label}: ${action.url}`] : [])].join("\n\n");
  return { to, subject, html, text };
}

export function premiumStartedEmail(params: {
  to: string;
  interval: "month" | "year";
  manageUrl: string;
  termsUrl: string;
}): Email {
  const period = params.interval === "month" ? "elke maand" : "elk jaar";
  return billingEmail({
    to: params.to,
    subject: `Je Premium-abonnement bij ${siteConfig.name} is gestart`,
    preheader: "Bedankt! Je Premium staat aan.",
    paragraphs: [
      `Bedankt voor je abonnement! Je Premium staat aan en wordt ${period} automatisch verlengd.`,
      "Opzeggen kan altijd via je account, in twee klikken. Binnen 14 dagen kun je de overeenkomst ook herroepen: dan krijg je het hele bedrag terug.",
      `De voorwaarden lees en bewaar je hier: ${params.termsUrl}`,
    ],
    action: { url: params.manageUrl, label: "Abonnement beheren" },
  });
}

export function cancellationScheduledEmail(params: { to: string; endsOn: string; manageUrl: string }): Email {
  return billingEmail({
    to: params.to,
    subject: `Je abonnement bij ${siteConfig.name} is opgezegd`,
    preheader: `Premium loopt nog tot en met ${params.endsOn}.`,
    paragraphs: [
      "We hebben je opzegging ontvangen. Je hoeft verder niets te doen.",
      `Je houdt Premium tot en met ${params.endsOn}. Daarna gaat je account over naar Gratis en betaal je niets meer. Je gegevens blijven bewaard.`,
      "Bedacht? Tot die datum kun je de opzegging in je account weer intrekken.",
    ],
    action: { url: params.manageUrl, label: "Naar mijn abonnement" },
  });
}

export function paymentFailedEmail(params: { to: string; manageUrl: string }): Email {
  return billingEmail({
    to: params.to,
    subject: `Je betaling voor ${siteConfig.name} is niet gelukt`,
    preheader: "Geen zorgen: je Premium loopt nog even door.",
    paragraphs: [
      "De laatste betaling voor je Premium-abonnement is niet gelukt. Dat kan gebeuren, bijvoorbeeld als een pas is verlopen.",
      "We proberen het de komende dagen automatisch opnieuw en je Premium loopt zolang door. Wil je zeker zijn? Controleer dan je betaalmethode.",
    ],
    action: { url: params.manageUrl, label: "Betaalmethode controleren" },
  });
}

export function withdrawalConfirmedEmail(params: { to: string; refunded: string | null }): Email {
  return billingEmail({
    to: params.to,
    subject: `Je hebt je abonnement bij ${siteConfig.name} herroepen`,
    preheader: "Je herroeping is verwerkt.",
    paragraphs: [
      "Je hebt je Premium-abonnement herroepen. Het abonnement is direct gestopt en er wordt niets meer afgeschreven.",
      params.refunded
        ? `We betalen ${params.refunded} terug. Dat staat meestal binnen 5 tot 10 werkdagen op je rekening.`
        : "Er was nog niets betaald, dus er hoeft ook niets terug.",
      "Je account blijft bestaan, met het Gratis plan.",
    ],
  });
}
