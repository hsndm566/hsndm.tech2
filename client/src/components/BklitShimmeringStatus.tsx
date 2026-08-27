import type { ReactNode } from "react";

/**
 * Lightweight CSS adaptation of Bklit UI's MIT-licensed ShimmeringText
 * component for campaign-state text. It intentionally avoids importing
 * Bklit's Motion runtime so the public home route keeps its existing bundle
 * and reduced-motion behavior.
 *
 * Source: https://github.com/bklit/bklit-ui/blob/main/packages/ui/src/components/shimmering-text.tsx
 */
export function BklitShimmeringStatus({ children }: { children: ReactNode }) {
  return <span className="bklit-shimmer-status">{children}</span>;
}
