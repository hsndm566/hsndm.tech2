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

/**
 * Adds only a native, one-time Intersection Observer reveal state. CSS owns the
 * 300ms transition so users with reduced motion keep the fully static interface.
 */
export function NativeVisualEnhancements({ routeKey }: { routeKey: string }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    root.classList.add("has-native-motion");
    const targets = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));

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

    targets.forEach(target => observer.observe(target));

    return () => {
      observer.disconnect();
      root.classList.remove("has-native-motion");
      targets.forEach(target => target.classList.remove("is-visible"));
    };
  }, [routeKey]);

  return null;
}
