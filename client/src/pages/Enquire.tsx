/**
 * Design reminder — Operational Clarity: the enquiry route is a focused intake sheet,
 * not a generic contact page. Use sharp rules, visible status, and a single next action.
 */
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, FileText, Loader2, ShieldCheck } from "lucide-react";
import { applyPageSeo } from "@/lib/seo";
import { Link, useLocation } from "wouter";

const campaignLanes = ["Operations", "Logistics", "Sales", "Technology", "Hospitality", "Other"];
const WHATSAPP_NUMBER = "966571448656";

export default function Enquire() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [fileName, setFileName] = useState("");
  const [isHandingOff, setIsHandingOff] = useState(false);
  const [handoffStep, setHandoffStep] = useState(0);
  const handoffSteps = [["Reviewing your campaign brief", "Checking the essentials for your handoff."], ["Preparing your WhatsApp message", "Adding your selected campaign direction."], ["Opening WhatsApp", "Your chat will be ready in a moment."]] as const;

  useEffect(() => {
    applyPageSeo({ title: "Start a Campaign | AutoApply SA", description: "Start an AutoApply SA campaign and share the essential details for your Saudi Arabia job search.", path: "/enquire" });
  }, []);

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.files?.[0]?.name || "");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isHandingOff) return;
    const message = [
      "Hi AutoApply SA, I want to start a campaign.",
      `Name: ${name}`,
      `Email: ${email}`,
      `Target lane: ${role}`,
      fileName ? `CV selected: ${fileName} — I will attach it in this chat.` : "CV: I will share it in this chat.",
    ].join("\n");
    const handoffWindow = window.open("about:blank", "autoapply-whatsapp");
    if (handoffWindow) handoffWindow.opener = null;
    setHandoffStep(0);
    setIsHandingOff(true);
    window.setTimeout(() => setHandoffStep(1), 520);
    window.setTimeout(() => setHandoffStep(2), 1040);
    window.setTimeout(() => {
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      if (handoffWindow) handoffWindow.location.replace(whatsappUrl);
      else window.location.assign(whatsappUrl);
      setLocation(`/thank-you${name ? `?name=${encodeURIComponent(name)}` : ""}`);
    }, 1750);
  };

  return (
    <main className="journey-page">
      <header className="journey-header page-frame">
        <Link href="/" className="brand journey-brand" aria-label="AutoApply SA home">
          <img src="/manus-storage/autoapply-symbol_80d77010.png" alt="" className="brand-mark" />
          <span>AutoApply <em>SA</em></span>
        </Link>
        <span className="journey-status"><i /> CAMPAIGN INTAKE / STEP 01</span>
      </header>

      <section className="enquiry-wrap page-frame">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><b>Start a campaign</b></nav>
        <div className="enquiry-grid">
          <aside className="enquiry-aside">
            <span className="rail-label">01 / Start here</span>
            <span className="rail-rule" />
            <h1>Make your search <i>move with intent.</i></h1>
            <p>Share the essential context for your next role. This secure-looking static preview does not transmit the file you select.</p>
            <div className="response-guard"><ShieldCheck size={17} /><div><b>Response safeguard</b><span>For the fastest direct reply, keep this page open and follow up via WhatsApp if you have not heard back within one business day.</span></div></div>
          </aside>

          <form className="campaign-form" onSubmit={submit} aria-busy={isHandingOff}>
            <div className="form-heading"><span>YOUR CAMPAIGN BRIEF</span><b>Required fields are marked <em>*</em></b></div>
            <label>
              <span>Full name <em>*</em></span>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="How should we address you?" />
            </label>
            <label>
              <span>Email address <em>*</em></span>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </label>
            <label>
              <span>Primary target lane <em>*</em></span>
              <select required value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="" disabled>Select a direction</option>
                {campaignLanes.map((lane) => <option key={lane} value={lane}>{lane}</option>)}
              </select>
            </label>
            <label className="campaign-upload">
              <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={chooseFile} />
              <span className="upload-icon"><FileText size={19} /></span>
              <span><b>{fileName || "Select a CV (optional)"}</b><small>PDF, DOC, DOCX or TXT · remains on this device in preview</small></span>
              <ArrowRight size={18} />
            </label>
            <div className="form-protection"><Check size={15} /> On submit, a prefilled WhatsApp message opens so you can send your campaign brief and attach your CV directly.</div>
            <button className="button button-accent" type="submit" disabled={isHandingOff}>{isHandingOff ? <>Preparing your chat <Loader2 className="handoff-inline-spinner" size={17} /></> : <>Continue to WhatsApp <ArrowRight size={18} /></>}</button>
            <Link href="/" className="form-back"><ArrowLeft size={15} /> Return to the engine overview</Link>
            {isHandingOff && <div className="whatsapp-handoff" role="status" aria-live="polite"><Loader2 size={25} className="handoff-spinner" /><div><b>{handoffSteps[handoffStep][0]}</b><span>{handoffSteps[handoffStep][1]}</span></div><div className="handoff-steps" aria-label="WhatsApp handoff progress">{handoffSteps.map((step, index) => <span className={index <= handoffStep ? "active" : ""} key={step[0]}><i>{index < handoffStep ? "✓" : `0${index + 1}`}</i><small>{step[0]}</small></span>)}</div></div>}
          </form>
        </div>
      </section>
    </main>
  );
}
