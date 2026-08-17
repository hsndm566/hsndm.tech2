import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("HeroMedia", () => {
  it("uses the managed uploaded background video with silent, looping, non-interactive playback", () => {
    const component = readSource("client/src/components/HeroMedia.tsx");
    const media = readSource("client/src/lib/media.ts");

    expect(media).toContain('/manus-storage/autoapply-hero-bright-loop_946dfd52.mp4');
    expect(media).toContain('/manus-storage/autoapply-explainer_0911e97f.mp4');
    expect(component).toContain('autoPlay');
    expect(component).toContain('muted');
    expect(component).toContain('loop');
    expect(component).toContain('playsInline');
    expect(component).toContain('pointer-events-none');
    expect(component).toContain('aria-hidden="true"');
    expect(component).toContain('disablePictureInPicture');
    expect(component).toContain('preload="metadata"');
    expect(component).toContain('className="hero-media-video h-full w-full"');
    expect(component).toContain('onError={() => setVideoFailed(true)}');
    expect(component).not.toContain('prefers-reduced-motion: no-preference');
    expect(component).not.toContain('min-width: 768px');
  });
});
