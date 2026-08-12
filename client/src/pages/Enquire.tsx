/* Campaign intake is the customer-facing entry point for the audited backend. */
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, FileText, Loader2, ShieldCheck } from "lucide-react";
import { applyPageSeo } from "@/lib/seo";
import { Link, useLocation } from "wouter";
import { createCampaign } from "@/lib/campaignApi";

const campaignLanes = ["Operations", "Logistics", "Sales", "Technology", "Hospitality", "Other"];

export default function Enquire() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    applyPageSeo({ title: "Start a Campaign | AutoApply SA", description: "Start a monitored AutoApply SA campaign and upload the CV used for your Saudi Arabia job search.", path: "/enquire" });
  }, []);

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    setCvFile(event.target.files?.[0] || null);
    setError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      const { campaign } = await createCampaign({
        candidateName: name,
        candidateEmail: email,
        targetRole: role,
        city: "Saudi Arabia",
        language: "English",
        cv: cvFile,
      });
      setLocation(`/thank-you?campaign=${encodeURIComponent(campaign.id)}&name=${encodeURIComponent(name)}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create the campaign. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            <p>Upload the CV you want used, set your role lane, and receive a campaign record you can monitor. The system starts with read-only discovery; no external application is sent until its source and package are verified.</p>
            <div className="response-guard"><ShieldCheck size={17} /><div><b>Execution safeguard</b><span>Your CV is stored for this campaign. Every future email or portal action must pass an independent audit before it can proceed.</span></div></div>
          </aside>

          <form className="campaign-form" onSubmit={submit} aria-busy={isSubmitting}>
            <div className="form-heading"><span>YOUR CAMPAIGN BRIEF</span><b>Required fields are marked <em>*</em></b></div>
            <label>
              <span>Full name <em>*</em></span>
              <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="How should we address you?" />
            </label>
            <label>
              <span>Email address <em>*</em></span>
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" />
            </label>
            <label>
              <span>Primary target lane <em>*</em></span>
              <select required value={role} onChange={(event) => setRole(event.target.value)}>
                <option value="" disabled>Select a direction</option>
                {campaignLanes.map((lane) => <option key={lane} value={lane}>{lane}</option>)}
              </select>
            </label>
            <label className="campaign-upload">
              <input type="file" required accept=".pdf,.doc,.docx,.txt" onChange={chooseFile} />
              <span className="upload-icon"><FileText size={19} /></span>
              <span><b>{cvFile?.name || "Select your CV"}</b><small>PDF, DOC, DOCX or TXT · max 5 MB</small></span>
              <ArrowRight size={18} />
            </label>
            <div className="form-protection"><Check size={15} /> Campaign creation stores your brief and opens a status record. Discovery can start safely; unverified applications remain blocked.</div>
            {error && <div className="campaign-api-error" role="alert">{error}</div>}
            <button className="button button-accent" type="submit" disabled={isSubmitting}>{isSubmitting ? <>Creating campaign <Loader2 className="handoff-inline-spinner" size={17} /></> : <>Create monitored campaign <ArrowRight size={18} /></>}</button>
            <Link href="/" className="form-back"><ArrowLeft size={15} /> Return to the engine overview</Link>
          </form>
        </div>
      </section>
    </main>
  );
}
