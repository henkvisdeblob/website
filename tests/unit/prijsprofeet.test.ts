import { afterEach, describe, expect, it, vi } from "vitest";
import { PrijsProfeetSource } from "@/lib/deals/prijsprofeet";

type Call = { url: string; headers: Record<string, string> };

/** A fake fetch that records calls and answers every request with the same response. */
function fakeFetch(respond: (url: string) => Response) {
  const calls: Call[] = [];
  const impl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, headers: (init?.headers ?? {}) as Record<string, string> });
    return respond(url);
  }) as typeof fetch;
  return { impl, calls };
}

const emptyPage = (headers: Record<string, string> = {}) =>
  new Response(JSON.stringify({ total: 0, page: 1, page_size: 100, results: [] }), {
    status: 200,
    headers: { "content-type": "application/json", ...headers },
  });

afterEach(() => vi.restoreAllMocks());

describe("PrijsProfeetSource", () => {
  it("sends the key as X-API-Key only when one is set", async () => {
    const withKey = fakeFetch(() => emptyPage());
    await new PrijsProfeetSource("secret-test-key", withKey.impl).fetchDeals("ah");
    expect(withKey.calls.length).toBeGreaterThan(0);
    expect(withKey.calls.every((c) => c.headers["x-api-key"] === "secret-test-key")).toBe(true);

    const without = fakeFetch(() => emptyPage());
    await new PrijsProfeetSource(undefined, without.impl).fetchDeals("ah");
    expect(without.calls.every((c) => !("x-api-key" in c.headers))).toBe(true);
  });

  it("logs a notice from PrijsProfeet once, however many requests carry it", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { impl, calls } = fakeFetch(() => emptyPage({ "x-prijsprofeet-notice": "Invalid API key (unknown or revoked)" }));
    await new PrijsProfeetSource("wrong-key", impl).fetchDeals("ah");
    expect(calls.length).toBeGreaterThan(1);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("Invalid API key");
  });

  it("logs nothing when there is no notice", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { impl } = fakeFetch(() => emptyPage());
    await new PrijsProfeetSource("good-key", impl).fetchDeals("ah");
    expect(warn).not.toHaveBeenCalled();
  });

  describe("keyStatus", () => {
    it("is 'none' without a key and makes no request", async () => {
      const { impl, calls } = fakeFetch(() => emptyPage());
      expect(await new PrijsProfeetSource(undefined, impl).keyStatus()).toEqual({ kind: "none" });
      expect(calls).toHaveLength(0);
    });

    it("reports the plan for an accepted key", async () => {
      const { impl, calls } = fakeFetch(
        () => new Response(JSON.stringify({ plan: "free", rate_limit: "150/minute" }), { status: 200 }),
      );
      expect(await new PrijsProfeetSource("good-key", impl).keyStatus()).toEqual({
        kind: "valid",
        plan: "free",
        rateLimit: "150/minute",
      });
      expect(calls[0].url).toMatch(/\/partner\/usage$/);
      expect(calls[0].headers["x-api-key"]).toBe("good-key");
    });

    it("reports a rejected key with the API's reason", async () => {
      const { impl } = fakeFetch(
        () => new Response(JSON.stringify({ error: "Forbidden", detail: "Invalid API key" }), { status: 403 }),
      );
      expect(await new PrijsProfeetSource("wrong-key", impl).keyStatus()).toEqual({
        kind: "rejected",
        httpStatus: 403,
        detail: "Invalid API key",
      });
    });

    it("reports other failures as an error", async () => {
      const { impl } = fakeFetch(() => new Response("down", { status: 503 }));
      expect(await new PrijsProfeetSource("good-key", impl).keyStatus()).toEqual({ kind: "error", httpStatus: 503 });
    });
  });
});
