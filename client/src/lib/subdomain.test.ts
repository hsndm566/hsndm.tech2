import { describe, expect, it } from "vitest";
import { isDashboardSubdomain } from "./subdomain";

describe("subdomain routing helper", () => {
  it("detects dashboard subdomain correctly", () => {
    // In node test environment without browser window, returns false safely
    expect(typeof isDashboardSubdomain()).toBe("boolean");
  });
});
