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
