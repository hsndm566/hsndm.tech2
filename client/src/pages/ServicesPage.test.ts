import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./ServicesPage.tsx", import.meta.url), "utf8");

describe("ServicesPage", () => {
  it("presents both Saudi work tracks without implying checkout or guaranteed outcomes", () => {
    expect(source).toContain("AutoApply SA");
    expect(source).toContain("Web & operations systems");
    expect(source).toContain("This page does not collect payment");
    expect(source).toContain("أنظمة الويب والتشغيل");
    expect(source).toContain("لا تُجمع مدفوعات من هذه الصفحة");
  });
});
