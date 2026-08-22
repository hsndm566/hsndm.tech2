import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
const arabicHome = readFileSync(new URL("./ArabicHome.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

describe("public homepage enhancement contracts", () => {
  it("keeps the approval-led promise and the fixed public prices visible in English", () => {
    expect(home).toContain("We prepare");
    expect(home).toContain("Nothing is submitted without your go-ahead");
    expect(home).toContain('price: "99"');
    expect(home).toContain('price: "149"');
    expect(home).toContain('price: "249"');
  });

  it("keeps Arabic approval-led copy and matching FAQ coverage", () => {
    expect(arabicHome).toContain("لا يُقدَّم شيء دون موافقتك");
    expect(arabicHome).toContain("هل تضمنون حصولي على وظيفة؟");
    expect(arabicHome).toContain("الخصوصية والأمان");
  });

  it("uses route-derived document direction, lazy below-fold rendering, and static FAQ metadata", () => {
    expect(app).toContain('root.dir = isArabicRoute ? "rtl" : "ltr"');
    expect(home).toContain("<LazyMount>");
    expect(styles).toContain("content-visibility: auto");
    expect(html).toContain("Do you guarantee I'll get hired?");
    expect(html).toContain('hreflang="ar"');
  });
});
