import { describe, expect, it } from "vitest";

const token = process.env.CLOUDFLARE_API_TOKEN;

describe.skipIf(!token)("Cloudflare DNS credential", () => {
  it("validates the active token with Cloudflare", async () => {
    const response = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const body = await response.json() as { success?: boolean };

    expect(response.ok).toBe(true);
    expect(body.success).toBe(true);
  });
});
