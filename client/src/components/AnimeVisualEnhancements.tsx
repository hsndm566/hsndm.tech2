import { useEffect } from "react";

const landingRoutes = new Set(["/", "/ar"]);

/**
 * Keeps Anime.js deliberately scoped to the first public impression. The
 * library is dynamically imported after the landing route commits, so it never
 * loads for dashboard or support routes and does not replace native scroll
 * reveals elsewhere in the site.
 */
export function AnimeVisualEnhancements({ routeKey }: { routeKey: string }) {
  useEffect(() => {
    if (!landingRoutes.has(routeKey)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    const root = document.documentElement;
    const animations: Array<{ revert: () => unknown }> = [];

    void import("animejs").then(({ animate, stagger }) => {
      if (cancelled) return;

      const heroWords = Array.from(document.querySelectorAll<HTMLElement>("[data-anime-hero-word]"));
      const ledger = document.querySelector<HTMLElement>(".hero-ledger");
      const stats = Array.from(document.querySelectorAll<HTMLElement>(".hero-stats > div > div"));

      root.classList.add("has-anime-motion");

      if (heroWords.length) {
        animations.push(
          animate(heroWords, {
            opacity: [0, 1],
            y: [16, 0],
            delay: stagger(54),
            duration: 520,
            ease: "outQuart",
          }),
        );
      }

      if (ledger) {
        animations.push(
          animate(ledger, {
            opacity: [0, 1],
            y: [12, 0],
            delay: 260,
            duration: 480,
            ease: "outQuart",
          }),
        );
      }

      if (stats.length) {
        animations.push(
          animate(stats, {
            opacity: [0, 1],
            y: [8, 0],
            delay: stagger(55, { start: 420 }),
            duration: 380,
            ease: "outQuad",
          }),
        );
      }
    });

    return () => {
      cancelled = true;
      animations.forEach(animation => animation.revert());
      root.classList.remove("has-anime-motion");
    };
  }, [routeKey]);

  return null;
}
