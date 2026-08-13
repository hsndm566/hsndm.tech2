import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sitemap = readFileSync(new URL("../../public/sitemap.xml", import.meta.url), "utf8");
const staticRoutes = readFileSync(new URL("../../../scripts/prepare-static-routes.mjs", import.meta.url), "utf8");

describe("public route SEO coverage", () => {
  it("lists every indexable English and Arabic route in the sitemap", () => {
    for (const route of ["/ats", "/pricing", "/ar/pricing", "/how-it-works", "/support", "/privacy", "/terms", "/ar/how-it-works", "/ar/support", "/ar/privacy", "/ar/terms"]) {
      expect(sitemap).toContain(`https://hsndm.tech${route}`);
    }
  });

  it("exports static ATS metadata for direct crawler access", () => {
    expect(staticRoutes).toContain('ats: { title: "ATS Review | AutoApply SA"');
    expect(staticRoutes).toContain('path: "/ats"');
  });
});
