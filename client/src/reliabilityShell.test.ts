import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../..");

describe("first-paint reliability shell", () => {
  it("ships a branded immediate loading shell before React initializes", () => {
    const html = readFileSync(resolve(projectRoot, "client/index.html"), "utf8");

    expect(html).toContain('id="app-loading-shell"');
    expect(html).toContain("Preparing your campaign workspace.");
    expect(html).toContain("No CV, campaign brief, or application action has been submitted.");
  });

  it("keeps the public hero promise approval-led in both languages", () => {
    const english = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
    const arabic = readFileSync(resolve(projectRoot, "client/src/pages/ArabicHome.tsx"), "utf8");

    expect(english).toContain(">applications.</span>");
    expect(english).toContain(">You approve</span>");
    expect(english).toContain("You approve role targets");
    expect(arabic).toContain("وأنت توافق");
    expect(arabic).toContain("كل طلب مسجّل");
  });
});
