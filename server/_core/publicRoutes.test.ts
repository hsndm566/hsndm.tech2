import { describe, expect, it } from "vitest";
import { getPathnameFromRequestUrl, isKnownPublicRoute } from "./publicRoutes";

describe("public SPA route contract", () => {
  it("accepts every registered public route and campaign detail URLs", () => {
    expect(isKnownPublicRoute("/")).toBe(true);
    expect(isKnownPublicRoute("/ar/privacy")).toBe(true);
    expect(isKnownPublicRoute("/dashboard/settings/")).toBe(true);
    expect(isKnownPublicRoute("/campaign/candidate-safe-token")).toBe(true);
  });

  it("rejects unknown routes so production can return an actual 404", () => {
    expect(isKnownPublicRoute("/made-up-route")).toBe(false);
    expect(isKnownPublicRoute("/campaign/")).toBe(false);
    expect(isKnownPublicRoute("api/trpc")).toBe(false);
  });

  it("uses only the URL pathname when query strings are present", () => {
    expect(getPathnameFromRequestUrl("/privacy?source=footer#rights")).toBe("/privacy");
    expect(getPathnameFromRequestUrl("not a valid URL")).toBe("/");
  });
});
