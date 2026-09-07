import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dataClient = readFileSync(new URL("./components/DataClientProviders.tsx", import.meta.url), "utf8");
const dashboard = readFileSync(new URL("./pages/Dashboard.tsx", import.meta.url), "utf8");
const settings = readFileSync(new URL("./pages/ProfileSettings.tsx", import.meta.url), "utf8");
const serverContext = readFileSync(new URL("../../server/_core/context.ts", import.meta.url), "utf8");
const serverEntry = readFileSync(new URL("../../server/_core/index.ts", import.meta.url), "utf8");

describe("Clerk-only customer authentication", () => {
  it("sends only Clerk bearer tokens from the browser", () => {
    expect(dataClient).toContain("getClerkToken");
    expect(dataClient).not.toContain("manus-cookie");
    expect(dataClient).not.toContain("COOKIE_NAME");
  });

  it("fails closed instead of offering the legacy OAuth flow", () => {
    for (const source of [dashboard, settings]) {
      expect(source).not.toContain("useManusAuth");
      expect(source).not.toContain("startLogin");
      expect(source).not.toContain("Sign In with Manus");
    }
  });

  it("uses Clerk as the only customer identity accepted by tRPC", () => {
    expect(serverContext).toContain("verifyToken");
    expect(serverContext).toContain('authorizedParties: process.env.NODE_ENV === "production"');
    expect(serverContext).not.toContain("sdk.authenticateRequest");
    expect(serverEntry).not.toContain("registerOAuthRoutes");
  });
});

