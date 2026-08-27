/**
 * Design reminder — Operational Clarity: a confirmation page must close uncertainty,
 * state the response protection clearly, and expose the next human-contact action.
 */
import { useEffect, useMemo } from "react";
import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import { applyPageSeo } from "@/lib/seo";
import { Link } from "wouter";

const WHATSAPP_URL = "https://wa.me/966571448656?text=Hi%20AutoApply%20SA%2C%20I%20just%20sent%20a%20campaign%20enquiry%20and%20would%20like%20to%20continue.";

export default function ThankYou() {
  const name = useMemo(() => new URLSearchParams(window.location.search).get("name"), []);

  useEffect(() => {
    applyPageSeo({ title: "Enquiry Received | AutoApply SA", description: "Your AutoApply SA campaign enquiry has been received. Continue with the team on WhatsApp for the fastest response.", path: "/thank-you", noindex: true });
  }, []);

  return (
    <main className="journey-page thank-you-page">
      <header className="journey-header page-frame">
        <Link href="/" className="brand journey-brand" aria-label="AutoApply SA home">
          <img src="/manus-storage/autoapply-symbol_80d77010.png" alt="" className="brand-mark" />
          <span>AutoApply <em>SA</em></span>
        </Link>
        <span className="journey-status"><i /> INTAKE RECEIVED / STEP 02</span>
      </header>
      <section className="thanks-wrap page-frame">
        <nav className="breadcrumbs light-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/enquire">Start a campaign</Link><span>/</span><b>Enquiry received</b></nav>
        <div className="thanks-card">
          <CheckCircle2 size={42} strokeWidth={1.3} />
          <div className="thank-eyebrow">CAMPAIGN BRIEF LOGGED</div>
          <h1>{name ? `Thanks, ${name}.` : "Thanks."}<br />The next move is <i>in motion.</i></h1>
          <p>Your enquiry has reached the campaign queue. For the quickest direct response and any payment or CV-sharing instructions, continue on WhatsApp.</p>
          <ol className="thanks-stages" aria-label="What happens next">
            <li><span>01</span><div><b>Your brief is received</b><small>The team reviews the direction you shared.</small></div></li>
            <li><span>02</span><div><b>You control the next message</b><small>Continue on WhatsApp only when you are ready.</small></div></li>
          </ol>
          <div className="thanks-actions">
            <a className="button button-paper" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> Continue on WhatsApp</a>
            <Link href="/" className="text-button light-text" style={{ color: "#f5f2eb" }}>Back to engine overview <ArrowRight size={17} /></Link>
          </div>
          <div className="thanks-protection"><ShieldCheck size={17} /><span><b>Response protection.</b> If you have not received a reply within one business day, send a follow-up directly on WhatsApp with your name and target role.</span></div>
        </div>
      </section>
    </main>
  );
}
