/**
 * Design reminder — Operational Clarity: error recovery must feel intentional and guide
 * the visitor immediately into the application campaign journey.
 */
import { useEffect } from "react";
import { ArrowLeft, ArrowRight, SearchX } from "lucide-react";
import { applyPageSeo } from "@/lib/seo";
import { Link } from "wouter";

export default function NotFound() {
  useEffect(() => {
    applyPageSeo({ title: "Page Not Found | AutoApply SA", description: "The requested AutoApply SA page could not be found. Return to the application engine or start a campaign.", path: "/404", noindex: true });
  }, []);

  return (
    <main className="journey-page not-found-page">
      <header className="journey-header page-frame">
        <Link href="/" className="brand journey-brand" aria-label="AutoApply SA home">
          <img src="/autoapplysa-mark.svg" alt="" className="brand-mark" />
          <span>AutoApply<em>Sa</em></span>
        </Link>
        <span className="journey-status"><i /> ROUTE NOT FOUND / 404</span>
      </header>
      <section className="not-found-wrap page-frame">
        <nav className="breadcrumbs light-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><b>404</b></nav>
        <div className="not-found-layout">
          <SearchX size={62} strokeWidth={1} />
          <div><span className="error-code">404</span><h1>That route is<br /><i>not in the plan.</i></h1><p>The page you requested has moved, expired, or never existed. The application engine is still running.</p></div>
          <div className="error-actions"><Link className="button button-paper" href="/"> <ArrowLeft size={17} /> Back to the engine</Link><Link className="text-button light-text" href="/enquire">Start a campaign <ArrowRight size={17} /></Link></div>
        </div>
      </section>
    </main>
  );
}
