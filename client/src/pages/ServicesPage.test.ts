import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./ServicesPage.tsx", import.meta.url), "utf8");

describe("ServicesPage", () => {
  it("keeps the public services page focused on AutoApply SA in both languages", () => {
    expect(source).toContain("AUTOAPPLY SA / SERVICES");
    expect(source).toContain("One service. A clearer job search.");
    expect(source).toContain("AUTOAPPLY SA / الخدمات");
    expect(source).toContain("خدمة واحدة. بحث وظيفي أوضح.");
    expect(source).not.toContain("Web & operations systems");
    expect(source).not.toContain("أنظمة الويب والتشغيل");
    expect(source).not.toContain("small businesses");
  });

  it("makes targeting, preparation, approval and real AutoApply imagery explicit", () => {
    expect(source).toContain("01 / TARGET");
    expect(source).toContain("02 / PREPARE");
    expect(source).toContain("03 / APPROVE");
    expect(source).toContain("01 / الاستهداف");
    expect(source).toContain("02 / التجهيز");
    expect(source).toContain("03 / الموافقة");
    expect(source).toContain("Nothing is submitted without your approval");
    expect(source).toContain("لا يتم إرسال أي طلب دون موافقتك");
    expect(source).toContain("autoapply-desk_635170b2.jpg");
    expect(source).toContain("autoapply-flow_6c03602a.jpg");
    expect(source).toContain("autoapply-hero-operations_ad007abc.jpg");
    expect(source).toContain("imageAlt");
  });
});
