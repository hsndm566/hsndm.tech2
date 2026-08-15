import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ArrowUpRight, Check, FileText, Loader2, ShieldCheck } from "lucide-react";
import { applyPageSeo } from "@/lib/seo";
import { Link, useLocation } from "wouter";
import { SearchableSaudiSelect } from "@/components/SearchableSaudiSelect";
import { saudiCities, saudiIndustries } from "@/lib/saudiTaxonomy";
import { trpc } from "@/lib/trpc";

const campaignLanes = ["التقنية والبيانات", "الأعمال والعمليات", "المبيعات", "الهندسة والإنشاءات", "الضيافة والخدمات", "مجال آخر"];
const WHATSAPP_NUMBER = "966571448656";
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
  const [isHandingOff, setIsHandingOff] = useState(false);
  const [handoffStep, setHandoffStep] = useState(0);
  const [handoffBlocked, setHandoffBlocked] = useState(false);
  const [handoffHref, setHandoffHref] = useState("");

  useEffect(() => {
    applyPageSeo({
      title: "ابدأ حملتك | أوتوأبلاي السعودية",
      description: "ابدأ حملة أوتوأبلاي السعودية وشارك المعلومات الأساسية لبحثك عن وظيفة داخل المملكة.",
      path: "/ar/enquire",
    });
  }, []);

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => setFileName(event.target.files?.[0]?.name || "");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isHandingOff) return;

    const message = [
      "مرحباً AutoApply SA، أرغب في بدء حملة تقديم.",
      `الاسم: ${name}`,
      `البريد الإلكتروني: ${email}`,
      `المسار الوظيفي: ${role}`,
      `المدينة المستهدفة: ${saudiCities.find(option => option.en === city)?.ar || city}`,
      `المجال المستهدف: ${saudiIndustries.find(option => option.en === industry)?.ar || industry}`,
      fileName ? `السيرة المختارة: ${fileName} — سأرفقها في هذه المحادثة.` : "السيرة الذاتية: سأشاركها في هذه المحادثة.",
    ].join("\n");
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    const handoffWindow = window.open("about:blank", "autoapply-whatsapp");

    if (handoffWindow) handoffWindow.opener = null;
    else reportBlockedHandoff.mutate({ route: "/ar/enquire" });

    setHandoffBlocked(!handoffWindow);
    setHandoffHref(whatsappUrl);
    setHandoffStep(0);
    setIsHandingOff(true);
    window.setTimeout(() => setHandoffStep(1), 520);
    window.setTimeout(() => setHandoffStep(2), 1040);
    window.setTimeout(() => {
      if (handoffWindow) {
        handoffWindow.location.replace(whatsappUrl);
        setLocation(`/ar/thank-you${name ? `?name=${encodeURIComponent(name)}` : ""}`);
      }
    }, 1750);
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
        <div className="enquiry-grid">
          <aside className="enquiry-aside">
            <span className="rail-label">01 / ابدأ من هنا</span>
            <span className="rail-rule" />
            <h1>اجعل بحثك <i>يتحرّك بوضوح.</i></h1>
            <p>شارك المعلومات الأساسية للوظيفة التالية. لا يرسل هذا النموذج ملف السيرة الذي تختاره؛ ستضيفه أنت مباشرة في محادثة WhatsApp إن رغبت.</p>
            <div className="response-guard"><ShieldCheck size={17} /><div><b>حماية الاستجابة</b><span>لأسرع رد مباشر، أبقِ الصفحة مفتوحة وتابع عبر WhatsApp إذا لم يصلك رد خلال يوم عمل واحد.</span></div></div>
          </aside>

          <form id="campaign-brief" className="campaign-form" onSubmit={submit} aria-busy={isHandingOff}>
            <div className="form-heading"><span>ملخص حملتك</span><b>الحقول المطلوبة مميزة بـ <em>*</em></b></div>
            <label><span>الاسم الكامل <em>*</em></span><input required value={name} onChange={event => setName(event.target.value)} placeholder="كيف نُخاطبك؟" /></label>
            <label><span>البريد الإلكتروني <em>*</em></span><input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" /></label>
            <label><span>المسار الوظيفي المستهدف <em>*</em></span><select required value={role} onChange={event => setRole(event.target.value)}><option value="" disabled>اختر اتجاهاً</option>{campaignLanes.map(lane => <option key={lane} value={lane}>{lane}</option>)}</select></label>
            <div className="grid gap-4 md:grid-cols-2">
              <label><span>المدينة المستهدفة</span><SearchableSaudiSelect options={saudiCities} value={city} onChange={setCity} language="ar" placeholder="ابحث عن مدينة سعودية…" /></label>
              <label><span>المجال المستهدف</span><SearchableSaudiSelect options={saudiIndustries} value={industry} onChange={setIndustry} language="ar" placeholder="ابحث عن مجال…" /></label>
            </div>
            <label className="campaign-upload"><input type="file" accept=".pdf,.doc,.docx,.txt" onChange={chooseFile} /><span className="upload-icon"><FileText size={19} /></span><span><b>{fileName || "اختر سيرة ذاتية (اختياري)"}</b><small>PDF أو DOC أو DOCX أو TXT · يبقى الملف على جهازك في المعاينة</small></span><ArrowUpRight size={18} /></label>
            <div className="form-protection"><Check size={15} /> عند الإرسال، تُفتح رسالة WhatsApp جاهزة بالعربية لتشارك ملخص الحملة وتضيف سيرتك مباشرة.</div>
            <button className="button button-accent" type="submit" disabled={isHandingOff}>{isHandingOff ? <>جارٍ تجهيز المحادثة <Loader2 className="handoff-inline-spinner" size={17} /></> : <>المتابعة إلى WhatsApp <ArrowUpRight size={18} /></>}</button>
            <Link href="/ar" className="form-back">العودة إلى نظرة المحرك</Link>
            {isHandingOff && (
              <div className="whatsapp-handoff" role="status" aria-live="polite">
                <Loader2 size={25} className="handoff-spinner" />
                <div>
                  <b>{handoffBlocked ? "حظر المتصفح نافذة WhatsApp." : handoffSteps[handoffStep][0]}</b>
                  <span>{handoffBlocked ? "ملخص حملتك جاهز. استخدم الرابط الآمن أدناه لفتح WhatsApp يدوياً." : handoffSteps[handoffStep][1]}</span>
                  {handoffBlocked && handoffHref && <a href={handoffHref} target="_blank" rel="noreferrer" className="form-back">فتح WhatsApp يدوياً</a>}
                </div>
                <div className="handoff-steps" aria-label="تقدم فتح WhatsApp">{handoffSteps.map((step, index) => <span className={index <= handoffStep ? "active" : ""} key={step[0]}><i>{index < handoffStep ? "✓" : `0${index + 1}`}</i><small>{step[0]}</small></span>)}</div>
              </div>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
