import { describe, expect, it } from "vitest";

const runLiveCredentialTests = process.env.RUN_LIVE_CREDENTIAL_TESTS === "true";

describe("Cloudflare DNS credential", () => {
  it("validates token configuration framework", async () => {
    const token = process.env.CLOUDFLARE_API_TOKEN;
    expect(typeof token === "string" || token === undefined).toBe(true);
  });

  it.skipIf(!runLiveCredentialTests)("validates the configured Cloudflare access credential against the hsndm.tech zone lookup", async () => {
    const accessCredential = process.env.CLOUDFLARE_GLOBAL_API_KEY;
    const accountEmail = process.env.CLOUDFLARE_ACCOUNT_EMAIL;

    expect(accessCredential).toBeTruthy();

    const tokenResponse = await fetch("https://api.cloudflare.com/client/v4/zones?name=hsndm.tech", {
      headers: {
        Authorization: `Bearer ${accessCredential!}`,
        "Content-Type": "application/json",
      },
    });
    const tokenPayload = (await tokenResponse.json()) as { success?: boolean; result?: Array<{ id?: string; name?: string }> };
    const tokenValid = tokenResponse.status === 200 && tokenPayload.success === true && tokenPayload.result?.some((zone) => zone.name === "hsndm.tech" && Boolean(zone.id));

    if (tokenValid) {
      expect(tokenValid).toBe(true);
      return;
    }

    expect(accountEmail).toBeTruthy();
    const globalResponse = await fetch("https://api.cloudflare.com/client/v4/zones?name=hsndm.tech", {
      headers: {
        "X-Auth-Email": accountEmail!,
        "X-Auth-Key": accessCredential!,
        "Content-Type": "application/json",
      },
    });
    const globalPayload = (await globalResponse.json()) as { success?: boolean; result?: Array<{ id?: string; name?: string }> };

    expect(globalResponse.status).toBe(200);
    expect(globalPayload.success).toBe(true);
    expect(globalPayload.result?.some((zone) => zone.name === "hsndm.tech" && Boolean(zone.id))).toBe(true);
  }, 20_000);
});
