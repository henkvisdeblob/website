/**
 * Checks the live deal source with the same code the site uses: whether the PrijsProfeet key is
 * accepted, and how many of this week's deals per store can be used in recipes. Never prints the key.
 *
 * Usage: npm run check:deals
 * Reads PRIJSPROFEET_API_KEY from the environment or .env.local. Behind an HTTPS proxy, set
 * NODE_USE_ENV_PROXY=1. Exits with code 1 when the key is rejected or a store returns no usable deals.
 * (The npm script passes --conditions=react-server so the server-only modules load outside Next.)
 */
import { INGREDIENTS } from "@/lib/catalog/ingredients";
import { STORES } from "@/lib/catalog/stores";
import { isWithin, todayInAmsterdam } from "@/lib/dates";
import { buildOffers } from "@/lib/deals/offers";
import { PrijsProfeetSource } from "@/lib/deals/prijsprofeet";

async function main() {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // No .env.local: use the environment as it is.
  }

  const today = todayInAmsterdam(new Date());
  const source = new PrijsProfeetSource();
  let problems = 0;

  console.log(`PrijsProfeet check, ${today}\n`);

  const key = await source.keyStatus();
  switch (key.kind) {
    case "none":
      console.log("Key    none set: running keyless (lower limits, shared per IP address)");
      break;
    case "valid":
      console.log(`Key    OK: plan "${key.plan}", limit ${key.rateLimit}`);
      break;
    case "rejected":
      problems++;
      console.log(`Key    REJECTED (${key.httpStatus}${key.detail ? `: ${key.detail}` : ""})`);
      console.log("       Deals still load, but keyless. Check the key at https://www.prijsprofeet.nl/api-account/");
      break;
    case "error":
      problems++;
      console.log(`Key    could not be checked: PrijsProfeet answered ${key.httpStatus}. Try again later.`);
      break;
  }
  console.log("");

  for (const store of STORES) {
    const started = performance.now();
    try {
      const deals = await source.fetchDeals(store.id);
      const offers = buildOffers(deals, INGREDIENTS);
      const validToday = offers.filter((o) => isWithin(today, o.validFrom, o.validUntil)).length;
      const seconds = ((performance.now() - started) / 1000).toFixed(1);
      const ok = validToday > 0;
      if (!ok) problems++;
      console.log(
        `${(ok ? "OK" : "EMPTY").padEnd(6)} ${store.name}: ${deals.length} deals, ${offers.length} usable in recipes, ` +
          `${validToday} valid today (${seconds}s)`,
      );
    } catch (error) {
      problems++;
      const message = error instanceof Error ? error.message : String(error);
      console.log(`${"ERROR".padEnd(6)} ${store.name}: ${message}`);
      if (/PrijsProfeet 429/.test(message)) console.log("       Rate limit reached: wait a minute and try again.");
      if (/fetch failed/.test(message)) console.log("       No connection. Behind a proxy? Set NODE_USE_ENV_PROXY=1.");
    }
  }

  console.log(problems === 0 ? "\nAll good." : `\n${problems} problem(s), see above.`);
  process.exitCode = problems === 0 ? 0 : 1;
}

void main();
