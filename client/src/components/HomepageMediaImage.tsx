import React, { useState } from "react";

type HomepageMediaImageProps = {
  src: string;
  alt: string;
};

/** Keeps below-fold imagery visually present while its lazy resource is decoded. */
export function HomepageMediaImage({ src, alt }: HomepageMediaImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`homepage-media-surface${isLoaded ? " is-ready" : ""}`} aria-busy={!isLoaded}>
      <img
        className="homepage-media-image"
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
