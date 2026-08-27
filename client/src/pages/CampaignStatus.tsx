import React, { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { AlertCircle, ArrowLeft, Building2, Clock3, Download, ExternalLink, FileCheck2, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { applyPageSeo } from "@/lib/seo";
import {
  CampaignAccessError,
  CampaignConnectionError,
  computeCampaignHealth,
  type CampaignDashboardPayload,
  fetchCampaignDashboard,
  formatCampaignTime,
  getCvVersionTag,
  humanCampaignStatus,
  readCampaignLink,
  verifiedApplicationCompanies,
  verifiedEvidenceCount,
} from "@/lib/campaignDashboard";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; payload: CampaignDashboardPayload }
  | { status: "error"; message: string; kind: "access" | "connection" };

export default function CampaignStatus() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const link = useMemo(() => readCampaignLink(window.location.pathname, window.location.search, window.location.hash), []);

  useEffect(() => {
    applyPageSeo({
      title: "Private Campaign Status | AutoApply SA",
      description: "Private, evidence-aware campaign status for AutoApply SA candidates.",
      path: window.location.pathname,
      noindex: true,
    });
  }, []);

  useEffect(() => {
    if (!link) {
      setState({
        status: "error",
        kind: "access",
        message: "This private status page needs the complete campaign link supplied by AutoApply SA. The secure link keeps its access token after #access=.",
      });
      return;
    }

    let active = true;
    setState({ status: "loading" });
    void fetchCampaignDashboard(link)
      .then((payload) => active && setState({ status: "ready", payload }))
      .catch((error: unknown) => {
        if (!active) return;
        setState({
          status: "error",
          kind: error instanceof CampaignAccessError ? "access" : "connection",
          message: error instanceof Error ? error.message : "The campaign update service is temporarily unavailable.",
        });
      });

    return () => {
      active = false;
    };
  }, [link]);

  return (
    <main className="min-h-screen bg-[#f3f0e9] text-[#151515] font-sans antialiased">
      <header className="border-b border-[#151515]/10 bg-[#fbf9f5]">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium outline-none hover:text-[#e5482a] focus-visible:ring-2 focus-visible:ring-[#e5482a] focus-visible:ring-offset-2">
            <ArrowLeft className="h-4 w-4" /> AutoApply SA
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#151515]/55">Private campaign view</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        {state.status === "loading" && <LoadingState />}
        {state.status === "error" && <ErrorState message={state.message} kind={state.kind} />}
        {state.status === "ready" && <CampaignDataView payload={state.payload} />}
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <Card className="mx-auto max-w-xl border-[#151515]/10 bg-[#fbf9f5] py-16 text-center shadow-sm" role="status" aria-live="polite">
      <CardContent className="space-y-4">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#e5482a]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-tight">Loading your campaign update</h1>
        <p className="mx-auto max-w-md text-sm leading-6 text-[#151515]/65">Checking the campaign summary and its activity record. This page does not treat activity notes as application proof.</p>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message, kind }: { message: string; kind: "access" | "connection" }) {
  return (
    <Card className="mx-auto max-w-xl border-[#151515]/10 bg-[#fbf9f5] py-12 text-center shadow-sm">
      <CardContent className="space-y-5">
        <AlertCircle className="mx-auto h-10 w-10 text-[#e5482a]" aria-hidden="true" />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{kind === "access" ? "Campaign link needed" : "Campaign updates unavailable"}</h1>
          <p className="mx-auto max-w-md text-sm leading-6 text-[#151515]/65">{message}</p>
        </div>
        <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#151515] px-4 text-sm font-medium outline-none transition-colors hover:bg-[#e5482a] focus-visible:ring-2 focus-visible:ring-[#e5482a] focus-visible:ring-offset-2" style={{ color: "#fbf9f5" }} href="https://wa.me/966571448656?text=Hi%20AutoApply%20SA%2C%20I%20need%20help%20accessing%20my%20private%20campaign%20status." target="_blank" rel="noopener noreferrer">
          Contact AutoApply SA <ExternalLink className="h-4 w-4" />
        </a>
      </CardContent>
    </Card>
  );
}

function CampaignDataView({ payload }: { payload: CampaignDashboardPayload }) {
  const { campaign, events } = payload;
  const status = humanCampaignStatus(campaign.status);
  const evidenceCount = verifiedEvidenceCount(campaign);
  const verifiedCompanies = verifiedApplicationCompanies(campaign);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#e5482a]">Campaign status</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{campaign.target_role || "Your Saudi Arabia campaign"}</h1>
          <p className="max-w-2xl text-sm leading-6 text-[#151515]/65">{campaign.city ? `${campaign.city}, Saudi Arabia` : "Saudi Arabia"}{campaign.industry ? ` · ${campaign.industry}` : ""}</p>
        </div>
        <div className="space-y-2 sm:text-right">
          <Badge className="bg-[#151515] px-3 py-1.5 text-[#fbf9f5] hover:bg-[#151515]">{status.label}</Badge>
          <p className="max-w-xs text-xs leading-5 text-[#151515]/60">{status.detail}</p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Campaign totals">
        <MetricCard icon={<FileCheck2 className="h-4 w-4" />} label="Verified application evidence" value={String(evidenceCount)} detail="Counted only from application evidence." />
        <MetricCard icon={<Building2 className="h-4 w-4" />} label="Companies applied to" value={String(verifiedCompanies.length)} detail="Only companies linked to application evidence." />
        <MetricCard icon={<Mail className="h-4 w-4" />} label="Emails sent" value={String(Math.max(0, Number(campaign.email_send_count) || 0))} detail="Counted only after SMTP acceptance evidence." />
        <MetricCard icon={<Clock3 className="h-4 w-4" />} label="Campaign started" value={formatCampaignTime(campaign.created_at)} detail="Times display in your device time zone." />
      </section>

      {(() => {
        const health = computeCampaignHealth(campaign);
        const filledBlocks = Math.round((health.score / 100) * 10);
        const emptyBlocks = 10 - filledBlocks;
        const barStr = "█".repeat(Math.max(0, filledBlocks)) + "░".repeat(Math.max(0, emptyBlocks));
        return (
          <Card className="border-[#151515]/10 bg-white shadow-sm p-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium">
                <span>Campaign Health: <strong className="text-[#e5482a]">{health.label}</strong></span>
                <span className="font-mono text-xs text-[#151515]/70">[{barStr}] {health.score}%</span>
              </div>
              <p className="text-xs text-[#151515]/60">{health.actionLine}</p>
            </div>
          </Card>
        );
      })()}

      {evidenceCount > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={async () => {
              const { jsPDF } = await import("jspdf");
              const doc = new jsPDF();
              doc.setFont("helvetica", "bold");
              doc.setFontSize(18);
              doc.text("AutoApply SA — Your Active Campaign", 14, 20);
              doc.setFont("helvetica", "normal");
              doc.setFontSize(11);
              doc.text(`Candidate: ${campaign.candidate_name || "Candidate"}`, 14, 30);
              doc.text(`Target Roles: ${campaign.target_role || "Saudi Arabia campaign"}`, 14, 38);
              doc.text(`Status: ${status.label}`, 14, 46);
              doc.text(`Total Applications Submitted: ${evidenceCount}`, 14, 54);
              doc.text("Verified Companies Applied To:", 14, 66);
              let y = 74;
              verifiedCompanies.forEach((app, index) => {
                if (y > 270) {
                  doc.addPage();
                  y = 20;
                }
                doc.text(`${index + 1}. ${app.company} — ${app.title || "Application evidence"} (${formatCampaignTime(app.created_at)})`, 14, y);
                y += 8;
              });
              y += 10;
              doc.setFontSize(9);
              doc.text("AutoApply SA branding · https://hsndm.tech", 14, y);
              doc.save("autoapply-sa-campaign-summary.pdf");
            }}
            className="bg-[#151515] text-white hover:bg-[#333]"
          >
            <Download className="mr-2 h-4 w-4" /> Download your campaign summary
          </Button>
        </div>
      )}

      <Card className="border-[#151515]/10 bg-[#fbf9f5] shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Evidence boundary</CardTitle>
              <CardDescription className="mt-1.5 max-w-2xl leading-6">Application totals above come only from the backend&apos;s application-evidence count. Campaign activity is shown below for context and is never presented as proof that an application was sent.</CardDescription>
            </div>
            <ShieldCheck className="h-6 w-6 text-[#e5482a]" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent className="border-t border-[#151515]/10 pt-6">
          <dl className="grid gap-5 text-sm sm:grid-cols-2">
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#151515]/50">Last verified application</dt><dd className="mt-1.5 font-medium">{formatCampaignTime(campaign.last_application_at || undefined)}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#151515]/50">Current update</dt><dd className="mt-1.5 font-medium">{formatCampaignTime(campaign.updated_at)}</dd></div>
          </dl>
        </CardContent>
      </Card>

      <Card className="border-[#151515]/10 bg-[#fbf9f5] shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Verified applications</CardTitle>
          <CardDescription className="mt-1.5 leading-6">Companies appear only when their job record is linked to application evidence. No campaign activity note is used as proof.</CardDescription>
        </CardHeader>
        <CardContent className="border-t border-[#151515]/10 pt-0">
          {verifiedCompanies.length === 0 ? (
            <p className="py-8 text-sm leading-6 text-[#151515]/65">No evidence-linked company records are available yet.</p>
          ) : (
            <ol className="divide-y divide-[#151515]/10">
              {verifiedCompanies.map((application) => {
                const cvVersion = getCvVersionTag(application, verifiedCompanies);
                return (
                  <li key={application.id} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{application.company}</p>
                        <span className="inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#151515]/5 border border-[#151515]/10 text-[#151515]/70">{cvVersion}</span>
                      </div>
                      <p className="mt-1 text-sm text-[#151515]/60">{application.title || "Application evidence recorded"}{application.location ? ` · ${application.location}` : ""}</p>
                    </div>
                    <time className="font-mono text-[10px] leading-5 text-[#151515]/50">{formatCampaignTime(application.created_at)}</time>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#151515]/10 bg-[#fbf9f5] shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Campaign activity</CardTitle>
          <CardDescription className="mt-1.5 leading-6">Operational updates supplied by the existing campaign-events endpoint. These notes are not submission proof.</CardDescription>
        </CardHeader>
        <CardContent className="border-t border-[#151515]/10 pt-0">
          {events.length === 0 ? (
            <p className="py-8 text-sm leading-6 text-[#151515]/65">No campaign activity has been recorded yet.</p>
          ) : (
            <ol className="divide-y divide-[#151515]/10">
              {events.map((event) => (
                <li key={event.id} className="grid gap-2 py-5 sm:grid-cols-[150px_1fr] sm:gap-5">
                  <time className="font-mono text-[10px] leading-5 text-[#151515]/50">{formatCampaignTime(event.created_at)}</time>
                  <div>
                    <p className="text-sm leading-6 text-[#151515]">{event.message}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.11em] text-[#151515]/45">{event.event_type.replaceAll("_", " ")}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <Card className="border-[#151515]/10 bg-[#fbf9f5] shadow-sm">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center gap-2 text-[#e5482a]">{icon}<CardDescription className="text-[11px] uppercase tracking-[0.08em] text-[#151515]/60">{label}</CardDescription></div>
        <CardTitle className="break-words text-2xl tracking-[-0.04em]">{value}</CardTitle>
      </CardHeader>
      <CardContent><p className="text-xs leading-5 text-[#151515]/60">{detail}</p></CardContent>
    </Card>
  );
}
