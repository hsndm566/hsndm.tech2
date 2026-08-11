/**
 * Design reminder — Operational Clarity: Swiss information design with a signal rail,
 * deliberate asymmetry, near-black ink, warm paper, and signal vermilion used only for action.
 */
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import HeroMedia from "@/components/HeroMedia";
import { MapView } from "@/components/Map";
import { trackEngagement } from "@/lib/analytics";
import { demoLists, readCvText } from "@/lib/careerMatcher";
import { applyPageSeo } from "@/lib/seo";
import {
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Globe2,
  Languages,
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

const WHATSAPP_URL =
  "https://wa.me/966571448656?text=Hi%20AutoApply%20SA%2C%20I%20want%20to%20start%20a%20campaign.";

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
    features: ["~90 applications", "Priority tailoring", "Julie copilot", "Daily report"],
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

type ScanResult = { field: string; roles: string[]; confidence: "Focused" | "Strong"; rationale: string };
type MatchPreferences = { city: string; industry: string; seniority: string; language: string };

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [selectedFile, setSelectedFile] = useState("");
  const [scanState, setScanState] = useState<"idle" | "scanning" | "matched" | "fallback">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedSuggestedRole, setSelectedSuggestedRole] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [matchPreferences, setMatchPreferences] = useState<MatchPreferences>({ city: "Jeddah", industry: "all", seniority: "Any level", language: "English" });
  const [campaignStage, setCampaignStage] = useState(1);
  const scanFrame = useRef<number | null>(null);
  const scanVersion = useRef(0);

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
    const fieldPromise = readCvText(file).then((text) => demoLists(text, preferencesAtScan.industry));
    const startedAt = performance.now();

    setSelectedFile(file.name);
    setScanState("scanning");
    setScanProgress(0);
    setScanResult(null);
    setSelectedSuggestedRole(null);

    const tick = (now: number) => {
      const progress = Math.min(100, Math.round(((now - startedAt) / scanDuration) * 100));
      setScanProgress(progress);
      if (progress < 100) {
        scanFrame.current = window.requestAnimationFrame(tick);
        return;
      }
      void fieldPromise.then((fields) => {
        if (scanVersion.current !== version) return;
        const bestFit = fields[0];
        if (!bestFit) {
          setScanState("fallback");
          return;
        }
        const confidence = fields.length > 1 ? "Strong" : "Focused";
        const scope = preferencesAtScan.industry === "all" ? "your CV signals" : "your CV signals and selected industry";
        setScanResult({ field: bestFit.title, roles: bestFit.items.slice(0, 3), confidence, rationale: `Matched from ${scope}; ${preferencesAtScan.city}, ${preferencesAtScan.seniority}, and ${preferencesAtScan.language} are included in your Saudi Arabia campaign brief.` });
        setScanState("matched");
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
    setScanState("idle");
  };

  const returnToTop = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    trackEngagement("back_to_top_clicked", { page: window.location.pathname });
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="AutoApply SA home">
          <img src="/manus-storage/autoapply-symbol_80d77010.png" alt="" className="brand-mark" />
          <span>AutoApply <em>SA</em></span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <button onClick={() => scrollTo("how")}>How it works</button>
          <button onClick={() => scrollTo("product")}>Product</button>
          <button onClick={() => scrollTo("upload")}>Upload CV</button>
          <button onClick={() => scrollTo("pricing")}>Pricing</button>
          <button onClick={() => scrollTo("faq")}>FAQ</button>
        </nav>

        <div className="nav-actions">
          <Link className="language-link" href="/ar" lang="ar" aria-label="Visit the Arabic version">العربية</Link>
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
          <HeroMedia poster="/manus-storage/autoapply-hero-operations_ad007abc.jpg" alt="Professional reviewing a job application at a laptop" />
          <div className="hero-overlay" />
          <div className="hero-structure" aria-hidden="true">
            <span className="hero-grid-line one" />
            <span className="hero-grid-line two" />
            <span className="hero-grid-line three" />
          </div>
          <div className="hero-content page-frame">
            <div className="hero-lead">
              <div className="eyebrow light"><StatusDot /> 24/7 job engine <span /> Jeddah, Saudi Arabia</div>
              <h1 id="hero-heading">
                Your applications,<br />
                <i>engineered</i> while<br />
                you sleep.
              </h1>
              <p>
                AutoApply SA finds, tailors, and submits applications to Saudi Arabia roles by email and portal—built around your CV and your preferred language.
              </p>
              <div className="hero-actions">
                <Link className="button button-paper" href="/enquire">Start your campaign <ArrowDownRight size={18} /></Link>
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
                <div><StatusDot /> CV parsed</div>
                <span />
                <div><StatusDot /> Roles matched</div>
                <span />
                <div><StatusDot tone="quiet" /> Applying</div>
              </div>
              <div className="ledger-record">
                <span className="record-number">03</span>
                <div>
                  <b>Targeting ready</b>
                  <small>Skills, experience & language mapped</small>
                </div>
                <ArrowUpRight size={16} />
              </div>
              <div className="ledger-queue" aria-label="Saudi Arabia campaign workflow preview">
                <div className="queue-heading"><span>CAMPAIGN QUEUE / PREVIEW</span><b>JEDDAH · SA</b></div>
                <div><StatusDot /> CV signal intake <span>READY</span></div>
                <div><StatusDot /> Saudi role lane <span>QUEUED</span></div>
              </div>
            </div>

            <div className="hero-stats">
              <div><strong>500+</strong><span>Saudi roles scanned</span></div>
              <div><strong>24/7</strong><span>Engine in motion</span></div>
              <div><strong>2</strong><span>Languages supported</span></div>
            </div>
          </div>
        </section>

        <section id="product" className="service-intro section-paper">
          <div className="page-frame split-layout">
            <aside className="section-rail">
              <RailLabel>01 / Platform</RailLabel>
              <span className="rail-rule" />
              <p>NOT ANOTHER JOB BOARD</p>
            </aside>
            <div className="intro-main">
              <div className="section-kicker"><Zap size={15} /> APPLICATION INFRASTRUCTURE</div>
              <h2>Everything a serious search <i>needs to keep moving.</i></h2>
              <p className="section-summary">
                From CV interpretation to submission follow-through, the system turns your job search into a planned operating rhythm—not a late-night copy-and-paste exercise.
              </p>
              <div className="capability-grid">
                <article className="capability-card">
                  <span className="capability-index">A/01</span>
                  <ScanSearch size={27} strokeWidth={1.6} />
                  <h3>Application engine</h3>
                  <p>CV details are matched to live Saudi Arabia roles and each application is tailored to the opening.</p>
                  <span className="card-rule" />
                </article>
                <article className="capability-card dark-card">
                  <span className="capability-index">A/02</span>
                  <Languages size={27} strokeWidth={1.6} />
                  <h3>CV matching</h3>
                  <p>Surface the most relevant target roles first, so your effort follows your actual profile.</p>
                  <span className="card-rule" />
                </article>
                <article className="capability-card accent-card">
                  <span className="capability-index">A/03</span>
                  <Clock3 size={27} strokeWidth={1.6} />
                  <h3>Ops automation</h3>
                  <p>Follow-ups, resends, and delivery checks help keep application activity from losing pace.</p>
                  <span className="card-rule" />
                </article>
              </div>
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

        <section id="upload" className="upload-section section-paper">
          <div className="page-frame upload-grid">
            <div className="upload-image-wrap">
              <img src="/manus-storage/autoapply-desk_635170b2.jpg" alt="Minimal worktable prepared for a job search" />
              <div className="image-stamp"><span>START / 60 SEC</span><ArrowDownRight size={17} /></div>
            </div>
            <div className="upload-copy">
              <div className="section-kicker"><Paperclip size={15} /> CV INTAKE</div>
              <h2>Drop your CV. <i>Find your lanes.</i></h2>
              <p className="section-summary">Select the latest version of your CV, then set the Saudi Arabia role preferences that matter to you. The local scan uses both inputs to make its match more relevant.</p>
              <div className="match-preferences" aria-label="Saudi Arabia role preferences">
                <div className="preferences-heading"><span><SlidersHorizontal size={14} /> MATCH PREFERENCES</span><small>Applied locally</small></div>
                <div className="preferences-grid">
                  <label><span>City</span><select value={matchPreferences.city} onChange={(event) => setMatchPreferences((current) => ({ ...current, city: event.target.value }))}><option>Jeddah</option><option>Riyadh</option><option>Dammam</option><option>Makkah</option><option>Madinah</option><option>Anywhere in Saudi Arabia</option></select></label>
                  <label><span>Industry</span><select value={matchPreferences.industry} onChange={(event) => setMatchPreferences((current) => ({ ...current, industry: event.target.value }))}><option value="all">All industries</option><option value="technology-data">Technology & Data</option><option value="business-operations">Business & Operations</option><option value="people-service">People & Services</option><option value="engineering-construction">Engineering & Construction</option></select></label>
                  <label><span>Seniority</span><select value={matchPreferences.seniority} onChange={(event) => setMatchPreferences((current) => ({ ...current, seniority: event.target.value }))}><option>Any level</option><option>Entry level</option><option>Mid level</option><option>Senior level</option></select></label>
                  <label><span>Language</span><select value={matchPreferences.language} onChange={(event) => setMatchPreferences((current) => ({ ...current, language: event.target.value }))}><option>English</option><option>Arabic</option></select></label>
                </div>
              </div>
              <label className={`drop-zone ${scanState !== "idle" ? "has-file" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={onFileDrop}>
                <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={onFileChange} />
                <span className="drop-symbol"><FileText size={24} /></span>
                <span className="drop-copy">
                  <b>{selectedFile || "Choose or drop your CV"}</b>
                  <small>{selectedFile ? "Local scan active — your file stays in this browser" : "PDF, DOC, DOCX or TXT"}</small>
                </span>
                <span className="drop-arrow"><ArrowUpRight size={20} /></span>
              </label>
              {scanState === "scanning" && (
                <div className="role-scan" role="status" aria-live="polite">
                  <div className="scan-meta"><span><ScanSearch size={14} /> Finding roles for you…</span><b>{scanProgress}%</b></div>
                  <div className="scan-track" role="progressbar" aria-label="Finding relevant roles" aria-valuemin={0} aria-valuemax={100} aria-valuenow={scanProgress}><span style={{ width: `${scanProgress}%` }} /></div>
                  <p>Reading skills, experience, and career signals locally.</p>
                </div>
              )}
              {scanState === "matched" && scanResult && (
                <div className="role-results" role="status" aria-live="polite">
                  <div className="result-heading"><span><Check size={14} /> ROLE SIGNALS FOUND</span><button onClick={resetScan}>Scan another CV</button></div>
                  <p>Best-fit lane <b>{scanResult.field}</b> <em>{scanResult.confidence} match</em></p>
                  <div className="role-chips" aria-label="Suggested target roles">{scanResult.roles.map((role) => <button type="button" key={role} className={selectedSuggestedRole === role ? "selected" : ""} aria-pressed={selectedSuggestedRole === role} onClick={() => setSelectedSuggestedRole(role)}><span>{role}</span><ArrowUpRight size={13} /></button>)}</div>
                  {selectedSuggestedRole && <p className="role-selection"><Check size={13} /> <b>{selectedSuggestedRole}</b> selected for your campaign brief.</p>}
                  <div className="match-rationale"><b>Why this match</b><span>{scanResult.rationale}</span></div>
                </div>
              )}
              {scanState === "fallback" && (
                <div className="scan-fallback" role="status" aria-live="polite">
                  <div><ShieldCheck size={16} /><span><b>We need a closer look.</b> This file could not be read clearly in the browser, so we will not guess at roles.</span></div>
                  <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">Send it on WhatsApp <ArrowUpRight size={15} /></a>
                  <button onClick={resetScan}>Try another CV</button>
                </div>
              )}
              <p className="privacy-note"><ShieldCheck size={16} /> This static preview keeps the selection in your browser only. For a real campaign, continue with the team below.</p>
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
            <div className="campaign-preview-copy"><div className="section-kicker inverse"><Clock3 size={15} /> BEFORE YOU COMMIT</div><h2>See the campaign <i>take shape.</i></h2><p className="section-summary inverse-summary">Use the stage control to see how the Saudi Arabia campaign moves from your CV signal to a visible application rhythm.</p><div className="campaign-switcher" role="tablist" aria-label="Campaign preview stages">{campaignStages.map((stage, index) => <button key={stage.label} className={campaignStage === index ? "active" : ""} role="tab" aria-selected={campaignStage === index} onClick={() => setCampaignStage(index)}><span>0{index + 1}</span>{stage.label}</button>)}</div><input className={`campaign-range stage-${campaignStage}`} aria-label="Select campaign preview stage" aria-valuetext={campaignStages[campaignStage].label} type="range" min="0" max="2" value={campaignStage} onChange={(event) => setCampaignStage(Number(event.target.value))} /><div className="campaign-range-label"><span>START / CV SIGNAL</span><b>{campaignStages[campaignStage].status}</b><span>MOVE / APPLY</span></div><Link href="/enquire" className="text-button light-text">Open your campaign brief <MoveRight size={17} /></Link></div>
            <div className="campaign-dashboard" aria-label="Interactive example campaign status dashboard"><div className="dashboard-top"><span>SAUDI CAMPAIGN / PREVIEW</span><b>{campaignStages[campaignStage].status}</b></div><div className="dashboard-spotlight"><span>0{campaignStage + 1}</span><div><b>{campaignStages[campaignStage].title}</b><p>{campaignStages[campaignStage].detail}</p></div></div>{campaignStages.map((stage, index) => <button className={`dashboard-progress ${index === campaignStage ? "active" : ""} ${index > campaignStage ? "quiet" : ""}`} key={stage.label} onClick={() => setCampaignStage(index)}><span>0{index + 1}</span><div><b>{stage.label}</b><small>{index < campaignStage ? "Step prepared" : index === campaignStage ? "Current preview" : "Next in the flow"}</small></div>{index < campaignStage ? <Check size={16} /> : index === campaignStage ? <Clock3 size={16} /> : <ArrowUpRight size={16} />}</button>)}</div>
          </div>
        </section>

        <section className="detail-section section-fog">
          <div className="page-frame detail-layout">
            <aside className="section-rail">
              <RailLabel>03 / In practice</RailLabel>
              <span className="rail-rule" />
              <p>VISIBLE WORK. NOT VAGUE PROMISES.</p>
            </aside>
            <div className="detail-content">
              <div>
                <div className="section-kicker"><ScanSearch size={15} /> WHAT THE SERVICE DOES</div>
                <h2>The moving parts behind a <i>considered application.</i></h2>
              </div>
              <img className="flow-image" src="/manus-storage/autoapply-flow_6c03602a.jpg" alt="Desk workspace illustrating a structured job application process" />
              <div className="detail-points">
                <article><span>01</span><p><b>Read the signal.</b> Interpret your CV, availability, language, and target direction before a role is selected.</p></article>
                <article><span>02</span><p><b>Match with context.</b> Focus on openings where your profile has relevance, instead of treating every vacancy the same.</p></article>
                <article><span>03</span><p><b>Carry the thread.</b> Tailor, submit, and follow through on the operational tasks that can otherwise interrupt a search.</p></article>
              </div>
            </div>
          </div>
        </section>

        <section id="case-study" className="case-study-section section-paper">
          <div className="page-frame split-layout">
            <aside className="section-rail">
              <RailLabel>04 / Case note</RailLabel>
              <span className="rail-rule" />
              <p>AN EXAMPLE OF THE SERVICE PROCESS</p>
            </aside>
            <div className="case-main">
              <div className="section-kicker"><FileText size={15} /> PROCESS CASE STUDY</div>
              <h2>One brief. A clearer <i>application operating rhythm.</i></h2>
              <p className="section-summary">This illustrative process note shows how a campaign moves from a candidate’s existing CV to a maintained job-application workflow. It is a service walkthrough, not a customer testimonial.</p>
              <div className="case-ledger">
                <div className="case-heading"><span>CAMPAIGN TRACE / EXAMPLE</span><span>SAUDI ARABIA ROLE SEARCH</span></div>
                <article><span className="case-stage">01</span><div><b>Candidate brief</b><p>Role preference, experience, language, and availability are organised into a usable campaign brief.</p></div><span className="case-time">START</span></article>
                <article><span className="case-stage">02</span><div><b>Role lanes identified</b><p>Relevant openings are prioritised so the campaign focuses on jobs that make sense for the profile.</p></div><span className="case-time">MATCH</span></article>
                <article><span className="case-stage">03</span><div><b>Applications prepared</b><p>Each application gets the necessary tailoring before email or portal submission is carried out.</p></div><span className="case-time">APPLY</span></article>
                <article><span className="case-stage">04</span><div><b>Follow-through retained</b><p>Reports, delivery checks, and subsequent actions keep the candidate’s application activity visible.</p></div><span className="case-time">TRACK</span></article>
              </div>
              <Link href="/enquire" className="text-button case-link">Start a campaign brief <MoveRight size={18} /></Link>
            </div>
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
              <MapView className="location-map-canvas" initialCenter={{ lat: 21.4858, lng: 39.1925 }} initialZoom={11} />
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
          <div><a href="https://instagram.com/hsndm_" target="_blank" rel="noreferrer">Instagram</a><a href="https://linkedin.com/in/hsndm" target="_blank" rel="noreferrer">LinkedIn</a><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp</a></div>
          <span>JEDDAH, KSA</span>
        </div>
      </footer>
    </div>
  );
}
