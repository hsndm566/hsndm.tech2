import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sitemap = readFileSync(new URL("../../public/sitemap.xml", import.meta.url), "utf8");
const robots = readFileSync(new URL("../../public/robots.txt", import.meta.url), "utf8");
const staticRoutes = readFileSync(new URL("../../../scripts/prepare-static-routes.mjs", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const campaignStatus = readFileSync(new URL("../pages/CampaignStatus.tsx", import.meta.url), "utf8");
const homePage = readFileSync(new URL("../pages/Home.tsx", import.meta.url), "utf8");

describe("public route SEO coverage", () => {
  it("lists every indexable English and Arabic route in the sitemap", () => {
    for (const route of ["/ats/", "/pricing/", "/ar/pricing/", "/how-it-works/", "/support/", "/privacy/", "/terms/", "/campaign-report-sample/", "/ar/how-it-works/", "/ar/support/", "/ar/privacy/", "/ar/terms/", "/ar/campaign-report-sample/"]) {
      expect(sitemap).toContain(`https://www.hsndm.tech${route}`);
    }
    expect(sitemap).not.toContain("https://hsndm.tech/");
    expect(robots).toContain("Sitemap: https://www.hsndm.tech/sitemap.xml");
    expect(robots).toContain("Disallow: /campaign/");
    expect(robots).toContain("Disallow: /dashboard/");
  });

  it("exports static ATS metadata for direct crawler access", () => {
    expect(staticRoutes).toContain('ats: { title: "ATS CV Review for Saudi Jobs | AutoApply SA"');
    expect(staticRoutes).toContain('path: "/ats"');
    expect(staticRoutes).toContain("const canonicalPath");
    expect(staticRoutes).toContain("Saudi job-application campaign plans from 99 SAR/month");
    expect(staticRoutes).toContain("Saudi-focused job-application campaign support and practical web systems");
    expect(staticRoutes).toContain("faqSchema: \"ar\"");
    expect(staticRoutes).toContain("faqSchemaPattern");
  });

  it("uses truthful public structured data without fabricated reviews and protects private campaign metadata", () => {
    expect(indexHtml).toContain('"@type": "Service"');
    expect(indexHtml).toContain('"priceCurrency": "SAR"');
    expect(indexHtml).toContain('"price": "99"');
    expect(indexHtml).toContain('"price": "149"');
    expect(indexHtml).toContain('"price": "249"');
    expect(indexHtml).toContain('id="homepage-faq-schema"');
    expect(indexHtml).not.toContain("AggregateRating");
    expect(indexHtml).not.toContain('"@type": "Review"');
    expect(homePage).toContain("AutoApply SA — We Prepare Your Job Applications, You Approve");
    expect(homePage).toContain("Nothing goes out until you say yes.");
    expect(campaignStatus).toContain("noindex: true");
    expect(readFileSync(new URL("./seo.ts", import.meta.url), "utf8")).toContain('"noindex, nofollow"');
  });
});
