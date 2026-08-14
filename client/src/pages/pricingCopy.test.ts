import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("public pricing copy", () => {
  it("does not promise an unsupported Julie copilot in English or Arabic", () => {
    const englishHome = source("client/src/pages/Home.tsx");
    const arabicHome = source("client/src/pages/ArabicHome.tsx");

    expect(englishHome).not.toContain("Julie copilot");
    expect(arabicHome).not.toContain("مساعدة Julie الرقمية");
  });
});
