// @vitest-environment jsdom
import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HeroMedia from "./HeroMedia";

describe("HeroMedia", () => {
  it("uses the approved managed hero MP4 with muted inline looping playback", () => {
    const { container } = render(<HeroMedia alt="Automated job application workflow" />);
    const video = container.querySelector("video");
    const source = container.querySelector("source");

    expect(video).toBeTruthy();
    expect(video?.hasAttribute("autoplay")).toBe(true);
    expect(video?.hasAttribute("loop")).toBe(true);
    expect(video?.hasAttribute("playsinline")).toBe(true);
    expect(video?.muted).toBe(true);
    expect(video?.getAttribute("preload")).toBe("metadata");
    expect(source?.getAttribute("src")).toBe("/manus-storage/autoapply-hero-bright-loop_946dfd52.mp4");
  });
});
