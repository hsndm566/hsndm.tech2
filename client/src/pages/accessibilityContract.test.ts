import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
const arabicHomeSource = readFileSync(new URL("./ArabicHome.tsx", import.meta.url), "utf8");
const enquireSource = readFileSync(new URL("./Enquire.tsx", import.meta.url), "utf8");
const arabicEnquireSource = readFileSync(new URL("./ArabicEnquire.tsx", import.meta.url), "utf8");
const stylesSource = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("public accessibility and recovery contract", () => {
  it("provides bilingual skip navigation to the CV matcher and campaign brief", () => {
    expect(homeSource).toContain('className="skip-link" href="#upload"');
    expect(arabicHomeSource).toContain('className="skip-link" href="#upload"');
    expect(arabicEnquireSource).toContain('className="skip-link" href="#campaign-brief"');
  });

  it("keeps CV upload controls and primary CTAs keyboard-focusable", () => {
    expect(homeSource).toContain('aria-describedby="cv-privacy-note"');
    expect(homeSource).toContain('href="/enquire"');
    expect(enquireSource).toContain('type="submit"');
    expect(arabicEnquireSource).toContain('type="submit"');
    expect(stylesSource).toContain("select:focus-visible");
    expect(stylesSource).toContain(".drop-zone:focus-within");
  });

  it("announces media failures and preserves a clear manual WhatsApp recovery path", () => {
    expect(homeSource).toContain('role="status" aria-live="polite" aria-label="AutoApply SA walkthrough video unavailable');
    expect(arabicHomeSource).toContain('role="status" aria-live="polite" aria-label="فيديو AutoApply SA التوضيحي غير متاح');
    expect(enquireSource).toContain("Open WhatsApp manually");
    expect(arabicEnquireSource).toContain("فتح WhatsApp يدوياً");
  });

  it("honors reduced-motion preferences for visual transitions and the scanning laser", () => {
    expect(stylesSource).toContain("@media (prefers-reduced-motion: reduce)");
    expect(stylesSource).toContain(".drop-zone.is-scanning-laser::after");
    expect(stylesSource).toContain("animation: none");
  });
});
