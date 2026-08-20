import { describe, expect, it, vi } from "vitest";
import { checkDashboardAuth, createAuthMonitorAlertText, reportAuthMonitorToSentry } from "./authMonitor";

describe("dashboard authentication monitor", () => {
  it("marks a non-successful Clerk bootstrap as degraded without candidate data", async () => {
    const check = await checkDashboardAuth(vi.fn().mockResolvedValue(new Response(null, { status: 403 })) as unknown as typeof fetch);
    expect(check.status).toBe("degraded");
    expect(check.clerkBootstrapStatus).toBe(403);
    const alert = createAuthMonitorAlertText(check);
    expect(alert).toContain("http-403");
    expect(alert).not.toContain("candidate@");
    expect(alert).not.toContain("CV");
  });

  it("uses a redacted Sentry envelope without request or candidate payloads", async () => {
    const originalDsn = process.env.SENTRY_DSN;
    process.env.SENTRY_DSN = "https://public@example.ingest.sentry.io/42";
    const send = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    const reported = await reportAuthMonitorToSentry({ status: "degraded", configurationReady: true, clerkBootstrapStatus: 403 }, false, send as unknown as typeof fetch);
    expect(reported).toBe(true);
    expect(String(send.mock.calls[0][1]?.body)).toContain("no-candidate-data");
    expect(String(send.mock.calls[0][1]?.body)).not.toContain("request");
    process.env.SENTRY_DSN = originalDsn;
  });
});
