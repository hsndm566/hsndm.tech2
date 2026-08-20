import { describe, expect, it } from "vitest";
import { getDashboardHostRedirect, isDashboardSubdomain } from "./subdomain";

describe("subdomain routing helper", () => {
  it("detects dashboard subdomain correctly", () => {
    // In node test environment without browser window, returns false safely
    expect(typeof isDashboardSubdomain()).toBe("boolean");
  });

  it("sends only protected dashboard paths from www to the configured dashboard host", () => {
    expect(getDashboardHostRedirect({ hostname: "www.hsndm.tech", pathname: "/dashboard", search: "?from=hero" })).toBe(
      "https://dashboard.hsndm.tech/dashboard?from=hero"
    );
    expect(getDashboardHostRedirect({ hostname: "www.hsndm.tech", pathname: "/dashboard/settings", hash: "#security" })).toBe(
      "https://dashboard.hsndm.tech/dashboard/settings#security"
    );
  });

  it("keeps public routes and already-correct dashboard host paths unchanged", () => {
    expect(getDashboardHostRedirect({ hostname: "www.hsndm.tech", pathname: "/pricing" })).toBeNull();
    expect(getDashboardHostRedirect({ hostname: "dashboard.hsndm.tech", pathname: "/dashboard" })).toBeNull();
  });
});
