import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("HeroMedia", () => {
  it("uses the managed uploaded background video with silent, looping, non-interactive playback", () => {
    const component = readSource("client/src/components/HeroMedia.tsx");
    const media = readSource("client/src/lib/media.ts");

    expect(media).toContain('/manus-storage/autoapply-sa-loop-bg_7ecfd5bb.mp4');
    expect(component).toContain('autoPlay muted loop playsInline preload="metadata"');
    expect(component).toContain('pointer-events-none select-none');
    expect(component).toContain('aria-hidden="true"');
    expect(component).toContain('disablePictureInPicture');
    expect(component).toContain('min-width: 768px');
  });
});
