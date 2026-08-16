import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";

type ConsentChoice = "accepted" | "necessary";

const COOKIE_NAME = "autoapply_optional_consent";
const maxAge = 60 * 60 * 24 * 180;

function getConsent(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const value = document.cookie.split("; ").find((entry) => entry.startsWith(`${COOKIE_NAME}=`))?.split("=")[1];
  return value === "accepted" || value === "necessary" ? value : null;
}

function saveConsent(choice: ConsentChoice) {
  document.cookie = `${COOKIE_NAME}=${choice}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;
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
    return <button type="button" className="fixed bottom-4 left-4 z-50 border border-black/15 bg-white px-3 py-2 font-mono text-[10px] text-black shadow-sm" onClick={() => { document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax; Secure`; setConsent(null); }}>{text.settings}</button>;
  }

  return (
    <aside className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md border border-black/15 bg-[#151515] p-4 text-[#f3f0e9] shadow-2xl" role="dialog" aria-labelledby="cookie-consent-title" aria-describedby="cookie-consent-description" dir={isArabic ? "rtl" : "ltr"} lang={isArabic ? "ar" : "en"}>
      <p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#e5482a]">{text.kicker}</p>
      <h2 id="cookie-consent-title" className="mt-1 text-base font-semibold">{text.title}</h2>
      <p id="cookie-consent-description" className="mt-2 text-xs leading-5 text-white/75">{text.detail}</p>
      <a className="mt-3 inline-flex text-xs text-[#e5482a] underline underline-offset-4" href={isArabic ? "/ar/privacy" : "/privacy"}>{text.privacy}</a>
      <div className="mt-4 flex flex-nowrap gap-2">
        <button type="button" className="border border-[#e5482a] bg-[#e5482a] px-3 py-2 font-mono text-[10px] text-[#151515]" onClick={() => choose("accepted")}>{text.allow}</button>
        <button type="button" className="border border-white/35 px-3 py-2 font-mono text-[10px] text-white" onClick={() => choose("necessary")}>{text.necessary}</button>
      </div>
    </aside>
  );
}
