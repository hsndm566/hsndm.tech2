/** Operational Clarity: render the approved hero motion wherever autoplay is supported, with a dark fallback if the asset fails. */
import { useState } from "react";
import { HERO_VIDEO_URL } from "@/lib/media";

type HeroMediaProps = { poster?: string; alt: string };

export default function HeroMedia({ alt }: HeroMediaProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0f0f0f] select-none pointer-events-none" aria-label={alt}>
      {HERO_VIDEO_URL && !videoFailed && (
        <video
          className="h-full w-full object-cover opacity-85"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          controlsList="nodownload noplaybackrate"
          onError={() => setVideoFailed(true)}
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>
      )}
      {videoFailed && <span className="sr-only">The background video is unavailable. The branded dark background remains available.</span>}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
    </div>
  );
}
