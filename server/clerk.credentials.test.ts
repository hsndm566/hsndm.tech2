import { describe, expect, it } from "vitest";

describe("Clerk credential configuration", () => {
  it("authenticates against Clerk without exposing the secret", async () => {
    const secret = process.env.CLERK_SECRET_KEY;
    expect(secret, "CLERK_SECRET_KEY must be configured for this validation").toBeTruthy();

    const response = await fetch("https://api.clerk.com/v1/instance", {
      headers: { Authorization: `Bearer ${secret}` },
    });

    expect(response.ok).toBe(true);
    const instance = (await response.json()) as { id?: string };
    expect(instance.id).toBeTruthy();
  }, 15_000);
});
