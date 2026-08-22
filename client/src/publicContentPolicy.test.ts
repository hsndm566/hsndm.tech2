import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..", "..");
const publicPages = ["client/src/pages/Home.tsx", "client/src/pages/ArabicHome.tsx"];

describe("public content policy", () => {
  it("does not present unverified reviews or fabricated customer testimonials", () => {
    for (const file of publicPages) {
      const source = readFileSync(resolve(root, file), "utf8");

      expect(source).not.toContain("<blockquote>");
      expect(source).not.toContain("Three reviews shared directly");
      expect(source).not.toContain("ثلاث مراجعات مشاركة مباشرة");
      expect(source).not.toContain("Working in Jeddah as a nurse");
      expect(source).not.toContain("بصفتي ممرضة أعمل في جدة");
    }
  });

  it("keeps the former review section focused on transparent campaign information", () => {
    const english = readFileSync(resolve(root, publicPages[0]), "utf8");
    const arabic = readFileSync(resolve(root, publicPages[1]), "utf8");

    expect(english).toContain("WHO IT&apos;S FOR");
    expect(arabic).toContain("لمن تناسب الخدمة");
  });
});
