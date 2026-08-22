import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { consentCookieAttributes } from "@/lib/consentCookie";

type ConsentChoice = "accepted" | "necessary";

const COOKIE_NAME = "autoapply_optional_consent";
const maxAge = 60 * 60 * 24 * 180;

function getConsent(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const value = document.cookie.split("; ").find((entry) => entry.startsWith(`${COOKIE_NAME}=`))?.split("=")[1];
  return value === "accepted" || value === "necessary" ? value : null;
}

function saveConsent(choice: ConsentChoice) {
  document.cookie = `${COOKIE_NAME}=${choice}; ${consentCookieAttributes(maxAge)}`;
}

function loadAnalytics() {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined;
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID as string | undefined;
  if (!endpoint || !websiteId || document.querySelector("script[data-autoapply-analytics]")) return;
  const script = document.createElement("script");
  script.defer = true;
  script.src = `${endpoint.replace(/\/$/, "")}/umami`;
  script.dataset.websiteId = websiteId;
  script.dataset.autoapplyAnalytics = "true";
  document.head.appendChild(script);
}

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentChoice | null>(() => getConsent());
  const [location] = useLocation();
  const isArabic = location.startsWith("/ar");
  const text = isArabic ? {
    kicker: "خيارات الخصوصية",
    title: "تحليلات اختيارية",
    detail: "تبقى التحليلات الاختيارية معطّلة ما لم تسمح بها. ويحفظ التخزين الضروري اختيارك.",
    allow: "السماح بالتحليلات",
    necessary: "الضروري فقط",
    settings: "إعدادات ملفات الارتباط",
    privacy: "سياسة الخصوصية",
  } : {
    kicker: "Privacy choices",
    title: "Optional analytics",
    detail: "Optional analytics stay off unless you allow them. Necessary storage saves this choice.",
    allow: "Allow analytics",
    necessary: "Use necessary only",
    settings: "Cookie settings",
    privacy: "Privacy Policy",
  };

  useEffect(() => {
    if (consent === "accepted") loadAnalytics();
  }, [consent]);

  const choose = (choice: ConsentChoice) => {
    saveConsent(choice);
    setConsent(choice);
    window.dispatchEvent(new CustomEvent("autoapply:optional-consent", { detail: { analytics: choice === "accepted" } }));
  };

  if (consent) {
    return <button type="button" className="cookie-settings-trigger fixed bottom-[max(.75rem,env(safe-area-inset-bottom))] left-4 z-50 border border-black/15 bg-white px-3 py-2 font-mono text-[10px] text-black shadow-sm sm:bottom-4" onClick={() => { document.cookie = `${COOKIE_NAME}=; ${consentCookieAttributes(0)}`; setConsent(null); }}>{text.settings}</button>;
  }

  return (
    <aside className="fixed inset-x-2 bottom-[max(.5rem,env(safe-area-inset-bottom))] z-[80] mx-auto w-[calc(100%-1rem)] max-w-md border border-black/15 bg-[#151515] p-2.5 text-[#f3f0e9] shadow-2xl sm:inset-x-auto sm:right-4 sm:bottom-4 sm:mx-0 sm:w-[min(30rem,calc(100vw-2rem))] sm:p-3" role="dialog" aria-modal="false" aria-labelledby="cookie-consent-title" aria-describedby="cookie-consent-description" dir={isArabic ? "rtl" : "ltr"} lang={isArabic ? "ar" : "en"}>
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <div className="min-w-0">
          <p className="hidden font-mono text-[10px] uppercase tracking-[.12em] text-[#e5482a] sm:block">{text.kicker}</p>
          <h2 id="cookie-consent-title" className="font-sans !text-sm font-semibold !leading-5 sm:mt-1">{text.title}</h2>
          <p id="cookie-consent-description" className="mt-0.5 font-sans text-[11px] leading-[.9rem] text-white/75 sm:mt-1 sm:leading-4">{text.detail} <a className="text-[#f3f0e9] underline underline-offset-4" href={isArabic ? "/ar/privacy" : "/privacy"}>{text.privacy}</a></p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-1.5 sm:flex sm:items-center sm:gap-2">
          <button type="button" className="min-w-0 border border-[#e5482a] bg-[#e5482a] px-2 py-1.5 text-center font-mono text-[10px] leading-4 text-[#151515] sm:py-2" onClick={() => choose("accepted")}>{text.allow}</button>
          <button type="button" autoFocus className="min-w-0 border border-white/35 px-2 py-1.5 text-center font-mono text-[10px] leading-4 text-white sm:py-2" onClick={() => choose("necessary")}>{text.necessary}</button>
        </div>
      </div>
    </aside>
  );
}
