import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const homeSource = () => readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
  const arabicHomeSource = () => readFileSync(resolve(process.cwd(), "client/src/pages/ArabicHome.tsx"), "utf8");
  const arabicIntakeSource = () => readFileSync(resolve(process.cwd(), "client/src/components/arabic/ArabicIntakeSection.tsx"), "utf8") + readFileSync(resolve(process.cwd(), "client/src/components/arabic/ArabicScanProgress.tsx"), "utf8") + readFileSync(resolve(process.cwd(), "client/src/components/arabic/ArabicMatchedResults.tsx"), "utf8");
const stylesSource = () => readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

describe("homepage clarity release", () => {
  it("states the service plainly and keeps the approved campaign CTA paths", () => {
    const source = homeSource();

    ["We", "apply", "jobs", "you."].forEach(word => expect(source).toContain(`>${word}</span>`));
    expect(source).toContain("AutoApply SA submits tailored job applications to Saudi companies on your behalf");
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
    expect(source).toContain("autoPlay loop muted playsInline disablePictureInPicture");
    expect(source).toContain('controlsList="nodownload noplaybackrate"');
    expect(source).toContain("Powered by AutoApply SA.");
    expect(source).toContain("EXPLAINER_VIDEO_URL");
    expect(source).toContain("explainerVideoFailed");
    expect(source).toContain("onError={() => setExplainerVideoFailed(true)}");
    expect(source).toContain("autoPlay loop muted playsInline");
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

    ["نتقدّم", "للوظائف"].forEach(word => expect(source).toContain(`>${word}</span>`));
    expect(source).toContain("سيرتك الذاتية جاهزة");
    expect(source).toContain("arabic-video-explainer-heading");
    expect(source).toContain("arabicExplainerVideoFailed");
    expect(source).toContain("onError={() => setArabicExplainerVideoFailed(true)}");
    expect(source).not.toContain("البنية التحتية للتقديم");
    expect(source).not.toContain("ما تقدّمه الخدمة");
    expect(source).not.toContain("هذا المثال التوضيحي يشرح كيف تنتقل الحملة");
    const intake = arabicIntakeSource();
    expect(intake).toContain("استلام السيرة الذاتية");
    expect(intake).toContain("أضف سيرتك الذاتية.");
    expect(stylesSource()).not.toContain("سنوضح لك ما تستطيع فعله.");
  });

  it("keeps the bright first-screen hero complete and readable around the full motion panel in both languages", () => {
    const english = homeSource();
    const arabic = arabicHomeSource();
    const styles = stylesSource();

    expect(english).toContain("<HeroMedia alt=");
    ["We", "apply", "jobs", "for"].forEach(word => expect(english).toContain(`>${word}</span>`));
    expect(english).toContain("Start your campaign");
    expect(english).toContain("500+");
    expect(arabic).toContain("<HeroMedia alt=");
    ["نتقدّم", "للوظائف"].forEach(word => expect(arabic).toContain(`>${word}</span>`));
    expect(arabic).toContain("ابدأ حملتك");
    expect(arabic).toContain("لغتان مدعومتان");
    expect(styles).toContain(".hero { min-height: 610px");
    expect(styles).toContain(".hero-media::after");
    expect(styles).toContain("background: linear-gradient(90deg, rgba(255,255,255,.28)");
    expect(styles).toContain("filter: saturate(.94) contrast(1.18) brightness(.96)");
    expect(styles).toContain(".hero-content { height: 610px");
    expect(styles).toContain("padding-top: calc(43vw + 20px)");
  });

  it("keeps keyboard access and clear recovery paths for CV matching, video playback, and WhatsApp handoff", () => {
    const english = homeSource();
    const arabic = arabicHomeSource();
    const styles = stylesSource();

    expect(english).toContain('className="skip-link" href="#upload"');
    expect(arabic).toContain('className="skip-link" href="#upload"');
    expect(english).toContain("handoffBlocked");
    expect(english).toContain("WhatsApp was blocked by this browser.");
    expect(english).toContain('aria-describedby="cv-privacy-note"');
    expect(english).toContain('role="status" aria-live="polite" aria-label="AutoApply SA walkthrough video unavailable');
    expect(arabic).toContain('role="status" aria-live="polite" aria-label="فيديو AutoApply SA التوضيحي غير متاح');
    expect(styles).toContain("select:focus-visible");
    expect(styles).toContain(".drop-zone:focus-within");
    expect(styles).toContain(".skip-link:focus");
    expect(english).toContain('const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;');
    expect(english).toContain('behavior: prefersReducedMotion ? "auto" : "smooth"');
    expect(english).toContain('if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)');
    expect(english).toContain("new AbortController()");
    expect(english).toContain('document.addEventListener("visibilitychange", onVisibilityChange)');
  });
});
