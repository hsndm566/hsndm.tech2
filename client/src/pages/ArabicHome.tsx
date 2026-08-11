/**
 * Arabic landing page. Copy is supplied by the user and mirrors the public English
 * campaign journey while retaining the shared Operational Clarity design system.
 */
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Globe2,
  Languages,
  MessageCircle,
  MoveLeft,
  Paperclip,
  ScanSearch,
  Send,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import HeroMedia from "@/components/HeroMedia";
import { applyPageSeo } from "@/lib/seo";
import { Link } from "wouter";

const MapView = lazy(async () => {
  const module = await import("@/components/Map");
  return { default: module.MapView };
});

const WHATSAPP_URL = "https://wa.me/966571448656?text=مرحباً%20AutoApply%20SA،%20أرغب%20في%20بدء%20حملة%20تقديم.";

const plans = [
  { name: "الباقة الأساسية", price: "99", descriptor: "مسار بداية مركّز.", features: ["حوالي 40 طلب تقديم", "تقديم عبر البريد الإلكتروني والمنصات", "تقرير أسبوعي"] },
  { name: "الباقة الاحترافية", price: "149", descriptor: "لزخم نشط عبر قنوات متعددة.", features: ["حوالي 90 طلب تقديم", "تخصيص ذو أولوية", "مساعدة Julie الرقمية", "تقرير يومي"], featured: true },
  { name: "باقة المؤسس", price: "249", descriptor: "استهداف عالي الدقة لخطوة مفصلية في مسارك المهني.", features: ["حوالي 150 طلب تقديم", "استهداف متعدد الوظائف", "تأهيل شامل ومخصص"] },
];

const campaignStages = [
  { label: "ملخص المرشح", title: "تنظيم الإشارات", detail: "يتم تنظيم تفضيلات الوظيفة والخبرة واللغة والتوفر في ملخص حملة قابل للاستخدام.", status: "الملخص جاهز" },
  { label: "مسارات الوظائف", title: "تحديد الاتجاه", detail: "يتم ترتيب الوظائف ذات الصلة حسب الأولوية بحيث تركز الحملة على الوظائف المناسبة لهذا الملف الشخصي.", status: "المطابقة جاهزة" },
  { label: "استمرار المتابعة", title: "إبقاء الوتيرة واضحة", detail: "التقارير، والتحقق من التسليم، والإجراءات اللاحقة تُبقي نشاط تقديم المرشح واضحاً وقابلاً للمتابعة.", status: "الحملة نشطة" },
];

const faqs = [
  { question: "هل بيانات سيرتي الذاتية خاصة؟", answer: "تُستخدم سيرتك الذاتية لمطابقة الطلبات وتخصيصها. يمكنك طلب حذفها في أي وقت، ولا تُباع كمنتج منفصل." },
  { question: "هل تتقدمون فعلياً لشركات حقيقية؟", answer: "صُممت الخدمة للوظائف الفعلية والمتاحة في السعودية، باستخدام البريد الإلكتروني والتقديم المباشر عبر المنصات، مع التحقق من صحة عناوين البريد الإلكتروني المستخدَمة." },
  { question: "ما اللغات المدعومة؟", answer: "تدعم الخدمة حالياً اللغتين العربية والإنجليزية للباحثين عن عمل في جميع أنحاء السعودية." },
  { question: "كيف أدفع؟", answer: "يمكن ترتيب الباقات الشهرية عبر STC Pay أو التحويل البنكي (الآيبان). يمكنك سؤال الفريق عن تفاصيل الدفع الحالية عند بدء حملتك." },
  { question: "متى أتوقع الرد؟", answer: "يراجع الفريق طلبات الحملة أولاً بأول. للحصول على أسرع رد مباشر، استخدم WhatsApp بعد إرسال ملخصك؛ وإذا لم تسمع رداً خلال يوم عمل واحد، أرسل متابعة قصيرة تتضمن اسمك والوظيفة المستهدفة." },
];

function RailLabel({ children }: { children: React.ReactNode }) {
  return <span className="rail-label">{children}</span>;
}

function StatusDot({ tone = "active" }: { tone?: "active" | "quiet" }) {
  return <span className={`status-dot ${tone}`} aria-hidden="true" />;
}

export default function ArabicHome() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [campaignStage, setCampaignStage] = useState(1);

  useEffect(() => {
    applyPageSeo({
      title: "أوتوأبلاي السعودية | محرّك التقديم الوظيفي",
      description: "AutoApply SA يبحث عن الوظائف في السعودية، ويُخصّص طلبات التقديم، ويرسلها عبر البريد الإلكتروني والمنصات بناءً على سيرتك الذاتية ولغتك المفضلة.",
      path: "/ar",
    });
  }, []);

  return (
    <div className="site-shell" lang="ar" dir="rtl">
      <header className="topbar" aria-label="التنقل الرئيسي">
        <Link className="brand" href="/ar" aria-label="الصفحة الرئيسية AutoApply SA">
          <img src="/manus-storage/autoapply-symbol_80d77010.png" alt="" className="brand-mark" />
          <span>AutoApply <em>SA</em></span>
        </Link>
        <nav className="desktop-nav" aria-label="روابط الصفحة">
          <a href="#how">كيف يعمل</a><a href="#upload">السيرة الذاتية</a><a href="#pricing">الأسعار</a><a href="#faq">الأسئلة</a>
        </nav>
        <Link href="/" className="language-link">English <ArrowLeft size={15} /></Link>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="arabic-hero-heading">
          <HeroMedia poster="/manus-storage/autoapply-hero-operations_ad007abc.jpg" alt="محترف يراجع طلبات توظيف عبر جهاز محمول" />
          <div className="hero-overlay" />
          <div className="hero-structure" aria-hidden="true"><span className="hero-grid-line one" /><span className="hero-grid-line two" /><span className="hero-grid-line three" /></div>
          <div className="hero-content page-frame" dir="ltr">
            <div className="hero-lead" dir="rtl">
              <div className="eyebrow light"><StatusDot /> محرك توظيف يعمل 24/7 <span /> جدة، المملكة العربية السعودية</div>
              <h1 id="arabic-hero-heading">طلباتك الوظيفية،<br /><i>تُعالَج</i> أثناء<br />نومك.</h1>
              <p>AutoApply SA يبحث عن الوظائف في السعودية، ويُخصّص طلبات التقديم، ويرسلها عبر البريد الإلكتروني والمنصات — بناءً على سيرتك الذاتية ولغتك المفضلة.</p>
              <div className="hero-actions"><Link className="button button-paper" href="/enquire">ابدأ حملتك <ArrowUpRight size={18} /></Link><a className="text-button light-text" href="#how">تعرّف على النظام <MoveLeft size={18} /></a></div>
              <div className="hero-note">ابتداءً من 99 ريال / شهرياً <b /> بدون بطاقة لبدء المحادثة</div>
              <div className="hero-trust-row"><span><ShieldCheck size={14} /> ابدأ بملخص موجز</span><span><Clock3 size={14} /> سنتواصل خلال يوم عمل واحد</span></div>
            </div>
            <div className="hero-ledger" dir="rtl" aria-label="حالة محرك التقديم">
              <div className="ledger-topline"><span>محرك التقديم</span><span>نشط / على مدار 24 ساعة</span></div>
              <div className="ledger-route"><div><StatusDot /> تم تحليل السيرة الذاتية</div><span /><div><StatusDot /> جارٍ مطابقة الوظائف</div><span /><div><StatusDot tone="quiet" /> جارٍ التقديم</div></div>
              <div className="ledger-record"><span className="record-number">03</span><div><b>الاستهداف جاهز</b><small>تمت مطابقة المهارات والخبرة واللغة</small></div><ArrowUpRight size={16} /></div>
              <div className="ledger-queue"><div className="queue-heading"><span>قائمة الحملة / معاينة</span><b>جدة · السعودية</b></div><div><StatusDot /> استلام بيانات السيرة الذاتية <span>جاهز</span></div><div><StatusDot /> مسار الوظائف السعودية <span>في الانتظار</span></div></div>
            </div>
            <div className="hero-stats" dir="rtl"><div><strong>500+</strong><span>وظيفة سعودية تم فحصها</span></div><div><strong>24/7</strong><span>محرك يعمل على مدار الساعة</span></div><div><strong>2</strong><span>لغتان مدعومتان</span></div></div>
          </div>
        </section>

        <section id="product" className="service-intro section-paper">
          <div className="page-frame split-layout"><aside className="section-rail"><RailLabel>01 / البنية التحتية</RailLabel><span className="rail-rule" /><p>ليست مجرد منصة توظيف أخرى</p></aside><div className="intro-main"><div className="section-kicker"><Zap size={15} /> البنية التحتية للتقديم</div><h2>كل ما يحتاجه بحث جاد عن عمل <i>لمواصلة التقدّم.</i></h2><p className="section-summary">من فهم السيرة الذاتية إلى متابعة الإرسال، يحوّل النظام بحثك عن وظيفة إلى إيقاع عمل منظم — وليس نسخاً ولصقاً في ساعات متأخرة من الليل.</p><div className="capability-grid"><article className="capability-card"><span className="capability-index">A/01</span><ScanSearch size={27} strokeWidth={1.6} /><h3>محرك التقديم</h3><p>تتم مطابقة تفاصيل سيرتك الذاتية مع الوظائف الفعلية المتاحة في السعودية، ويُخصَّص كل طلب حسب الوظيفة المعلن عنها.</p><span className="card-rule" /></article><article className="capability-card dark-card"><span className="capability-index">A/02</span><Languages size={27} strokeWidth={1.6} /><h3>مطابقة السيرة الذاتية</h3><p>إبراز الوظائف الأكثر ملاءمة أولاً، بحيث يتماشى جهدك مع ملفك الفعلي.</p><span className="card-rule" /></article><article className="capability-card accent-card"><span className="capability-index">A/03</span><Clock3 size={27} strokeWidth={1.6} /><h3>أتمتة العمليات</h3><p>المتابعات، وإعادة الإرسال، والتحقق من التسليم، كلها تساعد في الحفاظ على وتيرة نشاط التقديم.</p><span className="card-rule" /></article></div></div></div>
        </section>

        <section id="how" className="workflow-section section-ink">
          <div className="page-frame split-layout"><aside className="section-rail inverted"><RailLabel>02 / كيف يعمل</RailLabel><span className="rail-rule" /><p>ثلاث خطوات. بلا تقديم يدوي.</p></aside><div className="workflow-main"><div className="section-kicker inverse"><Sparkles size={15} /> واضح بالتصميم</div><h2>ضع بحثك <i>في نظام.</i></h2><p className="section-summary inverse-summary">ابدأ بما لديك بالفعل. ثم دع المحرك يحوّله إلى روتين تقديم منتظم.</p><div className="process-list"><article className="process-item"><div className="process-number">01</div><div className="process-content"><h3>ارفع سيرتك الذاتية</h3><p>أضف ملف PDF أو DOC أو DOCX أو TXT. مهاراتك وخبراتك ومسارك المهني تصبح نقطة الانطلاق.</p></div><FileText size={24} strokeWidth={1.4} /></article><article className="process-item"><div className="process-number">02</div><div className="process-content"><h3>حدّد الوظائف المستهدفة</h3><p>راجع أفضل مسارات الوظائف المتوافقة معك من بين الإعلانات في السعودية، ووجّه البحث نحو خطوتك القادمة.</p></div><Globe2 size={24} strokeWidth={1.4} /></article><article className="process-item active-process"><div className="process-number">03</div><div className="process-content"><h3>المحرك يقدّم على مدار الساعة</h3><p>الطلبات، وخطابات التقديم المخصصة، والمنصات، ورسائل البريد الإلكتروني، والتحقق من التسليم، كلها تسير بينما تُكمل يومك.</p></div><Send size={24} strokeWidth={1.4} /></article></div></div></div>
        </section>

        <section id="upload" className="upload-section section-paper">
          <div className="page-frame upload-grid"><div className="upload-image-wrap"><img src="/manus-storage/autoapply-desk_635170b2.jpg" alt="مساحة عمل جاهزة لبدء البحث عن وظيفة" /><div className="image-stamp"><span>ابدأ / 60 ثانية</span><ArrowUpRight size={17} /></div></div><div className="upload-copy"><div className="section-kicker"><Paperclip size={15} /> استلام السيرة الذاتية</div><h2>أضف سيرتك الذاتية. <i>اكتشف مساراتك.</i></h2><p className="section-summary">اختر أحدث نسخة من سيرتك الذاتية وأكمل المحادثة مباشرة مع الفريق.</p><div className="drop-zone has-file" aria-label="رفع السيرة الذاتية"><span className="drop-symbol"><FileText size={24} /></span><span className="drop-copy"><b>اختر أو أضف سيرتك الذاتية</b><small>PDF أو DOC أو DOCX أو TXT</small></span><span className="drop-arrow"><ArrowUpRight size={20} /></span></div><p className="privacy-note"><ShieldCheck size={16} /> هذه المعاينة التجريبية تحتفظ بالاختيار في متصفحك فقط. لبدء حملة فعلية، تابع مع الفريق أدناه.</p><a className="button button-ink" href={WHATSAPP_URL} target="_blank" rel="noreferrer">تابع عبر WhatsApp <MessageCircle size={18} /></a></div></div>
        </section>

        <section className="proof-strip" aria-label="خصائص الخدمة"><div className="page-frame proof-grid"><div><StatusDot /> إرسال موثّق</div><div><StatusDot /> تقديم عبر البريد الإلكتروني والمنصات</div><div><StatusDot /> الدفع عبر STC Pay أو الآيبان</div><div><StatusDot /> عربي / إنجليزي · المملكة العربية السعودية</div></div></section>

        <section className="campaign-preview section-ink">
          <div className="page-frame campaign-preview-grid"><div className="campaign-preview-copy"><div className="section-kicker inverse"><Clock3 size={15} /> دراسة حالة العملية</div><h2>ملخص واحد. <i>إيقاع تقديم أوضح.</i></h2><p className="section-summary inverse-summary">مسار الحملة / مثال توضيحي — البحث عن وظيفة في السعودية.</p><div className="campaign-switcher" role="tablist" aria-label="مراحل معاينة الحملة">{campaignStages.map((stage, index) => <button key={stage.label} className={campaignStage === index ? "active" : ""} role="tab" aria-selected={campaignStage === index} aria-controls="arabic-campaign-preview-status" onClick={() => setCampaignStage(index)}><span>0{index + 1}</span>{stage.label}</button>)}</div><Link href="/enquire" className="text-button light-text">ابدأ ملخص حملتك <MoveLeft size={17} /></Link></div><div id="arabic-campaign-preview-status" className="campaign-dashboard" aria-label="معاينة حالة الحملة"><div className="dashboard-top"><span>الحملة السعودية / معاينة</span><b>{campaignStages[campaignStage].status}</b></div><div className="dashboard-spotlight"><span>0{campaignStage + 1}</span><div><b>{campaignStages[campaignStage].title}</b><p>{campaignStages[campaignStage].detail}</p></div></div>{campaignStages.map((stage, index) => <button className={`dashboard-progress ${index === campaignStage ? "active" : ""} ${index > campaignStage ? "quiet" : ""}`} key={stage.label} onClick={() => setCampaignStage(index)}><span>0{index + 1}</span><div><b>{stage.label}</b><small>{index < campaignStage ? "الخطوة جاهزة" : index === campaignStage ? "المعاينة الحالية" : "الخطوة التالية"}</small></div>{index < campaignStage ? <Check size={16} /> : index === campaignStage ? <Clock3 size={16} /> : <ArrowUpRight size={16} />}</button>)}</div></div>
        </section>

        <section className="detail-section section-fog"><div className="page-frame detail-layout"><aside className="section-rail"><RailLabel>03 / ما تقدّمه الخدمة</RailLabel><span className="rail-rule" /><p>عمل واضح. لا وعود غامضة.</p></aside><div className="detail-content"><div><div className="section-kicker"><ScanSearch size={15} /> ما تقدّمه الخدمة</div><h2>الأجزاء المتحركة خلف <i>طلب تقديم مدروس.</i></h2></div><img className="flow-image" src="/manus-storage/autoapply-flow_6c03602a.jpg" alt="مساحة عمل توضّح عملية تقديم وظيفي منظمة" /><div className="detail-points"><article><span>01</span><p><b>فهم الإشارات.</b> تحليل سيرتك الذاتية، وتوفرك، ولغتك، والاتجاه المستهدف قبل اختيار أي وظيفة.</p></article><article><span>02</span><p><b>مطابقة واعية بالسياق.</b> التركيز على الوظائف التي يتوافق معها ملفك الشخصي فعلياً، بدلاً من التعامل مع كل وظيفة بالطريقة نفسها.</p></article><article><span>03</span><p><b>متابعة مستمرة.</b> تخصيص الطلبات وإرسالها ومتابعتها في المهام التشغيلية التي قد تُعيق البحث لو تُركت يدوياً.</p></article></div></div></div></section>

        <section id="case-study" className="case-study-section section-paper"><div className="page-frame split-layout"><aside className="section-rail"><RailLabel>04 / دراسة حالة</RailLabel><span className="rail-rule" /><p>مثال توضيحي لعملية الخدمة</p></aside><div className="case-main"><div className="section-kicker"><FileText size={15} /> دراسة حالة العملية</div><h2>ملخص واحد. <i>إيقاع تقديم أوضح.</i></h2><p className="section-summary">هذا المثال التوضيحي يشرح كيف تنتقل الحملة من السيرة الذاتية الحالية للمرشح إلى سير عمل مستمر لتقديم الطلبات. إنه شرح للخدمة، وليس مراجعة عميل.</p><div className="case-ledger"><div className="case-heading"><span>مسار الحملة / مثال</span><span>البحث عن وظيفة في السعودية</span></div><article><span className="case-stage">01</span><div><b>ملخص المرشح</b><p>يتم تنظيم تفضيلات الوظيفة والخبرة واللغة والتوفر في ملخص حملة قابل للاستخدام.</p></div><span className="case-time">ابدأ</span></article><article><span className="case-stage">02</span><div><b>تحديد مسارات الوظائف</b><p>يتم ترتيب الوظائف ذات الصلة حسب الأولوية بحيث تركز الحملة على الوظائف المناسبة لهذا الملف الشخصي.</p></div><span className="case-time">مطابقة</span></article><article><span className="case-stage">03</span><div><b>تجهيز الطلبات</b><p>يحصل كل طلب على التخصيص اللازم قبل إرساله عبر البريد الإلكتروني أو المنصة.</p></div><span className="case-time">تقديم</span></article><article><span className="case-stage">04</span><div><b>استمرار المتابعة</b><p>التقارير، والتحقق من التسليم، والإجراءات اللاحقة تُبقي نشاط تقديم المرشح واضحاً وقابلاً للمتابعة.</p></div><span className="case-time">متابعة</span></article></div><Link href="/enquire" className="text-button case-link">ابدأ ملخص حملتك <MoveLeft size={18} /></Link></div></div></section>

        <section id="pricing" className="pricing-section section-paper"><div className="page-frame split-layout"><aside className="section-rail"><RailLabel>05 / الأسعار</RailLabel><span className="rail-rule" /><p>باقات شهرية / ريال</p></aside><div className="pricing-main"><div className="pricing-heading"><div><div className="section-kicker"><Zap size={15} /> حدّد محركك</div><h2>حدّد الوتيرة المناسبة <i>لبحثك.</i></h2></div><p>باقات شهرية. الدفع عبر STC Pay أو الآيبان. إلغاء في أي وقت.</p></div><div className="plans-grid">{plans.map((plan) => <article className={`plan-card ${plan.featured ? "plan-featured" : ""}`} key={plan.name}>{plan.featured && <div className="plan-flag">الأكثر اختياراً</div>}<div className="plan-top"><span>{plan.name}</span><ArrowUpRight size={18} /></div><div className="price"><b>{plan.price}</b><span>ريال<br />/ شهرياً</span></div><p>{plan.descriptor}</p><ul>{plan.features.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}</ul><Link href="/enquire" className="plan-cta">اختر {plan.name} <MoveLeft size={17} /></Link></article>)}</div></div></div></section>

        <section id="reviews" className="reviews-pending section-fog"><div className="page-frame reviews-heading"><div><div className="section-kicker"><MessageCircle size={15} /> آراء العملاء</div><h2>تجارب حقيقية،<br /><i>منسوبة لأصحابها بدقة.</i></h2></div><p><ShieldCheck size={16} /> ثلاث مراجعات مشاركة مباشرة من عملاء AutoApply SA.</p></div><div className="page-frame review-cards"><article className="review-card arabic-review"><span className="review-index">01 / جدة</span><blockquote>“بصفتي ممرضة أعمل في جدة، طابقتني الخدمة مع وظائف في المستشفيات وأرسلت الطلبات نيابةً عني. وفّرت عليّ التقديم في ساعات متأخرة من الليل.”</blockquote><footer><b>Ana</b><span>ممرضة · جدة</span></footer></article><article className="review-card arabic-review"><span className="review-index">02 / الرياض</span><blockquote>“قدّمت سيرتي مع أوتوأبلاي السعودية وطلعت لي وظائف تطابق تخصصي في المحاسبة. الخدمة مرتبة والرد سريع على واتساب.”</blockquote><footer><b>سلطان</b><span>محاسب · الرياض</span></footer></article><article className="review-card arabic-review"><span className="review-index">03 / الدمام</span><blockquote>“رفعت سيرتي الذاتية وتمت مطابقتي مع وظائف دعم تقني في نفس اليوم. تابع معي الفريق عبر WhatsApp كما وعدوا. ما زلت في مرحلة المقابلات، لكن الطلبات فعلاً أُرسلت.”</blockquote><footer><b>Fahad</b><span>دعم تقني · الدمام</span></footer></article></div></section>

        <section id="faq" className="faq-section section-ink"><div className="page-frame split-layout"><aside className="section-rail inverted"><RailLabel>06 / الأسئلة الشائعة</RailLabel><span className="rail-rule" /><p>قبل أن تبدأ</p></aside><div className="faq-main"><div className="section-kicker inverse"><MessageCircle size={15} /> الأسئلة، بإجابات واضحة</div><h2>أشياء تستحق <i>التوضيح.</i></h2><div className="faq-list">{faqs.map((faq, index) => { const isOpen = activeFaq === index; return <article className={`faq-item ${isOpen ? "open" : ""}`} key={faq.question}><button onClick={() => setActiveFaq(isOpen ? null : index)} aria-expanded={isOpen}><span>0{index + 1}</span><b>{faq.question}</b><ChevronDown size={20} /></button><div className="faq-answer"><p>{faq.answer}</p></div></article>; })}</div></div></div></section>

        <section id="location" className="location-section section-fog"><div className="page-frame location-grid"><div className="location-copy"><div className="section-kicker"><Globe2 size={15} /> جدة، السعودية</div><h2>مُركّز على السعودية.<br /><i>مقرّه في جدة.</i></h2><p className="section-summary">AutoApply SA مقرّها في جدة، وتخدم المرشحين الباحثين عن وظائف في جميع أنحاء المملكة العربية السعودية.</p><div className="location-actions"><a className="button button-ink" href="https://www.google.com/maps/dir/?api=1&destination=Jeddah%2C%20Saudi%20Arabia" target="_blank" rel="noreferrer">الاتجاهات <ArrowUpRight size={18} /></a><Link className="text-button" href="/enquire">ابدأ عن بُعد <MoveLeft size={18} /></Link></div></div><div className="map-frame"><Suspense fallback={<div className="location-map-canvas" role="status" aria-label="جارٍ تحميل خريطة جدة" />}><MapView className="location-map-canvas" initialCenter={{ lat: 21.4858, lng: 39.1925 }} initialZoom={11} /></Suspense><div className="map-caption"><span><StatusDot /> قاعدة الخدمة</span><b>جدة / السعودية</b></div></div></div></section>

        <section className="final-cta section-accent"><div className="page-frame final-inner"><div><div className="eyebrow dark"><StatusDot tone="quiet" /> ابدأ حملة جديدة</div><h2>اجعل وظيفتك القادمة<br /><i>خطوتك التالية.</i></h2></div><div className="final-action"><p>تواصل مباشرة مع حسن لإعداد الحملة، وتفاصيل الدفع، وأفضل طريقة لمشاركة سيرتك الذاتية.</p><Link className="button button-ink" href="/enquire">ابدأ حملتك <ArrowUpRight size={18} /></Link></div></div></section>
      </main>

      <div className="mobile-campaign-cta"><Link href="/enquire"><span><StatusDot /> ابدأ حملة جديدة</span><b>ابدأ الآن <ArrowUpRight size={17} /></b></Link></div>
      <footer className="footer"><div className="page-frame footer-top"><Link className="brand footer-brand" href="/ar"><img src="/manus-storage/autoapply-symbol_80d77010.png" alt="" className="brand-mark" /><span>AutoApply <em>SA</em></span></Link><p>مُركّز على السعودية. مقرّه في جدة.<br />خدمة للمرشحين في جميع أنحاء المملكة.</p><a className="footer-email" href="mailto:hasan@hsndm.tech">hasan@hsndm.tech <ArrowUpRight size={16} /></a></div><div className="page-frame footer-bottom"><span>© 2026 AUTOAPPLY SA</span><div><a href="https://instagram.com/hsndm_" target="_blank" rel="noreferrer">Instagram</a><a href="https://linkedin.com/in/hsndm" target="_blank" rel="noreferrer">LinkedIn</a><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp</a></div><span>جدة، السعودية</span></div></footer>
    </div>
  );
}
