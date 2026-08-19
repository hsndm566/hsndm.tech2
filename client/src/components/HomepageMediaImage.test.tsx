// @vitest-environment jsdom
import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomepageMediaImage } from "./HomepageMediaImage";

describe("HomepageMediaImage", () => {
  it("keeps a busy loading surface until the lazy image has decoded", () => {
    const { container } = render(<HomepageMediaImage src="/manus-storage/workspace.jpg" alt="Workspace" />);
    const surface = container.querySelector(".homepage-media-surface");
    const image = container.querySelector("img");

    expect(surface?.getAttribute("aria-busy")).toBe("true");
    expect(image?.getAttribute("loading")).toBe("lazy");

    fireEvent.load(image!);

    expect(surface?.className).toContain("is-ready");
    expect(surface?.getAttribute("aria-busy")).toBe("false");
  });
});
