import { useEffect } from "react";

const revealSelector = [
  ".site-shell main > section:not(.hero) h2",
  ".site-shell .capability-card",
  ".site-shell .process-item",
  ".site-shell .campaign-dashboard",
  ".site-shell .plan-card",
  ".site-shell .review-card",
  ".site-shell .faq-item",
  ".site-shell .map-frame",
].join(",");

const mobileSectionSelector = ".site-shell main > section:not(.hero)";

/**
 * Adds only a native, one-time Intersection Observer reveal state. CSS owns the
 * 300ms transition so users with reduced motion keep the fully static interface.
 */
export function NativeVisualEnhancements({ routeKey }: { routeKey: string }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const root = document.documentElement;
    root.classList.add("has-native-motion");
    const targets = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));
    const mobileSectionTargets = Array.from(document.querySelectorAll<HTMLElement>(mobileSectionSelector));
    mobileSectionTargets.forEach(target => target.classList.add("mobile-section-reveal-target"));
    const observerTargets = Array.from(new Set([...targets, ...mobileSectionTargets]));

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -5%" },
    );

    observerTargets.forEach(target => observer.observe(target));

    return () => {
      observer.disconnect();
      root.classList.remove("has-native-motion");
      observerTargets.forEach(target => target.classList.remove("is-visible"));
      mobileSectionTargets.forEach(target => target.classList.remove("mobile-section-reveal-target"));
    };
  }, [routeKey]);

  return null;
}
