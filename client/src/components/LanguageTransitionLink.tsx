import React, { type AnchorHTMLAttributes, type MouseEvent } from "react";
import { useLocation } from "wouter";

type LanguageTransitionLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function LanguageTransitionLink({ href, onClick, ...props }: LanguageTransitionLinkProps) {
  const [location] = useLocation();
  const targetHref = location.startsWith("/ar") ? (location.slice(3) || "/") : `/ar${location === "/" ? "" : location}`;
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const targetLocale = targetHref.startsWith("/ar") ? "ar" : "en";
    document.cookie = `autoapply_preferred_locale=${targetLocale}; Path=/; Max-Age=15552000; SameSite=Lax; Secure`;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    event.preventDefault();
    document.documentElement.dataset.localeTransition = "out";
    window.setTimeout(() => window.location.assign(targetHref || href), 180);
  };

  return <a {...props} href={targetHref || href} onClick={handleClick} />;
}
