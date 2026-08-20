import { describe, expect, it } from "vitest";
import { createAuthenticationReadinessPayload, createDatabaseHealthPayload, createHealthPayload } from "./health";

describe("Health check endpoint payload", () => {
  it("returns a healthy service payload with stable fields", () => {
    const payload = createHealthPayload(1_725_000_000_000, 12.5);

    expect(payload).toEqual({
      status: "healthy",
      service: "AutoApply SA",
      timestamp: 1_725_000_000_000,
      uptime: 12.5,
    });
  });

  it("reports database readiness without exposing database details", () => {
    expect(createDatabaseHealthPayload(true, 1_725_000_000_000)).toEqual({
      status: "healthy",
      dependency: "database",
      timestamp: 1_725_000_000_000,
    });
    expect(createDatabaseHealthPayload(false, 1_725_000_000_000)).toEqual({
      status: "unhealthy",
      dependency: "database",
      timestamp: 1_725_000_000_000,
    });
  });

  it("reports dashboard authentication configuration without exposing a secret", () => {
    expect(createAuthenticationReadinessPayload(true, 1_725_000_000_000)).toEqual({
      status: "healthy",
      dependency: "dashboard-auth-configuration",
      timestamp: 1_725_000_000_000,
    });
    expect(createAuthenticationReadinessPayload(false, 1_725_000_000_000).status).toBe("unhealthy");
  });
});
