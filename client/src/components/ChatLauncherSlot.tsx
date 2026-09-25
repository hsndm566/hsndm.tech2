import { lazy, Suspense } from "react";

const DISABLED = import.meta.env.VITE_ENABLE_CHAT_WIDGET === "false";
const ChatLauncher = lazy(() => import("./ChatLauncher"));

/**
 * Loads the official Chatwoot bootstrap unless explicitly disabled. The
 * bootstrap itself fails closed unless both the self-hosted Chatwoot base URL
 * and Website Inbox token are configured.
 */
export function ChatLauncherSlot() {
  if (DISABLED) return null;
  return <Suspense fallback={null}><ChatLauncher /></Suspense>;
}
