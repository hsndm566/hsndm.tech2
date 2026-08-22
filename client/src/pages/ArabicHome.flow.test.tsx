// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ callbacks: [] as FrameRequestCallback[] }));

vi.mock("wouter", () => ({ Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>, useLocation: () => ["/ar", vi.fn()] }));
vi.mock("@/components/HeroMedia", () => ({ default: () => <div /> }));
vi.mock("@/components/Map", () => ({ MapView: () => <div />, JeddahLocationCard: () => <div /> }));
vi.mock("@/lib/seo", () => ({ applyPageSeo: vi.fn() }));
vi.mock("@/lib/trpc", () => ({ trpc: { campaign: { ats: { extractSkills: { useMutation: () => ({ mutateAsync: vi.fn().mockResolvedValue({ keySkills: ["Excel"], topDomain: "Finance" }) }) } }, readiness: { record: { useMutation: () => ({ mutate: vi.fn() }) } }, clientIssue: { reportCvExtractionFailure: { useMutation: () => ({ mutate: vi.fn() }) }, reportBlockedWhatsAppHandoff: { useMutation: () => ({ mutate: vi.fn() }) } } } } }));
vi.mock("@/lib/careerMatcher", () => ({ readCvText: async () => "finance experience" }));
vi.mock("@/lib/careerTaxonomy", () => ({ demoLists: () => [{ title: "Finance", items: ["Financial Analyst"] }] }));

class TestResizeObserver { observe() {} unobserve() {} disconnect() {} }
vi.stubGlobal("ResizeObserver", TestResizeObserver);

describe("ArabicHome canonical taxonomy flow", () => {
  beforeEach(() => {
    mocks.callbacks = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => { mocks.callbacks.push(callback); return mocks.callbacks.length; });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("renders the Arabic approval-led public path in the intended order", async () => {
    const { default: ArabicHome } = await import("./ArabicHome");
    const { container } = render(<ArabicHome />);

    expect(container.textContent).toContain("لا يُقدَّم شيء دون موافقتك");
    expect(container.querySelector("#how")).not.toBeNull();
    expect(container.querySelector("#reviews")).not.toBeNull();
    expect(container.querySelector("#approval")).not.toBeNull();
    expect(container.querySelector("#pricing")).not.toBeNull();
    expect(container.querySelector("#location")).not.toBeNull();
    expect(container.querySelector("#faq")).not.toBeNull();
    expect(container.querySelector('input[type="file"]')).toBeNull();
  });

  it("keeps privacy and final campaign direction visible without mounting the legacy readiness preview", async () => {
    const { default: ArabicHome } = await import("./ArabicHome");
    const { container } = render(<ArabicHome />);

    expect(container.querySelector(".privacy-panel")).not.toBeNull();
    expect(container.textContent).toContain("بياناتك تبقى خاصة");
    expect(container.textContent).toContain("ابدأ بخطة");
    expect(container.querySelector(".arabic-canonical-preference")).toBeNull();
    expect(container.querySelector(".readiness-card")).toBeNull();
  });
});
