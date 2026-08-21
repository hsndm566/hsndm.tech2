import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const entry = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const sentry = readFileSync(new URL("./sentryTelemetry.ts", import.meta.url), "utf8");
const home = readFileSync(new URL("../pages/Home.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const viteConfig = readFileSync(new URL("../../../vite.config.ts", import.meta.url), "utf8");
const staticServer = readFileSync(new URL("../../../server/_core/vite.ts", import.meta.url), "utf8");

describe("public marketing performance contracts", () => {
  it("defers optional Sentry work until consent and idle time", () => {
    expect(sentry).toContain('import("@sentry/react")');
    expect(sentry).not.toContain('import * as Sentry from "@sentry/react"');
    expect(sentry).toContain("if (hasOptionalConsent()) void startOptionalSentry()");
    expect(entry).toContain("requestIdleCallback");
  });

  it("keeps marketing freshness checks and remote fonts off the first-paint critical path", () => {
    expect(home).toContain("window.setTimeout(startPolling, 1_800)");
    expect(styles).not.toContain("fonts.googleapis.com");
    expect(indexHtml).toContain('media="print" onload="this.media=\'all\'"');
    expect(indexHtml).toContain("display=swap");
  });

  it("splits private SDKs and caches hashed public assets immutably", () => {
    expect(viteConfig).toContain('if (id.includes("/node_modules/@sentry/")) return "sentry-optional"');
    expect(viteConfig).toContain('if (id.includes("/node_modules/@clerk/clerk-react/")) return "clerk-auth"');
    expect(staticServer).toContain('"public, max-age=31536000, immutable"');
    expect(staticServer).toContain('res.setHeader("Cache-Control", "no-cache")');
  });
});
