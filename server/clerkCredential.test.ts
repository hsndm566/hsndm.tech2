import { describe, expect, it } from "vitest";

const verifyCredential = process.env.RUN_CLERK_CREDENTIAL_CHECK === "true";

describe("Clerk production credential", () => {
  it.skipIf(!verifyCredential)("authorizes a read-only instance request", async () => {
    const secretKey = process.env.CLERK_SECRET_KEY;
    expect(secretKey).toMatch(/^sk_live_/);
    const response = await fetch("https://api.clerk.com/v1/instance", {
      headers: { Authorization: `Bearer ${secretKey}` },
      signal: AbortSignal.timeout(15_000),
    });
    expect(response.status).toBe(200);
    const instance = (await response.json()) as Record<string, unknown>;
    console.info("Clerk instance response fields:", Object.keys(instance).sort().join(", "));
    console.info("Clerk allowed origins:", JSON.stringify(instance.allowed_origins));
    expect(instance).toHaveProperty("id");

    const options = await fetch("https://api.clerk.com/v1/instance", {
      method: "OPTIONS",
      headers: { Authorization: `Bearer ${secretKey}` },
      signal: AbortSignal.timeout(15_000),
    });
    console.info("Clerk instance allowed methods:", options.headers.get("allow") || "not-advertised");
    expect(options.status).toBeLessThan(500);

    const bootstrap = "https://clerk.hsndm.tech/v1/environment?__clerk_api_version=2025-11-10&__clerk_js_version=5.127.2";
    const originStatuses = await Promise.all(
      ["https://hsndm.tech", "https://www.hsndm.tech", "https://dashboard.hsndm.tech"].map(async origin => {
        const result = await fetch(bootstrap, {
          headers: { Accept: "application/json", Origin: origin, Referer: `${origin}/dashboard` },
          signal: AbortSignal.timeout(15_000),
        });
        return [origin, result.status] as const;
      })
    );
    console.info("Clerk FAPI origin statuses:", JSON.stringify(originStatuses));
    expect(originStatuses).toContainEqual(["https://www.hsndm.tech", 403]);
  }, 20_000);
});
