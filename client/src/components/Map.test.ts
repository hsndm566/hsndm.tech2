import { describe, expect, it } from "vitest";
import { buildMapsScriptUrl, getJeddahDirectionsUrl, getJeddahLocationCopy, getMapFallbackMessage } from "./Map";

describe("MapView localization contract", () => {
  it("requests the Saudi Arabic Maps locale when Arabic is selected", () => {
    const url = buildMapsScriptUrl("ar", "SA");

    expect(url).toContain("language=ar");
    expect(url).toContain("region=SA");
    expect(url).toContain("loading=async");
  });

  it("keeps the English locale available for the English page", () => {
    expect(buildMapsScriptUrl("en", "SA")).toContain("language=en");
  });

  it("provides an honest Arabic fallback when Maps cannot load", () => {
    expect(getMapFallbackMessage("ar")).toContain("تعذر تحميل");
  });

  it("provides an actionable English fallback when Maps cannot load", () => {
    expect(getMapFallbackMessage("en")).toContain("Get directions");
  });

  it("uses Jeddah as the safe external-directions fallback", () => {
    expect(getJeddahDirectionsUrl()).toContain("destination=Jeddah");
  });

  it("provides an Arabic and English directions-first location-card contract", () => {
    expect(getJeddahLocationCopy("en").directions).toBe("Get directions");
    expect(getJeddahLocationCopy("ar").directions).toContain("الاتجاهات");
    expect(getJeddahLocationCopy("ar").title).toContain("جدة");
  });
});
