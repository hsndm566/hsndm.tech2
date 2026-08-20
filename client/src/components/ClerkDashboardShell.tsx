import { type ReactNode } from "react";
import { ClerkSessionBoundary } from "@/components/ClerkSessionBoundary";
import { canUseClerkOnCurrentOrigin } from "@/lib/clerkOrigin";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

export function ClerkDashboardShell({ children }: { children: ReactNode }) {
  const enabled = Boolean(clerkPublishableKey) && canUseClerkOnCurrentOrigin();

  return <ClerkSessionBoundary enabled={enabled} publishableKey={clerkPublishableKey}>{children}</ClerkSessionBoundary>;
}
