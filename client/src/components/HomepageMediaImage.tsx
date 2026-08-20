import React, { useState } from "react";

type HomepageMediaImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/** Keeps below-fold imagery visually present while its lazy resource is decoded. */
export function HomepageMediaImage({ src, alt, width, height }: HomepageMediaImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`homepage-media-surface${isLoaded ? " is-ready" : ""}`} aria-busy={!isLoaded}>
      <img
        className="homepage-media-image"
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
