import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sitemap = readFileSync(new URL("../../public/sitemap.xml", import.meta.url), "utf8");
const robots = readFileSync(new URL("../../public/robots.txt", import.meta.url), "utf8");
const staticRoutes = readFileSync(new URL("../../../scripts/prepare-static-routes.mjs", import.meta.url), "utf8");

describe("public route SEO coverage", () => {
  it("lists every indexable English and Arabic route in the sitemap", () => {
    for (const route of ["/ats/", "/pricing/", "/ar/pricing/", "/how-it-works/", "/support/", "/privacy/", "/terms/", "/ar/how-it-works/", "/ar/support/", "/ar/privacy/", "/ar/terms/"]) {
      expect(sitemap).toContain(`https://www.hsndm.tech${route}`);
    }
    expect(sitemap).not.toContain("https://hsndm.tech/");
    expect(robots).toContain("Sitemap: https://www.hsndm.tech/sitemap.xml");
  });

  it("exports static ATS metadata for direct crawler access", () => {
    expect(staticRoutes).toContain('ats: { title: "ATS CV Review for Saudi Jobs | AutoApply SA"');
    expect(staticRoutes).toContain('path: "/ats"');
    expect(staticRoutes).toContain("const canonicalPath");
    expect(staticRoutes).toContain("Saudi job-application campaign plans from 99 SAR/month");
    expect(staticRoutes).toContain("Saudi-focused job-application campaign support and practical web systems");
  });
});
