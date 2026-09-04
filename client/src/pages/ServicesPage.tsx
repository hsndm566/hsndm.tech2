import { ArrowUpRight, Check, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";
import { applyPageSeo } from "@/lib/seo";

type ServiceCard = {
  step: string;
  title: string;
  detail: string;
  points: string[];
  image: string;
  imageAlt: string;
};

type ServicesCopy = {
  kicker: string;
  title: string;
  intro: string;
  promise: string;
  services: ServiceCard[];
  cta: string;
  ats: string;
  back: string;
};

const englishCopy: ServicesCopy = {
  kicker: "AUTOAPPLY SA / SERVICES",
  title: "One service. A clearer job search.",
  intro: "AutoApply SA is focused on Saudi job seekers: match better opportunities, prepare stronger applications, approve every submission, and keep the campaign visible from one place.",
  promise: "Nothing is submitted without your approval. Your campaign remains focused on the roles, industries, and locations you choose.",
  services: [
    {
      step: "01 / TARGET",
      title: "Campaign direction",
      detail: "Turn your CV, preferred cities, industries, and role targets into a focused Saudi job-search brief.",
      points: ["Role and city targeting", "CV-led campaign setup", "Clear scope before activity begins"],
      image: "/manus-storage/autoapply-desk_635170b2.jpg",
      imageAlt: "AutoApply SA campaign setup workspace",
    },
    {
      step: "02 / PREPARE",
      title: "Matching & application preparation",
      detail: "Find relevant openings and prepare the application context needed for each approved opportunity.",
      points: ["Relevant opportunity matching", "ATS-aware preparation", "Role-specific application context"],
      image: "/manus-storage/autoapply-flow_6c03602a.jpg",
      imageAlt: "AutoApply SA application workflow",
    },
    {
      step: "03 / APPROVE",
      title: "Approval & tracking",
      detail: "Review what was prepared before anything goes out, then keep submitted activity and next steps visible.",
      points: ["Approval before submission", "Visible application activity", "Pause or change direction when needed"],
      image: "/manus-storage/autoapply-hero-operations_ad007abc.jpg",
      imageAlt: "AutoApply SA campaign operations",
    },
  ],
  cta: "START A CAMPAIGN",
  ats: "CHECK YOUR CV",
  back: "BACK TO HOME",
};

const arabicCopy: ServicesCopy = {
  kicker: "AUTOAPPLY SA / الخدمات",
  title: "خدمة واحدة. بحث وظيفي أوضح.",
  intro: "يركز AutoApply SA على الباحثين عن عمل في السعودية: فرص أكثر صلة، طلبات أقوى، موافقتك قبل كل إرسال، ومتابعة واضحة للحملة من مكان واحد.",
  promise: "لا يتم إرسال أي طلب دون موافقتك. وتبقى الحملة مركزة على الأدوار والقطاعات والمدن التي تختارها.",
  services: [
    {
      step: "01 / الاستهداف",
      title: "اتجاه الحملة",
      detail: "نحوّل سيرتك والمدن والقطاعات والأدوار التي تفضلها إلى ملخص بحث وظيفي واضح داخل السعودية.",
      points: ["استهداف الأدوار والمدن", "إعداد الحملة من السيرة الذاتية", "نطاق واضح قبل بدء النشاط"],
      image: "/manus-storage/autoapply-desk_635170b2.jpg",
      imageAlt: "مساحة إعداد حملة AutoApply SA",
    },
    {
      step: "02 / التجهيز",
      title: "المطابقة وتجهيز الطلب",
      detail: "نحدد الفرص ذات الصلة ونجهز سياق الطلب المناسب لكل فرصة توافق عليها.",
      points: ["مطابقة فرص مناسبة", "تجهيز يراعي ATS", "سياق مخصص لكل وظيفة"],
      image: "/manus-storage/autoapply-flow_6c03602a.jpg",
      imageAlt: "مسار تقديم AutoApply SA",
    },
    {
      step: "03 / الموافقة",
      title: "الموافقة والمتابعة",
      detail: "تراجع ما تم تجهيزه قبل الإرسال، ثم تبقى الطلبات والخطوات التالية واضحة أمامك.",
      points: ["موافقة قبل الإرسال", "متابعة واضحة للنشاط", "إيقاف الحملة أو تعديل اتجاهها عند الحاجة"],
      image: "/manus-storage/autoapply-hero-operations_ad007abc.jpg",
      imageAlt: "عمليات حملة AutoApply SA",
    },
  ],
  cta: "ابدأ حملة",
  ats: "افحص سيرتك",
  back: "العودة للرئيسية",
};

export default function ServicesPage({ language = "en" }: { language?: "en" | "ar" }) {
  const arabic = language === "ar";
  const root = arabic ? "/ar" : "/";
  const enquiry = arabic ? "/ar/enquire" : "/enquire";
  const copy = arabic ? arabicCopy : englishCopy;

  useEffect(() => {
    applyPageSeo({
      title: `${arabic ? "خدمات التقديم الوظيفي" : "Job Application Services"} | AutoApply SA`,
      description: copy.intro,
      path: arabic ? "/ar/services" : "/services",
    });
  }, [arabic, copy.intro]);

  return (
    <main className="min-h-screen bg-[#f3f0e9] text-[#151515]" dir={arabic ? "rtl" : "ltr"} lang={language}>
      <header className="border-b border-black/10 bg-[#fbf9f5]">
        <div className="page-frame flex items-center justify-between gap-5 py-5">
          <Link href={root} className="inline-flex items-center gap-3" aria-label="AutoApply SA home">
            <img src="/manus-storage/autoapply-symbol_80d77010.png" alt="AutoApply SA brand mark" className="h-11 w-11 rounded-xl bg-[#151515] p-1 object-contain" width={44} height={44} />
            <span className="font-bold">AutoApply <em className="not-italic text-[#e5482a]">SA</em></span>
          </Link>
          <Link href={root} className="font-mono text-xs">{copy.back}</Link>
        </div>
      </header>

      <section className="page-frame py-16">
        <p className="font-mono text-xs text-[#e5482a]">{copy.kicker}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">{copy.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-black/70">{copy.intro}</p>
        <div className="mt-6 flex max-w-3xl items-start gap-3 border-s-4 border-[#e5482a] bg-white p-5 text-sm leading-6 text-black/75"><ShieldCheck className="mt-0.5 shrink-0 text-[#e5482a]" size={18} /><span>{copy.promise}</span></div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {copy.services.map((service) => (
            <article key={service.step} className="overflow-hidden border border-black/10 bg-white shadow-[0_20px_50px_rgba(21,21,21,.07)]">
              <div className="aspect-[16/10] overflow-hidden bg-[#151515]"><img src={service.image} alt={service.imageAlt} className="h-full w-full object-cover" loading="lazy" decoding="async" /></div>
              <div className="p-7">
                <p className="font-mono text-xs text-[#e5482a]">{service.step}</p>
                <h2 className="mt-4 text-2xl font-bold tracking-tight">{service.title}</h2>
                <p className="mt-4 min-h-24 leading-7 text-black/70">{service.detail}</p>
                <ul className="mt-5 space-y-3 text-sm">{service.points.map((point) => <li key={point} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#e5482a]" />{point}</li>)}</ul>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href={enquiry} className="inline-flex min-h-12 items-center gap-2 bg-[#e5482a] px-5 py-3 font-mono text-xs font-bold text-white"><ArrowUpRight size={16} />{copy.cta}</Link>
          <Link href="/ats" className="inline-flex min-h-12 items-center gap-2 border border-black/20 bg-white px-5 py-3 font-mono text-xs font-bold text-[#151515]"><ArrowUpRight size={16} />{copy.ats}</Link>
        </div>
      </section>
    </main>
  );
}
