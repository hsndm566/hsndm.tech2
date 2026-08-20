import { RefreshCw, ShieldCheck } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/966571448656?text=Hi%20AutoApply%20SA%2C%20I%20need%20help%20with%20the%20website.";
const PAUSE_WHATSAPP_URL = "https://wa.me/966571448656?text=Hi%20AutoApply%20SA%20%E2%80%94%20I%20need%20to%20pause%20my%20campaign.%20Please%20confirm%20when%20the%20pause%20is%20effective.%20%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20AutoApply%20SA%20%E2%80%94%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A5%D9%8A%D9%82%D8%A7%D9%81%20%D8%AD%D9%85%D9%84%D8%AA%D9%8A.%20%D9%8A%D8%B1%D8%AC%D9%89%20%D8%AA%D8%A3%D9%83%D9%8A%D8%AF%20%D9%88%D9%82%D8%AA%20%D8%B3%D8%B1%D9%8A%D8%A7%D9%86%20%D8%A7%D9%84%D8%A5%D9%8A%D9%82%D8%A7%D9%81.";

export function RecoveryPanel({ arabic = false, loading = false }: { arabic?: boolean; loading?: boolean }) {
  const copy = arabic
    ? {
        eyebrow: loading ? "جارٍ تحميل الواجهة" : "تعذّر تحميل الواجهة",
        title: loading ? "نُجهّز صفحة آمنة وواضحة." : "تعذّر فتح واجهة التطبيق الآن.",
        detail: loading ? "إذا استغرق الأمر أكثر من لحظات، يمكنك إعادة المحاولة أو التواصل معنا بأمان." : "لم يُرسل أي نموذج أو سيرة ذاتية من هذه الصفحة. يمكنك إعادة المحاولة أو التواصل معنا مباشرة.",
        retry: "إعادة المحاولة",
        email: "راسلنا بالبريد",
        whatsapp: "افتح WhatsApp",
        pause: "أوقف حملتي بشكل عاجل",
        pauseNote: "سنؤكد لك وقت سريان الإيقاف قبل اعتبار أي تغيير نافذاً.",
        fallback: "فتح صفحة المساعدة الآمنة",
      }
    : {
        eyebrow: loading ? "Loading the interface" : "The interface did not load",
        title: loading ? "Preparing a clear, safe page." : "We could not load the application interface.",
        detail: loading ? "If this takes more than a moment, you can retry or contact us safely." : "No form or CV has been sent from this page. You can retry or contact us directly.",
        retry: "Try again",
        email: "Email us",
        whatsapp: "Open WhatsApp",
        pause: "Pause my campaign urgently",
        pauseNote: "We will confirm when the pause is effective before treating any change as complete.",
        fallback: "Open safe fallback page",
      };

  const fallbackPath = arabic ? "/fallback/ar" : "/fallback";

  return (
    <main className="min-h-screen bg-[#f3f0e9] px-5 py-16 text-[#151515]" dir={arabic ? "rtl" : "ltr"} lang={arabic ? "ar" : "en"}>
      <section className="mx-auto max-w-xl border border-black/15 bg-white p-6 shadow-sm sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[.12em] text-[#e5482a]">{copy.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1>
        <p className="mt-4 max-w-lg text-base leading-7 text-black/70">{copy.detail}</p>
        <p className="mt-4 flex items-center gap-2 text-sm font-medium"><ShieldCheck size={17} className="text-[#e5482a]" />{arabic ? "لم تُرفع أي سيرة ذاتية." : "No CV has been uploaded."}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-2 bg-[#151515] px-4 py-3 font-mono text-xs text-white transition-transform active:scale-[.97]"><RefreshCw size={15} />{copy.retry}</button>
          <a className="border border-black/20 px-4 py-3 font-mono text-xs text-[#151515]" href="mailto:apply@hsndm.tech">{copy.email}</a>
          <a className="border border-black/20 px-4 py-3 font-mono text-xs text-[#151515]" href={WHATSAPP_URL} target="_blank" rel="noreferrer">{copy.whatsapp}</a>
        </div>
        <div className="mt-4 border-l-2 border-[#e5482a] bg-[#f8f5ef] px-4 py-3">
          <a className="font-mono text-xs font-semibold uppercase tracking-[.08em] text-[#151515] underline underline-offset-4" href={PAUSE_WHATSAPP_URL} target="_blank" rel="noreferrer">{copy.pause}</a>
          <p className="mt-2 text-xs leading-5 text-black/65">{copy.pauseNote}</p>
        </div>
        {!loading ? <a className="mt-6 inline-flex text-sm underline underline-offset-4" href={fallbackPath}>{copy.fallback}</a> : null}
      </section>
    </main>
  );
}
