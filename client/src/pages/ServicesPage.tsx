import { ArrowUpRight, Check, MessageCircle } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";
import { applyPageSeo } from "@/lib/seo";

const whatsapp = "966571448656";

type ServiceTrack = {
  key: string;
  step: string;
  title: string;
  label: string;
  detail: string;
  points: string[];
  action: string;
  href: string;
};

type ServicesCopy = {
  kicker: string;
  title: string;
  intro: string;
  founder: string;
  choiceKicker: string;
  choice: string;
  tracks: ServiceTrack[];
  note: string;
  cta: string;
  back: string;
};

const englishCopy: ServicesCopy = {
  kicker: "WORK TRACKS",
  title: "Two connected services, with clear outcomes.",
  intro: "AutoApply SA — Saudi-focused job-application campaign support and practical web systems for small businesses in Jeddah.",
  founder: "An industrial engineer and automation strategist focused on simplifying operations and building measurable, practical tools.",
  choiceKicker: "CHOOSE A STARTING POINT",
  choice: "Start with the route that matches your immediate goal. Each route opens a conversation; neither begins work or collects payment.",
  tracks: [
    {
      key: "campaign",
      step: "01 / JOB SEARCH",
      title: "AutoApply SA",
      label: "For job seekers",
      detail: "Saudi-focused support for career matching, ATS review, campaign discussion, and visible candidate application tracking.",
      points: ["CV-led local starting point", "No submission before confirmation", "Visible tracking for agreed activity"],
      action: "Start a campaign discussion",
      href: "/enquire",
    },
    {
      key: "systems",
      step: "02 / BUSINESS SYSTEM",
      title: "Web & operations systems",
      label: "For small businesses",
      detail: "A separate path for a sales page, business website, booking flow, and lead capture that can grow into a simple operating system.",
      points: ["One-page site through five-page build", "Contact, booking, and lead follow-up", "Clear scope before work begins"],
      action: "Discuss a website project",
      href: `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi, I would like to discuss a website or operations system for my Saudi business.")}`,
    },
  ],
  note: "Custom digital projects begin with an agreed scope; final price and delivery terms are discussed before work starts. This page does not collect payment.",
  cta: "Explore the case study",
  back: "BACK TO HOME",
};

const arabicCopy: ServicesCopy = {
  kicker: "مسارات العمل",
  title: "خدمتان مترابطتان، بأهداف واضحة.",
  intro: "AutoApply SA: دعم لحملات التقديم للوظائف في السعودية وأنظمة ويب عملية للشركات الصغيرة في جدة.",
  founder: "مهندس صناعي واستراتيجي أتمتة يركز على تبسيط العمليات وبناء أدوات عملية قابلة للقياس.",
  choiceKicker: "اختر نقطة البداية",
  choice: "ابدأ بالمسار الذي يطابق هدفك الحالي. يفتح كل مسار محادثة، ولا يبدأ العمل أو يجمع أي مدفوعات.",
  tracks: [
    {
      key: "campaign",
      step: "01 / البحث عن عمل",
      title: "AutoApply SA",
      label: "للباحثين عن عمل",
      detail: "دعم موجّه للسعودية لمطابقة المسار ومراجعة ATS ومحادثة حملة التقديم ولوحة متابعة المرشح.",
      points: ["بدء محلي من السيرة الذاتية", "لا إرسال قبل التأكيد", "متابعة مرئية للطلبات المتفق عليها"],
      action: "ابدأ نقاش الحملة",
      href: "/ar/enquire",
    },
    {
      key: "systems",
      step: "02 / نظام أعمال",
      title: "أنظمة الويب والتشغيل",
      label: "للشركات الصغيرة",
      detail: "مسار منفصل لبناء صفحة مبيعات أو موقع أعمال أو نموذج حجز والتقاط العملاء مع إدارة بسيطة قابلة للنمو.",
      points: ["موقع من صفحة واحدة أو حتى 5 صفحات", "نموذج تواصل وحجز ومتابعة العملاء", "نطاق واضح قبل البدء"],
      action: "ناقش مشروع موقع",
      href: `https://wa.me/${whatsapp}?text=${encodeURIComponent("مرحباً، أود مناقشة موقع أو نظام تشغيل لنشاطي في السعودية.")}`,
    },
  ],
  note: "تبدأ المشاريع الرقمية المخصصة عادةً من نطاق متفق عليه، ويُناقش السعر النهائي قبل بدء العمل. لا تُجمع مدفوعات من هذه الصفحة.",
  cta: "استكشف دراسة الحالة",
  back: "العودة للرئيسية",
};

export default function ServicesPage({ language = "en" }: { language?: "en" | "ar" }) {
  const arabic = language === "ar";
  const root = arabic ? "/ar" : "/";
  const copy = arabic ? arabicCopy : englishCopy;

  useEffect(() => {
    applyPageSeo({
      title: `${arabic ? "الخدمات" : "Services"} | AutoApply SA`,
      description: copy.intro,
      path: arabic ? "/ar/services" : "/services",
    });
  }, [arabic, copy.intro]);

  return (
    <main className="min-h-screen bg-[#f3f0e9] text-[#151515]" dir={arabic ? "rtl" : "ltr"} lang={language}>
      <header className="border-b border-black/10 bg-[#fbf9f5]">
        <div className="page-frame flex items-center justify-between py-5">
          <Link href={root} className="font-bold">AutoApply <em className="text-[#e5482a]">SA</em></Link>
          <Link href={root} className="font-mono text-xs">{copy.back}</Link>
        </div>
      </header>
      <section className="page-frame py-16">
        <p className="font-mono text-xs text-[#e5482a]">{copy.kicker}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">{copy.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-black/70">{copy.intro}</p>
        <p className="mt-5 max-w-2xl border-s-4 border-[#e5482a] bg-white p-4 text-sm leading-6 text-black/75">{copy.founder}</p>

        <div className="mt-12 max-w-3xl border-y border-black/15 py-4">
          <p className="font-mono text-xs text-[#e5482a]">{copy.choiceKicker}</p>
          <p className="mt-2 text-sm leading-6 text-black/70">{copy.choice}</p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {copy.tracks.map((track) => {
            const titleId = `${language}-${track.key}-track`;
            const actionClass = "mt-8 inline-flex min-h-11 items-center gap-2 bg-[#151515] px-4 py-3 font-mono text-xs text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#e5482a] focus-visible:ring-offset-2 hover:bg-[#e5482a]";

            return (
              <article key={track.key} aria-labelledby={titleId} className="border border-black/10 border-s-4 border-s-[#e5482a] bg-white p-7">
                <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                  <span className="text-[#e5482a]">{track.step}</span>
                  <span className="text-black/60">{track.label}</span>
                </div>
                <h2 id={titleId} className="mt-5 text-3xl font-bold">{track.title}</h2>
                <p className="mt-4 min-h-20 leading-7 text-black/70">{track.detail}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {track.points.map((point) => <li key={point} className="flex gap-2"><Check size={16} className="shrink-0 text-[#e5482a]" />{point}</li>)}
                </ul>
                {track.href.startsWith("http") ? (
                  <a href={track.href} className={actionClass} style={{ color: "#fff" }} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} />{track.action}</a>
                ) : (
                  <Link href={track.href} className={actionClass} style={{ color: "#fff" }}><ArrowUpRight size={15} />{track.action}</Link>
                )}
              </article>
            );
          })}
        </div>

        <p className="mt-8 max-w-3xl text-sm leading-6 text-black/60">{copy.note}</p>
        <Link href={arabic ? "/ar/case-studies" : "/case-studies"} className="mt-8 inline-flex min-h-11 items-center gap-2 border border-black/20 px-4 py-3 font-mono text-xs text-[#151515] outline-none transition-colors hover:border-[#e5482a] hover:text-[#e5482a] focus-visible:ring-2 focus-visible:ring-[#e5482a] focus-visible:ring-offset-2"><ArrowUpRight size={15} />{copy.cta}</Link>
      </section>
    </main>
  );
}
