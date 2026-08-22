/** Render the approved hero motion with a light, unobtrusive fallback if autoplay is unavailable. */
import React, { useState } from "react";
import { HERO_POSTER_URL, HERO_VIDEO_URL } from "@/lib/media";

type HeroMediaProps = { poster?: string; alt: string };

export default function HeroMedia({ alt }: HeroMediaProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  return (
    <div className="hero-media absolute inset-0 overflow-hidden select-none pointer-events-none" role="img" aria-label={alt}>
      <img
        className="hero-media-poster h-full w-full"
        src={HERO_POSTER_URL}
        width={1920}
        height={1080}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
      />
      {HERO_VIDEO_URL && !videoFailed && (
        <video
          className={`hero-media-video h-full w-full${videoReady ? " is-ready" : ""}`}
          width={1920}
          height={1080}
          autoPlay
          muted
          loop
          playsInline
          poster={HERO_POSTER_URL}
          preload="metadata"
          controls={false}
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          controlsList="nodownload noplaybackrate"
          onLoadedData={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>
      )}
      {videoFailed && <span className="sr-only">The background video is unavailable. A light branded background remains available.</span>}
    </div>
  );
}
