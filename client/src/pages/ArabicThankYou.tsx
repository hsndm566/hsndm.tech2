import { CheckCircle2, MessageCircle } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";
import { applyPageSeo } from "@/lib/seo";

export default function ArabicThankYou() {
  useEffect(() => { applyPageSeo({ title: "ملخص الحملة جاهز | أوتوأبلاي السعودية", description: "تم تجهيز ملخص حملتك للخطوة التالية في أوتوأبلاي السعودية.", path: "/ar/thank-you", noindex: true }); }, []);
  return <main className="journey-page arabic-journey" dir="rtl"><section className="thanks-wrap page-frame"><article className="thanks-card"><CheckCircle2 size={31} /><p className="thank-eyebrow">الخطوة التالية جاهزة</p><h1>ملخص حملتك <i>في طريقه.</i></h1><p>تم فتح WhatsApp برسالة عربية جاهزة. أرسلها عندما تكون مستعداً، ثم أرفق سيرتك الذاتية مباشرة في المحادثة إذا رغبت.</p><div className="thanks-actions"><Link href="/ar" className="button button-paper">العودة للرئيسية</Link><a href="https://wa.me/966571448656?text=مرحباً%20AutoApply%20SA،%20أرغب%20في%20بدء%20حملة%20تقديم." target="_blank" rel="noreferrer" className="text-button light-text">فتح WhatsApp <MessageCircle size={17} /></a></div></article></section></main>;
}
