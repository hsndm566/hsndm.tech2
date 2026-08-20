import { describe, expect, it } from "vitest";

const verifyCredential = process.env.RUN_BREVO_CREDENTIAL_CHECK === "true";

describe("Brevo monitor credential", () => {
  it.skipIf(!verifyCredential)("accepts the configured API key without sending email", async () => {
    const apiKey = process.env.BREVO_API_KEY;
    expect(apiKey).toBeTruthy();

    const response = await fetch("https://api.brevo.com/v3/account", {
      headers: { accept: "application/json", "api-key": apiKey! },
      signal: AbortSignal.timeout(15_000),
    });

    expect(response.status).toBe(200);
  }, 20_000);
});
