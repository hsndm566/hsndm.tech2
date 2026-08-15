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
  MessageCircle,
  MoveLeft,
  Paperclip,
  ScanSearch,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from "lucide-react";
import React, { ChangeEvent, DragEvent, lazy, Suspense, useEffect, useRef, useState } from "react";
import HeroMedia from "@/components/HeroMedia";
import { demoLists } from "@/lib/careerTaxonomy";
import { trackEngagement } from "@/lib/analytics";
import { applyPageSeo } from "@/lib/seo";
import { HERO_VIDEO_URL, EXPLAINER_VIDEO_URL } from "@/lib/media";
import { trpc } from "@/lib/trpc";
import { saudiCities, toMatchIndustry } from "@/lib/saudiTaxonomy";
import { ArabicMarketSelector } from "@/components/ArabicMarketSelector";
import { Link } from "wouter";

const MapView = lazy(async () => {
  const module = await import("@/components/Map");
  return { default: module.MapView };
});

const WHATSAPP_URL = "https://wa.me/966571448656?text=مرحباً%20AutoApply%20SA،%20أرغب%20في%20بدء%20حملة%20تقديم.";

// Reusing the approved managed silent loop for Arabic explanation.
const ARABIC_EXPLAINER_VIDEO_SRC = EXPLAINER_VIDEO_URL;

const plans = [
  { name: "الباقة الأساسية", price: "99", descriptor: "مسار بداية مركّز.", features: ["حوالي 40 طلب تقديم", "تقديم عبر البريد الإلكتروني والمنصات", "تقرير أسبوعي"] },
  { name: "الباقة الاحترافية", price: "149", descriptor: "لزخم نشط عبر قنوات متعددة.", features: ["حوالي 90 طلب تقديم", "تخصيص ذو أولوية", "مراجعة بشرية بأولوية", "تقرير يومي"], featured: true },
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

const industryLabels = {
  all: "جميع المجالات",
  "technology-data": "التقنية والبيانات",
  "business-operations": "الأعمال والعمليات",
  "people-service": "الأفراد والخدمات",
  "engineering-construction": "الهندسة والإنشاءات",
};

const roleTranslations: Record<string, string> = {
  "Software Engineer": "مهندس برمجيات", "Backend Developer": "مطور خلفي", "Full Stack Developer": "مطور متكامل",
  "Data Analyst": "محلل بيانات", "Business Intelligence Analyst": "محلل ذكاء أعمال", "Data Scientist": "عالم بيانات",
  "Accountant": "محاسب", "Financial Analyst": "محلل مالي", "Finance Officer": "مسؤول مالي",
  "Sales Executive": "مسؤول مبيعات", "Account Manager": "مدير حسابات", "Business Development Manager": "مدير تطوير أعمال",
  "Marketing Specialist": "أخصائي تسويق", "Digital Marketing Executive": "مسؤول تسويق رقمي", "Social Media Manager": "مدير وسائل التواصل",
  "HR Specialist": "أخصائي موارد بشرية", "Recruiter": "أخصائي توظيف", "HR Coordinator": "منسق موارد بشرية",
  "Registered Nurse": "ممرض مسجل", "Clinical Coordinator": "منسق سريري", "Medical Officer": "مسؤول طبي",
  "Civil Engineer": "مهندس مدني", "Site Engineer": "مهندس موقع", "Project Engineer": "مهندس مشروع",
  "Mechanical Engineer": "مهندس ميكانيكي", "Electrical Engineer": "مهندس كهربائي", "Maintenance Engineer": "مهندس صيانة",
  "IT Support Specialist": "أخصائي دعم تقني", "Network Administrator": "مسؤول شبكات", "Systems Administrator": "مسؤول أنظمة",
  "Customer Service Representative": "ممثل خدمة عملاء", "Call Center Agent": "موظف مركز اتصال", "Client Support Specialist": "أخصائي دعم عملاء",
  "Teacher": "معلم", "Training Specialist": "أخصائي تدريب", "Academic Coordinator": "منسق أكاديمي",
  "Operations Lead": "قائد عمليات", "Process Improvement Specialist": "أخصائي تحسين عمليات", "Operations Coordinator": "منسق عمليات",
  "Logistics Coordinator": "منسق لوجستي", "Supply Chain Analyst": "محلل سلسلة إمداد", "Warehouse Supervisor": "مشرف مستودع",
  "Project Manager": "مدير مشروع", "Project Coordinator": "منسق مشروع", "PMO Analyst": "محلل مكتب إدارة المشاريع",
};

type MatchPreferences = { city: string; industry: keyof typeof industryLabels; seniority: string; language: "Arabic" };
type ScanResult = { field: string; roles: string[]; confidence: string; rationale: string; keySkills?: string[]; topDomain?: string };

function RailLabel({ children }: { children: React.ReactNode }) {
  return <span className="rail-label">{children}</span>;
}

function StatusDot({ tone = "active" }: { tone?: "active" | "quiet" }) {
  return <span className={`status-dot ${tone}`} aria-hidden="true" />;
}

export default function ArabicHome() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [campaignStage, setCampaignStage] = useState(1);
  const [selectedFile, setSelectedFile] = useState("");
  const [scanState, setScanState] = useState<"idle" | "scanning" | "matched" | "fallback">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedSuggestedRole, setSelectedSuggestedRole] = useState<string | null>(null);
  const [briefStatus, setBriefStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [matchPreferences, setMatchPreferences] = useState<MatchPreferences>({ city: "Jeddah", industry: "all", seniority: "Any level", language: "Arabic" });
  const [selectedArabicIndustry, setSelectedArabicIndustry] = useState("Technology & Software");
  const [arabicExplainerVideoFailed, setArabicExplainerVideoFailed] = useState(false);
  const scanFrame = useRef<number | null>(null);
  const scanVersion = useRef(0);
  const recordReadiness = trpc.campaign.readiness.record.useMutation();
  const reportCvExtractionFailure = trpc.campaign.clientIssue.reportCvExtractionFailure.useMutation();
  const reportBlockedHandoff = trpc.campaign.clientIssue.reportBlockedWhatsAppHandoff.useMutation();
  const extractSkillsMutation = trpc.campaign.ats.extractSkills.useMutation();
  const backendAvailable = Boolean(import.meta.env.VITE_API_BASE_URL)
    || window.location.hostname === "localhost"
    || window.location.hostname.endsWith(".manus.space")
    || window.location.hostname.includes("manus.computer");

  useEffect(() => {
    applyPageSeo({
      title: "أوتوأبلاي السعودية | محرّك التقديم الوظيفي",
      description: "AutoApply SA يبحث عن الوظائف في السعودية، ويُخصّص طلبات التقديم، ويرسلها عبر البريد الإلكتروني والمنصات بناءً على سيرتك الذاتية ولغتك المفضلة.",
      path: "/ar",
    });
  }, []);

  useEffect(() => () => {
    if (scanFrame.current !== null) window.cancelAnimationFrame(scanFrame.current);
  }, []);

  const roleLabel = (role: string) => roleTranslations[role] || role;
  const cityLabel = (city: string) => saudiCities.find(option => option.en === city)?.ar || city;
  const seniorityLabel = (level: string) => ({ "Any level": "أي مستوى", "Entry level": "مستوى مبتدئ", "Mid level": "مستوى متوسط", "Senior level": "مستوى متقدم" }[level] || level);
  const makeArabicWhatsAppHref = (roles: string[]) => `https://wa.me/966571448656?text=${encodeURIComponent(["مرحباً AutoApply SA، أكملت فحص جاهزية الحملة السعودية.", `المدينة: ${cityLabel(matchPreferences.city)}`, `المجال: ${industryLabels[matchPreferences.industry]}`, `المستوى: ${seniorityLabel(matchPreferences.seniority)}`, "لغة التقديم: العربية", `مسارات الوظائف المقترحة: ${roles.map(roleLabel).join("، ")}`, "أفهم أن هذه معاينة فقط ولم يتم إرسال أي طلب تقديم. أرغب في مناقشة حملة تقديم."].join("\n"))}`;

  const startScan = (file?: File) => {
    if (!file) return;
    if (scanFrame.current !== null) window.cancelAnimationFrame(scanFrame.current);
    const version = scanVersion.current + 1;
    scanVersion.current = version;
    const scanDuration = 8000 + Math.floor(Math.random() * 4001);
    const preferencesAtScan = matchPreferences;
    const textPromise = import("@/lib/careerMatcher").then(({ readCvText }) => readCvText(file, { onExtractionFailure: () => reportCvExtractionFailure.mutate({ route: "/ar" }) }));
    const fieldPromise = textPromise.then((text) => demoLists(text, preferencesAtScan.industry));
    const startedAt = performance.now();
    setSelectedFile(file.name); setScanState("scanning"); setScanProgress(0); setScanResult(null); setSelectedSuggestedRole(null); setBriefStatus("idle");
    const tick = (now: number) => {
      const progress = Math.min(100, Math.round(((now - startedAt) / scanDuration) * 100));
      setScanProgress(progress);
      if (progress < 100) { scanFrame.current = window.requestAnimationFrame(tick); return; }
      void Promise.all([fieldPromise, textPromise]).then(([fields, cvText]) => {
        if (scanVersion.current !== version) return;
        const bestFit = fields[0];
        if (!bestFit) { setScanState("fallback"); return; }
        const emptySkills = { keySkills: [], topDomain: "" };
        const skillsPromise = cvText && cvText.length >= 50
          ? extractSkillsMutation.mutateAsync({ cvText, language: "Arabic" }).catch(() => emptySkills)
          : Promise.resolve(emptySkills);
        void skillsPromise.then((extracted) => {
          if (scanVersion.current !== version) return;
          setScanResult({ field: bestFit.title, roles: bestFit.items.slice(0, 3), confidence: fields.length > 1 ? "مطابقة قوية" : "مطابقة مركزة", rationale: `تمت المطابقة محلياً من إشارات سيرتك الذاتية وتفضيلاتك: ${cityLabel(preferencesAtScan.city)}، ${seniorityLabel(preferencesAtScan.seniority)}، والعربية.`, keySkills: extracted.keySkills, topDomain: extracted.topDomain });
          setScanState("matched");
        });
      });
    };
    scanFrame.current = window.requestAnimationFrame(tick);
  };

  const resetScan = () => { scanVersion.current += 1; if (scanFrame.current !== null) window.cancelAnimationFrame(scanFrame.current); setSelectedFile(""); setScanProgress(0); setScanResult(null); setSelectedSuggestedRole(null); setBriefStatus("idle"); setScanState("idle"); };
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => startScan(event.target.files?.[0]);
  const onFileDrop = (event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); startScan(event.dataTransfer.files?.[0]); };
  const shareArabicBrief = () => {
    if (!scanResult) return;
    const targetRoles = selectedSuggestedRole ? [selectedSuggestedRole] : scanResult.roles;
    const whatsappHref = makeArabicWhatsAppHref(targetRoles);
    trackEngagement("campaign_readiness_brief_shared", { page: window.location.pathname, city: matchPreferences.city, language: "Arabic", role_count: String(targetRoles.length) });
    const handoffWindow = window.open("about:blank", "autoapply-whatsapp");
    if (handoffWindow) handoffWindow.opener = null;
    else reportBlockedHandoff.mutate({ route: "/ar" });
    setBriefStatus("submitting");
    if (backendAvailable) recordReadiness.mutate({ city: matchPreferences.city as "Jeddah" | "Riyadh" | "Dammam" | "Makkah" | "Madinah" | "Anywhere in Saudi Arabia", industry: matchPreferences.industry, seniority: matchPreferences.seniority as "Any level" | "Entry level" | "Mid level" | "Senior level", language: "Arabic", targetRoles, primaryField: scanResult.field, cvReadable: true, consent: true, source: "landing-readiness-check" });
    window.setTimeout(() => { setBriefStatus("success"); if (handoffWindow) handoffWindow.location.replace(whatsappHref); else window.location.assign(whatsappHref); }, 650);
  };

  return (
    <div className="site-shell" lang="ar" dir="rtl">
      <a className="skip-link" href="#upload">انتقل إلى مطابقة السيرة الذاتية</a>
      <header className="topbar" aria-label="التنقل الرئيسي">
        <Link className="brand" href="/ar" aria-label="الصفحة الرئيسية AutoApply SA">
          <img src="/manus-storage/autoapply-symbol_80d77010.png" alt="" className="brand-mark" />
          <span>AutoApply <em>SA</em></span>
        </Link>
        <nav className="desktop-nav" aria-label="روابط الصفحة">
          <a href="#how">كيف يعمل</a><a href="#upload">السيرة الذاتية</a><a href="#pricing">الأسعار</a><a href="#faq">الأسئلة</a>
        </nav>
        <a href="/" className="language-toggle is-arabic" aria-label="Switch to the English version"><span>EN</span><span>AR</span></a>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="arabic-hero-heading">
          <HeroMedia alt="محترف يراجع طلبات توظيف عبر جهاز محمول" />
          <div className="hero-overlay" />
          <div className="hero-structure" aria-hidden="true"><span className="hero-grid-line one" /><span className="hero-grid-line two" /><span className="hero-grid-line three" /></div>
          <div className="hero-content page-frame" dir="ltr">
            <div className="hero-lead" dir="rtl">
              <div className="eyebrow light"><StatusDot /> محرك توظيف يعمل 24/7 <span /> جدة، المملكة العربية السعودية</div>
              <h1 id="arabic-hero-heading">نتقدّم للوظائف <br />نيابةً عنك.<br /><i>كل يوم.</i></h1>
              <p>يتولى AutoApply SA إرسال طلبات توظيف مخصصة إلى الشركات السعودية نيابةً عنك، عبر البريد الإلكتروني والمنصات، بينما تركز أنت على ما يهمك.</p>
              <div className="hero-actions"><Link className="button button-paper" href="/ar/enquire">ابدأ حملتك <ArrowUpRight size={18} /></Link><a className="text-button light-text" href="#how">تعرّف على النظام <MoveLeft size={18} /></a></div>
              <div className="hero-note">ابتداءً من 99 ريال / شهرياً <b /> بدون بطاقة لبدء المحادثة</div>
              <div className="hero-trust-row"><span><ShieldCheck size={14} /> ابدأ بملخص موجز</span><span><Clock3 size={14} /> سنتواصل خلال يوم عمل واحد</span></div>
            </div>
            <div className="hero-ledger" dir="rtl" aria-label="حالة محرك التقديم">
              <div className="ledger-topline"><span>محرك التقديم</span><span>نشط / على مدار 24 ساعة</span></div>
              <div className="ledger-route"><div><StatusDot /> تمت قراءة السيرة الذاتية</div><span /><div><StatusDot /> جارٍ مطابقة الوظائف</div><span /><div><StatusDot tone="quiet" /> جارٍ التقديم</div></div>
              <div className="ledger-record"><span className="record-number">03</span><div><b>جاهز للتقديم</b><small>تمت مطابقة المهارات والخبرة واللغة</small></div><ArrowUpRight size={16} /></div>
              <div className="ledger-queue"><div className="queue-heading"><span>قائمة الحملة / معاينة</span><b>جدة · السعودية</b></div><div><StatusDot /> سيرتك الذاتية جاهزة</div><div><StatusDot /> جارٍ مطابقة الوظائف</div></div>
            </div>
            <div className="hero-stats" dir="rtl"><div><strong>500+</strong><span>وظيفة سعودية تم فحصها</span></div><div><strong>24/7</strong><span>محرك يعمل على مدار الساعة</span></div><div><strong>2</strong><span>لغتان مدعومتان</span></div></div>
	          </div>
	        </section>


        <section id="how" className="workflow-section section-ink">
          <div className="page-frame split-layout"><aside className="section-rail inverted"><RailLabel>02 / كيف يعمل</RailLabel><span className="rail-rule" /><p>ثلاث خطوات. بلا تقديم يدوي.</p></aside><div className="workflow-main"><div className="section-kicker inverse"><Sparkles size={15} /> واضح بالتصميم</div><h2>ضع بحثك <i>في نظام.</i></h2><p className="section-summary inverse-summary">ابدأ بما لديك بالفعل. ثم دع المحرك يحوّله إلى روتين تقديم منتظم.</p><div className="process-list"><article className="process-item"><div className="process-number">01</div><div className="process-content"><h3>ارفع سيرتك الذاتية</h3><p>أضف ملف PDF أو DOC أو DOCX أو TXT. مهاراتك وخبراتك ومسارك المهني تصبح نقطة الانطلاق.</p></div><FileText size={24} strokeWidth={1.4} /></article><article className="process-item"><div className="process-number">02</div><div className="process-content"><h3>حدّد الوظائف المستهدفة</h3><p>راجع أفضل مسارات الوظائف المتوافقة معك من بين الإعلانات في السعودية، ووجّه البحث نحو خطوتك القادمة.</p></div><Globe2 size={24} strokeWidth={1.4} /></article><article className="process-item active-process"><div className="process-number">03</div><div className="process-content"><h3>المحرك يقدّم على مدار الساعة</h3><p>الطلبات، وخطابات التقديم المخصصة، والمنصات، ورسائل البريد الإلكتروني، والتحقق من التسليم، كلها تسير بينما تُكمل يومك.</p></div><Send size={24} strokeWidth={1.4} /></article></div></div></div>
        </section>

        <section id="product" className="video-explainer section-paper" aria-labelledby="arabic-video-explainer-heading">
          <div className="page-frame video-explainer-inner">
            <div className="section-kicker"><Send size={15} /> شاهد كيف تعمل الخدمة</div>
            <h2 id="arabic-video-explainer-heading">30 ثانية فقط. <i>وهذا يكفي لفهمها.</i></h2>
            {ARABIC_EXPLAINER_VIDEO_SRC && !arabicExplainerVideoFailed ? (
              <video className="video-placeholder video-explainer-media pointer-events-none select-none" autoPlay loop muted playsInline disablePictureInPicture controlsList="nodownload noplaybackrate" preload="auto" aria-label="فيديو توضيحي لخدمة AutoApply SA" onError={() => setArabicExplainerVideoFailed(true)}>
                <source src={ARABIC_EXPLAINER_VIDEO_SRC} type="video/mp4" />
              </video>
            ) : (
              <div className="video-placeholder" role="status" aria-live="polite" aria-label="فيديو AutoApply SA التوضيحي غير متاح حالياً؛ خطوات الخدمة ما زالت متاحة">
                <span className="video-play" aria-hidden="true"><Send size={22} fill="currentColor" /></span>
                <span>Powered by AutoApply SA</span>
              </div>
            )}
            <p>هذا ما يعمل بينما تتابع يومك.</p>
            <div className="mt-4 sm:hidden">
              <a href="#upload" className="block w-full text-center bg-[#e5482a] text-white py-3 px-4 font-medium shadow-lg hover:bg-[#c93b20] transition-colors">
                ارفع سيرتك الذاتية الآن ←
              </a>
            </div>
          </div>
        </section>

        <section id="upload" className="upload-section section-paper">
          <div className="page-frame upload-grid"><div className="upload-image-wrap"><img src="/manus-storage/autoapply-desk_635170b2.jpg" alt="مساحة عمل جاهزة لبدء البحث عن وظيفة" /><div className="image-stamp"><span>ابدأ / 60 ثانية</span><ArrowUpRight size={17} /></div></div><div className="upload-copy"><div className="section-kicker"><Paperclip size={15} /> استلام السيرة الذاتية</div><h2>أضف سيرتك الذاتية. <i>اكتشف مساراتك.</i></h2><p className="section-summary">اختر أحدث نسخة من سيرتك الذاتية وحدّد تفضيلاتك للحملة داخل السعودية. تتم القراءة والمطابقة في متصفحك فقط، ولا يُرسل أي طلب تقديم في هذه المعاينة.</p><div className="match-preferences" aria-label="تفضيلات مطابقة الوظائف في السعودية"><div className="preferences-heading"><span><SlidersHorizontal size={14} /> تفضيلات المطابقة</span><small>تُطبّق محلياً</small></div><div className="preferences-grid"><ArabicMarketSelector city={matchPreferences.city} industry={selectedArabicIndustry} onCityChange={(city) => setMatchPreferences((current) => ({ ...current, city }))} onIndustryChange={(industry) => { setSelectedArabicIndustry(industry); setMatchPreferences((current) => ({ ...current, industry: toMatchIndustry(industry) as MatchPreferences["industry"] })); }} /><label><span>المستوى الوظيفي</span><select value={matchPreferences.seniority} onChange={(event) => setMatchPreferences((current) => ({ ...current, seniority: event.target.value }))}><option value="Any level">أي مستوى</option><option value="Entry level">مستوى مبتدئ</option><option value="Mid level">مستوى متوسط</option><option value="Senior level">مستوى متقدم</option></select></label><label><span>لغة التقديم</span><select value="Arabic" disabled aria-label="لغة التقديم العربية"><option value="Arabic">العربية</option></select></label></div></div><label className={`drop-zone ${scanState !== "idle" ? "has-file" : ""} ${scanState === "scanning" ? "is-scanning-laser" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={onFileDrop}><input type="file" accept=".pdf,.doc,.docx,.txt" onChange={onFileChange} /><span className="drop-symbol"><FileText size={24} /></span><span className="drop-copy"><b>{selectedFile || "اختر أو أضف سيرتك الذاتية"}</b><small>{selectedFile ? "الفحص المحلي نشط — يبقى ملفك داخل هذا المتصفح" : "PDF أو DOC أو DOCX أو TXT"}</small></span><span className="drop-arrow"><ArrowUpRight size={20} /></span></label>{scanState === "scanning" && <div className="role-scan" role="status" aria-live="polite"><div className="scan-meta"><span><ScanSearch size={14} /> جارٍ العثور على مسارات مناسبة لك…</span><span className="text-[11px] font-mono opacity-75 mr-2">الفحص محلياً</span><b>{scanProgress}%</b></div><div className="scan-track" role="progressbar" aria-label="جارٍ العثور على وظائف مناسبة" aria-valuemin={0} aria-valuemax={100} aria-valuenow={scanProgress}><span style={{ width: `${scanProgress}%` }} /></div><p>نقرأ المهارات والخبرة والإشارات المهنية محلياً.</p></div>}{scanState === "matched" && scanResult && <div className="role-results" role="status" aria-live="polite"><div className="result-heading"><span><Check size={14} /> تم العثور على إشارات وظيفية</span><button onClick={resetScan}>افحص سيرة أخرى</button></div><p>المسار الأنسب <b>{scanResult.field}</b> <em>{scanResult.confidence}</em></p><div className="role-chips" aria-label="مسارات الوظائف المقترحة">{scanResult.roles.map((role) => <button type="button" key={role} className={selectedSuggestedRole === role ? "selected" : ""} aria-pressed={selectedSuggestedRole === role} onClick={() => setSelectedSuggestedRole(role)}><span>{roleLabel(role)}</span><ArrowUpRight size={13} /></button>)}</div>{selectedSuggestedRole && <p className="role-selection"><Check size={13} /> تم اختيار <b>{roleLabel(selectedSuggestedRole)}</b> لملخص حملتك.</p>}{scanResult.keySkills && scanResult.keySkills.length > 0 ? <div className="p-3 bg-black/[0.03] border border-black/10 my-3"><div className="flex items-center gap-1.5 font-mono text-xs font-semibold mb-2 text-[#151515]"><Sparkles size={13} className="text-[#e5482a]" /> المهارات الأساسية المستخرجة بالذكاء الاصطناعي {scanResult.topDomain ? `(${scanResult.topDomain})` : ""}</div><div className="flex flex-wrap gap-1.5">{scanResult.keySkills.map((skill) => <span key={skill} title={`تتوافق مباشرة مع مسار ${scanResult.field} في السوق السعودي`} className="px-2 py-0.5 bg-white border border-black/15 text-xs font-mono text-[#151515] cursor-help transition-colors hover:border-[#e5482a]">{skill}</span>)}</div><p className="text-[11px] font-mono text-black/60 mt-2">مرّر مؤشر الماوس فوق المهارات لمعرفة مدى توافقها مع مسارك الوظيفي المستهدف.</p></div> : <div className="p-3 bg-black/[0.02] border border-black/10 my-3 text-xs font-mono text-black/70 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /><span>المهارات الذكية غير متوفرة حالياً — مطابقة الوظائف المحلية تعمل بكامل كفاءتها.</span></div>}<div className="match-rationale"><b>سبب المطابقة</b><span>{scanResult.rationale}</span></div><section className="readiness-card" aria-label="فحص جاهزية الحملة السعودية"><div className="readiness-heading"><span><Zap size={14} /> جاهزية الحملة السعودية</span><b>معاينة فقط</b></div><p>هذا هو الاتجاه الذي سنستخدمه لبدء محادثة حول الحملة — وليس طلب تقديم أو توقعاً لمقابلة.</p><dl className="readiness-grid"><div><dt>المدينة المستهدفة</dt><dd>{cityLabel(matchPreferences.city)}</dd></div><div><dt>المجال</dt><dd>{industryLabels[matchPreferences.industry]}</dd></div><div><dt>المستوى</dt><dd>{seniorityLabel(matchPreferences.seniority)}</dd></div><div><dt>لغة التقديم</dt><dd>العربية</dd></div></dl><div className="readiness-checklist"><b>جاهز للخطوة التالية</b><span><Check size={13} /> تمت قراءة نص السيرة محلياً</span><span><Check size={13} /> تم تحديد موقع داخل السعودية</span><span><Check size={13} /> تم تحديد مسارات وظيفية</span></div><button className="readiness-share" type="button" onClick={shareArabicBrief} disabled={briefStatus === "submitting"}>{briefStatus === "submitting" ? "جارٍ تجهيز ملخصك…" : "أرسل هذا الملخص إلى حسن"} <MessageCircle size={16} /></button>{briefStatus === "submitting" && <div className="readiness-handoff readiness-loading" role="status" aria-live="polite"><span className="readiness-spinner" aria-hidden="true" /><span><b>جارٍ تجهيز ملخص حملتك</b><small>نُنشئ تحويلاً واضحاً إلى WhatsApp…</small></span></div>}{briefStatus === "success" && <div className="readiness-handoff readiness-success" role="status" aria-live="polite"><Check size={17} aria-hidden="true" /><span><b>ملخص الحملة جاهز.</b><small>تم فتح WhatsApp مع اتجاهك الوظيفي السعودي المحدد. إذا لم يُفتح، استخدم الرابط أدناه.</small><a href={makeArabicWhatsAppHref(selectedSuggestedRole ? [selectedSuggestedRole] : scanResult.roles)} target="_blank" rel="noreferrer">فتح WhatsApp</a></span></div>}<small>{backendAvailable ? "تُقرأ سيرتك على جهازك. يُرسل النص المستخرج إلى الذكاء الاصطناعي لهذا الملخص لمرة واحدة فقط؛ لا يُحفظ ملف السيرة أو نصها." : "تُقرأ سيرتك على جهازك. لا يتم إرسال ملف السيرة أو نصها في هذه المعاينة الثابتة."}</small></section></div>}{scanState === "fallback" && <div className="scan-fallback" role="status" aria-live="polite"><div><ShieldCheck size={16} /><span><b>نحتاج إلى إلقاء نظرة أقرب.</b> تعذر قراءة هذا الملف بوضوح في المتصفح، لذلك لن نخمن الوظائف المناسبة.</span></div><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">أرسلها عبر WhatsApp <ArrowUpRight size={15} /></a><button onClick={resetScan}>جرّب سيرة أخرى</button></div>}<p className="privacy-note"><ShieldCheck size={16} /> يبقي هذا الفحص نص السيرة واختيار الملف داخل متصفحك. لا يُرسل سوى ملخص حملة اختياري عند اختيار WhatsApp.</p><a className="button button-ink" href={WHATSAPP_URL} target="_blank" rel="noreferrer">تابع عبر WhatsApp <MessageCircle size={18} /></a></div></div>
        </section>

        <section className="proof-strip" aria-label="خصائص الخدمة"><div className="page-frame proof-grid"><div><StatusDot /> إرسال موثّق</div><div><StatusDot /> تقديم عبر البريد الإلكتروني والمنصات</div><div><StatusDot /> الدفع عبر STC Pay أو الآيبان</div><div><StatusDot /> عربي / إنجليزي · المملكة العربية السعودية</div></div></section>

        <section className="campaign-preview section-ink">
          <div className="page-frame campaign-preview-grid"><div className="campaign-preview-copy"><div className="section-kicker inverse"><Clock3 size={15} /> دراسة حالة العملية</div><h2>ملخص واحد. <i>إيقاع تقديم أوضح.</i></h2><p className="section-summary inverse-summary">مسار الحملة / مثال توضيحي — البحث عن وظيفة في السعودية.</p><div className="campaign-switcher" role="tablist" aria-label="مراحل معاينة الحملة">{campaignStages.map((stage, index) => <button key={stage.label} className={campaignStage === index ? "active" : ""} role="tab" aria-selected={campaignStage === index} aria-controls="arabic-campaign-preview-status" onClick={() => setCampaignStage(index)}><span>0{index + 1}</span>{stage.label}</button>)}</div><Link href="/ar/enquire" className="text-button light-text">ابدأ ملخص حملتك <MoveLeft size={17} /></Link></div><div id="arabic-campaign-preview-status" className="campaign-dashboard" aria-label="معاينة حالة الحملة"><div className="dashboard-top"><span>الحملة السعودية / معاينة</span><b>{campaignStages[campaignStage].status}</b></div><div className="dashboard-spotlight"><span>0{campaignStage + 1}</span><div><b>{campaignStages[campaignStage].title}</b><p>{campaignStages[campaignStage].detail}</p></div></div>{campaignStages.map((stage, index) => <button className={`dashboard-progress ${index === campaignStage ? "active" : ""} ${index > campaignStage ? "quiet" : ""}`} key={stage.label} onClick={() => setCampaignStage(index)}><span>0{index + 1}</span><div><b>{stage.label}</b><small>{index < campaignStage ? "الخطوة جاهزة" : index === campaignStage ? "المعاينة الحالية" : "الخطوة التالية"}</small></div>{index < campaignStage ? <Check size={16} /> : index === campaignStage ? <Clock3 size={16} /> : <ArrowUpRight size={16} />}</button>)}</div></div>
        </section>

        <section id="pricing" className="pricing-section section-paper"><div className="page-frame split-layout"><aside className="section-rail"><RailLabel>05 / الأسعار</RailLabel><span className="rail-rule" /><p>باقات شهرية / ريال</p></aside><div className="pricing-main"><div className="pricing-heading"><div><div className="section-kicker"><Zap size={15} /> حدّد محركك</div><h2>حدّد الوتيرة المناسبة <i>لبحثك.</i></h2></div><p>باقات شهرية. الدفع عبر STC Pay أو الآيبان. إلغاء في أي وقت.</p></div><div className="plans-grid">{plans.map((plan) => <article className={`plan-card ${plan.featured ? "plan-featured" : ""}`} key={plan.name}>{plan.featured && <div className="plan-flag">الأكثر اختياراً</div>}<div className="plan-top"><span>{plan.name}</span><ArrowUpRight size={18} /></div><div className="price"><b>{plan.price}</b><span>ريال<br />/ شهرياً</span></div><p>{plan.descriptor}</p><ul>{plan.features.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}</ul><Link href="/ar/enquire" className="plan-cta">اختر {plan.name} <MoveLeft size={17} /></Link></article>)}</div></div></div></section>

        <section id="reviews" className="reviews-pending section-fog"><div className="page-frame reviews-heading"><div><div className="section-kicker"><MessageCircle size={15} /> آراء العملاء</div><h2>تجارب حقيقية،<br /><i>منسوبة لأصحابها بدقة.</i></h2></div><p><ShieldCheck size={16} /> ثلاث مراجعات مشاركة مباشرة من عملاء AutoApply SA.</p></div><div className="page-frame review-cards"><article className="review-card arabic-review"><span className="review-index">01 / جدة</span><blockquote>“بصفتي ممرضة أعمل في جدة، طابقتني الخدمة مع وظائف في المستشفيات وأرسلت الطلبات نيابةً عني. وفّرت عليّ التقديم في ساعات متأخرة من الليل.”</blockquote><footer><b>Ana</b><span>ممرضة · جدة</span></footer></article><article className="review-card arabic-review"><span className="review-index">02 / الرياض</span><blockquote>“قدّمت سيرتي مع أوتوأبلاي السعودية وطلعت لي وظائف تطابق تخصصي في المحاسبة. الخدمة مرتبة والرد سريع على واتساب.”</blockquote><footer><b>سلطان</b><span>محاسب · الرياض</span></footer></article><article className="review-card arabic-review"><span className="review-index">03 / الدمام</span><blockquote>“رفعت سيرتي الذاتية وتمت مطابقتي مع وظائف دعم تقني في نفس اليوم. تابع معي الفريق عبر WhatsApp كما وعدوا. ما زلت في مرحلة المقابلات، لكن الطلبات فعلاً أُرسلت.”</blockquote><footer><b>Fahad</b><span>دعم تقني · الدمام</span></footer></article></div></section>

        <section id="faq" className="faq-section section-ink"><div className="page-frame split-layout"><aside className="section-rail inverted"><RailLabel>06 / الأسئلة الشائعة</RailLabel><span className="rail-rule" /><p>قبل أن تبدأ</p></aside><div className="faq-main"><div className="section-kicker inverse"><MessageCircle size={15} /> الأسئلة، بإجابات واضحة</div><h2>أشياء تستحق <i>التوضيح.</i></h2><div className="faq-list">{faqs.map((faq, index) => { const isOpen = activeFaq === index; return <article className={`faq-item ${isOpen ? "open" : ""}`} key={faq.question}><button onClick={() => setActiveFaq(isOpen ? null : index)} aria-expanded={isOpen}><span>0{index + 1}</span><b>{faq.question}</b><ChevronDown size={20} /></button><div className="faq-answer"><p>{faq.answer}</p></div></article>; })}</div></div></div></section>

        <section id="location" className="location-section section-fog"><div className="page-frame location-grid"><div className="location-copy"><div className="section-kicker"><Globe2 size={15} /> جدة، السعودية</div><h2>مُركّز على السعودية.<br /><i>مقرّه في جدة.</i></h2><p className="section-summary">AutoApply SA مقرّها في جدة، وتخدم المرشحين الباحثين عن وظائف في جميع أنحاء المملكة العربية السعودية.</p><div className="location-actions"><a className="button button-ink" href="https://www.google.com/maps/dir/?api=1&destination=Jeddah%2C%20Saudi%20Arabia" target="_blank" rel="noreferrer">الاتجاهات <ArrowUpRight size={18} /></a><Link className="text-button" href="/ar/enquire">ابدأ عن بُعد <MoveLeft size={18} /></Link></div></div>          <div className="map-frame"><Suspense fallback={<div className="location-map-canvas" role="status" aria-label="جارٍ تحميل خريطة جدة" />}><MapView className="location-map-canvas" initialCenter={{ lat: 21.4858, lng: 39.1925 }} initialZoom={11} language="ar" region="SA" /></Suspense><div className="map-caption"><span><StatusDot /> قاعدة الخدمة</span><b>جدة / السعودية</b></div></div></div></section>

        <section className="final-cta section-accent"><div className="page-frame final-inner"><div><div className="eyebrow dark"><StatusDot tone="quiet" /> ابدأ حملة جديدة</div><h2>اجعل وظيفتك القادمة<br /><i>خطوتك التالية.</i></h2></div><div className="final-action"><p>تواصل مباشرة مع حسن لإعداد الحملة، وتفاصيل الدفع، وأفضل طريقة لمشاركة سيرتك الذاتية.</p><Link className="button button-ink" href="/ar/enquire">ابدأ حملتك <ArrowUpRight size={18} /></Link></div></div></section>
      </main>

      <div className="mobile-campaign-cta"><Link href="/ar/enquire"><span><StatusDot /> ابدأ حملة جديدة</span><b>ابدأ الآن <ArrowUpRight size={17} /></b></Link></div>
      <footer className="footer"><div className="page-frame footer-top"><Link className="brand footer-brand" href="/ar"><img src="/manus-storage/autoapply-symbol_80d77010.png" alt="" className="brand-mark" /><span>AutoApply <em>SA</em></span></Link><p>مُركّز على السعودية. مقرّه في جدة.<br />خدمة للمرشحين في جميع أنحاء المملكة.</p><a className="footer-email" href="mailto:hasan@hsndm.tech">hasan@hsndm.tech <ArrowUpRight size={16} /></a></div><div className="page-frame footer-bottom"><span>© 2026 AUTOAPPLY SA</span><div><a href="https://instagram.com/hsndm_" target="_blank" rel="noreferrer">Instagram</a><a href="https://linkedin.com/in/hsndm" target="_blank" rel="noreferrer">LinkedIn</a><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp</a></div><span>جدة، السعودية</span></div></footer>
    </div>
  );
}
