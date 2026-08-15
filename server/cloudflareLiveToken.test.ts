import { describe, expect, it } from "vitest";

const token = process.env.CLOUDFLARE_API_TOKEN;
const runLiveCredentialTest = process.env.RUN_LIVE_CREDENTIAL_TESTS === "true";

describe("Cloudflare DNS credential", () => {
  const verify = token && runLiveCredentialTest ? it : it.skip;

  verify("is accepted by Cloudflare before DNS changes", async () => {
    const response = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status).toBe(200);

    const payload = (await response.json()) as { success?: boolean };
    expect(payload.success).toBe(true);
  }, 20_000);
});
