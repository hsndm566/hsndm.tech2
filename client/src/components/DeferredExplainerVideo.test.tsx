// @vitest-environment jsdom
import React from "react";
import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DeferredExplainerVideo } from "./DeferredExplainerVideo";

describe("DeferredExplainerVideo", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("waits to mount the video source until the explainer is near the viewport", () => {
    let observe: ((entries: IntersectionObserverEntry[]) => void) | undefined;
    class MockIntersectionObserver {
      constructor(callback: (entries: IntersectionObserverEntry[]) => void) { observe = callback; }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() { return []; }
      root = null;
      rootMargin = "360px 0px";
      thresholds = [0];
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const { container } = render(<DeferredExplainerVideo src="/manus-storage/explainer.mp4" className="video-placeholder" ariaLabel="Explainer" unavailableLabel="Unavailable" />);
    expect(container.querySelector("source")).toBeNull();
    expect(container.querySelector("[aria-busy='true']")).toBeTruthy();

    act(() => observe?.([{ isIntersecting: true } as IntersectionObserverEntry]));

    expect(container.querySelector("source")?.getAttribute("src")).toBe("/manus-storage/explainer.mp4");
    expect(container.querySelector("video")?.getAttribute("preload")).toBe("metadata");
  });
});
