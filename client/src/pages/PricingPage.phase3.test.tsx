// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
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
});
