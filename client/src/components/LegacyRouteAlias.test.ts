import { describe, expect, it } from "vitest";
import { getLegacyRouteAlias, legacyRouteAliases } from "./LegacyRouteAlias";

describe("legacy route aliases", () => {
  it("maps English and Arabic legacy routes to current pages or sections", () => {
    expect(legacyRouteAliases["/pricing"].target).toBe("/contact");
    expect(legacyRouteAliases["/ar/pricing"].target).toBe("/ar/contact");
    expect(legacyRouteAliases["/services"].target).toBe("/#features");
    expect(legacyRouteAliases["/ar/services"].target).toBe("/ar/#features");
    expect(legacyRouteAliases["/how-it-works"].target).toBe("/#how");
    expect(legacyRouteAliases["/ar/how-it-works"].target).toBe("/ar/#how");
    expect(legacyRouteAliases["/support"].target).toBe("/contact");
    expect(legacyRouteAliases["/ar/support"].target).toBe("/ar/contact");
    expect(legacyRouteAliases["/enquire"].target).toBe("/contact");
    expect(legacyRouteAliases["/ar/enquire"].target).toBe("/ar/contact");
    expect(legacyRouteAliases["/ats"].target).toBe("/#features");
    expect(legacyRouteAliases["/ar/ats"].target).toBe("/ar/#features");
  });

  it("uses the matching locale and canonical path without indexing aliases", () => {
    for (const path of Object.keys(legacyRouteAliases) as (keyof typeof legacyRouteAliases)[]) {
      const alias = getLegacyRouteAlias(path);
      expect(alias).toBeDefined();
      expect(alias?.canonicalPath.startsWith("/ar")).toBe(path.startsWith("/ar"));
      expect(alias?.title.length).toBeGreaterThan(10);
      expect(alias?.description.length).toBeGreaterThan(40);
    }
    expect(legacyRouteAliases["/ar/pricing"].language).toBe("ar");
    expect(legacyRouteAliases["/pricing"].language).toBe("en");
  });

  it("does not map retired pages that have no truthful current counterpart", () => {
    for (const path of ["/case-studies", "/ar/case-studies", "/campaign-report-sample", "/ar/campaign-report-sample", "/thank-you", "/ar/thank-you"]) {
      expect(getLegacyRouteAlias(path)).toBeUndefined();
    }
  });
});
