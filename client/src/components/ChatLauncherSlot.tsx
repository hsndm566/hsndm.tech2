import { lazy, Suspense } from "react";

const ENABLED = import.meta.env.VITE_ENABLE_CHAT_WIDGET === "true";
const ChatLauncher = lazy(() => import("./ChatLauncher"));

/** A no-op slot by default; no chat code loads until an explicit verified enablement. */
export function ChatLauncherSlot() {
  if (!ENABLED) return null;
  return <Suspense fallback={null}><ChatLauncher /></Suspense>;
}
