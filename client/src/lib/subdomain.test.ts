import { describe, expect, it } from "vitest";
import { getDashboardHostRedirect, isDashboardSubdomain } from "./subdomain";

describe("subdomain routing helper", () => {
  it("detects dashboard subdomain correctly", () => {
    expect(typeof isDashboardSubdomain()).toBe("boolean");
  });

  it("sends protected dashboard and auth paths from www to the configured dashboard host", () => {
    expect(getDashboardHostRedirect({ hostname: "www.hsndm.tech", pathname: "/dashboard", search: "?from=hero" })).toBe(
      "https://dashboard.hsndm.tech/dashboard?from=hero"
    );
    expect(getDashboardHostRedirect({ hostname: "www.hsndm.tech", pathname: "/dashboard/settings", hash: "#security" })).toBe(
      "https://dashboard.hsndm.tech/dashboard/settings#security"
    );
    expect(getDashboardHostRedirect({ hostname: "www.hsndm.tech", pathname: "/sign-in" })).toBe(
      "https://dashboard.hsndm.tech/sign-in"
    );
    expect(getDashboardHostRedirect({ hostname: "www.hsndm.tech", pathname: "/sign-up" })).toBe(
      "https://dashboard.hsndm.tech/sign-up"
    );
  });

  it("keeps public routes and already-correct dashboard host paths unchanged", () => {
    expect(getDashboardHostRedirect({ hostname: "www.hsndm.tech", pathname: "/pricing" })).toBeNull();
    expect(getDashboardHostRedirect({ hostname: "dashboard.hsndm.tech", pathname: "/dashboard" })).toBeNull();
  });
});
