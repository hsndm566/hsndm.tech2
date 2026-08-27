import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ArrowUpRight, Check, FileText, Loader2, ShieldCheck } from "lucide-react";
import { applyPageSeo } from "@/lib/seo";
import { Link, useLocation } from "wouter";
import { SearchableSaudiSelect } from "@/components/SearchableSaudiSelect";
import { saudiCities, saudiIndustries } from "@/lib/saudiTaxonomy";
import { trpc } from "@/lib/trpc";
import { trackEngagement } from "@/lib/analytics";

const campaignLanes = ["التقنية والبيانات", "الأعمال والعمليات", "المبيعات", "الهندسة والإنشاءات", "الضيافة والخدمات", "مجال آخر"];
const WHATSAPP_NUMBER = "966571448656";
const plans = {
  starter: { name: "Starter", price: "٩٩" },
  pro: { name: "Pro", price: "١٤٩" },
  founder: { name: "Founder", price: "٢٤٩" },
} as const;
type PlanKey = keyof typeof plans;

function selectedPlanFromLocation(): PlanKey | null {
  const value = new URLSearchParams(window.location.search).get("plan");
  return value && value in plans ? value as PlanKey : null;
}
const handoffSteps = [
  ["نراجع ملخص حملتك", "نتأكد من الاسم، البريد، والمسار الوظيفي."],
  ["نجهّز رسالتك بالعربية", "نضيف التفاصيل كي تبدأ المحادثة بوضوح."],
  ["نفتح WhatsApp", "ستظهر رسالتك الجاهزة خلال لحظات."],
] as const;

export default function ArabicEnquire() {
  const [, setLocation] = useLocation();
  const reportBlockedHandoff = trpc.campaign.clientIssue.reportBlockedWhatsAppHandoff.useMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [city, setCity] = useState("Jeddah");
  const [industry, setIndustry] = useState("Technology & Software");
  const [fileName, setFileName] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [contactChoice, setContactChoice] = useState<"whatsapp" | "email" | "web">("whatsapp");
  const [authorized, setAuthorized] = useState(false);
  const [receipt, setReceipt] = useState<{ reference: string; timestamp: string; channel: string } | null>(null);
  const [handoffBlocked, setHandoffBlocked] = useState(false);
  const [selectedPlan] = useState<PlanKey | null>(selectedPlanFromLocation);
  const secureEnquiry = trpc.campaign.enquiry.submit.useMutation();

  useEffect(() => {
    applyPageSeo({
      title: "ابدأ حملتك | أوتوأبلاي السعودية",
      description: "ابدأ حملة AutoApply SA للبحث عن وظيفة داخل السعودية وشارك الأدوار المستهدفة وتفضيلاتك قبل اعتماد اتجاه الحملة.",
      path: "/ar/enquire",
    });
  }, []);

  useEffect(() => {
    if (selectedPlan) trackEngagement("plan_selected", { plan: plans[selectedPlan].name, page: window.location.pathname, source: "enquire-query", language: "Arabic" });
  }, [selectedPlan]);

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => setFileName(event.target.files?.[0]?.name || "");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowPreview(true);
    setReceipt(null);
    trackEngagement("campaign_brief_started", { page: window.location.pathname, plan: selectedPlan ? plans[selectedPlan].name : "none", language: "Arabic" });
    trackEngagement("campaign_brief_completed", { page: window.location.pathname, plan: selectedPlan ? plans[selectedPlan].name : "none", language: "Arabic" });
  };

  const message = () => [
      "مرحباً AutoApply SA، أرغب في بدء حملة تقديم.",
      `الاسم: ${name}`,
      `البريد الإلكتروني: ${email}`,
      `المسار الوظيفي: ${role}`,
      `المدينة المستهدفة: ${saudiCities.find(option => option.en === city)?.ar || city}`,
      `المجال المستهدف: ${saudiIndustries.find(option => option.en === industry)?.ar || industry}`,
      ...(selectedPlan ? [`الباقة المختارة: ${plans[selectedPlan].name} — ${plans[selectedPlan].price} ريال/شهريًا`] : []),
      fileName ? `السيرة المختارة: ${fileName} — سأرفقها في هذه المحادثة.` : "السيرة الذاتية: سأشاركها في هذه المحادثة.",
    ].join("\n");

  const confirmContact = () => {
    if (!authorized) return;
    const timestamp = new Date().toLocaleString("ar-SA");
    if (contactChoice === "web") {
      secureEnquiry.mutate({ fullName: name, email, targetRole: role, city, industry, language: "Arabic", campaignAuthorizationConfirmed: true }, { onSuccess: ({ reference }) => setReceipt({ reference, timestamp, channel: "استفسار ويب آمن" }) });
      return;
    }
    if (contactChoice === "email") {
      window.open(`mailto:apply@hsndm.tech?subject=${encodeURIComponent("ملخص حملة AutoApply SA")}&body=${encodeURIComponent(message())}`, "_blank", "noopener,noreferrer");
      setReceipt({ reference: `EMAIL-${Date.now().toString(36).toUpperCase()}`, timestamp, channel: "البريد الإلكتروني" });
      return;
    }
    const handoffWindow = window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message())}`, "_blank", "noopener,noreferrer");
    trackEngagement("whatsapp_handoff_opened", { page: window.location.pathname, plan: selectedPlan ? plans[selectedPlan].name : "none", language: "Arabic" });
    if (!handoffWindow) reportBlockedHandoff.mutate({ route: "/ar/enquire" });
    setHandoffBlocked(!handoffWindow);
    setReceipt({ reference: `WA-${Date.now().toString(36).toUpperCase()}`, timestamp, channel: "واتساب" });
  };

  return (
    <main className="journey-page arabic-journey" dir="rtl">
      <a className="skip-link" href="#campaign-brief">انتقل إلى ملخص الحملة</a>
      <header className="journey-header page-frame">
        <Link href="/ar" className="brand journey-brand" aria-label="الصفحة الرئيسية لأوتوأبلاي السعودية">
          <img src="/manus-storage/autoapply-symbol_80d77010.png" alt="" className="brand-mark" />
          <span>AutoApply <em>SA</em></span>
        </Link>
        <span className="journey-status"><i /> استلام الحملة / الخطوة 01</span>
      </header>

      <section className="enquiry-wrap page-frame">
        <nav className="breadcrumbs light-breadcrumbs" aria-label="مسار التنقل"><Link href="/ar">الرئيسية</Link><span>/</span><b>ابدأ حملتك</b></nav>
        {selectedPlan ? <p className="mb-4 border border-[#e5482a] bg-[#fff8f5] px-4 py-3 text-sm text-[#151515]">اخترت <b>{plans[selectedPlan].name}</b> — {plans[selectedPlan].price} ريال/شهريًا</p> : null}
        <div className="enquiry-grid">
          <aside className="enquiry-aside">
            <span className="rail-label">01 / ابدأ من هنا</span>
            <span className="rail-rule" />
            <h1>اجعل بحثك <i>يتحرّك بوضوح.</i></h1>
            <p>نموذج حملة خاص — لا يُرسل أي شيء من هذه الصفحة.</p>
            <div className="response-guard"><ShieldCheck size={17} /><div><b>حماية الاستجابة</b><span>لأسرع رد مباشر، أبقِ الصفحة مفتوحة وتابع عبر WhatsApp إذا لم يصلك رد خلال يوم عمل واحد.</span></div></div>
          </aside>

          <form id="campaign-brief" className="campaign-form" onSubmit={submit} aria-busy={secureEnquiry.isPending}>
            <div className="form-heading"><span>ملخص حملتك</span><b>الحقول المطلوبة مميزة بـ <em>*</em></b></div>
            <input type="hidden" name="selected-plan" value={selectedPlan || ""} />
            <label><span>الاسم الكامل <em>*</em></span><input required value={name} onChange={event => setName(event.target.value)} placeholder="كيف نُخاطبك؟" /></label>
            <label><span>البريد الإلكتروني <em>*</em></span><input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" /></label>
            <label><span>المسار الوظيفي المستهدف <em>*</em></span><select required value={role} onChange={event => setRole(event.target.value)}><option value="" disabled>اختر اتجاهاً</option>{campaignLanes.map(lane => <option key={lane} value={lane}>{lane}</option>)}</select></label>
            <div className="grid gap-4 md:grid-cols-2">
              <label><span>المدينة المستهدفة</span><SearchableSaudiSelect options={saudiCities} value={city} onChange={setCity} language="ar" placeholder="ابحث عن مدينة سعودية…" /></label>
              <label><span>المجال المستهدف</span><SearchableSaudiSelect options={saudiIndustries} value={industry} onChange={setIndustry} language="ar" placeholder="ابحث عن مجال…" /></label>
            </div>
            <label className="campaign-upload"><input type="file" accept=".pdf,.doc,.docx,.txt" onChange={chooseFile} /><span className="upload-icon"><FileText size={19} /></span><span><b>{fileName || "اختر سيرة ذاتية (اختياري)"}</b><small>PDF أو DOC أو DOCX أو TXT · يبقى الملف على جهازك في المعاينة</small></span><ArrowUpRight size={18} /></label>
            <div className="form-protection"><Check size={15} /> راجع أولاً التفاصيل التي ستشاركها. ملف السيرة المختار يبقى على جهازك ولا يُرسل من هذا النموذج.</div>
            <button className="button button-accent" type="submit">راجع خيارات التواصل <ArrowUpRight size={18} /></button>
            <Link href="/ar" className="form-back">العودة إلى نظرة المحرك</Link>
            {showPreview ? <div className="enquiry-review-stage" role="status"><span className="enquiry-review-stage__label">02 / مراجعة خاصة</span><span className="enquiry-review-stage__status"><Check aria-hidden="true" size={15} /> تبقى خطوة التواصل تحت تحكمك.</span></div> : null}
            {showPreview && <section className="mt-6 border border-black/15 bg-white p-4 text-black" aria-labelledby="handoff-preview-title"><p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#e5482a]">قبل التواصل</p><h2 id="handoff-preview-title" className="mt-2 text-xl font-semibold">راجع التفاصيل التي ستشاركها</h2><p className="mt-2 text-sm text-black/70">ستتم مشاركة: <b>الاسم والبريد والمسار الوظيفي والمدينة والمجال.</b> لن تُرسل السيرة الذاتية إلا إذا أرفقتها بنفسك بعد اختيار واتساب أو البريد.</p><dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><div><dt>الاسم</dt><dd>{name}</dd></div><div><dt>البريد</dt><dd>{email}</dd></div><div><dt>المسار</dt><dd>{role}</dd></div><div><dt>المدينة</dt><dd>{saudiCities.find(option => option.en === city)?.ar || city}</dd></div><div><dt>المجال</dt><dd>{saudiIndustries.find(option => option.en === industry)?.ar || industry}</dd></div><div><dt>السيرة المختارة</dt><dd>{fileName ? `${fileName} (يبقى على جهازك)` : "لم تُختر سيرة"}</dd></div></dl><fieldset className="mt-4"><legend className="font-semibold">اختر وسيلة التواصل</legend><div className="mt-2 grid gap-2 sm:grid-cols-3">{(["whatsapp", "email", "web"] as const).map(option => <label key={option} className="border border-black/15 p-3 text-sm"><input className="ml-2" type="radio" name="contact-choice" checked={contactChoice === option} onChange={() => setContactChoice(option)} />{option === "whatsapp" ? "واتساب" : option === "email" ? "البريد" : "استفسار ويب آمن"}</label>)}</div></fieldset><section className="mt-4 border-r-2 border-[#e5482a] bg-[#f7f4ed] p-3 text-sm"><h3 className="font-semibold">تفويض خطة الحملة</h3><p className="mt-1">المسار المستهدف: {role}. الموقع: {saudiCities.find(option => option.en === city)?.ar || city}. اللغة: العربية. قنوات التقديم والحجم والمدى الزمني تُحدّد لاحقاً في خطة مكتوبة.</p><p className="mt-2 font-medium">لن يُرسل أي طلب حتى توافق على خطة الحملة. يمكنك الإيقاف أو التعليق في أي وقت، وستتلقى سجل التقديمات.</p><label className="mt-3 flex gap-2"><input type="checkbox" checked={authorized} onChange={event => setAuthorized(event.target.checked)} />أوافق على طلب التواصل هذا وأفهم أنه لا يبدأ أي تقديم لصاحب عمل.</label></section><a className="mt-3 inline-flex text-sm underline underline-offset-4" href="/ar/campaign-report-sample">اطلع على نموذج تقرير الحملة التوضيحي</a>{secureEnquiry.error ? <p className="mt-3 text-sm text-red-700">تعذر إرسال الطلب الآمن الآن. استخدم البريد أو واتساب.</p> : null}<p className="mt-3 text-sm text-black/70">أنت تتحكم في إرساله.</p><button className="button button-accent mt-4" type="button" disabled={!authorized || secureEnquiry.isPending} onClick={confirmContact}>{secureEnquiry.isPending ? <><Loader2 className="handoff-inline-spinner" size={17} /> جارٍ الإرسال الآمن</> : contactChoice === "whatsapp" ? "المتابعة إلى واتساب مع تفاصيل طلبي" : `تأكيد عبر ${contactChoice === "web" ? "الويب الآمن" : "البريد"}`}</button>{handoffBlocked ? <p className="mt-3 text-sm">حظر المتصفح نافذة واتساب. استخدم البريد أو الويب الآمن بدلاً من ذلك.</p> : null}</section>}
            {receipt && <section className="mt-4 border border-[#e5482a] bg-[#fff8f5] p-4" role="status" aria-live="polite"><p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#e5482a]">إيصال التواصل</p><h2 className="mt-2 text-xl font-semibold">تم تجهيز طلب التواصل.</h2><p className="mt-2 text-sm">المرجع: <b>{receipt.reference}</b><br />الوقت: {receipt.timestamp}<br />الخطوة التالية: يراجع الفريق ملخصك خلال يوم عمل واحد. لم تُرسل سيرة ذاتية من هذه الصفحة.</p><p className="mt-3 text-sm">لإيقاف أو حذف طلب التواصل، راسل <a className="underline" href={`mailto:apply@hsndm.tech?subject=${encodeURIComponent(`Pause or delete ${receipt.reference}`)}`}>apply@hsndm.tech</a> مع رقم المرجع.</p></section>}
          </form>
        </div>
      </section>
    </main>
  );
}
