// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SaudiHero } from "./SaudiHero";

afterEach(cleanup);
describe("Saudi landing introduction", () => {
  it("provides real navigation and explicitly labels the mock workspace", () => {
    render(<SaudiHero />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("A smarter way to run your job search in Saudi Arabia.");
    expect(screen.getByRole("link", { name: /Start an enquiry/ }).getAttribute("href")).toBe("/enquire");
    expect(screen.getByRole("link", { name: /See how it works/ }).getAttribute("href")).toBe("#how");
    expect(screen.getByText(/Illustrative preview/)).toBeTruthy();
    expect(screen.queryByText("LIVE / 24H")).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
  it("provides matching Arabic content without changing the workflow", () => {
    render(<SaudiHero arabic />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("طريقة أذكى لإدارة بحثك عن عمل في السعودية.");
    expect(screen.getByRole("link", { name: /ابدأ الطلب/ }).getAttribute("href")).toBe("/ar/enquire");
    expect(screen.getByText(/معاينة توضيحية/)).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
