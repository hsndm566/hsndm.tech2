/** Render the approved hero motion with a light, unobtrusive fallback if autoplay is unavailable. */
import { useState } from "react";
import { HERO_VIDEO_URL } from "@/lib/media";

type HeroMediaProps = { poster?: string; alt: string };

export default function HeroMedia({ alt }: HeroMediaProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className="hero-media absolute inset-0 overflow-hidden select-none pointer-events-none" aria-label={alt}>
      {HERO_VIDEO_URL && !videoFailed && (
        <video
          className="hero-media-video h-full w-full"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          controlsList="nodownload noplaybackrate"
          onError={() => setVideoFailed(true)}
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>
      )}
      {videoFailed && <span className="sr-only">The background video is unavailable. A light branded background remains available.</span>}
    </div>
  );
}
