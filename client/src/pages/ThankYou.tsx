import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { applyPageSeo } from "@/lib/seo";
import { Link } from "wouter";
import { Campaign, CampaignEvent, getCampaign, getCampaignEvents, loadCampaignSession, startCampaign } from "@/lib/campaignApi";

function formatEventTime(value: number) {
  return new Date(value * 1000).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function ThankYou() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const name = params.get("name");
  const requestedCampaign = params.get("campaign");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [events, setEvents] = useState<CampaignEvent[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    applyPageSeo({ title: "Campaign Status | AutoApply SA", description: "Track the verification status of your AutoApply SA job-search campaign.", path: "/thank-you", noindex: true });
  }, []);

  useEffect(() => {
    const session = loadCampaignSession();
    if (!session || (requestedCampaign && session.campaignId !== requestedCampaign)) {
      setStatus("error");
      setError("This campaign session is not available in this browser. Return to campaign intake to create a new monitored campaign.");
      return;
    }
    let active = true;
    const refresh = async (activate = false) => {
      try {
        const current = activate ? await startCampaign(session) : await getCampaign(session);
        const currentEvents = await getCampaignEvents(session);
        if (!active) return;
        setCampaign(current);
        setEvents(currentEvents);
        setStatus("ready");
      } catch (caught) {
        if (!active) return;
        setStatus("error");
        setError(caught instanceof Error ? caught.message : "Campaign status is temporarily unavailable.");
      }
    };
    void refresh(true);
    const timer = window.setInterval(() => void refresh(false), 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, [requestedCampaign]);

  return (
    <main className="journey-page thank-you-page">
      <header className="journey-header page-frame">
        <Link href="/" className="brand journey-brand" aria-label="AutoApply SA home">
          <img src="/manus-storage/autoapply-symbol_80d77010.png" alt="" className="brand-mark" />
          <span>AutoApply <em>SA</em></span>
        </Link>
        <span className="journey-status"><i /> CAMPAIGN STATUS / STEP 02</span>
      </header>
      <section className="thanks-wrap page-frame">
        <nav className="breadcrumbs light-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/enquire">Start a campaign</Link><span>/</span><b>Campaign status</b></nav>
        <div className="thanks-card campaign-status-card">
          <CheckCircle2 size={42} strokeWidth={1.3} />
          <div className="thank-eyebrow">CAMPAIGN BRIEF LOGGED</div>
          <h1>{name ? `Thanks, ${name}.` : "Campaign created."}<br />Discovery is <i>being verified.</i></h1>
          <p>Your campaign has a private status record. The system can discover and prepare opportunities, but it will not send an email or submit a portal application until the CV path, job route, personalization, and Auditor approval are all proven.</p>

          {status === "loading" && <div className="campaign-status-loading"><Loader2 size={20} /> Connecting to your campaign record…</div>}
          {status === "error" && <div className="campaign-api-error" role="alert">{error}</div>}
          {campaign && <>
            <div className="campaign-metrics" aria-label="Campaign status">
              <div><span>STATUS</span><b>{campaign.status.replace(/_/g, " ")}</b></div>
              <div><span>VERIFIED JOBS</span><b>{Object.values(campaign.job_counts || {}).reduce((sum, count) => sum + count, 0)}</b></div>
              <div><span>SUBMISSION EVIDENCE</span><b>{campaign.evidence_count}</b></div>
            </div>
            <div className="campaign-safety-note"><ShieldCheck size={17} /><span><b>Audit safeguard active.</b> External execution is {campaign.external_execution_enabled ? "enabled only through approved evidence paths." : "currently locked until a source-specific upload proof exists."}</span></div>
            <div className="campaign-event-list">
              <div className="campaign-event-heading"><span>LIVE CAMPAIGN LOG</span><RefreshCw size={15} /></div>
              {events.slice(0, 5).map((event) => <div className={`campaign-event ${event.level}`} key={event.id}><i /><div><b>{event.event_type.replace(/_/g, " ")}</b><span>{event.message}</span></div><time>{formatEventTime(event.created_at)}</time></div>)}
            </div>
          </>}
          <div className="thanks-actions">
            <Link href="/enquire" className="button button-paper">Start another campaign <ArrowRight size={17} /></Link>
            <Link href="/" className="text-button light-text">Back to engine overview <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
