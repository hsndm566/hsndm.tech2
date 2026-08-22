import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("HeroMedia", () => {
  it("uses the compressed managed poster for first paint and defers optional muted looping video until interaction", () => {
    const component = readSource("client/src/components/HeroMedia.tsx");
    const media = readSource("client/src/lib/media.ts");

    expect(media).toContain('/manus-storage/autoapply-hero-seamless-mobile_1fdb8683.mp4');
    expect(media).toContain('/manus-storage/autoapply-explainer_0911e97f.mp4');
    expect(component).not.toContain('autoPlay');
    expect(component).toContain('muted');
    expect(component).toContain('loop');
    expect(component).toContain('playsInline');
    expect(component).toContain('pointer-events-none');
    expect(component).toContain('aria-hidden="true"');
    expect(component).toContain('disablePictureInPicture');
    expect(component).toContain('preload="none"');
    expect(component).toContain("poster={HERO_POSTER_URL}");
    expect(component).toContain('className="hero-media-poster h-full w-full"');
    expect(component).toContain('fetchPriority="high"');
    expect(component).toContain('const [videoRequested, setVideoRequested] = useState(false);');
    expect(component).toContain('window.addEventListener("pointerdown", requestVideo, options);');
    expect(component).toContain('videoRequested && HERO_VIDEO_URL');
    expect(component).toContain('onCanPlay={(event) => {');
    expect(component).toContain('controls={false}');
    expect(component).toContain('hero-media-video h-full w-full${videoReady ? " is-ready" : ""}');
    expect(component).toContain('onError={() => setVideoFailed(true)}');
    expect(component).not.toContain('prefers-reduced-motion: no-preference');
    expect(component).not.toContain('min-width: 768px');
  });
});
