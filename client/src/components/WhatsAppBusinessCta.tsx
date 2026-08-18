import { MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

const WHATSAPP_NUMBER = "966571448656";

export function WhatsAppBusinessCta() {
  const [location] = useLocation();
  const arabic = location.startsWith("/ar");
  const text = arabic ? "تواصل عبر WhatsApp" : "WhatsApp us";
  const message = arabic ? "مرحباً AutoApply SA، أود التحدث عن حملة تقديم داخل السعودية." : "Hi AutoApply SA, I would like to discuss a Saudi Arabia job-application campaign.";
  return <a className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 border border-[#e5482a] bg-[#e5482a] px-4 py-3 font-mono text-xs text-[#151515] shadow-lg transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515] active:scale-[.97] sm:left-auto sm:right-4" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" aria-label={text}>
    <MessageCircle size={16} aria-hidden="true" />
    <span>{text}</span>
  </a>;
}
