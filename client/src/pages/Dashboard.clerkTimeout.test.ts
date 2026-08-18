import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./Dashboard.tsx", import.meta.url), "utf8");

describe("Dashboard Clerk loading recovery", () => {
  it("keeps a bounded timeout without declaring a slow custom-domain initialization unavailable after eight seconds", () => {
    expect(source).toContain("15_000");
    expect(source).not.toContain("setClerkLoadTimedOut(true), 8000");
    expect(source).toContain("Sign-in is temporarily unavailable");
    expect(source).toContain("Try again");
  });
});
