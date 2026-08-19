import { MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

const WHATSAPP_NUMBER = "966571448656";

const pageMessages = {
  campaign: {
    en: "Hi AutoApply SA, I would like to discuss a Saudi Arabia job-application campaign.",
    ar: "مرحباً AutoApply SA، أود التحدث عن حملة تقديم داخل السعودية.",
  },
  ats: {
    en: "Hi AutoApply SA, I am viewing the ATS review and would like help with my CV.",
    ar: "مرحباً AutoApply SA، أنا أراجع فحص ATS وأرغب في المساعدة بشأن سيرتي الذاتية.",
  },
  enquiry: {
    en: "Hi AutoApply SA, I am viewing the campaign brief and would like help getting started.",
    ar: "مرحباً AutoApply SA، أنا أراجع ملخص الحملة وأرغب في المساعدة للبدء.",
  },
  pricing: {
    en: "Hi AutoApply SA, I have a question about your campaign plans and pricing.",
    ar: "مرحباً AutoApply SA، لدي سؤال عن باقات الحملة والأسعار.",
  },
  support: {
    en: "Hi AutoApply SA, I need help with the AutoApply SA service.",
    ar: "مرحباً AutoApply SA، أحتاج إلى المساعدة بشأن خدمة AutoApply SA.",
  },
  privacy: {
    en: "Hi AutoApply SA, I have a question about privacy or my campaign data.",
    ar: "مرحباً AutoApply SA، لدي سؤال عن الخصوصية أو بيانات حملتي.",
  },
  tracking: {
    en: "Hi AutoApply SA, I have a question about campaign tracking or the candidate dashboard.",
    ar: "مرحباً AutoApply SA، لدي سؤال عن تتبع الحملة أو لوحة المرشح.",
  },
} as const;

export function getWhatsAppFallbackMessage(location: string) {
  const arabic = location.startsWith("/ar");
  const language = arabic ? "ar" : "en";
  const normalizedPath = location.split("?")[0].replace(/\/$/, "") || "/";

  if (normalizedPath === "/ats") return pageMessages.ats[language];
  if (normalizedPath === "/enquire" || normalizedPath === "/ar/enquire") return pageMessages.enquiry[language];
  if (normalizedPath === "/pricing" || normalizedPath === "/ar/pricing") return pageMessages.pricing[language];
  if (normalizedPath === "/privacy" || normalizedPath === "/terms" || normalizedPath === "/ar/privacy" || normalizedPath === "/ar/terms") return pageMessages.privacy[language];
  if (normalizedPath === "/support" || normalizedPath === "/how-it-works" || normalizedPath === "/services" || normalizedPath === "/ar/support" || normalizedPath === "/ar/how-it-works" || normalizedPath === "/ar/services") return pageMessages.support[language];
  if (normalizedPath === "/dashboard" || normalizedPath === "/dashboard/settings" || normalizedPath.startsWith("/campaign/")) return pageMessages.tracking[language];
  return pageMessages.campaign[language];
}

export function WhatsAppBusinessCta() {
  const [location] = useLocation();
  const arabic = location.startsWith("/ar");
  const text = arabic ? "تحدث عبر WhatsApp" : "Chat on WhatsApp";
  const message = getWhatsAppFallbackMessage(location);
  return <a className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 border border-[#e5482a] bg-[#e5482a] px-4 py-3 font-mono text-xs text-[#151515] shadow-lg transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515] active:scale-[.97] sm:left-auto sm:right-4" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" aria-label={text}>
    <MessageCircle size={16} aria-hidden="true" />
    <span>{text}</span>
  </a>;
}
