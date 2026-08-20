import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./Dashboard.tsx", import.meta.url), "utf8");

describe("Dashboard Clerk loading recovery", () => {
  it("keeps an eight-second bounded timeout and exposes a safe recovery path instead of an indefinite spinner", () => {
    expect(source).toContain("8_000");
    expect(source).toContain("Sign-in is temporarily unavailable");
    expect(source).toContain("Connecting your private dashboard");
    expect(source).toContain("Request secure report help");
    expect(source).toContain("we do not display a report link on this public recovery screen");
    expect(source).toContain('captureClientReliabilitySignal("clerk_load_timeout"');
    expect(source).toContain("Try again");
  });
});
