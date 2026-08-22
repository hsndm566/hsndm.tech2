/** Render the approved hero poster immediately and defer optional motion until the visitor interacts. */
import React, { useEffect, useState } from "react";
import { HERO_POSTER_URL, HERO_VIDEO_URL } from "@/lib/media";

type HeroMediaProps = { poster?: string; alt: string };

export default function HeroMedia({ alt }: HeroMediaProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoRequested, setVideoRequested] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const requestVideo = () => setVideoRequested(true);
    const options = { once: true, passive: true };

    window.addEventListener("pointerdown", requestVideo, options);
    window.addEventListener("touchstart", requestVideo, options);
    window.addEventListener("keydown", requestVideo, { once: true });

    return () => {
      window.removeEventListener("pointerdown", requestVideo);
      window.removeEventListener("touchstart", requestVideo);
      window.removeEventListener("keydown", requestVideo);
    };
  }, []);

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
      {videoRequested && HERO_VIDEO_URL && !videoFailed && (
        <video
          className={`hero-media-video h-full w-full${videoReady ? " is-ready" : ""}`}
          width={1920}
          height={1080}
          muted
          loop
          playsInline
          poster={HERO_POSTER_URL}
          preload="none"
          controls={false}
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          controlsList="nodownload noplaybackrate"
          onCanPlay={(event) => {
            void event.currentTarget.play().then(() => setVideoReady(true)).catch(() => setVideoFailed(true));
          }}
          onError={() => setVideoFailed(true)}
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>
      )}
      {videoFailed && <span className="sr-only">The background video is unavailable. A light branded background remains available.</span>}
    </div>
  );
}
