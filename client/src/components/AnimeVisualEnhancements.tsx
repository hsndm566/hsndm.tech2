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

    let cancelled = false;
    const root = document.documentElement;
    const scopeRoot = document.querySelector<HTMLElement>(".site-shell") ?? root;
    const animations: Array<{ revert: () => unknown }> = [];
    let cleanupScope: (() => void) | undefined;

    void import("animejs").then(({ animate, createScope, createTimeline, onScroll, stagger }) => {
      if (cancelled) return;

      const scope = createScope({
        root: scopeRoot,
        mediaQueries: { reducedMotion: "(prefers-reduced-motion)" },
      });

      scope.add((ctx) => {
        if (ctx?.matches.reducedMotion) return;

        const heroWords = Array.from(document.querySelectorAll<HTMLElement>("[data-anime-hero-word]"));
        const ledger = document.querySelector<HTMLElement>(".hero-ledger");
        const ledgerSteps = Array.from(document.querySelectorAll<HTMLElement>(".hero-ledger .ledger-route > div"));
        const ledgerDots = ledgerSteps.map((step) => step.querySelector<HTMLElement>(".status-dot")).filter((dot): dot is HTMLElement => Boolean(dot));
        const workflow = document.querySelector<HTMLElement>(".process-list");
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

        if (ledgerSteps.length === 3) {
          animations.push(
            createTimeline({
              delay: 760,
              loop: 2,
              loopDelay: 680,
              defaults: { duration: 230, ease: "out(3)" },
            })
              .add(ledgerSteps, { opacity: 0.56, scale: 0.985, duration: 1 })
              .add(ledgerDots, { opacity: 0.56, scale: 0.9, duration: 1 }, 0)
              .add(ledgerSteps[0], { opacity: 1, scale: 1 })
              .add(ledgerDots[0], { opacity: 1, scale: 1.25 })
              .add(ledgerSteps[1], { opacity: 1, scale: 1 })
              .add(ledgerDots[1], { opacity: 1, scale: 1.25 })
              .add(ledgerSteps[2], { opacity: 1, scale: 1 })
              .add(ledgerDots[2], { opacity: 1, scale: 1.25 })
              .add(ledgerSteps, { opacity: 1, scale: 1, duration: 140 })
              .add(ledgerDots, { opacity: 1, scale: 1, duration: 140 }, "<"),
          );
        }

        if (workflow) {
          animations.push(
            animate(workflow, {
              "--workflow-path-progress": [0, 1],
              duration: 780,
              ease: "outQuart",
              autoplay: onScroll({ target: workflow, repeat: false }),
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

      cleanupScope = () => scope.revert();
    });

    return () => {
      cancelled = true;
      animations.forEach(animation => animation.revert());
      cleanupScope?.();
      root.classList.remove("has-anime-motion");
    };
  }, [routeKey]);

  return null;
}
