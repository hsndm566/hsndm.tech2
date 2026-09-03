// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SaudiHero } from "./SaudiHero";

afterEach(cleanup);
describe("Saudi landing introduction", () => {
  it("provides real navigation and explicitly labels the mock workspace", () => {
    render(<SaudiHero />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Your next career move");
    expect(screen.getByRole("link", { name: /Find your campaign plan/ }).getAttribute("href")).toBe("#pricing");
    expect(screen.getByRole("link", { name: /See how it works/ }).getAttribute("href")).toBe("#how");
    expect(screen.getByText("Illustrative preview · No real applications shown")).toBeTruthy();
    expect(screen.queryByText("LIVE / 24H")).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
  it("provides matching Arabic content without changing the workflow", () => {
    render(<SaudiHero arabic />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("خطوتك المهنية القادمة");
    expect(screen.getByRole("link", { name: /اختر خطة التقديم/ }).getAttribute("href")).toBe("#pricing");
    expect(screen.getByText("معاينة توضيحية · لا تتضمن طلبات فعلية")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
