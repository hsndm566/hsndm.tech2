import React, { type AnchorHTMLAttributes, type MouseEvent } from "react";

type LanguageTransitionLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function LanguageTransitionLink({ href, onClick, ...props }: LanguageTransitionLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    event.preventDefault();
    document.documentElement.dataset.localeTransition = "out";
    window.setTimeout(() => window.location.assign(href), 180);
  };

  return <a {...props} href={href} onClick={handleClick} />;
}
