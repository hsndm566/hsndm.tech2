// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HeroMedia from "./HeroMedia";

describe("HeroMedia", () => {
  it("renders the approved poster first and mounts muted inline looping video only after interaction", async () => {
    const { container } = render(<HeroMedia alt="Automated job application workflow" />);
    const poster = container.querySelector("img.hero-media-poster");

    expect(poster?.getAttribute("src")).toContain("autoapply-hero-poster");
    expect(poster?.getAttribute("fetchpriority")).toBe("high");
    expect(container.querySelector("video")).toBeNull();

    fireEvent.pointerDown(window);
    await waitFor(() => expect(container.querySelector("video")).toBeTruthy());

    const video = container.querySelector("video");
    const source = container.querySelector("source");
    expect(video?.hasAttribute("autoplay")).toBe(false);
    expect(video?.hasAttribute("loop")).toBe(true);
    expect(video?.hasAttribute("playsinline")).toBe(true);
    expect(video?.muted).toBe(true);
    expect(video?.getAttribute("preload")).toBe("none");
    expect(video?.getAttribute("poster")).toContain("autoapply-hero-poster");
    expect(video?.className).toContain("hero-media-video");
    expect(video?.hasAttribute("controls")).toBe(false);
    expect(source?.getAttribute("src")).toBe("/manus-storage/autoapply-hero-seamless-mobile_1fdb8683.mp4");
  });
});
