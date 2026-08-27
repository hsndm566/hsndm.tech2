/**
 * Design reminder — Operational Clarity: the enquiry route is a focused intake sheet,
 * not a generic contact page. Use sharp rules, visible status, and a single next action.
 */
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, FileText, Loader2, ShieldCheck } from "lucide-react";
import { applyPageSeo } from "@/lib/seo";
import { Link, useLocation } from "wouter";
import { SearchableSaudiSelect } from "@/components/SearchableSaudiSelect";
import { saudiCities, saudiIndustries } from "@/lib/saudiTaxonomy";
import { trpc } from "@/lib/trpc";
import { trackEngagement } from "@/lib/analytics";

const campaignLanes = ["Operations", "Logistics", "Sales", "Technology", "Hospitality", "Other"];
const WHATSAPP_NUMBER = "966571448656";
const plans = {
  starter: { name: "Starter", price: "99" },
  pro: { name: "Pro", price: "149" },
  founder: { name: "Founder", price: "249" },
} as const;
type PlanKey = keyof typeof plans;

function selectedPlanFromLocation(): PlanKey | null {
  const value = new URLSearchParams(window.location.search).get("plan");
  return value && value in plans ? value as PlanKey : null;
}

export default function Enquire() {
  const [, setLocation] = useLocation();
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
  const reportBlockedHandoff = trpc.campaign.clientIssue.reportBlockedWhatsAppHandoff.useMutation();
  const secureEnquiry = trpc.campaign.enquiry.submit.useMutation();

  useEffect(() => {
    applyPageSeo({ title: "Start a Campaign | AutoApply SA", description: "Start an AutoApply SA job-application campaign for Saudi Arabia. Share your target roles and preferences before any campaign direction is confirmed.", path: "/enquire" });
  }, []);

  useEffect(() => {
    if (selectedPlan) trackEngagement("plan_selected", { plan: plans[selectedPlan].name, page: window.location.pathname, source: "enquire-query" });
  }, [selectedPlan]);

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.files?.[0]?.name || "");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowPreview(true);
    setReceipt(null);
    trackEngagement("campaign_brief_started", { page: window.location.pathname, plan: selectedPlan ? plans[selectedPlan].name : "none" });
    trackEngagement("campaign_brief_completed", { page: window.location.pathname, plan: selectedPlan ? plans[selectedPlan].name : "none" });
  };

  const handoffMessage = () => [
    "Hi AutoApply SA, I want to start a campaign.",
    `Name: ${name}`,
    `Email: ${email}`,
    `Target lane: ${role}`,
    `Target city: ${city}`,
    `Target industry: ${industry}`,
    ...(selectedPlan ? [`Selected plan: ${plans[selectedPlan].name} — ${plans[selectedPlan].price} SAR/month`] : []),
    "CV: I understand that no CV is sent from this page; I will attach one myself only if I choose to.",
  ].join("\n");

  const confirmContact = () => {
    if (!authorized) return;
    const timestamp = new Date().toLocaleString();
    if (contactChoice === "web") {
      secureEnquiry.mutate({ fullName: name, email, targetRole: role, city, industry, language: "English", campaignAuthorizationConfirmed: true }, {
        onSuccess: ({ reference }) => setReceipt({ reference, timestamp, channel: "Secure web enquiry" }),
      });
      return;
    }
    const body = handoffMessage();
    if (contactChoice === "email") {
      window.open(`mailto:apply@hsndm.tech?subject=${encodeURIComponent("AutoApply SA campaign brief")}&body=${encodeURIComponent(body)}`, "_blank", "noopener,noreferrer");
      setReceipt({ reference: `EMAIL-${Date.now().toString(36).toUpperCase()}`, timestamp, channel: "Email" });
      return;
    }
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
    const handoffWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    trackEngagement("whatsapp_handoff_opened", { page: window.location.pathname, plan: selectedPlan ? plans[selectedPlan].name : "none" });
    if (!handoffWindow) reportBlockedHandoff.mutate({ route: "/enquire" });
    setHandoffBlocked(!handoffWindow);
    setReceipt({ reference: `WA-${Date.now().toString(36).toUpperCase()}`, timestamp, channel: "WhatsApp" });
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
        {selectedPlan ? <p className="mb-4 border border-[#e5482a] bg-[#fff8f5] px-4 py-3 text-sm text-[#151515]">You selected <b>{plans[selectedPlan].name}</b> — {plans[selectedPlan].price} SAR/month</p> : null}
        <div className="enquiry-grid">
          <aside className="enquiry-aside">
            <span className="rail-label">01 / Start here</span>
            <span className="rail-rule" />
            <h1>Make your search <i>move with intent.</i></h1>
            <p>Private campaign brief — nothing is sent from this page.</p>
            <div className="response-guard"><ShieldCheck size={17} /><div><b>Response safeguard</b><span>For the fastest direct reply, keep this page open and follow up via WhatsApp if you have not heard back within one business day.</span></div></div>
          </aside>

          <form id="campaign-brief" className="campaign-form" onSubmit={submit} aria-busy={secureEnquiry.isPending}>
            <div className="form-heading"><span>YOUR CAMPAIGN BRIEF</span><b>Required fields are marked <em>*</em></b></div>
            <input type="hidden" name="selected-plan" value={selectedPlan || ""} />
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
            <div className="grid gap-4 md:grid-cols-2">
              <label><span>Target Saudi city</span><SearchableSaudiSelect options={saudiCities} value={city} onChange={setCity} placeholder="Search Saudi cities…" /></label>
              <label><span>Target industry</span><SearchableSaudiSelect options={saudiIndustries} value={industry} onChange={setIndustry} placeholder="Search industries…" /></label>
            </div>
            <label className="campaign-upload">
              <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={chooseFile} />
              <span className="upload-icon"><FileText size={19} /></span>
              <span><b>{fileName || "Select a CV (optional)"}</b><small>PDF, DOC, DOCX or TXT · remains on this device in preview</small></span>
              <ArrowRight size={18} />
            </label>
            <div className="form-protection"><Check size={15} /> Continue to review exactly what would be shared. The selected CV remains on this device and is never sent from this form.</div>
            <button className="button button-accent" type="submit">Review contact options <ArrowRight size={18} /></button>
            <Link href="/" className="form-back"><ArrowLeft size={15} /> Return to the engine overview</Link>
            {showPreview ? <div className="enquiry-review-stage" role="status"><span className="enquiry-review-stage__label">02 / Private review</span><span className="enquiry-review-stage__status"><Check aria-hidden="true" size={15} /> You remain in control of contact.</span></div> : null}
            {showPreview && <section className="mt-6 border border-black/15 bg-white p-4 text-black" aria-labelledby="handoff-preview-title">
              <p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#e5482a]">Before you contact us</p>
              <h2 id="handoff-preview-title" className="mt-2 text-xl font-semibold">Review your shared details</h2>
              <p className="mt-2 text-sm text-black/70">The following fields will be shared: <b>name, email, target role, city, and industry.</b> Your CV will <b>not</b> be sent unless you personally attach it after choosing WhatsApp or email.</p>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><div><dt>Name</dt><dd>{name}</dd></div><div><dt>Email</dt><dd>{email}</dd></div><div><dt>Target role</dt><dd>{role}</dd></div><div><dt>City</dt><dd>{city}</dd></div><div><dt>Industry</dt><dd>{industry}</dd></div><div><dt>Selected CV</dt><dd>{fileName ? `${fileName} (stays on this device)` : "No CV selected"}</dd></div></dl>
              <fieldset className="mt-4"><legend className="font-semibold">Choose a contact option</legend><div className="mt-2 grid gap-2 sm:grid-cols-3">{(["whatsapp", "email", "web"] as const).map(option => <label key={option} className="border border-black/15 p-3 text-sm"><input className="mr-2" type="radio" name="contact-choice" checked={contactChoice === option} onChange={() => setContactChoice(option)} />{option === "whatsapp" ? "WhatsApp" : option === "email" ? "Email" : "Secure web enquiry"}</label>)}</div></fieldset>
              <section className="mt-4 border-l-2 border-[#e5482a] bg-[#f7f4ed] p-3 text-sm"><h3 className="font-semibold">Campaign plan authorization</h3><p className="mt-1">Target role family: {role}. Locations: {city}. Language: English. Channels: email and career portals after a written campaign plan is agreed. Maximum volume and date range are set in that plan.</p><p className="mt-2 font-medium">Nothing is submitted until you approve the campaign plan. You can pause or stop it at any time. You receive an application log showing employer, role, channel, date, and status.</p><label className="mt-3 flex gap-2"><input type="checkbox" checked={authorized} onChange={event => setAuthorized(event.target.checked)} />I approve this contact request and understand it does not start any employer application.</label></section>
              <a className="mt-3 inline-flex text-sm underline underline-offset-4" href="/campaign-report-sample">View the illustrative campaign-report format</a>
              {secureEnquiry.error ? <p className="mt-3 text-sm text-red-700">Secure web enquiry is unavailable. Please use email or WhatsApp instead.</p> : null}
              <p className="mt-3 text-sm text-black/70">You control whether to send it.</p>
              <button className="button button-accent mt-4" type="button" disabled={!authorized || secureEnquiry.isPending} onClick={confirmContact}>{secureEnquiry.isPending ? <><Loader2 className="handoff-inline-spinner" size={17} /> Sending securely</> : contactChoice === "whatsapp" ? "Continue to WhatsApp with my brief" : `Confirm via ${contactChoice === "web" ? "secure enquiry" : "email"}`}</button>
              {handoffBlocked ? <p className="mt-3 text-sm">Your browser blocked the new WhatsApp window. Use the email or secure web option instead.</p> : null}
            </section>}
            {receipt && <section className="mt-4 border border-[#e5482a] bg-[#fff8f5] p-4" role="status" aria-live="polite"><p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#e5482a]">Contact receipt</p><h2 className="mt-2 text-xl font-semibold">Your contact request is prepared.</h2><p className="mt-2 text-sm">Reference: <b>{receipt.reference}</b><br />Time: {receipt.timestamp}<br />Next step: the AutoApply SA team reviews your brief and responds within one business day. No CV was sent from this page.</p><p className="mt-3 text-sm">To pause or delete this contact request, email <a className="underline" href={`mailto:apply@hsndm.tech?subject=${encodeURIComponent(`Pause or delete ${receipt.reference}`)}`}>apply@hsndm.tech</a> with your reference.</p></section>}
          </form>
        </div>
      </section>
    </main>
  );
}
