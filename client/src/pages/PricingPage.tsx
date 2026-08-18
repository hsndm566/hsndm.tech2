import { Check, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import React, { useEffect } from "react";
import { applyPageSeo } from "@/lib/seo";

const plans = [
  { name: "Starter", price: "99", en: "A focused starting lane.", ar: "مسار بداية مركّز.", features: ["~40 applications", "Email + portal submit", "Weekly report"], featuresAr: ["نحو 40 طلب تقديم", "تقديم عبر البريد والمنصات", "تقرير أسبوعي"] },
  { name: "Pro", price: "149", en: "For active multi-channel momentum.", ar: "لزخم نشط عبر قنوات متعددة.", features: ["~90 applications", "Priority tailoring", "Daily report"], featuresAr: ["نحو 90 طلب تقديم", "تخصيص بأولوية", "تقرير يومي"], featured: true },
  { name: "Founder", price: "249", en: "High-touch targeting for a pivotal move.", ar: "استهداف عالي المتابعة لخطوة محورية.", features: ["~150 applications", "Multi-role targeting", "White-glove onboarding"], featuresAr: ["نحو 150 طلب تقديم", "استهداف أدوار متعددة", "تهيئة شخصية"] },
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

type PageCopy = {
  back: string; plans: string; confirmation: string; selected: string; discuss: string;
  comparisonKicker: string; comparisonTitle: string; oneApplication: string; swipeToCompare: string;
  neverKicker: string; neverTitle: string; neverItems: string[];
  paymentKicker: string; paymentTitle: string; paymentBody: string; paymentNote: string;
};

const en: PageCopy = {
  back: "BACK TO HOME", plans: "CAMPAIGN PLANS / SAR", confirmation: "The next step starts with a conversation and your confirmation.", selected: "MOST SELECTED", discuss: "DISCUSS THIS PLAN",
  comparisonKicker: "PLAN SCOPE / CLARIFIED", comparisonTitle: "Compare campaign support", oneApplication: "One application means one approved employer-role submission prepared and sent to one Saudi employer or its official portal. It does not include duplicate attempts or any submission you have not approved.", swipeToCompare: "Swipe the table to compare all plans.",
  neverKicker: "CAMPAIGN BOUNDARIES / OUR COMMITMENT", neverTitle: "What we never do", neverItems: ["Invent credentials, experience, or outcomes.", "Apply outside the roles, industries, and locations you approve.", "Submit an application where your consent is unclear.", "Make false representations about you or our service."],
  paymentKicker: "PAYMENT PATH / NOT CONNECTED", paymentTitle: "A Saudi payment gateway, when approved.", paymentBody: "A secure payment option through a Saudi-ready provider such as HyperPay, Moyasar, or Tap will appear only after the provider, account, and integration are approved. This page does not process a payment or store card data.", paymentNote: "This page is not a checkout or invoice. Final scope, coverage, and any payment arrangement are confirmed in a separate conversation before a campaign begins.",
};

const ar: PageCopy = {
  back: "العودة للرئيسية", plans: "خطط الحملة / ريال سعودي", confirmation: "تبدأ الخطوة التالية بمحادثة وتأكيد منك.", selected: "الأكثر اختياراً", discuss: "ناقش هذه الخطة",
  comparisonKicker: "نطاق الخطة / توضيح", comparisonTitle: "قارن دعم الحملة", oneApplication: "يعني طلب تقديم واحد إرسالاً واحداً معتمداً لوظيفة محددة لدى جهة توظيف واحدة داخل السعودية، عبر جهة التوظيف أو منصتها الرسمية. ولا يشمل ذلك النسخ المكررة أو التقديمات التي لم توافق عليها.", swipeToCompare: "اسحب الجدول لمقارنة جميع الخطط.",
  neverKicker: "حدود الحملة / وعدنا", neverTitle: "ما الذي لا نفعله أبدًا", neverItems: ["لا نخترع مؤهلات أو خبرات أو نتائج.", "لا نتقدم خارج الأدوار والقطاعات والمواقع التي توافق عليها.", "لا نرسل طلبًا عندما تكون موافقتك غير واضحة.", "لا نمثل أنفسنا أو نمثلك بصفة غير صحيحة."],
  paymentKicker: "مسار الدفع / قيد الإعداد", paymentTitle: "بوابة دفع سعودية عند اعتمادها.", paymentBody: "سيظهر خيار دفع آمن عبر مزود سعودي مثل HyperPay أو Moyasar أو Tap فقط بعد اختيار المزود واعتماد الحساب والتكامل. لا تُرسل هذه الصفحة أي عملية دفع ولا تحفظ بيانات بطاقات.", paymentNote: "لا تمثل هذه الصفحة بوابة دفع أو فاتورة. التغطية والنطاق النهائي وأي ترتيبات دفع تُؤكد في محادثة منفصلة قبل بدء أي حملة.",
};

export default function PricingPage({ language = "en" }: { language?: "en" | "ar" }) {
  const arabic = language === "ar";
  const copy = arabic ? ar : en;
  const root = arabic ? "/ar" : "/";
  const enquiry = arabic ? "/ar/enquire" : "/enquire";
  const title = arabic ? "خطط واضحة لحملة التقديم." : "Clear options for your campaign.";
  const description = arabic ? "هذه أسعار إرشادية لحملات التقديم داخل السعودية. لا يتم تحصيل أي دفعة من هذه الصفحة." : "These are provisional Saudi application-campaign prices. This page does not collect a payment.";

  useEffect(() => {
    applyPageSeo({ title: `${arabic ? "الأسعار" : "Pricing"} | AutoApply SA`, description, path: arabic ? "/ar/pricing" : "/pricing" });
  }, [arabic, description]);

  return <main className="min-h-screen bg-[#f3f0e9] text-[#151515]" dir={arabic ? "rtl" : "ltr"} lang={language}>
    <header className="border-b border-black/10 bg-[#fbf9f5]"><div className="page-frame flex items-center justify-between py-5"><Link href={root} className="font-bold">AutoApply <em className="text-[#e5482a]">SA</em></Link><Link href={root} className="font-mono text-xs">{copy.back}</Link></div></header>
    <section className="page-frame py-16">
      <p className="font-mono text-xs text-[#e5482a]">{copy.plans}</p><h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">{title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-black/70">{description}</p><div className="mt-5 flex items-center gap-2 text-sm"><ShieldCheck size={17} className="text-[#e5482a]" /><span>{copy.confirmation}</span></div>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">{plans.map((plan) => <article key={plan.name} className={`border p-7 ${plan.featured ? "border-[#e5482a] bg-[#151515] text-white" : "border-black/10 bg-white"}`}><div className="flex justify-between font-mono text-xs"><span>{plan.name}</span>{plan.featured && <span className="text-[#e5482a]">{copy.selected}</span>}</div><div className="mt-6 flex items-end gap-2"><strong className="text-5xl">{plan.price}</strong><span className="font-mono text-xs">SAR<br />{arabic ? "/ شهرياً" : "/ MO"}</span></div><p className="mt-5 min-h-12 text-sm opacity-75">{arabic ? plan.ar : plan.en}</p><ul className="mt-6 space-y-3 text-sm">{(arabic ? plan.featuresAr : plan.features).map((feature) => <li key={feature} className="flex gap-2"><Check size={16} className="shrink-0 text-[#e5482a]" />{feature}</li>)}</ul><Link href={enquiry} className={`mt-8 inline-flex items-center gap-2 px-4 py-3 font-mono text-xs ${plan.featured ? "bg-[#f3f0e9]" : "bg-[#151515]"}`} style={{ color: plan.featured ? "#151515" : "#ffffff" }}><MessageCircle size={15} />{copy.discuss}</Link></article>)}</div>

      <section className="mt-16" aria-labelledby="comparison-title"><p className="font-mono text-xs text-[#e5482a]">{copy.comparisonKicker}</p><h2 id="comparison-title" className="mt-3 text-3xl font-bold tracking-tight">{copy.comparisonTitle}</h2><p className="mt-4 max-w-3xl text-sm leading-6 text-black/70">{copy.oneApplication}</p><p className="mt-3 text-xs font-mono text-black/60 sm:hidden">↔ {copy.swipeToCompare}</p><div className="mt-4 overflow-x-auto border border-black/10 bg-white"><table className="min-w-[720px] w-full border-collapse text-left text-sm"><thead className="bg-[#151515] text-white"><tr><th className="p-4 font-mono text-xs">{arabic ? "المعيار" : "Comparison"}</th>{plans.map((plan) => <th key={plan.name} className="p-4 font-mono text-xs">{plan.name}<span className="mt-1 block text-white/60">{plan.price} SAR</span></th>)}</tr></thead><tbody>{comparisonRows.map((row, index) => <tr key={row.en} className={index % 2 ? "bg-[#fbf9f5]" : "bg-white"}><th scope="row" className="border-t border-black/10 p-4 font-semibold">{arabic ? row.ar : row.en}</th>{(arabic ? row.valuesAr : row.values).map((value, valueIndex) => <td className="border-t border-black/10 p-4 align-top text-black/70" key={`${row.en}-${valueIndex}`}>{value}</td>)}</tr>)}</tbody></table></div></section>

      <aside className="mt-12 border border-[#e5482a]/30 bg-[#151515] p-6 text-[#f3f0e9]" aria-labelledby="never-do-title"><p className="font-mono text-xs text-[#e5482a]">{copy.neverKicker}</p><h2 id="never-do-title" className="mt-3 text-2xl font-bold">{copy.neverTitle}</h2><ul className="mt-5 grid gap-3 sm:grid-cols-2">{copy.neverItems.map((item) => <li className="flex gap-2 text-sm leading-6" key={item}><ShieldCheck size={17} className="mt-0.5 shrink-0 text-[#e5482a]" />{item}</li>)}</ul></aside>
      <aside className="mt-10 max-w-3xl border border-black/10 bg-white p-6" aria-label={arabic ? "مسار الدفع القادم" : "Future payment path"}><p className="font-mono text-xs text-[#e5482a]">{copy.paymentKicker}</p><h2 className="mt-3 text-xl font-bold">{copy.paymentTitle}</h2><p className="mt-3 text-sm leading-6 text-black/70">{copy.paymentBody}</p></aside><p className="mt-8 max-w-3xl text-sm text-black/60">{copy.paymentNote}</p>
    </section>
  </main>;
}
