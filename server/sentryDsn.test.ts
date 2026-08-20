import { describe, expect, it } from "vitest";

const verifyDsn = process.env.RUN_SENTRY_DSN_CHECK === "true";

function envelopeUrl(dsn: string) {
  const parsed = new URL(dsn);
  const projectId = parsed.pathname.split("/").filter(Boolean).at(-1);
  if (!projectId || !parsed.username) throw new Error("Invalid Sentry DSN");
  return `${parsed.protocol}//${parsed.host}/api/${projectId}/envelope/?sentry_version=7&sentry_key=${parsed.username}&sentry_client=autoapply-dsn-check/1.0`;
}

describe("Sentry monitor routing", () => {
  it.skipIf(!verifyDsn)("accepts one redacted monitor configuration event", async () => {
    const dsn = process.env.SENTRY_DSN;
    expect(dsn).toBeTruthy();
    const event = {
      event_id: crypto.randomUUID().replaceAll("-", ""),
      timestamp: Math.floor(Date.now() / 1000),
      level: "info",
      logger: "autoapply.auth-monitor",
      message: "Dashboard auth monitor routing check",
      platform: "node",
      tags: { monitor: "dashboard-auth", privacy: "technical-only", check: "configuration" },
    };
    const envelope = `${JSON.stringify({ dsn })}\n${JSON.stringify({ type: "event" })}\n${JSON.stringify(event)}\n`;
    const response = await fetch(envelopeUrl(dsn!), {
      method: "POST",
      headers: { "Content-Type": "application/x-sentry-envelope" },
      body: envelope,
      signal: AbortSignal.timeout(15_000),
    });
    expect(response.ok).toBe(true);
  }, 20_000);
});
