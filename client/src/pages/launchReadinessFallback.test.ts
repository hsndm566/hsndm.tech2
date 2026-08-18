import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const boundarySource = readFileSync(new URL("../components/ErrorBoundary.tsx", import.meta.url), "utf8");
const recoverySource = readFileSync(new URL("../components/RecoveryPanel.tsx", import.meta.url), "utf8");
const htmlSource = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const staticRouteSource = readFileSync(new URL("../../../scripts/prepare-static-routes.mjs", import.meta.url), "utf8");

describe("launch-readiness fallback contracts", () => {
  it("replaces empty route loading with visible bilingual recovery content", () => {
    expect(appSource).toContain("<RecoveryPanel loading arabic={window.location.pathname.startsWith(\"/ar\")} />");
    expect(boundarySource).toContain("RecoveryPanel");
    expect(recoverySource).toContain("No form or CV has been sent from this page.");
    expect(recoverySource).toContain("لم يُرسل أي نموذج أو سيرة ذاتية");
  });

  it("ships no-JavaScript and independently generated fallback pages for the audited routes", () => {
    expect(htmlSource).toContain("<noscript>");
    expect(htmlSource).toContain("No CV has been uploaded.");
    expect(staticRouteSource).toContain('"fallback/enquire"');
    expect(staticRouteSource).toContain('"fallback/privacy"');
    expect(staticRouteSource).toContain('"fallback/terms"');
    expect(staticRouteSource).toContain("fallbackContent");
  });
});
