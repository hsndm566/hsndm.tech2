import React, { useEffect, useRef, useState } from "react";

type DeferredExplainerVideoProps = {
  src: string;
  className: string;
  ariaLabel: string;
  unavailableLabel: string;
  children?: React.ReactNode;
};

/**
 * Keeps below-fold decorative motion out of the initial page transfer. The
 * source is mounted only when the explainer is close enough to be useful.
 */
export function DeferredExplainerVideo({ src, className, ariaLabel, unavailableLabel, children }: DeferredExplainerVideoProps) {
  const regionRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const target = regionRef.current;
    if (!target) return;
    if (!("IntersectionObserver" in window)) {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setIsNearViewport(true);
      observer.disconnect();
    }, { rootMargin: "360px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={regionRef} className="homepage-media-region">
      {isNearViewport && src && !hasFailed ? (
        <div className={`${className} homepage-media-surface${isVideoReady ? " is-ready" : ""}`} aria-busy={!isVideoReady} aria-label={ariaLabel}>
          {!isVideoReady && <span className="homepage-media-loader" aria-hidden="true"><i /><i /><i /></span>}
          <video className="homepage-media-video" autoPlay loop muted playsInline disablePictureInPicture controlsList="nodownload noplaybackrate" preload="metadata" onLoadedData={() => setIsVideoReady(true)} onError={() => setHasFailed(true)}>
            <source src={src} type="video/mp4" />
            {children}
          </video>
        </div>
      ) : (
        <div className={`${className} homepage-media-surface`} role={hasFailed ? "status" : undefined} aria-live={hasFailed ? "polite" : undefined} aria-label={hasFailed ? unavailableLabel : ariaLabel} aria-busy={!isNearViewport}>
          {!hasFailed && <span className="homepage-media-loader" aria-hidden="true"><i /><i /><i /></span>}
          <span className="sr-only">{hasFailed ? unavailableLabel : ariaLabel}</span>
        </div>
      )}
    </div>
  );
}
