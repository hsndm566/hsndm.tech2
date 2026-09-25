import { useEffect } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    chatwootSettings?: {
      hideMessageBubble?: boolean;
      position?: "left" | "right";
      locale?: string;
      type?: "standard" | "expanded_bubble";
      launcherTitle?: string;
      darkMode?: "light" | "auto";
    };
    chatwootSDK?: {
      run: (options: { websiteToken: string; baseUrl: string }) => void;
    };
    $chatwoot?: {
      setLocale?: (locale: string) => void;
    };
  }
}

const BASE_URL = String(import.meta.env.VITE_CHATWOOT_BASE_URL || "")
  .trim()
  .replace(/\/$/, "");
const WEBSITE_TOKEN = String(import.meta.env.VITE_CHATWOOT_WEBSITE_TOKEN || "").trim();
const CONFIGURED = Boolean(BASE_URL && WEBSITE_TOKEN);

let bootstrapStarted = false;

function bootstrapChatwoot(locale: "ar" | "en") {
  if (!CONFIGURED || bootstrapStarted) return;

  bootstrapStarted = true;
  window.chatwootSettings = {
    hideMessageBubble: false,
    position: "right",
    locale,
    type: "expanded_bubble",
    launcherTitle: locale === "ar" ? "تحدث معنا" : "Chat with us",
    darkMode: "auto",
  };

  const run = () => {
    if (!window.chatwootSDK) {
      bootstrapStarted = false;
      return;
    }

    window.chatwootSDK.run({
      websiteToken: WEBSITE_TOKEN,
      baseUrl: BASE_URL,
    });
  };

  if (window.chatwootSDK) {
    run();
    return;
  }

  const existing = document.querySelector<HTMLScriptElement>("script[data-autoapply-chatwoot]");
  if (existing) {
    existing.addEventListener("load", run, { once: true });
    existing.addEventListener("error", () => {
      bootstrapStarted = false;
    }, { once: true });
    return;
  }

  const script = document.createElement("script");
  script.src = `${BASE_URL}/packs/js/sdk.js`;
  script.async = true;
  script.defer = true;
  script.dataset.autoapplyChatwoot = "true";
  script.addEventListener("load", run, { once: true });
  script.addEventListener("error", () => {
    bootstrapStarted = false;
  }, { once: true });
  document.head.appendChild(script);
}

/**
 * Boots the official Chatwoot website widget only when its public base URL and
 * Website Inbox token are configured. Missing/invalid config fails closed and
 * leaves the AutoApply site unchanged.
 */
export function AutoApplyChatWidget() {
  const [location] = useLocation();
  const locale: "ar" | "en" = location.startsWith("/ar") ? "ar" : "en";

  useEffect(() => {
    if (!CONFIGURED) return;
    bootstrapChatwoot(locale);
  }, []);

  useEffect(() => {
    if (!CONFIGURED) return;
    window.$chatwoot?.setLocale?.(locale);
  }, [locale]);

  return null;
}
