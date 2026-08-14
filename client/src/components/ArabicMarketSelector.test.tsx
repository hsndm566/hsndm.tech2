// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ArabicMarketSelector } from "./ArabicMarketSelector";

describe("Arabic in-upload market selector", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders canonical controls inside the upload grid and returns English taxonomy values", async () => {
    document.body.innerHTML = '<div class="site-shell" lang="ar"><section id="upload"><div class="preferences-grid"></div></section></div>';
    const onCityChange = vi.fn();
    const onIndustryChange = vi.fn();
    render(<ArabicMarketSelector city="Jeddah" industry="Technology & Software" onCityChange={onCityChange} onIndustryChange={onIndustryChange} />);

    await waitFor(() => expect(document.querySelectorAll(".arabic-canonical-preference")).toHaveLength(2));
    const selects = document.querySelectorAll<HTMLSelectElement>(".arabic-canonical-preference select");
    fireEvent.change(selects[0], { target: { value: "Riyadh" } });
    fireEvent.change(selects[1], { target: { value: "Finance & Banking" } });

    expect(onCityChange).toHaveBeenCalledWith("Riyadh");
    expect(onIndustryChange).toHaveBeenCalledWith("Finance & Banking");
  });
});
