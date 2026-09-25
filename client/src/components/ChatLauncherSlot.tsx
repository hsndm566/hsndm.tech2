import { lazy, Suspense } from "react";

const ChatLauncher = lazy(() => import("./ChatLauncher"));

/**
 * Always loads the lightweight Chatwoot bootstrap shell. The bootstrap itself
 * fails closed unless both the self-hosted Chatwoot base URL and Website Inbox
 * token are configured, so no separate legacy feature flag is required.
 */
export function ChatLauncherSlot() {
  return <Suspense fallback={null}><ChatLauncher /></Suspense>;
}
