// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ callbacks: [] as FrameRequestCallback[] }));

vi.mock("wouter", () => ({ Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a> }));
vi.mock("@/components/HeroMedia", () => ({ default: () => <div /> }));
vi.mock("@/components/Map", () => ({ MapView: () => <div /> }));
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

  it("carries selected canonical Arabic city and industry values into the readiness output", async () => {
    const { default: ArabicHome } = await import("./ArabicHome");
    const { container } = render(<ArabicHome />);
    await waitFor(() => expect(container.querySelectorAll(".arabic-canonical-preference select")).toHaveLength(2));
    const selectors = container.querySelectorAll<HTMLSelectElement>(".arabic-canonical-preference select");
    fireEvent.change(selectors[0], { target: { value: "Riyadh" } });
    fireEvent.change(selectors[1], { target: { value: "Finance & Banking" } });
    const upload = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(upload, { target: { files: [new File(["cv"], "cv.txt", { type: "text/plain" })] } });
    await waitFor(() => expect(mocks.callbacks.length).toBeGreaterThan(0));
    mocks.callbacks.at(-1)!(999_999);

    await waitFor(() => {
      expect(container.textContent).toContain("الرياض");
      expect(container.textContent).toContain("المالية والمصارف");
    });
  });
});
