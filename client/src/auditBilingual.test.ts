import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..", "..");

describe("bilingual audit source coverage", () => {
  it("includes the extracted Arabic intake and readiness components in the public-page audit", () => {
    const audit = readFileSync(resolve(root, "scripts/audit-bilingual.mjs"), "utf8");

    expect(audit).toContain("ArabicIntakeSection.tsx");
    expect(audit).toContain("ArabicMatchedResults.tsx");
    expect(audit).toContain("Your CV is read on your device");
    expect(audit).toContain("لا يتم إرسال ملف السيرة أو نصها");
  });
});
