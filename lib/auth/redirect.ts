/**
 * Only same-site paths are allowed as a redirect target after logging in, so a login link can't
 * send someone to another website ("open redirect").
 */
export function safeNextPath(value: unknown, fallback = "/account/abonnement"): string {
  if (typeof value !== "string" || value.length > 200) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
