/** Operational Clarity: render motion reliably with a solid dark fallback surface instead of a photographic placeholder. */
import { useEffect, useState } from "react";
import { HERO_VIDEO_URL } from "@/lib/media";

type HeroMediaProps = { poster?: string; alt: string };

export default function HeroMedia({ alt }: HeroMediaProps) {
  const [mayRenderVideo, setMayRenderVideo] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const sync = () => setMayRenderVideo(Boolean(HERO_VIDEO_URL) && mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return (
    <div className="absolute inset-0 bg-[#0f0f0f] overflow-hidden select-none pointer-events-none" aria-label={alt}>
      {mayRenderVideo && (
        <video 
          className="w-full h-full object-cover opacity-85 pointer-events-none select-none" 
          autoPlay 
          muted 
          loop 
          playsInline 
          preload="auto" 
          aria-hidden="true" 
          tabIndex={-1} 
          disablePictureInPicture 
          controlsList="nodownload noplaybackrate"
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30 pointer-events-none" />
    </div>
  );
}
