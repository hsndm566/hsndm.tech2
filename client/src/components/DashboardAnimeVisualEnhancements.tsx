import { useEffect } from "react";

type DashboardAnimeVisualEnhancementsProps = {
  isReady: boolean;
};

/**
 * Gives authenticated dashboard evidence surfaces a single, short entrance
 * sequence after their data is ready. The dashboard keeps its real values and
 * remains fully visible when motion is reduced or Anime.js is unavailable.
 */
export function DashboardAnimeVisualEnhancements({ isReady }: DashboardAnimeVisualEnhancementsProps) {
  useEffect(() => {
    if (!isReady) return;

    let cancelled = false;
    let cleanupScope: (() => void) | undefined;

    void import("animejs").then(({ animate, createScope, stagger }) => {
      if (cancelled) return;

      const root = document.querySelector<HTMLElement>("[data-anime-dashboard-root]");
      if (!root) return;

      const scope = createScope({
        root,
        defaults: { duration: 360, ease: "out(3)" },
        mediaQueries: { reducedMotion: "(prefers-reduced-motion)" },
      });

      scope.add((ctx) => {
        if (ctx?.matches.reducedMotion) return;

        const metricCards = Array.from(root.querySelectorAll<HTMLElement>("[data-anime-dashboard-metric]"));
        const analyticsCards = Array.from(root.querySelectorAll<HTMLElement>("[data-anime-dashboard-analytics-card]"));
        const onboardingSteps = Array.from(root.querySelectorAll<HTMLElement>("[data-anime-dashboard-onboarding-step]"));
        const animateGroup = (targets: HTMLElement[], start: number) => {
          if (!targets.length) return;
          animate(targets, {
            opacity: { from: 0 },
            y: { from: 12 },
            delay: stagger(60, { start }),
          });
        };

        animateGroup(metricCards, 0);
        animateGroup(analyticsCards, 220);
        animateGroup(onboardingSteps, 480);
      });

      cleanupScope = () => scope.revert();
    });

    return () => {
      cancelled = true;
      cleanupScope?.();
    };
  }, [isReady]);

  return null;
}
