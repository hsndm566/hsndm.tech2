/** Operational Clarity: render motion only when a supplied video exists and the device can afford it. */
import { useEffect, useState } from "react";
import { HERO_VIDEO_URL } from "@/lib/media";

type HeroMediaProps = { poster: string; alt: string };

export default function HeroMedia({ poster, alt }: HeroMediaProps) {
  const [mayRenderVideo, setMayRenderVideo] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    const sync = () => setMayRenderVideo(Boolean(HERO_VIDEO_URL) && mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return (
    <>
      <img className="hero-image hero-poster" src={poster} alt={alt} />
      {mayRenderVideo && (
        <video className="hero-video" autoPlay muted loop playsInline preload="metadata" poster={poster} aria-hidden="true">
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>
      )}
    </>
  );
}
