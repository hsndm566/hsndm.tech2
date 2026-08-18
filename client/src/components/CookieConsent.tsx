import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";

type ConsentChoice = "accepted" | "necessary";

const COOKIE_NAME = "autoapply_optional_consent";
const maxAge = 60 * 60 * 24 * 180;

export function consentCookieAttributes(maxAgeValue: number, protocol = typeof window !== "undefined" ? window.location.protocol : "https:") {
  const secure = protocol === "https:" ? "; Secure" : "";
  return `Path=/; Max-Age=${maxAgeValue}; SameSite=Lax${secure}`;
}

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
  };

  if (consent) {
    return <button type="button" className="fixed bottom-[calc(max(.75rem,env(safe-area-inset-bottom))+4rem)] left-4 z-50 border border-black/15 bg-white px-3 py-2 font-mono text-[10px] text-black shadow-sm sm:bottom-4" onClick={() => { document.cookie = `${COOKIE_NAME}=; ${consentCookieAttributes(0)}`; setConsent(null); }}>{text.settings}</button>;
  }

  return (
    <aside className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-[80] mx-auto w-[calc(100%-1.5rem)] max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto border border-black/15 bg-[#151515] p-3 text-[#f3f0e9] shadow-2xl sm:inset-x-4 sm:bottom-4 sm:w-auto sm:max-h-[min(42vh,20rem)] sm:p-4" role="dialog" aria-labelledby="cookie-consent-title" aria-describedby="cookie-consent-description" dir={isArabic ? "rtl" : "ltr"} lang={isArabic ? "ar" : "en"}>
      <p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#e5482a]">{text.kicker}</p>
      <h2 id="cookie-consent-title" className="mt-1 text-sm font-semibold sm:text-base">{text.title}</h2>
      <p id="cookie-consent-description" className="mt-2 text-[11px] leading-4 text-white/75 sm:text-xs sm:leading-5">{text.detail}</p>
      <a className="mt-2 inline-flex text-xs text-[#e5482a] underline underline-offset-4 sm:mt-3" href={isArabic ? "/ar/privacy" : "/privacy"}>{text.privacy}</a>
      <div className="sticky bottom-0 mt-3 grid grid-cols-2 gap-2 bg-[#151515] pt-2 sm:mt-4 sm:flex sm:flex-nowrap">
        <button type="button" className="min-w-0 border border-[#e5482a] bg-[#e5482a] px-2 py-2 text-center font-mono text-[10px] leading-4 text-[#151515] sm:px-3" onClick={() => choose("accepted")}>{text.allow}</button>
        <button type="button" className="min-w-0 border border-white/35 px-2 py-2 text-center font-mono text-[10px] leading-4 text-white sm:px-3" onClick={() => choose("necessary")}>{text.necessary}</button>
      </div>
    </aside>
  );
}
