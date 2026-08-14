// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchableSaudiSelect } from "./SearchableSaudiSelect";
import { saudiCities } from "@/lib/saudiTaxonomy";

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", TestResizeObserver);

describe("SearchableSaudiSelect help cue", () => {
  it("provides a keyboard-accessible English explanation", () => {
    render(<SearchableSaudiSelect options={saudiCities} value="Jeddah" onChange={vi.fn()} placeholder="Search Saudi cities…" />);
    const help = screen.getByRole("button", { name: "How do these matching choices work?" });
    fireEvent.focus(help);
    expect(screen.getAllByText(/guide local matching/i).length).toBeGreaterThan(0);
  });

  it("uses localized Arabic help copy", () => {
    render(<SearchableSaudiSelect options={saudiCities} value="Jeddah" onChange={vi.fn()} language="ar" placeholder="ابحث عن مدينة سعودية…" />);
    const help = screen.getByRole("button", { name: "كيف تعمل اختيارات المطابقة؟" });
    fireEvent.focus(help);
    expect(screen.getAllByText(/لتوجيه المطابقة محلياً/).length).toBeGreaterThan(0);
  });
});
