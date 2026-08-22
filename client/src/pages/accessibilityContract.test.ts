import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
const arabicHomeSource = readFileSync(new URL("./ArabicHome.tsx", import.meta.url), "utf8");
const enquireSource = readFileSync(new URL("./Enquire.tsx", import.meta.url), "utf8");
const arabicEnquireSource = readFileSync(new URL("./ArabicEnquire.tsx", import.meta.url), "utf8");
const stylesSource = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const deferredExplainerSource = readFileSync(new URL("../components/DeferredExplainerVideo.tsx", import.meta.url), "utf8");

describe("public accessibility and recovery contract", () => {
  it("provides bilingual skip navigation to visible workflow content and campaign brief", () => {
    expect(homeSource).toContain('className="skip-link" href="#how"');
    expect(arabicHomeSource).toContain('className="skip-link" href="#how"');
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

  it("announces media failures and preserves accessible alternate contact recovery paths", () => {
    expect(homeSource).toContain("DeferredExplainerVideo");
    expect(arabicHomeSource).toContain("DeferredExplainerVideo");
    expect(deferredExplainerSource).toContain('role={hasFailed ? "status" : undefined}');
    expect(deferredExplainerSource).toContain('aria-live={hasFailed ? "polite" : undefined}');
    expect(enquireSource).toContain("Secure web enquiry");
    expect(enquireSource).toContain("browser blocked the new WhatsApp window");
    expect(arabicEnquireSource).toContain("استفسار ويب آمن");
    expect(arabicEnquireSource).toContain("حظر المتصفح نافذة واتساب");
  });

  it("honors reduced-motion preferences for visual transitions and the scanning laser", () => {
    expect(stylesSource).toContain("@media (prefers-reduced-motion: reduce)");
    expect(stylesSource).toContain(".drop-zone.is-scanning-laser::after");
    expect(stylesSource).toContain("animation: none");
  });
});
