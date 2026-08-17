import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..", "..");
const files = [
  "client/index.html",
  "client/public/llms.txt",
  "client/src/pages/Home.tsx",
  "client/src/pages/ArabicHome.tsx",
  "scripts/audit-bilingual.mjs",
];

describe("public business contact", () => {
  it("publishes the corrected apply address across visible and machine-readable contact surfaces", () => {
    for (const relativePath of files) {
      const source = readFileSync(resolve(root, relativePath), "utf8");
      expect(source).toContain("apply@hsndm.tech");
      expect(source).not.toContain("hasan@hsndm.tech");
    }
    const informationPage = readFileSync(resolve(root, "client/src/pages/InformationPage.tsx"), "utf8");
    expect(informationPage).toContain('const PUBLIC_EMAIL = "apply@hsndm.tech"');
    expect(informationPage).toContain('replaceAll("hasan@hsndm.tech", PUBLIC_EMAIL)');
  });
});
