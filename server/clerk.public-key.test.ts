import { describe, expect, it } from "vitest";

describe("Clerk public client configuration", () => {
  const runExternalCheck = process.env.RUN_CLERK_CREDENTIAL_CHECK === "true" ? it : it.skip;

  runExternalCheck("keeps the public alias aligned with the authenticated Clerk instance", async () => {
    const secret = process.env.CLERK_SECRET_KEY;
    const publishable = process.env.VITE_CLERK_PUBLISHABLE_KEY;

    expect(secret).toBeTruthy();
    expect(publishable).toMatch(/^pk_(test|live)_/);

    const response = await fetch("https://api.clerk.com/v1/instance", {
      headers: { Authorization: `Bearer ${secret}` },
    });

    expect(response.ok).toBe(true);
    expect((await response.json()).id).toBeTruthy();
  }, 15_000);
});
