import { useEffect } from "react";

type AnimeAnimation = { cancel?: () => void };
type AnimeApi = {
  animate: (targets: Element | Element[], parameters: Record<string, unknown>) => AnimeAnimation;
};

declare global {
  interface Window {
    anime?: AnimeApi;
  }
}

const buttonSelector = ".site-shell button, .site-shell a.button, .site-shell a.text-button, .site-shell a.plan-cta";
const cardSelector = ".site-shell .capability-card, .site-shell .plan-card, .site-shell .review-card, .site-shell .process-item";

/**
 * Keeps motion isolated from page content: Anime.js is loaded once from the CDN
 * and only transforms existing DOM elements. Reduced-motion users retain the
 * original static site with no opacity or transform changes.
 */
export function AnimeEnhancements() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.dataset.animeMotion = "reduced";
      return () => {
        delete root.dataset.animeMotion;
      };
    }

    root.dataset.animeMotion = "full";

    let cleanup = () => undefined;
    let frame = window.requestAnimationFrame(() => undefined);
    const script = document.querySelector<HTMLScriptElement>("script[data-animejs-cdn]");

    const initialise = () => {
      const anime = window.anime;
      if (!anime) return;

      const animations: AnimeAnimation[] = [];
      const disposers: Array<() => void> = [];
      const heroWords = Array.from(document.querySelectorAll<HTMLElement>("[data-anime-hero-word]"));

      if (heroWords.length) {
        animations.push(
          anime.animate(heroWords, {
            opacity: [0, 1],
            y: [22, 0],
            delay: (_: unknown, index: number) => index * 74,
            duration: 620,
            ease: "out(4)",
          }),
        );
      }

      const sections = Array.from(document.querySelectorAll<HTMLElement>(".site-shell main > section:not(.hero)"));
      const sectionObserver = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const section = entry.target as HTMLElement;
            animations.push(
              anime.animate(section, {
                opacity: [0, 1],
                y: [24, 0],
                duration: 560,
                ease: "out(4)",
              }),
            );
            sectionObserver.unobserve(section);
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -6%" },
      );

      sections.forEach(section => sectionObserver.observe(section));

      const attachInteractiveMotion = (element: HTMLElement, kind: "button" | "card") => {
        const onEnter = () => {
          animations.push(
            anime.animate(element, kind === "card"
              ? { perspective: 700, y: -5, rotateX: 1.2, rotateY: -1.2, boxShadow: "0 16px 30px rgba(21, 21, 21, .14)", duration: 220, ease: "out(3)" }
              : { y: -2, duration: 170, ease: "out(3)" }),
          );
        };
        const onLeave = () => {
          const restore = anime.animate(element, kind === "card"
            ? { perspective: 0, y: 0, rotateX: 0, rotateY: 0, boxShadow: "0 0 0 rgba(21, 21, 21, 0)", duration: 180, ease: "out(3)" }
            : { y: 0, scale: 1, duration: 150, ease: "out(3)" });
          animations.push(restore);
          window.setTimeout(() => {
            element.style.removeProperty("transform");
            element.style.removeProperty("box-shadow");
          }, 190);
        };
        const onPress = () => {
          animations.push(anime.animate(element, { scale: 0.97, duration: 110, ease: "out(3)" }));
        };
        const onRelease = () => {
          animations.push(anime.animate(element, { scale: 1, duration: 140, ease: "out(3)" }));
        };

        element.addEventListener("pointerenter", onEnter);
        element.addEventListener("pointerleave", onLeave);
        element.addEventListener("pointerdown", onPress);
        element.addEventListener("pointerup", onRelease);
        element.addEventListener("pointercancel", onRelease);
        disposers.push(() => {
          element.removeEventListener("pointerenter", onEnter);
          element.removeEventListener("pointerleave", onLeave);
          element.removeEventListener("pointerdown", onPress);
          element.removeEventListener("pointerup", onRelease);
          element.removeEventListener("pointercancel", onRelease);
        });
      };

      document.querySelectorAll<HTMLElement>(buttonSelector).forEach(button => attachInteractiveMotion(button, "button"));
      document.querySelectorAll<HTMLElement>(cardSelector).forEach(card => attachInteractiveMotion(card, "card"));

      cleanup = () => {
        sectionObserver.disconnect();
        disposers.forEach(dispose => dispose());
        animations.forEach(animation => animation.cancel?.());
      };
    };

    if (window.anime) {
      frame = window.requestAnimationFrame(initialise);
    } else {
      script?.addEventListener("load", initialise, { once: true });
    }

    return () => {
      window.cancelAnimationFrame(frame);
      script?.removeEventListener("load", initialise);
      cleanup();
      delete root.dataset.animeMotion;
    };
  }, []);

  return null;
}
