import { Check, CreditCard, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import React, { useEffect } from "react";
import { applyPageSeo } from "@/lib/seo";

const plans = [
  { name: "Starter", slug: "starter", price: "99", en: "A focused starting lane.", ar: "مسار بداية مركّز.", features: ["~40 applications", "Email + portal submit", "Weekly report"], featuresAr: ["نحو 40 طلب تقديم", "تقديم عبر البريد والمنصات", "تقرير أسبوعي"] },
  { name: "Pro", slug: "pro", price: "149", en: "For active multi-channel momentum.", ar: "لزخم نشط عبر قنوات متعددة.", features: ["~90 applications", "Priority tailoring", "Daily report"], featuresAr: ["نحو 90 طلب تقديم", "تخصيص بأولوية", "تقرير يومي"], featured: true },
  { name: "Founder", slug: "founder", price: "249", en: "High-touch targeting for a pivotal move.", ar: "استهداف عالي المتابعة لخطوة محورية.", features: ["~150 applications", "Multi-role targeting", "White-glove onboarding"], featuresAr: ["نحو 150 طلب تقديم", "استهداف أدوار متعددة", "تهيئة شخصية"] },
];

const comparisonRows = [
  { en: "Tailoring depth", ar: "مستوى التخصيص", values: ["Focused CV and role alignment", "Priority CV and role tailoring", "Multi-role targeting and high-touch tailoring"], valuesAr: ["مواءمة مركزة للسيرة والدور", "تخصيص بأولوية للسيرة والدور", "استهداف أدوار متعددة وتخصيص عالي المتابعة"] },
  { en: "Review process", ar: "آلية المراجعة", values: ["Standard campaign review", "Priority campaign review", "White-glove onboarding review"], valuesAr: ["مراجعة قياسية للحملة", "مراجعة بأولوية للحملة", "مراجعة تهيئة شخصية"] },
  { en: "Channels", ar: "قنوات التقديم", values: ["Email and official portals", "Email and official portals", "Approved channels across target roles"], valuesAr: ["البريد والمنصات الرسمية", "البريد والمنصات الرسمية", "القنوات المعتمدة عبر الأدوار المستهدفة"] },
  { en: "Turnaround", ar: "وتيرة التنفيذ", values: ["Campaign queue", "Priority queue", "Coordinated campaign queue"], valuesAr: ["قائمة الحملة", "قائمة بأولوية", "قائمة حملة منسقة"] },
  { en: "Reporting cadence", ar: "وتيرة التقارير", values: ["Weekly", "Daily", "Daily with onboarding guidance"], valuesAr: ["أسبوعي", "يومي", "يومي مع إرشاد التهيئة"] },
  { en: "Support", ar: "الدعم", values: ["Campaign questions", "Priority campaign questions", "High-touch campaign guidance"], valuesAr: ["أسئلة الحملة", "أسئلة الحملة بأولوية", "إرشاد عالي المتابعة للحملة"] },
  { en: "Role and industry breadth", ar: "تنوع الأدوار والقطاعات", values: ["One focused role lane", "Active multi-channel role lane", "Multi-role target plan"], valuesAr: ["مسار دور واحد مركّز", "مسار دور نشط متعدد القنوات", "خطة استهداف متعددة الأدوار"] },
];

const copy = {
  en: {
    back: "BACK TO HOME", plans: "CAMPAIGN PLANS / SAR", confirmation: "The next step starts with your confirmation.", selected: "MOST SELECTED", pay: "PAY SECURELY", discuss: "DISCUSS THIS PLAN",
    comparisonKicker: "PLAN SCOPE / CLARIFIED", comparisonTitle: "Compare campaign support", comparisonRegion: "Campaign plan comparison table", swipe: "Swipe, scroll, or use the left and right arrow keys to compare all plans.",
    oneApplication: "One application means one approved employer-role submission prepared and sent to one Saudi employer or its official portal. It does not include duplicate attempts or any submission you have not approved.",
    neverKicker: "CAMPAIGN BOUNDARIES / OUR COMMITMENT", neverTitle: "What we never do", never: ["Invent credentials, experience, or outcomes.", "Apply outside the roles, industries, and locations you approve.", "Submit an application where your consent is unclear.", "Make false representations about you or our service."],
    paymentKicker: "PAYMENT & ONBOARDING", paymentTitle: "Secure checkout is now available.", paymentBody: "Choose a plan and continue to AutoApply SA's dedicated payment flow. Card details are entered only on Dodo Payments' secure hosted checkout.", paymentNote: "Your plan does not activate until payment and campaign scope are confirmed. You remain in control before any employer application is submitted.",
  },
  ar: {
    back: "العودة للرئيسية", plans: "خطط الحملة / ريال سعودي", confirmation: "تبدأ الخطوة التالية بتأكيد منك.", selected: "الأكثر اختياراً", pay: "ادفع بأمان", discuss: "ناقش هذه الخطة",
    comparisonKicker: "نطاق الخطة / توضيح", comparisonTitle: "قارن دعم الحملة", comparisonRegion: "جدول مقارنة خطط الحملة", swipe: "اسحب الجدول أو مرره أو استخدم سهمي اليمين واليسار لمقارنة جميع الخطط.",
    oneApplication: "يعني طلب تقديم واحد إرسالاً واحداً معتمداً لوظيفة محددة لدى جهة توظيف واحدة داخل السعودية، عبر جهة التوظيف أو منصتها الرسمية. ولا يشمل ذلك النسخ المكررة أو التقديمات التي لم توافق عليها.",
    neverKicker: "حدود الحملة / وعدنا", neverTitle: "ما الذي لا نفعله أبدًا", never: ["لا نخترع مؤهلات أو خبرات أو نتائج.", "لا نتقدم خارج الأدوار والقطاعات والمواقع التي توافق عليها.", "لا نرسل طلبًا عندما تكون موافقتك غير واضحة.", "لا نمثل أنفسنا أو نمثلك بصفة غير صحيحة."],
    paymentKicker: "الدفع وبدء الحملة", paymentTitle: "الدفع الآمن متاح الآن.", paymentBody: "اختر الباقة وانتقل إلى مسار الدفع المخصص لـ AutoApply SA. تُدخل بيانات البطاقة فقط في صفحة الدفع الآمنة لدى Dodo Payments.", paymentNote: "لا تُفعّل الخطة حتى يتم تأكيد الدفع ونطاق الحملة. وتبقى أنت المتحكم قبل إرسال أي طلب إلى جهة توظيف.",
  },
};

export default function PricingPage({ language = "en" }: { language?: "en" | "ar" }) {
  const arabic = language === "ar";
  const c = arabic ? copy.ar : copy.en;
  const root = arabic ? "/ar" : "/";
  const enquiry = arabic ? "/ar/enquire" : "/enquire";
  const title = arabic ? "خطط واضحة لحملة التقديم." : "Clear options for your campaign.";
  const description = arabic ? "خطط لحملات التقديم للوظائف في السعودية تبدأ من 99 ريالاً شهرياً. راجع النطاق وقارن الخطط وادفع بأمان." : "Saudi job-application campaign plans from 99 SAR/month. Review scope, compare plans, and pay securely.";

  const scrollComparison = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    event.currentTarget.scrollBy({ left: event.key === "ArrowRight" ? 160 : -160 });
  };

  useEffect(() => {
    applyPageSeo({ title: arabic ? "خطط حملات التقديم في السعودية | AutoApply SA" : "Saudi Job-Application Plans | AutoApply SA", description, path: arabic ? "/ar/pricing" : "/pricing" });
  }, [arabic, description]);

  return (
    <main className="min-h-screen bg-[#f3f0e9] text-[#151515]" dir={arabic ? "rtl" : "ltr"} lang={language}>
      <header className="border-b border-black/10 bg-[#fbf9f5]"><div className="page-frame flex items-center justify-between gap-5 py-5"><Link href={root} className="inline-flex items-center gap-3" aria-label="AutoApply SA home"><img src="/manus-storage/autoapply-symbol_80d77010.png" alt="AutoApply SA brand mark" className="h-11 w-11 rounded-xl bg-[#151515] p-1 object-contain" width={44} height={44} /><span className="font-bold">AutoApply <em className="not-italic text-[#e5482a]">SA</em></span></Link><Link href={root} className="font-mono text-xs">{c.back}</Link></div></header>

      <section className="page-frame py-16">
        <p className="font-mono text-xs text-[#e5482a]">{c.plans}</p><h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">{title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-black/70">{description}</p><div className="mt-5 flex items-center gap-2 text-sm"><ShieldCheck size={17} className="text-[#e5482a]" /><span>{c.confirmation}</span></div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className={`border p-7 ${plan.featured ? "border-[#e5482a] bg-[#151515] text-white" : "border-black/10 bg-white"}`}>
              <div className="flex justify-between font-mono text-xs"><span>{plan.name}</span>{plan.featured && <span className="text-[#e5482a]">{c.selected}</span>}</div>
              <div className="mt-6 flex items-end gap-2"><strong className="text-5xl">{plan.price}</strong><span className="font-mono text-xs">SAR<br />{arabic ? "/ شهرياً" : "/ MO"}</span></div>
              <p className="mt-5 min-h-12 text-sm opacity-75">{arabic ? plan.ar : plan.en}</p>
              <ul className="mt-6 space-y-3 text-sm">{(arabic ? plan.featuresAr : plan.features).map((feature) => <li key={feature} className="flex gap-2"><Check size={16} className="shrink-0 text-[#e5482a]" />{feature}</li>)}</ul>
              <div className="mt-8 flex flex-col gap-2">
                <a href={`https://pay.hsndm.tech/?plan=${plan.slug}`} className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#e5482a] px-4 py-3 font-mono text-xs font-bold text-white"><CreditCard size={15} />{c.pay}</a>
                <Link href={enquiry} className={`inline-flex min-h-11 items-center justify-center gap-2 border px-4 py-3 font-mono text-xs ${plan.featured ? "border-white/20 text-white" : "border-black/15 text-[#151515]"}`}><MessageCircle size={15} />{c.discuss}</Link>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-16" aria-labelledby="comparison-title">
          <p className="font-mono text-xs text-[#e5482a]">{c.comparisonKicker}</p><h2 id="comparison-title" className="mt-3 text-3xl font-bold tracking-tight">{c.comparisonTitle}</h2><p className="mt-4 max-w-3xl text-sm leading-6 text-black/70">{c.oneApplication}</p><p id="comparison-instructions" className="mt-3 font-mono text-xs text-black/60">↔ {c.swipe}</p>
          <div className="mt-4 overflow-x-auto border border-black/10 bg-white outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a] focus-visible:ring-offset-2" tabIndex={0} role="region" aria-label={c.comparisonRegion} aria-describedby="comparison-instructions" onKeyDown={scrollComparison}>
            <table className={`min-w-[720px] w-full border-collapse text-sm ${arabic ? "text-right" : "text-left"}`}>
              <thead><tr className="border-b border-black/10"><th className="p-4 font-mono text-xs">{arabic ? "المقارنة" : "COMPARE"}</th>{plans.map((plan) => <th key={plan.name} className="p-4 text-base">{plan.name}</th>)}</tr></thead>
              <tbody>{comparisonRows.map((row) => <tr key={row.en} className="border-b border-black/10 last:border-0"><th className="p-4 font-medium">{arabic ? row.ar : row.en}</th>{(arabic ? row.valuesAr : row.values).map((value, index) => <td key={`${row.en}-${plans[index].name}`} className="p-4 text-black/65">{value}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="border border-black/10 bg-white p-7"><p className="font-mono text-xs text-[#e5482a]">{c.neverKicker}</p><h2 className="mt-3 text-3xl font-bold">{c.neverTitle}</h2><ul className="mt-6 space-y-4">{c.never.map((item) => <li key={item} className="flex gap-3 text-sm leading-6"><Check className="mt-0.5 shrink-0 text-[#e5482a]" size={17} />{item}</li>)}</ul></div>
          <div className="border border-black/10 bg-[#151515] p-7 text-white"><p className="font-mono text-xs text-[#e5482a]">{c.paymentKicker}</p><h2 className="mt-3 text-3xl font-bold">{c.paymentTitle}</h2><p className="mt-5 leading-7 text-white/70">{c.paymentBody}</p><p className="mt-5 text-sm leading-6 text-white/55">{c.paymentNote}</p></div>
        </section>
      </section>
    </main>
  );
}
