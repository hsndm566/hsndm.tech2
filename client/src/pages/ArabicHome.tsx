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
  Menu,
  MessageCircle,
  MoveLeft,
  Paperclip,
  ScanSearch,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import React, { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import HeroMedia from "@/components/HeroMedia";
import { DeferredExplainerVideo } from "@/components/DeferredExplainerVideo";
import { demoLists } from "@/lib/careerTaxonomy";
import { trackEngagement } from "@/lib/analytics";
import { applyPageSeo } from "@/lib/seo";
import { EXPLAINER_VIDEO_URL } from "@/lib/media";
import { saudiCities, toMatchIndustry } from "@/lib/saudiTaxonomy";
import { ArabicMarketSelector } from "@/components/ArabicMarketSelector";
import { ArabicIntakeSection } from "@/components/arabic/ArabicIntakeSection";
import { FooterEnquiryForm } from "@/components/FooterEnquiryForm";
import { LanguageTransitionLink } from "@/components/LanguageTransitionLink";
import { MarketingAnchorScroller } from "@/components/MarketingAnchorScroller";
import { LazyMount } from "@/components/LazyMount";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { Link } from "wouter";
import { JeddahLocationCard } from "@/components/Map";

const WHATSAPP_URL = "https://wa.me/966571448656?text=مرحباً%20AutoApply%20SA،%20أرغب%20في%20بدء%20حملة%20تقديم.";

// Reusing the approved managed silent loop for Arabic explanation.
const ARABIC_EXPLAINER_VIDEO_SRC = EXPLAINER_VIDEO_URL;

const plans = [
  { name: "الباقة الأساسية", price: "99", descriptor: "لمن يريد أساساً ثابتاً من الطلبات المرسلة أسبوعياً من دون تنفيذها يدوياً.", features: ["حوالي 40 طلب تقديم", "تقديم عبر البريد الإلكتروني والمنصات", "تقرير أسبوعي"] },
  { name: "الباقة الاحترافية", price: "149", descriptor: "لمن يريد تخصيصاً أسرع ومراجعة بشرية ذات أولوية فوق الأساس الثابت.", features: ["حوالي 90 طلب تقديم", "تخصيص ذو أولوية", "مراجعة بشرية بأولوية", "تقرير يومي"], featured: true },
  { name: "باقة المؤسس", price: "249", descriptor: "لمن يستهدف عدة وظائف ويريد تأهيلاً شخصياً عالي الاهتمام.", features: ["حوالي 150 طلب تقديم", "استهداف متعدد الوظائف", "تأهيل شامل ومخصّص"] },
];

const campaignStages = [
  { label: "ملخص المرشح", title: "تنظيم الإشارات", detail: "يتم تنظيم تفضيلات الوظيفة والخبرة واللغة والتوفر في ملخص حملة قابل للاستخدام.", status: "الملخص جاهز" },
  { label: "مسارات الوظائف", title: "تحديد الاتجاه", detail: "تُرتَّب الوظائف ذات الصلة حسب الأولوية بحيث تركّز الحملة على الوظائف المناسبة لهذا الملف الشخصي.", status: "المطابقة جاهزة" },
  { label: "استمرار المتابعة", title: "إبقاء الوتيرة واضحة", detail: "التقارير، والتحقق من التسليم، والإجراءات اللاحقة تُبقي نشاط تقديم المرشح واضحاً وقابلاً للمتابعة.", status: "الحملة نشطة" },
];

const faqs = [
  { question: "هل تضمنون حصولي على وظيفة؟", answer: "لا يمكن لأحد ضمان مقابلة أو عرض. نزيد عدد الطلبات المناسبة المرسلة بالنيابة عنك، بينما تعتمد النتيجة على السوق وملفك." },
  { question: "ماذا لو لم يعجبني طلب تم إعداده؟", answer: "لا يُرسل أي طلب قبل موافقتك. يمكنك طلب التعديل أو تجاوزه." },
  { question: "هل الخدمة للتقنية والهندسة فقط؟", answer: "لا، الخدمة تعمل عبر مجالات متعددة." },
  { question: "ماذا أحتاج أن أقدّم؟", answer: "سيرتك الذاتية والوظائف أو المجالات التي تستهدفها." },
  { question: "كم طلباً سأحصل عليه؟", answer: "يعتمد ذلك على باقتك — راجع تفاصيل الباقات أعلاه." },
  { question: "هل بياناتي آمنة؟", answer: "نعم. سيرتك الذاتية تبقى خاصة حتى توافق على وظيفة محددة. نستخدمها فقط لتجهيز الطلبات التي وافقت عليها، ولا تُباع لأي جهة. يمكنك طلب الحذف أو الإيقاف المؤقت في أي وقت من لوحة التحكم. الوصول إلى لوحة التحكم محمي بتسجيل الدخول عبر بريدك الإلكتروني." },
  { question: "كيف تجدون هذه الوظائف؟", answer: "نبحث في إعلانات الوظائف عبر منصات متعددة ونطابقها مع ملفك." },
];

const reviewedArabicCopy: Record<string, string> = {
  "تُطبّق محلياً": "تُطبَّق محلياً",
  "يبقي هذا الفحص نص السيرة واختيار الملف داخل متصفحك. لا يُرسل سوى ملخص حملة اختياري عند اختيار WhatsApp.": "تُقرأ سيرتك على جهازك، ولا يبقى خارج هذه الصفحة سوى ما تختار مشاركته.",
  "حدّد محركك": "حدّد محرّكك",
  "مُركّز على السعودية.": "مُركَّز على السعودية.",
  "تأهيل شامل ومخصص": "تأهيل شامل ومخصّص",
};

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

export type MatchPreferences = { city: string; industry: keyof typeof industryLabels; seniority: string; language: "Arabic" };
type ScanResult = { field: string; roles: string[]; confidence: string; rationale: string; keySkills?: string[]; topDomain?: string };

const hiddenLegacyMutation = { mutate: (_input: unknown) => undefined };
const hiddenLegacySkillsMutation = { mutateAsync: async (_input: unknown) => ({ keySkills: [], topDomain: "" }) };

function RailLabel({ children }: { children: React.ReactNode }) {
  return <span className="rail-label">{children}</span>;
}

function StatusDot({ tone = "active" }: { tone?: "active" | "quiet" }) {
  return <span className={`status-dot ${tone}`} aria-hidden="true" />;
}

export default function ArabicHome() {
  const legacyPublicPreviewVisible: boolean = false;
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [campaignStage, setCampaignStage] = useState(1);
  const [selectedFile, setSelectedFile] = useState("");
  const [scanState, setScanState] = useState<"idle" | "scanning" | "matched" | "fallback">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedSuggestedRole, setSelectedSuggestedRole] = useState<string | null>(null);
  const [briefStatus, setBriefStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [matchPreferences, setMatchPreferences] = useState<MatchPreferences>({ city: "Jeddah", industry: "all", seniority: "Any level", language: "Arabic" });
  const [selectedArabicIndustry, setSelectedArabicIndustry] = useState("Technology & Software");
  const scanFrame = useRef<number | null>(null);
  const scanVersion = useRef(0);
  const recordReadiness = hiddenLegacyMutation;
  const reportCvExtractionFailure = hiddenLegacyMutation;
  const reportBlockedHandoff = hiddenLegacyMutation;
  const extractSkillsMutation = hiddenLegacySkillsMutation;
  const backendAvailable = Boolean(import.meta.env.VITE_API_BASE_URL)
    || window.location.hostname === "localhost"
    || window.location.hostname.endsWith(".manus.space")
    || window.location.hostname.includes("manus.computer");

  useEffect(() => {
    applyPageSeo({
      title: "AutoApply SA — نُعِدّ طلباتك للوظائف وأنت توافق",
      description: "أخبرنا بالوظائف التي تريدها. نبحث عن فرص حقيقية في السعودية ونُعدّ طلبات مخصّصة — تراجع وتوافق قبل إرسال أي شيء.",
      path: "/ar",
    });
  }, []);

  useEffect(() => () => {
    if (scanFrame.current !== null) window.cancelAnimationFrame(scanFrame.current);
  }, []);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".site-shell[lang='ar']");
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);

    for (const node of nodes) {
      const sourceText = node.nodeValue?.trim();
      if (!sourceText) continue;
      const reviewedText = reviewedArabicCopy[sourceText];
      if (reviewedText) node.nodeValue = node.nodeValue?.replace(sourceText, reviewedText) ?? reviewedText;
    }
  }, [activeFaq, briefStatus, campaignStage, scanState, selectedFile]);

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
      <MarketingAnchorScroller />
      <a className="skip-link" href="#how">انتقل إلى شرح الخدمة</a>
      <header className="topbar" aria-label="التنقل الرئيسي">
        <Link className="brand" href="/ar" aria-label="الصفحة الرئيسية AutoApply SA">
          <img src="/manus-storage/autoapply-symbol_80d77010.png" alt="" className="brand-mark" width="1920" height="1920" />
          <span>AutoApply <em>SA</em></span>
        </Link>
        <nav className="desktop-nav" aria-label="روابط الصفحة">
          <a href="#how">كيف يعمل</a><a href="#reviews">لمن تناسب الخدمة</a><a href="#approval">ما الذي توافق عليه</a><Link href="/ats">فحص ATS</Link><a href="#pricing">الأسعار</a><a href="#faq">الأسئلة الشائعة</a>
        </nav>
        <Link className="mobile-ats-link" href="/ats">فحص ATS</Link>
        <div className="nav-actions">
          <LanguageTransitionLink href="/" className="language-toggle is-arabic"><span>English</span><span>العربية</span></LanguageTransitionLink>
          <button className="mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={menuOpen}>{menuOpen ? <X size={21} /> : <Menu size={22} />}</button>
        </div>
        {menuOpen && <nav className="mobile-nav" aria-label="روابط الجوال"><a href="#how" onClick={() => setMenuOpen(false)}><span>01</span> كيف يعمل <MoveLeft size={18} /></a><a href="#reviews" onClick={() => setMenuOpen(false)}><span>02</span> لمن تناسب الخدمة <MoveLeft size={18} /></a><a href="#approval" onClick={() => setMenuOpen(false)}><span>03</span> ما الذي توافق عليه <MoveLeft size={18} /></a><a href="#pricing" onClick={() => setMenuOpen(false)}><span>04</span> الباقات <MoveLeft size={18} /></a><Link href="/ats" onClick={() => setMenuOpen(false)}><span>05</span> فحص ATS المجاني <MoveLeft size={18} /></Link></nav>}
      </header>

      <SectionErrorBoundary name="arabic-marketing-home" fallback={<main id="top" dir="rtl" />}>
      <main id="top">
        <SectionErrorBoundary name="arabic-hero" fallback={<section className="hero" aria-labelledby="arabic-hero-heading"><div className="hero-content page-frame"><div className="hero-lead"><h1 id="arabic-hero-heading">نُعِدّ طلباتك للوظائف. وأنت توافق قبل الإرسال.</h1><p>أخبرنا بالوظائف التي تريدها. لا يُرسل أي شيء حتى توافق.</p></div></div></section>}>
        <section className="hero" aria-labelledby="arabic-hero-heading">
          <HeroMedia alt="محترف يراجع طلبات توظيف عبر جهاز محمول" />
          <div className="hero-structure" aria-hidden="true"><span className="hero-grid-line one" /><span className="hero-grid-line two" /><span className="hero-grid-line three" /></div>
          <div className="hero-content page-frame" dir="rtl">
            <div className="hero-lead" dir="rtl">
              <div className="eyebrow light"><StatusDot /> دعم حملة بعد موافقتك <span /> جدة، المملكة العربية السعودية</div>
              <h1 id="arabic-hero-heading"><span data-anime-hero-word>نُعِدّ طلباتك</span><br /><span data-anime-hero-word>للوظائف.</span>{" "}<span data-anime-hero-word>وأنت توافق</span><br /><i><span data-anime-hero-word>قبل الإرسال.</span></i></h1>
              <p>أخبرنا بالوظائف التي تريدها. نبحث عن فرص حقيقية ونكتب طلبات مخصّصة لكل فرصة. لا يُرسل أي شيء حتى توافق.</p>
              <div className="hero-actions"><a className="button button-ink" href="#pricing" onClick={() => trackEngagement("hero_start_campaign_click", { page: window.location.pathname, language: "Arabic" })}>ابدأ خطة التقديم <ArrowUpRight size={18} /></a><a className="text-button light-text" href="#how" onClick={() => trackEngagement("hero_see_plans_click", { page: window.location.pathname, language: "Arabic" })}>كيف تعمل الخدمة؟ <MoveLeft size={18} /></a></div>
              <p className="mt-2 text-xs font-mono text-[#151515]/70">لا يتم إرسال أي طلب أو دفع اليوم.</p>
              <div className="hero-note">ابتداءً من 99 ريال شهرياً <b /> دون بطاقة لبدء المحادثة</div>
              <div className="hero-trust-row" aria-label="معلومات موثوقة عن الحملة"><span><ShieldCheck size={14} /> توافق على الوظائف المستهدفة</span><span>تحدد الحجم والتواريخ</span><span>يمكنك الإيقاف في أي وقت</span><span>كل طلب مسجّل</span><span>دعم مركّز على السعودية</span></div>
            </div>
            <div className="hero-ledger" dir="rtl" aria-label="حالة محرك التقديم">
              <div className="ledger-topline"><span>محرّك التقديم</span><span>نشط / على مدار 24 ساعة</span></div>
              <div className="ledger-route"><div><StatusDot /> تمت قراءة السيرة الذاتية</div><span /><div><StatusDot /> جارٍ مطابقة الوظائف</div><span /><div><StatusDot tone="quiet" /> جارٍ التقديم</div></div>
              <div className="ledger-record"><span className="record-number">03</span><div><b>جاهز للتقديم</b><small>تمت مطابقة المهارات والخبرة واللغة</small></div><ArrowUpRight size={16} /></div>
              <div className="ledger-queue"><div className="queue-heading"><span>قائمة الحملة / معاينة</span><b>جدة · السعودية</b></div><div><StatusDot /> سيرتك الذاتية جاهزة</div><div><StatusDot /> جارٍ مطابقة الوظائف</div></div>
            </div>
            <div className="hero-stats" dir="rtl"><div className="hero-stats-grid"><div><strong>500+</strong><span>معاينة · وظائف سعودية تمت مراجعتها</span></div><div><strong>24/7</strong><span>محرّك يعمل على مدار الساعة</span></div><div><strong>2</strong><span>لغتان مدعومتان</span></div></div></div>
	          </div>
	        </section>
	        </SectionErrorBoundary>


        <SectionErrorBoundary name="arabic-approval-promise" fallback={<section className="proof-strip" aria-label="وعد الموافقة"><div className="page-frame proof-grid"><div><StatusDot /> لا يُقدَّم شيء دون موافقتك</div></div></section>}><section className="proof-strip" aria-label="وعد الموافقة"><div className="page-frame proof-grid"><div><StatusDot /> نبحث ونُعِدّ الطلبات</div><div><StatusDot /> تراجع وتوافق</div><div><StatusDot /> لا يُقدَّم شيء دون موافقتك</div><div><StatusDot /> كل طلب يبقى واضحاً أمامك</div></div></section></SectionErrorBoundary>

        <SectionErrorBoundary name="arabic-how-it-works" fallback={<section id="how" className="workflow-section section-ink"><div className="page-frame"><h2>كيف تعمل الخدمة.</h2><p>تحدد أهدافك، نُعدّ الطلبات، ثم تراجع وتوافق قبل الإرسال.</p></div></section>}><section id="how" className="workflow-section section-ink">
          <div className="page-frame split-layout"><aside className="section-rail inverted"><RailLabel>02 / كيف يعمل</RailLabel><span className="rail-rule" /><p>ثلاث خطوات. موافقتك أولاً.</p></aside><div className="workflow-main"><div className="section-kicker inverse"><Sparkles size={15} /> واضح بالتصميم</div><h2>كيف تعمل <i>الخدمة.</i></h2><p className="section-summary inverse-summary">إعداد واضح، وتحضير مخصّص، وموافقتك قبل تقديم أي طلب.</p><div className="process-list"><article className="process-item"><div className="process-number">01</div><div className="process-content"><h3>أخبرنا بما تريد</h3><p>شارك الوظائف والمجالات والتفضيلات التي تستهدفها في إعداد قصير.</p></div><FileText size={24} strokeWidth={1.4} /></article><article className="process-item"><div className="process-number">02</div><div className="process-content"><h3>نبحث ونُعِدّ</h3><p>يجد فريقنا الفرص المناسبة ويُعدّ طلباً مخصّصاً لكل فرصة.</p></div><Globe2 size={24} strokeWidth={1.4} /></article><article className="process-item active-process"><div className="process-number">03</div><div className="process-content"><h3>توافق، ثم نُقدّم</h3><p>راجع كل طلب قبل إرساله. بعد الموافقة نُقدّمه ونتابع الرد.</p></div><Send size={24} strokeWidth={1.4} /></article></div></div></div>
        </section></SectionErrorBoundary>

        <SectionErrorBoundary name="arabic-who-its-for" fallback={<section id="reviews" className="reviews-pending section-fog"><div className="page-frame"><h2>لمن تناسب الخدمة.</h2><p>للباحثين عن عمل في السعودية الذين يحتاجون إلى طلبات أكثر صلة دون تنفيذ كل خطوة يدوياً.</p></div></section>}><section id="reviews" className="reviews-pending section-fog below-fold-section" aria-labelledby="arabic-campaign-clarity-heading"><div className="page-frame reviews-heading"><div><div className="section-kicker"><MessageCircle size={15} /> لمن تناسب الخدمة</div><h2 id="arabic-campaign-clarity-heading">طلبات أكثر،<br /><i>من دون قضاء كل مساء في المنصات.</i></h2></div><p><ShieldCheck size={16} /> للباحثين عن عمل في السعودية الذين يحتاجون إلى حجم أكبر من الطلبات دون تنفيذها يدوياً.</p></div><div className="page-frame review-cards"><article className="review-card arabic-review"><span className="review-index">01 / أول وظيفة</span><h3>الخريجون الجدد</h3><p className="review-detail">لمن يبحث عن أول وظيفة ويريد روتيناً عملياً ثابتاً للتقديم.</p></article><article className="review-card arabic-review"><span className="review-index">02 / تغيير المسار</span><h3>المهنيون الذين يغيّرون اتجاههم</h3><p className="review-detail">لمن يفكر في دور أو مجال أو مدينة أو خطوة مهنية جديدة.</p></article><article className="review-card arabic-review"><span className="review-index">03 / بحث مشغول</span><h3>المرشحون المشغولون</h3><p className="review-detail">لمن يحتاج إلى طلبات أكثر صلة من دون إدارة كل منصة وخطاب تقديم يدوياً.</p></article></div></section></SectionErrorBoundary>

        {legacyPublicPreviewVisible && <>
        <section id="product" className="video-explainer section-paper below-fold-section" aria-labelledby="arabic-video-explainer-heading">
          <div className="page-frame video-explainer-inner">
            <div className="section-kicker"><Send size={15} /> شاهد كيف تعمل الخدمة</div>
            <h2 id="arabic-video-explainer-heading">30 ثانية فقط، <i>وهذا يكفي لفهمها.</i></h2>
            <LazyMount><DeferredExplainerVideo src={ARABIC_EXPLAINER_VIDEO_SRC} className="video-placeholder video-explainer-media pointer-events-none select-none" ariaLabel="فيديو توضيحي لخدمة AutoApply SA" unavailableLabel="فيديو AutoApply SA التوضيحي غير متاح حالياً؛ خطوات الخدمة ما زالت متاحة" /></LazyMount>
            <p>تستمر عمليات الحملة ضمن خطتك المعتمدة فقط.</p>
            <div className="mt-4 sm:hidden">
              <a href="#upload" className="block w-full text-center bg-[#e5482a] text-white py-3 px-4 font-medium shadow-lg hover:bg-[#c93b20] transition-colors">
                ارفع سيرتك الذاتية الآن ←
              </a>
            </div>
	          </div>
	        </section>

	        <ArabicIntakeSection
          matchPreferences={matchPreferences}
          setMatchPreferences={setMatchPreferences}
          selectedArabicIndustry={selectedArabicIndustry}
          setSelectedArabicIndustry={setSelectedArabicIndustry}
          selectedFile={selectedFile}
          scanState={scanState}
          scanProgress={scanProgress}
          scanResult={scanResult}
          selectedSuggestedRole={selectedSuggestedRole}
          setSelectedSuggestedRole={setSelectedSuggestedRole}
          briefStatus={briefStatus}
          backendAvailable={backendAvailable}
          onFileDrop={onFileDrop}
          onFileChange={onFileChange}
          resetScan={resetScan}
          shareArabicBrief={shareArabicBrief}
          roleLabel={roleLabel}
          cityLabel={cityLabel}
          industryLabels={industryLabels}
          seniorityLabel={seniorityLabel}
          toMatchIndustry={toMatchIndustry}
          makeArabicWhatsAppHref={makeArabicWhatsAppHref}
          WHATSAPP_URL={WHATSAPP_URL}
        />
        </>}

        {legacyPublicPreviewVisible && <section className="proof-strip" aria-label="وعد الموافقة"><div className="page-frame proof-grid"><div><StatusDot /> نبحث ونُعِدّ الطلبات</div><div><StatusDot /> تراجع وتوافق</div><div><StatusDot /> لا يُقدَّم شيء دون موافقتك</div><div><StatusDot /> كل طلب يبقى واضحاً أمامك</div></div></section>}

        <SectionErrorBoundary name="arabic-application-approval" fallback={<section id="approval" className="campaign-preview section-ink"><div className="page-frame"><h2>رؤية كاملة قبل إرسال أي طلب.</h2><p>تراجع الوظيفة والطلب المخصّص وتفاصيل جهة العمل قبل الموافقة.</p></div></section>}><section id="approval" className="campaign-preview section-ink below-fold-section">
          <div className="page-frame campaign-preview-grid"><div className="campaign-preview-copy"><div className="section-kicker inverse"><Clock3 size={15} /> ما الذي توافق عليه</div><h2>رؤية كاملة قبل <i>إرسال أي طلب.</i></h2><p className="section-summary inverse-summary">سترى لكل طلب الإعلان الأصلي ورابطه، ونسخة السيرة أو الطلب المخصّصة له، وتفاصيل الشركة والوظيفة قبل أن توافق.</p><div className="campaign-switcher" role="tablist" aria-label="تفاصيل موافقة الطلبات">{campaignStages.map((stage, index) => <button key={stage.label} className={campaignStage === index ? "active" : ""} role="tab" aria-selected={campaignStage === index} aria-controls="arabic-campaign-preview-status" onClick={() => setCampaignStage(index)}><span>0{index + 1}</span>{stage.label}</button>)}</div><Link href="/ar/enquire" className="text-button light-text">راجع خطة حملتك <MoveLeft size={17} /></Link></div><div id="arabic-campaign-preview-status" className="campaign-dashboard" aria-label="معاينة حالة الحملة"><div className="dashboard-top"><span>الحملة السعودية / معاينة</span><b>{campaignStages[campaignStage].status}</b></div><div className="dashboard-spotlight"><span>0{campaignStage + 1}</span><div><b>{campaignStages[campaignStage].title}</b><p>{campaignStages[campaignStage].detail}</p></div></div>{campaignStages.map((stage, index) => <button className={`dashboard-progress ${index === campaignStage ? "active" : ""} ${index > campaignStage ? "quiet" : ""}`} key={stage.label} onClick={() => setCampaignStage(index)}><span>0{index + 1}</span><div><b>{stage.label}</b><small>{index < campaignStage ? "الخطوة جاهزة" : index === campaignStage ? "المعاينة الحالية" : "الخطوة التالية"}</small></div>{index < campaignStage ? <Check size={16} /> : index === campaignStage ? <Clock3 size={16} /> : <ArrowUpRight size={16} />}</button>)}</div></div>
        </section></SectionErrorBoundary>

        <SectionErrorBoundary name="arabic-plans" fallback={<section id="pricing" className="pricing-section section-paper"><div className="page-frame"><h2>الباقات</h2><p>باقات شهرية تبدأ من 99 ريال. تواصل معنا لاختيار الباقة المناسبة.</p></div></section>}><section id="pricing" className="pricing-section section-paper below-fold-section"><div className="page-frame split-layout"><aside className="section-rail"><RailLabel>05 / الأسعار</RailLabel><span className="rail-rule" /><p>باقات شهرية / ريال</p></aside><div className="pricing-main"><div className="pricing-heading"><div><div className="section-kicker"><Zap size={15} /> حدّد محركك</div><h2>حدّد الوتيرة المناسبة <i>لبحثك.</i></h2></div><p>باقات شهرية. الدفع عبر STC Pay أو الآيبان. إلغاء في أي وقت.</p></div><div className="plans-grid">{plans.map((plan) => <article className={`plan-card ${plan.featured ? "plan-featured" : ""}`} key={plan.name}>{plan.featured && <div className="plan-flag">الأكثر اختياراً</div>}<div className="plan-top"><span>{plan.name}</span><ArrowUpRight size={18} /></div><div className="price"><b>{plan.price}</b><span>ريال<br />/ شهرياً</span></div><p>{plan.descriptor}</p><ul>{plan.features.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}</ul><Link href={`/ar/enquire?plan=${plan.price === "99" ? "starter" : plan.price === "149" ? "pro" : "founder"}`} className="plan-cta" onClick={() => trackEngagement("plan_selected", { plan: plan.name, page: window.location.pathname, language: "Arabic" })}>اختر {plan.name} <MoveLeft size={17} /></Link></article>)}</div></div></div></section></SectionErrorBoundary>

        {legacyPublicPreviewVisible && <section id="reviews" className="reviews-pending section-fog below-fold-section" aria-labelledby="arabic-campaign-clarity-heading"><div className="page-frame reviews-heading"><div><div className="section-kicker"><MessageCircle size={15} /> لمن تناسب الخدمة</div><h2 id="arabic-campaign-clarity-heading">طلبات أكثر،<br /><i>من دون قضاء كل مساء في المنصات.</i></h2></div><p><ShieldCheck size={16} /> للباحثين عن عمل في السعودية الذين يحتاجون إلى حجم أكبر من الطلبات دون تنفيذها يدوياً.</p></div><div className="page-frame review-cards"><article className="review-card arabic-review"><span className="review-index">01 / أول وظيفة</span><h3>الخريجون الجدد</h3><p className="review-detail">لمن يبحث عن أول وظيفة ويريد روتيناً عملياً ثابتاً للتقديم.</p></article><article className="review-card arabic-review"><span className="review-index">02 / تغيير المسار</span><h3>المهنيون الذين يغيّرون اتجاههم</h3><p className="review-detail">لمن يفكر في دور أو مجال أو مدينة أو خطوة مهنية جديدة.</p></article><article className="review-card arabic-review"><span className="review-index">03 / بحث مشغول</span><h3>المرشحون المشغولون</h3><p className="review-detail">لمن يحتاج إلى طلبات أكثر صلة من دون إدارة كل منصة وخطاب تقديم يدوياً.</p></article></div></section>}

        <SectionErrorBoundary name="arabic-privacy-safety" fallback={<section id="location" className="location-section section-fog"><div className="page-frame"><h2>بياناتك تبقى خاصة.</h2><p>نستخدم المعلومات فقط لإعداد طلبات توافق عليها.</p></div></section>}><section id="location" className="location-section section-fog below-fold-section"><div className="page-frame location-grid"><div className="location-copy"><div className="section-kicker"><ShieldCheck size={15} /> الخصوصية والأمان</div><h2>بياناتك تبقى <i>خاصة.</i></h2><p className="section-summary">نستخدم معلوماتك فقط للبحث عن طلبات وإعدادها بالنيابة عنك، ولا نبيعها لأطراف ثالثة. لا تُشارك سيرتك وبياناتك مع جهة عمل إلا كجزء من طلب وافقت عليه مسبقاً.</p><div className="location-actions"><Link className="button button-ink" href="/ar/privacy">سياسة الخصوصية <ArrowUpRight size={18} /></Link><Link className="text-button" href="/ar/terms">الشروط <MoveLeft size={18} /></Link></div></div><div className="map-frame"><div className="location-map-canvas privacy-panel"><StatusDot /><b>الموافقة مطلوبة</b><p>لا يُقدَّم أي طلب بالنيابة عنك من دون موافقتك، في كل مرة.</p></div><div className="map-caption"><span><StatusDot /> خاص افتراضياً</span><b>أنت تبقى المتحكم</b></div></div></div></section></SectionErrorBoundary>

        <SectionErrorBoundary name="arabic-faq" fallback={<section id="faq" className="faq-section section-ink"><div className="page-frame"><h2>الأسئلة الشائعة</h2><Link href="/ar/support">مركز الدعم</Link></div></section>}><section id="faq" className="faq-section section-ink below-fold-section"><div className="page-frame split-layout"><aside className="section-rail inverted"><RailLabel>06 / الأسئلة الشائعة</RailLabel><span className="rail-rule" /><p>قبل أن تبدأ</p></aside><div className="faq-main"><div className="section-kicker inverse"><MessageCircle size={15} /> الأسئلة، بإجابات واضحة</div><h2>أشياء تستحق <i>التوضيح.</i></h2><div className="faq-list">{faqs.map((faq, index) => { const isOpen = activeFaq === index; return <article className={`faq-item ${isOpen ? "open" : ""}`} key={faq.question}><button onClick={() => setActiveFaq(isOpen ? null : index)} aria-expanded={isOpen}><span>0{index + 1}</span><b>{faq.question}</b><ChevronDown size={20} /></button><div className="faq-answer"><p>{faq.answer}</p></div></article>; })}</div></div></div></section></SectionErrorBoundary>

        {legacyPublicPreviewVisible && <section id="location" className="location-section section-fog below-fold-section"><div className="page-frame location-grid"><div className="location-copy"><div className="section-kicker"><ShieldCheck size={15} /> الخصوصية والأمان</div><h2>بياناتك تبقى <i>خاصة.</i></h2><p className="section-summary">نستخدم معلوماتك فقط للبحث عن طلبات وإعدادها بالنيابة عنك، ولا نبيعها لأطراف ثالثة. لا تُشارك سيرتك وبياناتك مع جهة عمل إلا كجزء من طلب وافقت عليه مسبقاً.</p><div className="location-actions"><Link className="button button-ink" href="/ar/privacy">سياسة الخصوصية <ArrowUpRight size={18} /></Link><Link className="text-button" href="/ar/terms">الشروط <MoveLeft size={18} /></Link></div></div>          <div className="map-frame"><div className="location-map-canvas privacy-panel"><StatusDot /><b>الموافقة مطلوبة</b><p>لا يُقدَّم أي طلب بالنيابة عنك من دون موافقتك، في كل مرة.</p></div><div className="map-caption"><span><StatusDot /> خاص افتراضياً</span><b>أنت تبقى المتحكم</b></div></div></div></section>}

        <SectionErrorBoundary name="arabic-final-cta" fallback={<section className="final-cta section-accent"><div className="page-frame final-inner"><div><h2>ابدأ بخطة تدور حول بحثك عن وظيفة.</h2></div><div className="final-action"><p>أخبرنا بالوظائف التي تريدها، ثم راجع اتجاه الحملة قبل تقديم أي طلب.</p><Link className="button button-ink" href="/ar/enquire">ابدأ حملة <ArrowUpRight size={18} /></Link></div></div></section>}><section className="final-cta section-accent"><div className="page-frame final-inner"><div><div className="eyebrow dark"><StatusDot tone="quiet" /> ابدأ حملة جديدة</div><h2>ابدأ بخطة <br /><i>تدور حول بحثك عن وظيفة.</i></h2></div><div className="final-action"><p>أخبرنا بالوظائف التي تريدها، ثم راجع اتجاه الحملة قبل تقديم أي طلب.</p><Link className="button button-ink" href="/ar/enquire">ابدأ حملة <ArrowUpRight size={18} /></Link></div></div></section></SectionErrorBoundary>
      </main>
      </SectionErrorBoundary>

      <SectionErrorBoundary name="arabic-marketing-footer" fallback={<footer className="footer"><div className="page-frame footer-top"><a className="footer-email" href="mailto:apply@hsndm.tech">apply@hsndm.tech</a></div></footer>}><footer className="footer"><div className="page-frame footer-top"><Link className="brand footer-brand" href="/ar"><img src="/manus-storage/autoapply-symbol_80d77010.png" alt="" className="brand-mark" width="1920" height="1920" /><span>AutoApply <em>SA</em></span></Link><p>مُركّز على السعودية. مقرّه في جدة.<br />خدمة للمرشحين في جميع أنحاء المملكة.</p><a className="footer-email" href="mailto:apply@hsndm.tech">apply@hsndm.tech <ArrowUpRight size={16} /></a></div><div className="page-frame footer-enquiry-wrap"><FooterEnquiryForm locale="ar" /></div><div className="page-frame footer-bottom"><span>© 2026 AUTOAPPLY SA</span><div><a href="https://instagram.com/hsndm_" target="_blank" rel="noreferrer">Instagram</a><a href="https://linkedin.com/in/hsndm" target="_blank" rel="noreferrer">LinkedIn</a><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp</a></div><span>جدة، السعودية</span></div></footer></SectionErrorBoundary>
    </div>
  );
}
