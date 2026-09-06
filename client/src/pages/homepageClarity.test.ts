import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const homeSource = () => readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
  const arabicHomeSource = () => readFileSync(resolve(process.cwd(), "client/src/pages/ArabicHome.tsx"), "utf8");
  const arabicIntakeSource = () => readFileSync(resolve(process.cwd(), "client/src/components/arabic/ArabicIntakeSection.tsx"), "utf8") + readFileSync(resolve(process.cwd(), "client/src/components/arabic/ArabicScanProgress.tsx"), "utf8") + readFileSync(resolve(process.cwd(), "client/src/components/arabic/ArabicMatchedResults.tsx"), "utf8");
const deferredExplainerSource = () => readFileSync(resolve(process.cwd(), "client/src/components/DeferredExplainerVideo.tsx"), "utf8");
const stylesSource = () => readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

describe("homepage clarity release", () => {
  it("states the service plainly and keeps the approved campaign CTA paths", () => {
    const source = homeSource();

    expect(source).toContain("We prepare your job applications");
    expect(source).toContain("Nothing goes out until you say yes.");
    expect(source).toContain('href="/enquire"');
    expect(source).toContain("https://wa.me/966571448656");
  });

  it("keeps one how-it-works section and removes duplicate explainers", () => {
    const source = homeSource();

    expect(source).toContain('id="how"');
    expect(source).not.toContain("APPLICATION INFRASTRUCTURE");
    expect(source).not.toContain("WHAT THE SERVICE DOES");
    expect(source).not.toContain("PROCESS CASE STUDY");
  });

  it("uses the approved silent managed video in See It Work and does not promise a copilot", () => {
    const source = homeSource();

    expect(source).toContain("30 seconds. That&apos;s all it takes to understand.");
    expect(source).toContain("EXPLAINER_VIDEO_SRC = EXPLAINER_VIDEO_URL");
    expect(source).toContain("DeferredExplainerVideo");
    expect(deferredExplainerSource()).toContain("autoPlay loop muted playsInline disablePictureInPicture");
    expect(deferredExplainerSource()).toContain('controlsList="nodownload noplaybackrate"');
    expect(deferredExplainerSource()).toContain('preload="metadata"');
    expect(source).toContain("Powered by AutoApply SA.");
    expect(source).toContain("EXPLAINER_VIDEO_URL");
    expect(deferredExplainerSource()).toContain("hasFailed");
    expect(deferredExplainerSource()).toContain("onError={() => setHasFailed(true)}");
    expect(source).toContain("Priority human review");
    expect(source).not.toContain("Julie copilot");
  });

  it("shows the local-scan status, AI skill result wiring, alignment tooltips, and unavailable states in both landing pages", () => {
    const english = homeSource();
    const arabic = arabicHomeSource();

    expect(english).toContain("Scanning locally");
    expect(english).toContain("extractSkillsMutation");
    expect(english).toContain("AI Extracted Key Skills");
    expect(english).toContain("AI skills currently unavailable");
    expect(english).toContain("Hover skill chips to see alignment");

    const intake = arabicIntakeSource();
    expect(intake).toContain("الفحص محلياً");
    expect(intake).toContain("المهارات الأساسية المستخرجة بالذكاء الاصطناعي");
    expect(intake).toContain("المهارات الذكية غير متوفرة حالياً");
    expect(intake).toContain("مرّر مؤشر الماوس فوق المهارات");
  });

  it("keeps the Arabic hero plain-language and removes matching duplicate rendered sections", () => {
    const source = arabicHomeSource();

    expect(source).toContain("نُعِدّ طلباتك للوظائف");
    expect(source).toContain("نبحث ونُعِدّ الطلبات");
    expect(source).toContain("arabic-video-explainer-heading");
    expect(source).toContain("DeferredExplainerVideo");
    expect(deferredExplainerSource()).toContain("onError={() => setHasFailed(true)}");
    expect(source).not.toContain("البنية التحتية للتقديم");
    expect(source).not.toContain("ما تقدّمه الخدمة");
    expect(source).not.toContain("هذا المثال التوضيحي يشرح كيف تنتقل الحملة");
    const intake = arabicIntakeSource();
    expect(intake).toContain("استلام السيرة الذاتية");
    expect(intake).toContain("أضف سيرتك الذاتية.");
    expect(stylesSource()).not.toContain("سنوضح لك ما تستطيع فعله.");
  });

  it("keeps the bright first-screen hero complete and readable in both languages", () => {
    const english = homeSource();
    const arabic = arabicHomeSource();
    const hero = readFileSync(resolve(process.cwd(), "client/src/components/SaudiHero.tsx"), "utf8");
    const heroStyles = readFileSync(resolve(process.cwd(), "client/src/saudi-redesign.css"), "utf8");

    // The first-screen hero is the shared bilingual SaudiHero component.
    expect(english).toContain("<SaudiHero />");
    expect(arabic).toContain("<SaudiHero arabic />");
    expect(hero).toContain("A smarter way to run your job search in");
    expect(hero).toContain("طريقة أذكى لإدارة بحثك عن عمل في");
    expect(hero).toContain("Start an enquiry");
    expect(hero).toContain("ابدأ الطلب");
    expect(hero).toContain("Built for focused candidates across Saudi Arabia");
    // Dark editorial hero surface is defined in the redesign stylesheet.
    expect(heroStyles).toContain(".saudi-hero");
    expect(heroStyles).toContain(".saudi-intro h1");
  });

  it("keeps keyboard access and clear recovery paths for CV matching, video playback, and WhatsApp handoff", () => {
    const english = homeSource();
    const arabic = arabicHomeSource();
    const styles = stylesSource();

    expect(english).toContain('className="skip-link" href="#how"');
    expect(arabic).toContain('className="skip-link" href="#how"');
    expect(english).toContain("handoffBlocked");
    expect(english).toContain("WhatsApp was blocked by this browser.");
    expect(english).toContain('aria-describedby="cv-privacy-note"');
    expect(english).toContain("DeferredExplainerVideo");
    expect(arabic).toContain("DeferredExplainerVideo");
    expect(deferredExplainerSource()).toContain('role={hasFailed ? "status" : undefined}');
    expect(deferredExplainerSource()).toContain('aria-live={hasFailed ? "polite" : undefined}');
    expect(styles).toContain("select:focus-visible");
    expect(styles).toContain(".drop-zone:focus-within");
    expect(styles).toContain(".skip-link:focus");
    expect(english).toContain('const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;');
    expect(english).toContain('behavior: prefersReducedMotion ? "auto" : "smooth"');
    expect(english).toContain('if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)');
    expect(english).toContain("new AbortController()");
    expect(english).toContain('document.addEventListener("visibilitychange", onVisibilityChange)');
  });

  it("keeps public activity polling on the portal route instead of the protected automation API host", () => {
    const english = homeSource();

    expect(english).toContain('PORTAL_ACTIVITY_URL = "/v1/campaigns/latest-activity"');
    expect(english).toContain("fetch(PORTAL_ACTIVITY_URL");
    expect(english).toContain('credentials: "include"');
    expect(english).toContain('Accept: "application/json"');
    expect(english).toContain("not the separate");
    expect(english).not.toContain("ACTIVITY_API_BASE");
  });
});
