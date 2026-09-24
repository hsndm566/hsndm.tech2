import { lazy, Suspense } from "react";

const DISABLED = import.meta.env.VITE_ENABLE_CHAT_WIDGET === "false";
const ChatLauncher = lazy(() => import("./ChatLauncher"));

/**
 * Loads the chat shell unless explicitly disabled. The widget performs its own
 * server-side readiness check and renders nothing when Hermes is unavailable.
 */
export function ChatLauncherSlot() {
  if (DISABLED) return null;
  return <Suspense fallback={null}><ChatLauncher /></Suspense>;
}
