// @vitest-environment jsdom
import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomepageMediaImage } from "./HomepageMediaImage";

describe("HomepageMediaImage", () => {
  it("keeps a busy loading surface until the lazy image has decoded", () => {
    const { container } = render(<HomepageMediaImage src="/manus-storage/workspace.jpg" alt="Workspace" width={1536} height={1920} />);
    const surface = container.querySelector(".homepage-media-surface");
    const image = container.querySelector("img");

    expect(surface?.getAttribute("aria-busy")).toBe("true");
    expect(image?.getAttribute("loading")).toBe("lazy");
    expect(image?.getAttribute("decoding")).toBe("async");
    expect(image?.getAttribute("width")).toBe("1536");
    expect(image?.getAttribute("height")).toBe("1920");

    fireEvent.load(image!);

    expect(surface?.className).toContain("is-ready");
    expect(surface?.getAttribute("aria-busy")).toBe("false");
  });
});
