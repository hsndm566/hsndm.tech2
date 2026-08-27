// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PricingPage from "./PricingPage";

describe("PricingPage Phase 3 clarity", () => {
  afterEach(cleanup);

  it("defines an application, compares plans, and states core campaign boundaries", () => {
    render(<PricingPage />);
    expect(screen.getByRole("heading", { name: "Compare campaign support" })).toBeTruthy();
    expect(screen.getByText("What we never do")).toBeTruthy();
    expect(screen.getByText(/One application means one approved employer-role submission/i)).toBeTruthy();
    expect(screen.getByText(/Invent credentials/i)).toBeTruthy();
    expect(screen.getByText(/consent is unclear/i)).toBeTruthy();
  });

  it("keeps the approved plan-boundary content available in Arabic RTL", () => {
    render(<PricingPage language="ar" />);
    expect(document.querySelector("main")?.getAttribute("dir")).toBe("rtl");
    expect(screen.getByRole("heading", { name: "قارن دعم الحملة" })).toBeTruthy();
    expect(screen.getByText("ما الذي لا نفعله أبدًا")).toBeTruthy();
  });

  it("makes the plan comparison discoverable and keyboard-scrollable without changing its contents", () => {
    render(<PricingPage />);
    const comparison = screen.getByRole("region", { name: "Campaign plan comparison table" });
    const scrollBy = vi.fn();
    Object.defineProperty(comparison, "scrollBy", { value: scrollBy });

    expect(comparison.getAttribute("tabindex")).toBe("0");
    expect(comparison.getAttribute("aria-describedby")).toBe("comparison-instructions");
    expect(screen.getByText(/use the left and right arrow keys/i)).toBeTruthy();
    fireEvent.keyDown(comparison, { key: "ArrowRight" });
    fireEvent.keyDown(comparison, { key: "ArrowLeft" });
    expect(scrollBy).toHaveBeenNthCalledWith(1, { left: 160 });
    expect(scrollBy).toHaveBeenNthCalledWith(2, { left: -160 });
  });

  it("keeps the Arabic comparison region labelled and right-aligned", () => {
    render(<PricingPage language="ar" />);
    expect(screen.getByRole("region", { name: "جدول مقارنة خطط الحملة" })).toBeTruthy();
    expect(document.querySelector("table")?.className).toContain("text-right");
  });
});
