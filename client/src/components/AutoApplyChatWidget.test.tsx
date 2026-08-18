// @vitest-environment jsdom
import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AutoApplyChatWidget } from "./AutoApplyChatWidget";

describe("AutoApplyChatWidget safety fallback", () => {
  it("does not render an AI chat launcher while the connected endpoint has an unverified business profile", () => {
    const { container } = render(<AutoApplyChatWidget />);
    expect(container.innerHTML).toBe("");
  });
});
