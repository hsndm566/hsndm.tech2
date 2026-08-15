/**
 * Design reminder — Operational Clarity: Swiss information design with a signal rail,
 * deliberate asymmetry, near-black ink, warm paper, and signal vermilion used only for action.
 */
import { ChangeEvent, DragEvent, lazy, Suspense, useEffect, useRef, useState } from "react";
import HeroMedia from "@/components/HeroMedia";
import { trackEngagement } from "@/lib/analytics";
import { demoLists } from "@/lib/careerTaxonomy";
import { HERO_VIDEO_URL } from "@/lib/media";
import { applyPageSeo } from "@/lib/seo";
import { trpc } from "@/lib/trpc";
import { SearchableSaudiSelect } from "@/components/SearchableSaudiSelect";
import { saudiCities, saudiIndustries, toMatchIndustry } from "@/lib/saudiTaxonomy";
import {
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Globe2,
  Menu,
  MessageCircle,
  MoveRight,
  Paperclip,
  ScanSearch,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

const MapView = lazy(async () => {
  const module = await import("@/components/Map");
  return { default: module.MapView };
});

const WHATSAPP_URL =
  "https://wa.me/966571448656?text=Hi%20AutoApply%20SA%2C%20I%20want%20to%20start%20a%20campaign.";

import { EXPLAINER_VIDEO_URL } from "@/lib/media";
const EXPLAINER_VIDEO_SRC = EXPLAINER_VIDEO_URL;

const plans = [
  {
    name: "Starter",
    price: "99",
    descriptor: "A focused starting lane.",
    features: ["~40 applications", "Email + portal submit", "Weekly report"],
  },
  {
    name: "Pro",
    price: "149",
    descriptor: "For active multi-channel momentum.",
    features: ["~90 applications", "Priority tailoring", "Priority human review", "Daily report"],
    featured: true,
  },
  {
    name: "Founder",
    price: "249",
    descriptor: "High-touch targeting for a pivotal move.",
    features: ["~150 applications", "Multi-role targeting", "White-glove onboarding"],
  },
];

const faqs = [
  {
    question: "Is my CV data private?",
    answer:
      "Your CV is used to match and tailor applications. You can request deletion at any time; it is not sold as a separate product.",
  },
  {
    question: "Do you apply to real companies?",
    answer:
      "The service is designed for live Saudi Arabia roles, using email and direct portal submission, with bounce-checked addresses where email is used.",
  },
  {
    question: "Which languages are supported?",
    answer:
      "The current service supports English and Arabic for job seekers across Saudi Arabia.",
  },
  {
    question: "How do I pay?",
    answer:
      "Monthly plans can be arranged through STC Pay or bank transfer (IBAN). You can ask the team about the current payment instructions when you start a campaign.",
  },
  {
    question: "When should I expect a response?",
    answer:
      "Campaign enquiries are reviewed by the team. For the fastest direct response, use WhatsApp after submitting your brief; if you have not heard back within one business day, send a short follow-up with your name and target role.",
  },
];

const campaignStages = [
  { label: "CV signals", title: "Read the signal", detail: "Skills, experience, and language are prepared for a Saudi Arabia role search.", status: "INPUT READY" },
  { label: "Role lanes", title: "Confirm the direction", detail: "Your preferred city, industry, seniority, and language create a focused campaign brief.", status: "TARGETING READY" },
  { label: "Application rhythm", title: "Put the search in motion", detail: "The next step is tailored applications and a visible record of campaign activity.", status: "CAMPAIGN ACTIVE" },
];

function RailLabel({ children }: { children: React.ReactNode }) {
  return <span className="rail-label">{children}</span>;
}

function StatusDot({ tone = "active" }: { tone?: "active" | "quiet" }) {
  return <span className={`status-dot ${tone}`} aria-hidden="true" />;
}

type ScanResult = { field: string; roles: string[]; confidence: "Focused" | "Strong"; rationale: string; keySkills?: string[]; topDomain?: string };
type MatchPreferences = { city: string; industry: string; seniority: string; language: string };

const industryLabels: Record<string, string> = {
  all: "All industries",
  "technology-data": "Technology & Data",
  "business-operations": "Business & Operations",
  "people-service": "People & Services",
  "engineering-construction": "Engineering & Construction",
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [selectedFile, setSelectedFile] = useState("");
  const [userProfileType, setUserProfileType] = useState<"Fresh Graduate" | "Experienced Hire" | "Career Switcher" | "Default">("Default");
  const [scanState, setScanState] = useState<"idle" | "scanning" | "matched" | "fallback">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedSuggestedRole, setSelectedSuggestedRole] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState(() => {
    if (typeof window === "undefined") return "Technology & Software";
    const savedSector = localStorage.getItem("autoapply_sector");
    return savedSector || "Technology & Software";
  });
  const [matchPreferences, setMatchPreferences] = useState<MatchPreferences>(() => {
    if (typeof window === "undefined") return { city: "Jeddah", industry: "all", seniority: "Any level", language: "English" };
    const savedCity = localStorage.getItem("autoapply_city");
    const savedSeniority = localStorage.getItem("autoapply_seniority");
    const savedSector = localStorage.getItem("autoapply_sector");
    return {
      city: savedCity || "Jeddah",
      industry: savedSector ? toMatchIndustry(savedSector) : "all",
      seniority: savedSeniority || "Any level",
      language: "English",
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("autoapply_city", matchPreferences.city);
    localStorage.setItem("autoapply_seniority", matchPreferences.seniority);
    localStorage.setItem("autoapply_sector", selectedIndustry);
  }, [matchPreferences.city, matchPreferences.seniority, selectedIndustry]);
  const [campaignStage, setCampaignStage] = useState(1);
  const [briefShared, setBriefShared] = useState(false);
  const [briefStatus, setBriefStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [handoffBlocked, setHandoffBlocked] = useState(false);
  const [latestActivityText, setLatestActivityText] = useState("Engine active — 24/7");
  const [explainerVideoFailed, setExplainerVideoFailed] = useState(false);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch("/v1/campaigns/latest-activity");
        if (res.ok) {
          const data = await res.json();
          if (data && data.timestamp) {
            const diffMins = Math.max(0, Math.floor((Date.now() - data.timestamp) / 60000));
            setLatestActivityText(`${diffMins === 0 ? "Just now" : `${diffMins} minutes ago`}`);
          } else {
            setLatestActivityText("Engine active — 24/7");
          }
        }
      } catch {
        setLatestActivityText("Engine active — 24/7");
      }
    };
    fetchLatest();
    const interval = setInterval(fetchLatest, 60000);
    return () => clearInterval(interval);
  }, []);
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
    applyPageSeo({ title: "AutoApply SA | AI Job Application Engine for Saudi Arabia", description: "AutoApply SA helps job seekers across Saudi Arabia organise, tailor, and submit applications with a 24/7 AI application engine based in Jeddah.", path: "/" });
  }, []);

  useEffect(() => {
    const updateBackToTopVisibility = () => setShowBackToTop(window.scrollY > window.innerHeight * 1.15);
    updateBackToTopVisibility();
    window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateBackToTopVisibility);
  }, []);

  useEffect(() => {
    const trackCampaignAction = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href]');
      const href = target?.getAttribute("href") || "";
      if (!target || (!href.startsWith("/enquire") && !href.includes("wa.me/966571448656"))) return;
      const label = (target.textContent || "campaign action").trim().replace(/\s+/g, " ").slice(0, 64);
      trackEngagement("campaign_cta_clicked", { page: window.location.pathname, placement: label });
    };
    document.addEventListener("click", trackCampaignAction);
    return () => document.removeEventListener("click", trackCampaignAction);
  }, []);

  useEffect(() => () => {
    if (scanFrame.current !== null) window.cancelAnimationFrame(scanFrame.current);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  const startScan = (file?: File) => {
    if (!file) return;
    if (scanFrame.current !== null) window.cancelAnimationFrame(scanFrame.current);
    const version = scanVersion.current + 1;
    scanVersion.current = version;
    const scanDuration = 8000 + Math.floor(Math.random() * 4001);
    const preferencesAtScan = matchPreferences;
    const textPromise = import("@/lib/careerMatcher").then(({ readCvText }) => readCvText(file, { onExtractionFailure: () => reportCvExtractionFailure.mutate({ route: "/" }) }));
    const fieldPromise = textPromise.then((text) => demoLists(text, preferencesAtScan.industry, userProfileType));
    const startedAt = performance.now();

    setSelectedFile(file.name);
    setScanState("scanning");
    setScanProgress(0);
    setScanResult(null);
    setSelectedSuggestedRole(null);
    setBriefShared(false);
    setBriefStatus("idle");

    const tick = (now: number) => {
      const progress = Math.min(100, Math.round(((now - startedAt) / scanDuration) * 100));
      setScanProgress(progress);
      if (progress < 100) {
        scanFrame.current = window.requestAnimationFrame(tick);
        return;
      }
      void Promise.all([fieldPromise, textPromise]).then(([fields, cvText]) => {
        if (scanVersion.current !== version) return;
        const bestFit = fields[0];
        if (!bestFit) {
          setScanState("fallback");
          return;
        }
        const confidence = fields.length > 1 ? "Strong" : "Focused";
        const scope = preferencesAtScan.industry === "all" ? "your CV signals" : "your CV signals and selected industry";
        
        // Trigger AI skill extraction concurrently
        const fallbackSkills = { keySkills: [], topDomain: "" };
        const skillsPromise = cvText && cvText.length >= 50 
          ? extractSkillsMutation.mutateAsync({ cvText, language: "English" }).catch(() => fallbackSkills)
          : Promise.resolve(fallbackSkills);

        void skillsPromise.then((extracted) => {
          if (scanVersion.current !== version) return;
          setScanResult({
            field: bestFit.title,
            roles: bestFit.items.slice(0, 3),
            confidence,
            rationale: `Matched from ${scope}; ${preferencesAtScan.city}, ${preferencesAtScan.seniority}, and ${preferencesAtScan.language} are included in your Saudi Arabia campaign brief.`,
            keySkills: extracted.keySkills,
            topDomain: extracted.topDomain,
          });
          setScanState("matched");
        });
      });
    };
    scanFrame.current = window.requestAnimationFrame(tick);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    startScan(event.target.files?.[0]);
  };

  const onFileDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    startScan(event.dataTransfer.files?.[0]);
  };

  const resetScan = () => {
    scanVersion.current += 1;
    if (scanFrame.current !== null) window.cancelAnimationFrame(scanFrame.current);
    setSelectedFile("");
    setScanProgress(0);
    setScanResult(null);
    setSelectedSuggestedRole(null);
    setBriefShared(false);
    setBriefStatus("idle");
    setHandoffBlocked(false);
    setScanState("idle");
  };

  const shareCampaignBrief = () => {
    if (!scanResult) return;
    const targetRoles = selectedSuggestedRole ? [selectedSuggestedRole] : scanResult.roles;
    const campaignMessage = [
      "Hi AutoApply SA — I completed the Saudi Campaign Readiness Check.",
      `City: ${matchPreferences.city}`,
      `Industry: ${industryLabels[matchPreferences.industry]}`,
      `Seniority: ${matchPreferences.seniority}`,
      `Application language: ${matchPreferences.language}`,
      `Detected role lanes: ${targetRoles.join(", ")}`,
      "I understand this is a preview only and no applications have been sent. I would like to discuss a campaign.",
    ].join("\n");
    const whatsappHref = `https://wa.me/966571448656?text=${encodeURIComponent(campaignMessage)}`;

    trackEngagement("campaign_readiness_brief_shared", {
      page: window.location.pathname,
      city: matchPreferences.city,
      language: matchPreferences.language,
      role_count: String(targetRoles.length),
    });
    const handoffWindow = window.open("about:blank", "autoapply-whatsapp");
    if (handoffWindow) handoffWindow.opener = null;
    else reportBlockedHandoff.mutate({ route: "/" });
    setHandoffBlocked(!handoffWindow);
    setBriefStatus("submitting");
    setBriefShared(true);
    if (backendAvailable) {
      recordReadiness.mutate({
        city: matchPreferences.city as "Jeddah" | "Riyadh" | "Dammam" | "Makkah" | "Madinah" | "Anywhere in Saudi Arabia",
        industry: matchPreferences.industry as "all" | "technology-data" | "business-operations" | "people-service" | "engineering-construction",
        seniority: matchPreferences.seniority as "Any level" | "Entry level" | "Mid level" | "Senior level",
        language: matchPreferences.language as "English" | "Arabic",
        targetRoles,
        primaryField: scanResult.field,
        cvReadable: true,
        consent: true,
        source: "landing-readiness-check",
      });
    }
    window.setTimeout(() => {
      setBriefStatus("success");
      if (typeof window !== "undefined") {
        localStorage.removeItem("autoapply_city");
        localStorage.removeItem("autoapply_seniority");
        localStorage.removeItem("autoapply_sector");
      }
      if (handoffWindow) handoffWindow.location.replace(whatsappHref);
    }, 650);
  };

  const returnToTop = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    trackEngagement("back_to_top_clicked", { page: window.location.pathname });
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#upload">Skip to CV matcher</a>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="AutoApply SA home">
          <img src="/manus-storage/autoapply-symbol_80d77010.png" alt="" className="brand-mark" />
          <span>AutoApply <em>SA</em></span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <button onClick={() => scrollTo("how")}>How it works</button>
          <button onClick={() => scrollTo("product")}>Product</button>
          <button onClick={() => scrollTo("upload")}>Upload CV</button>
          <Link href="/ats">ATS review</Link>
          <button onClick={() => scrollTo("pricing")}>Pricing</button>
          <button onClick={() => scrollTo("faq")}>FAQ</button>
        </nav>

        <div className="nav-actions">
          <a className="language-toggle is-english" href="/ar" lang="ar" aria-label="التبديل إلى النسخة العربية"><span>EN</span><span>AR</span></a>
          <Link className="button button-ink button-small" href="/enquire">Start a campaign <ArrowUpRight size={15} /></Link>
          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={21} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {[
              ["How it works", "how"],
              ["Product", "product"],
              ["Upload CV", "upload"],
              ["Pricing", "pricing"],
              ["FAQ", "faq"],
            ].map(([label, id], index) => (
              <button key={id} onClick={() => scrollTo(id)}>
                <span>0{index + 1}</span> {label} <ArrowDownRight size={18} />
              </button>
            ))}
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Talk to the team <MessageCircle size={18} />
            </a>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-heading">
          <HeroMedia alt="Professional reviewing a job application at a laptop" />
          <div className="hero-structure" aria-hidden="true">
            <span className="hero-grid-line one" />
            <span className="hero-grid-line two" />
            <span className="hero-grid-line three" />
          </div>
          <div className="hero-content page-frame">
            <div className="hero-lead">
              <div className="eyebrow light"><StatusDot /> 24/7 job engine <span /> Jeddah, Saudi Arabia</div>
              <h1 id="hero-heading">
                We apply to jobs for you.<br />
                Every day.<br />
                Automatically.
              </h1>
              <p>
                AutoApply SA submits tailored job applications to Saudi companies on your behalf — by email and portal — while you focus on everything else.
              </p>
              <div className="hero-actions">
                <Link className="button button-ink" href="/enquire">Start your campaign <ArrowDownRight size={18} /></Link>
                <button className="text-button light-text" onClick={() => scrollTo("how")}>
                  See the system <MoveRight size={18} />
                </button>
              </div>
              <div className="hero-note">From 99 SAR / month <b /> no card needed to begin a conversation</div>
              <div className="hero-trust-row"><span><ShieldCheck size={14} /> Start with a brief</span><span><Clock3 size={14} /> Follow up within one business day</span></div>
            </div>

              <div className="hero-ledger" aria-label="Application engine status">
                <div className="ledger-topline">
                  <span>APPLICATION ENGINE</span>
                  <span>LIVE / 24H</span>
                </div>
              <div className="ledger-route">
                <div><StatusDot /> CV read</div>
                <span />
                <div><StatusDot /> Roles matched</div>
                <span />
                <div><StatusDot tone="quiet" /> Applying</div>
              </div>
              <div className="ledger-record">
                <span className="record-number">03</span>
                <div>
                  <b>Ready to apply</b>
                  <small>Skills, experience & language mapped</small>
                </div>
                <ArrowUpRight size={16} />
              </div>
              <div className="ledger-queue" aria-label="Saudi Arabia campaign workflow preview">
                <div className="queue-heading"><span>CAMPAIGN QUEUE / PREVIEW</span><b>JEDDAH · SA</b></div>
                <div><StatusDot /> Your CV is ready</div>
                <div><StatusDot /> Roles being matched</div>
              </div>
            </div>

            <div className="hero-stats space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div><strong>500+</strong><span>Saudi roles scanned</span></div>
                <div><strong>24/7</strong><span>Engine in motion</span></div>
                <div><strong>2</strong><span>Languages supported</span></div>
              </div>
              <p className="text-xs font-mono text-[#fbf9f5]/80 pt-1 border-t border-white/10">⚡ {latestActivityText.includes("Engine") ? latestActivityText : `Last application sent: ${latestActivityText}`}</p>
            </div>
          </div>
        </section>

        <section id="how" className="workflow-section section-ink">
          <div className="page-frame split-layout">
            <aside className="section-rail inverted">
              <RailLabel>02 / Workflow</RailLabel>
              <span className="rail-rule" />
              <p>THREE MOVES. ZERO MANUAL APPLYING.</p>
            </aside>
            <div className="workflow-main">
              <div className="section-kicker inverse"><Sparkles size={15} /> CLEAR BY DESIGN</div>
              <h2>Put the search <i>on a system.</i></h2>
              <p className="section-summary inverse-summary">Start with the material you already have. Then let the engine turn it into a consistent application routine.</p>
              <div className="process-list">
                <article className="process-item">
                  <div className="process-number">01</div>
                  <div className="process-content">
                    <h3>Upload your CV</h3>
                    <p>Drop a PDF, DOC, DOCX, or TXT. Your skills, experience, and career trajectory become the starting brief.</p>
                  </div>
                  <FileText size={24} strokeWidth={1.4} />
                </article>
                <article className="process-item">
                  <div className="process-number">02</div>
                  <div className="process-content">
                    <h3>Set your target roles</h3>
                    <p>Review the best-fit role lanes found across Saudi Arabia listings and align the search to your next move.</p>
                  </div>
                  <Globe2 size={24} strokeWidth={1.4} />
                </article>
                <article className="process-item active-process">
                  <div className="process-number">03</div>
                  <div className="process-content">
                    <h3>The engine applies 24/7</h3>
                    <p>Applications, tailored cover letters, portals, email sends, and delivery checks progress while you get on with your day.</p>
                  </div>
                  <Send size={24} strokeWidth={1.4} />
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="video-explainer section-paper" aria-labelledby="video-explainer-heading">
          <div className="page-frame video-explainer-inner">
            <div className="section-kicker"><Send size={15} /> SEE IT WORK</div>
            <h2 id="video-explainer-heading">30 seconds. That&apos;s all it takes to understand.</h2>
            {EXPLAINER_VIDEO_SRC && !explainerVideoFailed ? (
              <video className="video-placeholder video-explainer-media" autoPlay loop muted playsInline disablePictureInPicture controlsList="nodownload noplaybackrate" preload="metadata" aria-label="AutoApply SA walkthrough video" onError={() => setExplainerVideoFailed(true)}>
                <source src={EXPLAINER_VIDEO_SRC} type="video/mp4" />
                Your browser cannot play this background video. The campaign walkthrough remains available through the surrounding service steps.
              </video>
            ) : (
              <div className="video-placeholder" role="status" aria-live="polite" aria-label="AutoApply SA walkthrough video unavailable; service steps remain available">
                <span className="video-play" aria-hidden="true"><Send size={22} fill="currentColor" /></span>
                <span>Powered by AutoApply SA</span>
              </div>
            )}
            <p>Powered by AutoApply SA. This is what runs while you sleep.</p>
            <div className="mt-4 sm:hidden">
              <a href="#upload" className="block w-full text-center bg-[#e5482a] text-white py-3 px-4 font-medium shadow-lg hover:bg-[#c93b20] transition-colors">
                Upload CV Now →
              </a>
            </div>
          </div>
        </section>

        <section id="upload" className="upload-section section-paper">
          <div className="page-frame upload-grid">
            <div className="upload-image-wrap">
              <img src="/manus-storage/autoapply-desk_635170b2.jpg" alt="Minimal worktable prepared for a job search" />
              <div className="image-stamp"><span>Try it now — 60 seconds</span><ArrowDownRight size={17} /></div>
            </div>
            <div className="upload-copy">
              <div className="section-kicker"><Paperclip size={15} /> Try it now — takes 60 seconds</div>
              <h2>Drop your CV. <i>We&apos;ll show you what&apos;s possible.</i></h2>
              <p className="section-summary">Select the latest version of your CV, then set the Saudi Arabia role preferences that matter to you. The local scan uses both inputs to make its match more relevant. No applications are sent during this readiness check.</p>
              <div className="match-preferences" aria-label="Saudi Arabia role preferences">
                <div className="preferences-heading"><span><SlidersHorizontal size={14} /> MATCH PREFERENCES</span><small>Applied locally</small></div>
                <div className="preferences-grid">
                  <label><span>City</span><SearchableSaudiSelect options={saudiCities} value={matchPreferences.city} onChange={(city) => setMatchPreferences((current) => ({ ...current, city }))} placeholder="Search Saudi cities…" /></label>
                  <label><span>Industry</span><SearchableSaudiSelect options={saudiIndustries} value={selectedIndustry} onChange={(industry) => { setSelectedIndustry(industry); setMatchPreferences((current) => ({ ...current, industry: toMatchIndustry(industry) })); }} placeholder="Search industries…" /></label>
                  <label><span>Seniority</span><select value={matchPreferences.seniority} onChange={(event) => setMatchPreferences((current) => ({ ...current, seniority: event.target.value }))}><option>Any level</option><option>Entry level</option><option>Mid level</option><option>Senior level</option></select></label>
                  <label><span>Language</span><select value={matchPreferences.language} onChange={(event) => setMatchPreferences((current) => ({ ...current, language: event.target.value }))}><option>English</option><option>Arabic</option></select></label>
                </div>
              </div>
              <div className="mb-3 space-y-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[#151515]/70">Profile type:</span>
                  {(["Fresh Graduate", "Experienced Hire", "Career Switcher"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUserProfileType(userProfileType === type ? "Default" : type)}
                      aria-pressed={userProfileType === type}
                      className={`px-3 py-1.5 border transition-all ${userProfileType === type ? "bg-[#151515] text-white border-[#151515]" : "bg-white text-[#151515] border-black/20 hover:border-black"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[#151515]/70">Emerging sector filter:</span>
                  {[
                    { label: "AI & Emerging Tech", industryVal: "Data, AI & Analytics", scopeVal: "technology-data" },
                    { label: "Renewable Energy", industryVal: "Energy, Oil & Gas", scopeVal: "engineering-construction" },
                  ].map((sector) => (
                    <button
                      key={sector.label}
                      type="button"
                      aria-pressed={selectedIndustry === sector.industryVal}
                      onClick={() => {
                        setSelectedIndustry(sector.industryVal);
                        setMatchPreferences((current) => ({ ...current, industry: sector.scopeVal }));
                      }}
                      className={`px-3 py-1.5 border transition-all ${selectedIndustry === sector.industryVal ? "bg-[#e5482a] text-white border-[#e5482a]" : "bg-white text-[#151515] border-black/20 hover:border-black"}`}
                    >
                      {sector.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className={`drop-zone ${scanState !== "idle" ? "has-file" : ""} ${scanState === "scanning" ? "is-scanning-laser" : ""}`} aria-busy={scanState === "scanning"} onDragOver={(event) => event.preventDefault()} onDrop={onFileDrop}>
                <input type="file" accept=".pdf,.doc,.docx,.txt" aria-describedby="cv-privacy-note" onChange={onFileChange} />
                <span className="drop-symbol"><FileText size={24} /></span>
                <span className="drop-copy">
                  <b>{selectedFile || "Choose or drop your CV"}</b>
                  <small>{selectedFile ? "Local scan active — your file stays in this browser" : "PDF, DOC, DOCX or TXT"}</small>
                </span>
                <span className="drop-arrow"><ArrowUpRight size={20} /></span>
              </label>
              {scanState === "scanning" && (
                <div className="role-scan" role="status" aria-live="polite">
                  <div className="scan-meta"><span><ScanSearch size={14} /> Finding roles for you…</span><span className="text-[11px] font-mono opacity-75 ml-2">Scanning locally</span><b>{scanProgress}%</b></div>
                  <div className="scan-track" role="progressbar" aria-label="Finding relevant roles" aria-valuemin={0} aria-valuemax={100} aria-valuenow={scanProgress}><span style={{ width: `${scanProgress}%` }} /></div>
                  <p>Reading skills, experience, and career signals locally.</p>
                </div>
              )}
              {scanState === "matched" && scanResult && (
                <div className="role-results" role="status" aria-live="polite">
                  <div className="result-heading"><span><Check size={14} /> ROLE SIGNALS FOUND</span><button onClick={resetScan}>Scan another CV</button></div>
                  <p>Best-fit lane <b>{scanResult.field}</b> <em>{scanResult.confidence} match</em></p>
                  <div className="space-y-2">
                    <div className="role-chips" aria-label="Suggested target roles">
                      {scanResult.roles.map((role, idx) => {
                        const confidenceLabel = idx === 0 ? "Strong match" : idx === 1 ? "Possible match" : "Worth exploring";
                        return (
                          <button type="button" key={role} className={`flex flex-col items-start p-2 border ${selectedSuggestedRole === role ? "bg-[#151515] text-white border-[#151515]" : "bg-white text-[#151515] border-black/20"}`} aria-pressed={selectedSuggestedRole === role} onClick={() => setSelectedSuggestedRole(role)}>
                            <span className="flex items-center gap-1 font-medium"><span>{role}</span><ArrowUpRight size={13} /></span>
                            <span className="text-[10px] opacity-85 font-mono">[{confidenceLabel}]</span>
                          </button>
                        );
                      })}
                    </div>
                    {(() => {
                      const fieldLower = (scanResult.field || "").toLowerCase();
                      const countText = fieldLower.includes("software") || fieldLower.includes("data") || fieldLower.includes("ai") || fieldLower.includes("it") ? "~340 open roles in KSA this month"
                        : fieldLower.includes("operations") || fieldLower.includes("engineer") || fieldLower.includes("construction") || fieldLower.includes("mechanical") ? "~280 open roles in KSA this month"
                        : fieldLower.includes("account") || fieldLower.includes("finance") ? "~190 open roles in KSA this month"
                        : fieldLower.includes("health") || fieldLower.includes("nurse") ? "~220 open roles in KSA this month"
                        : fieldLower.includes("logistics") || fieldLower.includes("supply") ? "~160 open roles in KSA this month"
                        : "~120 open roles in KSA this month";
                      return <p className="text-xs font-mono text-[#151515]/70">{countText}</p>;
                    })()}
                  </div>
                  {selectedSuggestedRole && <p className="role-selection"><Check size={13} /> <b>{selectedSuggestedRole}</b> selected for your campaign brief.</p>}
                  {scanResult.keySkills && scanResult.keySkills.length > 0 ? (
                    <div className="p-3 bg-black/[0.03] border border-black/10 my-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold mb-2 text-[#151515]">
                        <Sparkles size={13} className="text-[#e5482a]" /> AI Extracted Key Skills ({scanResult.topDomain || scanResult.field})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {scanResult.keySkills.map((skill) => (
                          <span key={skill} title={`Directly aligns with ${scanResult.field} in Saudi Arabia`} className="px-2 py-0.5 bg-white border border-black/15 text-xs font-mono text-[#151515] cursor-help transition-colors hover:border-[#e5482a]">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] font-mono text-black/60 mt-2">Hover skill chips to see alignment with your target Saudi role lane.</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-black/[0.02] border border-black/10 my-3 text-xs font-mono text-black/70 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      <span>AI skills currently unavailable — local role matching remains fully active.</span>
                    </div>
                  )}
                  <div className="match-rationale"><b>Why this match</b><span>{scanResult.rationale}</span></div>
                  <section className="readiness-card" aria-label="Saudi Campaign Readiness Check">
                    <div className="readiness-heading"><span><Zap size={14} /> SAUDI CAMPAIGN READINESS</span><b>PREVIEW ONLY</b></div>
                    <p>Here is the direction we would use to begin a campaign conversation—not a job application or interview prediction.</p>
                    <dl className="readiness-grid">
                      <div><dt>Target city</dt><dd>{matchPreferences.city}</dd></div>
                      <div><dt>Industry</dt><dd>{industryLabels[matchPreferences.industry]}</dd></div>
                      <div><dt>Seniority</dt><dd>{matchPreferences.seniority}</dd></div>
                      <div><dt>Application language</dt><dd>{matchPreferences.language}</dd></div>
                    </dl>
                    <div className="readiness-checklist"><b>Ready for the next step</b><span><Check size={13} /> CV text read locally</span><span><Check size={13} /> Saudi location selected</span><span><Check size={13} /> Role lanes identified</span></div>
                    <button className="readiness-share" type="button" onClick={shareCampaignBrief} disabled={briefStatus === "submitting"}>
                      {briefStatus === "submitting" ? "Preparing your brief…" : "Send this brief to Hasan"} <MessageCircle size={16} />
                    </button>
                    {briefStatus === "submitting" && <div className="readiness-handoff readiness-loading" role="status" aria-live="polite"><span className="readiness-spinner" aria-hidden="true" /><span><b>Preparing your campaign brief</b><small>Creating a clean WhatsApp handoff…</small></span></div>}
                    {briefStatus === "success" && <div className="readiness-handoff readiness-success" role="status" aria-live="polite"><Check size={17} aria-hidden="true" /><span><b>{handoffBlocked ? "WhatsApp was blocked by this browser." : "Campaign brief ready."}</b><small>{handoffBlocked ? "Your details are still on this page. Use the secure link below to open the prepared WhatsApp message." : "WhatsApp has opened with your selected Saudi role direction. If it did not open, use the link below."}</small><a href={`https://wa.me/966571448656?text=${encodeURIComponent(["Hi AutoApply SA — I completed the Saudi Campaign Readiness Check.", `City: ${matchPreferences.city}`, `Industry: ${industryLabels[matchPreferences.industry]}`, `Seniority: ${matchPreferences.seniority}`, `Application language: ${matchPreferences.language}`, `Detected role lanes: ${(selectedSuggestedRole ? [selectedSuggestedRole] : scanResult.roles).join(", ")}`, "I understand this is a preview only and no applications have been sent. I would like to discuss a campaign."].join("\n"))}`} target="_blank" rel="noreferrer">Open WhatsApp</a></span></div>}
                    <small>Your CV is read on your device. The AI receives extracted text only for this one-time skill summary; no CV file or text is stored.</small>
                  </section>
                </div>
              )}
              {scanState === "fallback" && (
                <div className="scan-fallback space-y-3 p-4 border border-black/20 bg-white" role="status" aria-live="polite">
                  <div><ShieldCheck size={16} className="inline mr-1 text-[#e5482a]" /><span><b>Your background is specific — the engine needs a closer look.</b> Not every CV fits a standard lane. That&apos;s not a problem.</span></div>
                  <a href={`https://wa.me/966571448656?text=${encodeURIComponent(`Hi, the CV scanner couldn't find standard role lanes for my background. Can we discuss directly? [City: ${matchPreferences.city}, Industry: ${industryLabels[matchPreferences.industry]}]`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 bg-[#151515] text-white px-4 py-2 text-sm font-medium">Continue on WhatsApp →</a>
                  <button onClick={resetScan} className="block text-xs underline mt-1">Try another CV</button>
                </div>
              )}
              <p id="cv-privacy-note" className="text-xs text-[#151515]/60 mt-3">Your CV is read on your device. Only what you choose to share continues.</p>
              <a className="button button-ink" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                Continue on WhatsApp <MessageCircle size={18} />
              </a>
            </div>
          </div>
        </section>

        <section className="proof-strip" aria-label="Service properties">
          <div className="page-frame proof-grid">
            <div><StatusDot /> Bounce-verified sends</div>
            <div><StatusDot /> Email + portal submission</div>
            <div><StatusDot /> STC Pay & IBAN accepted</div>
            <div><StatusDot /> EN / AR · Saudi Arabia</div>
          </div>
        </section>

        <section className="campaign-preview section-ink">
          <div className="page-frame campaign-preview-grid">
            <div className="campaign-preview-copy"><div className="section-kicker inverse"><Clock3 size={15} /> BEFORE YOU COMMIT</div><h2>See the campaign <i>take shape.</i></h2><p className="section-summary inverse-summary">Choose a stage to see how the Saudi Arabia campaign moves from your CV signal to a visible application rhythm.</p><div className="campaign-switcher" role="tablist" aria-label="Campaign preview stages">{campaignStages.map((stage, index) => <button key={stage.label} className={campaignStage === index ? "active" : ""} role="tab" aria-selected={campaignStage === index} aria-controls="campaign-preview-status" onClick={() => setCampaignStage(index)}><span>0{index + 1}</span>{stage.label}</button>)}</div><Link href="/enquire" className="text-button light-text">Open your campaign brief <MoveRight size={17} /></Link></div>
            <div id="campaign-preview-status" className="campaign-dashboard" aria-label="Interactive example campaign status dashboard"><div className="dashboard-top"><span>SAUDI CAMPAIGN / PREVIEW</span><b>{campaignStages[campaignStage].status}</b></div><div className="dashboard-spotlight"><span>0{campaignStage + 1}</span><div><b>{campaignStages[campaignStage].title}</b><p>{campaignStages[campaignStage].detail}</p></div></div>{campaignStages.map((stage, index) => <button className={`dashboard-progress ${index === campaignStage ? "active" : ""} ${index > campaignStage ? "quiet" : ""}`} key={stage.label} onClick={() => setCampaignStage(index)}><span>0{index + 1}</span><div><b>{stage.label}</b><small>{index < campaignStage ? "Step prepared" : index === campaignStage ? "Current preview" : "Next in the flow"}</small></div>{index < campaignStage ? <Check size={16} /> : index === campaignStage ? <Clock3 size={16} /> : <ArrowUpRight size={16} />}</button>)}</div>
          </div>
        </section>

        <section id="pricing" className="pricing-section section-paper">
          <div className="page-frame split-layout">
            <aside className="section-rail">
              <RailLabel>04 / Pricing</RailLabel>
              <span className="rail-rule" />
              <p>MONTHLY PLANS / SAR</p>
            </aside>
            <div className="pricing-main">
              <div className="pricing-heading">
                <div>
                  <div className="section-kicker"><Zap size={15} /> CHOOSE YOUR ENGINE</div>
                  <h2>Set the pace that <i>fits your search.</i></h2>
                </div>
                <p>Monthly plans. STC Pay or IBAN. Cancel anytime.</p>
              </div>
              <div className="plans-grid">
                {plans.map((plan) => (
                  <article className={`plan-card ${plan.featured ? "plan-featured" : ""}`} key={plan.name}>
                    {plan.featured && <div className="plan-flag">MOST SELECTED</div>}
                    <div className="plan-top"><span>{plan.name}</span><ArrowUpRight size={18} /></div>
                    <div className="price"><b>{plan.price}</b><span>SAR<br />/ MO</span></div>
                    <p>{plan.descriptor}</p>
                    <ul>{plan.features.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}</ul>
                    <Link href="/enquire" className="plan-cta">Choose {plan.name} <MoveRight size={17} /></Link>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="reviews" className="reviews-pending section-fog">
          <div className="page-frame reviews-heading"><div><div className="section-kicker"><MessageCircle size={15} /> CLIENT PERSPECTIVES</div><h2>Real experiences,<br /><i>properly attributed.</i></h2></div><p><ShieldCheck size={16} /> Three reviews shared directly by AutoApply SA clients.</p></div>
          <div className="page-frame review-cards">
            <article className="review-card"><span className="review-index">01 / JEDDAH</span><blockquote>“Working in Jeddah as a nurse, the service matched me to hospital roles and emailed them for me. Saved me the late-night applying.”</blockquote><footer><b>Ana</b><span>Nurse · Jeddah</span></footer></article>
            <article className="review-card arabic-review" lang="ar" dir="rtl"><span className="review-index">02 / الرياض</span><blockquote>“قدّمت سيرتي مع أوتوأبلاي السعودية وطلعت لي وظائف تطابق تخصصي في المحاسبة. الخدمة مرتبة والرد سريع على واتساب.”</blockquote><footer><b>سلطان</b><span>محاسب · الرياض</span></footer></article>
            <article className="review-card"><span className="review-index">03 / DAMMAM</span><blockquote>“I uploaded my CV and got matched to IT support roles within the same day. The team followed up on WhatsApp like they said. Still interviewing, but the applications actually went out.”</blockquote><footer><b>Fahad</b><span>IT Support · Dammam</span></footer></article>
          </div>
        </section>

        <section id="faq" className="faq-section section-ink">
          <div className="page-frame split-layout">
            <aside className="section-rail inverted">
              <RailLabel>05 / FAQ</RailLabel>
              <span className="rail-rule" />
              <p>BEFORE YOU BEGIN</p>
            </aside>
            <div className="faq-main">
              <div className="section-kicker inverse"><MessageCircle size={15} /> QUESTIONS, ANSWERED</div>
              <h2>A few things worth <i>making clear.</i></h2>
              <div className="faq-list">
                {faqs.map((faq, index) => {
                  const isOpen = activeFaq === index;
                  return (
                    <article className={`faq-item ${isOpen ? "open" : ""}`} key={faq.question}>
                      <button onClick={() => setActiveFaq(isOpen ? null : index)} aria-expanded={isOpen}>
                        <span>0{index + 1}</span><b>{faq.question}</b><ChevronDown size={20} />
                      </button>
                      <div className="faq-answer"><p>{faq.answer}</p></div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="location" className="location-section section-fog">
          <div className="page-frame location-grid">
            <div className="location-copy">
              <div className="section-kicker"><Globe2 size={15} /> JEDDAH, KSA</div>
              <h2>Saudi focused.<br /><i>Jeddah based.</i></h2>
              <p className="section-summary">AutoApply SA is based in Jeddah and serves candidates pursuing roles across Saudi Arabia. Directions open in Google Maps, while campaign support continues online.</p>
              <div className="location-actions">
                <a className="button button-ink" href="https://www.google.com/maps/dir/?api=1&destination=Jeddah%2C%20Saudi%20Arabia" target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={18} /></a>
                <Link className="text-button" href="/enquire">Start remotely <MoveRight size={18} /></Link>
              </div>
            </div>
            <div className="map-frame">
              <Suspense fallback={<div className="location-map-canvas" role="status" aria-label="Loading Jeddah map" />}>
                <MapView className="location-map-canvas" initialCenter={{ lat: 21.4858, lng: 39.1925 }} initialZoom={11} />
              </Suspense>
              <div className="map-caption"><span><StatusDot /> SERVICE BASE</span><b>JEDDAH / KSA</b></div>
            </div>
          </div>
        </section>

        <section className="final-cta section-accent">
          <div className="page-frame final-inner">
            <div>
              <div className="eyebrow dark"><StatusDot tone="quiet" /> OPEN A NEW CAMPAIGN</div>
              <h2>Make the next role<br /><i>your next move.</i></h2>
            </div>
            <div className="final-action">
              <p>Reach Hasan directly for campaign setup, payment details, and the best way to share your CV.</p>
              <Link className="button button-ink" href="/enquire">Start your campaign <ArrowUpRight size={18} /></Link>
            </div>
          </div>
        </section>
      </main>

      <div className="mobile-campaign-cta">
        <Link href="/enquire"><span><StatusDot /> OPEN CAMPAIGN</span><b>Start now <ArrowUpRight size={17} /></b></Link>
      </div>
      {showBackToTop && <button className="back-to-top" type="button" onClick={returnToTop} aria-label="Back to top" title="Back to top"><ArrowUp size={17} /><span>TOP</span></button>}

      <footer className="footer">
        <div className="page-frame footer-top">
          <a className="brand footer-brand" href="#top">
            <img src="/manus-storage/autoapply-symbol_80d77010.png" alt="" className="brand-mark" />
            <span>AutoApply <em>SA</em></span>
          </a>
          <p>Your 24/7 job application engine.<br />Jeddah built. Saudi focused.</p>
          <a className="footer-email" href="mailto:hasan@hsndm.tech">hasan@hsndm.tech <ArrowUpRight size={16} /></a>
        </div>
        <div className="page-frame footer-bottom">
          <span>© 2026 AUTOAPPLY SA</span>
          <div><Link href="/how-it-works">How it works</Link><Link href="/support">Support</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><a href="https://instagram.com/hsndm_" target="_blank" rel="noreferrer">Instagram</a><a href="https://linkedin.com/in/hsndm" target="_blank" rel="noreferrer">LinkedIn</a><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp</a></div>
          <span>JEDDAH, KSA</span>
        </div>
      </footer>
    </div>
  );
}
