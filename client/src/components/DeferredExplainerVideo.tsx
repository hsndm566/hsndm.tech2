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
    <div ref={regionRef}>
      {isNearViewport && src && !hasFailed ? (
        <video className={className} autoPlay loop muted playsInline disablePictureInPicture controlsList="nodownload noplaybackrate" preload="metadata" aria-label={ariaLabel} onError={() => setHasFailed(true)}>
          <source src={src} type="video/mp4" />
          {children}
        </video>
      ) : (
        <div className={className} role={hasFailed ? "status" : undefined} aria-live={hasFailed ? "polite" : undefined} aria-label={hasFailed ? unavailableLabel : ariaLabel} aria-busy={!isNearViewport}>
          <span className="sr-only">{hasFailed ? unavailableLabel : ariaLabel}</span>
        </div>
      )}
    </div>
  );
}
