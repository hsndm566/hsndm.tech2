import { describe, expect, it } from "vitest";
import { saudiCities, saudiIndustries, toMatchIndustry } from "./saudiTaxonomy";

describe("Saudi taxonomy", () => {
  it("pairs every city and industry with English and Arabic labels", () => {
    expect(saudiCities.length).toBeGreaterThanOrEqual(24);
    expect(saudiIndustries.length).toBeGreaterThanOrEqual(38);
    [...saudiCities, ...saudiIndustries].forEach(option => {
      expect(option.en.trim()).not.toBe("");
      expect(option.ar.trim()).not.toBe("");
    });
  });

  it("maps each detailed industry to a supported local matching group", () => {
    const groups = new Set(["technology-data", "business-operations", "people-service", "engineering-construction"]);
    saudiIndustries.forEach(industry => expect(groups.has(toMatchIndustry(industry.en))).toBe(true));
  });
});
