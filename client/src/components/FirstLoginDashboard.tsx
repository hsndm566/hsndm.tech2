import {
  ArrowRight,
  Check,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { createFirstLoginDashboardViewModel, type DashboardIdentity } from "@/lib/firstLoginDashboardModel";
import React, { useState } from "react";
import { Link } from "wouter";

type FirstLoginDashboardProps = {
  identity?: DashboardIdentity;
  onSignOut?: () => void;
};

const whatsappHelpUrl = "https://wa.me/966571448656?text=Hi%20AutoApply%20SA%2C%20I%20need%20help%20with%20my%20campaign%20dashboard.";

export function FirstLoginDashboard({ identity, onSignOut }: FirstLoginDashboardProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const viewModel = createFirstLoginDashboardViewModel(identity);
  const { customer, campaign, checklist, metrics } = viewModel;

  // TODO: When the authenticated API contract is available, replace this truthful first-login
  // view model with GET https://api.hsndm.tech/v1/me/dashboard through the established client pattern.

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-[#151515]">
      <a
        className="sr-only fixed left-4 top-4 z-[80] rounded-lg bg-[#e5482a] px-4 py-3 text-sm font-bold text-[#151515] focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-[#151515]"
        href="#main-content"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/15 bg-[#151515] px-4 text-[#f5f2eb] lg:hidden">
        <Link className="flex items-center gap-3" href="/dashboard" aria-label="AutoApply SA dashboard home">
          <BrandMark />
        </Link>
        <button
          aria-controls="dashboard-mobile-menu"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
          className="rounded-lg border border-white/25 p-2 text-[#f5f2eb] transition hover:border-[#e5482a] hover:text-[#e5482a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a]"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          type="button"
        >
          {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      <div className="min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          aria-label="Dashboard navigation"
          className={`${isMobileMenuOpen ? "block" : "hidden"} fixed inset-x-0 bottom-0 top-16 z-30 overflow-y-auto bg-[#151515] p-4 text-[#f5f2eb] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:p-5`}
          id="dashboard-mobile-menu"
        >
          <div className="hidden h-11 items-center lg:flex">
            <Link className="flex items-center gap-3" href="/dashboard" aria-label="AutoApply SA dashboard home">
              <BrandMark />
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-[#e5482a]/45 bg-[#e5482a]/10 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#e5482a]">Campaign workspace</p>
            <p className="mt-2 text-sm font-semibold text-white">Your career progress, with proof.</p>
            <p className="mt-1 text-xs leading-5 text-slate-300">We only show a role as submitted after required evidence has been captured.</p>
          </div>

          <nav aria-label="Main" className="mt-8 space-y-1">
            <SidebarLink active href="/dashboard" icon={<LayoutDashboard className="size-5" />} label="Overview" onNavigate={closeMobileMenu} />
            <SidebarLink href="#recent-activity" icon={<FileText className="size-5" />} label="Applications" onNavigate={closeMobileMenu} suffix={metrics.verifiedSubmitted} />
            <SidebarLink href="/dashboard/settings" icon={<UserRound className="size-5" />} label="Profile & preferences" onNavigate={closeMobileMenu} />
            <SidebarLink href="/#cv-intake" icon={<FileText className="size-5" />} label="Documents" onNavigate={closeMobileMenu} />
          </nav>

          <div className="mt-8 border-t border-white/15 pt-6">
            <SidebarLink href="/support" icon={<CircleHelp className="size-5" />} label="Help & support" onNavigate={closeMobileMenu} />
          </div>

          <div className="mt-auto hidden rounded-2xl border border-white/15 bg-white/5 p-3 lg:block">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-white/10 text-sm font-bold text-[#e5482a]">{customer.initials}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{customer.fullName}</p>
                <p className="truncate text-xs text-slate-400">{customer.email}</p>
              </div>
              {onSignOut ? (
                <button aria-label="Sign out" className="rounded p-1.5 text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" onClick={onSignOut} type="button">
                  <LogOut className="size-4" />
                </button>
              ) : null}
            </div>
          </div>
        </aside>

        <main className="min-w-0 bg-[#f5f2eb]" id="main-content">
          <div className="border-b border-[#e8e5de] bg-[#f5f2eb] px-5 py-4 sm:px-8 lg:px-10">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[.2em] text-stone-500">Customer dashboard</p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-[#151515] [font-family:Space_Grotesk,sans-serif] sm:text-2xl">Good to see you, {customer.firstName}.</h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-700/25 bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-950">
                  <span className="size-1.5 rounded-full bg-amber-700" /> Campaign not started
                </span>
                <span className="hidden text-xs text-stone-500 sm:inline">{campaign.lastUpdated}</span>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
            <section aria-labelledby="launch-title" className="relative overflow-hidden rounded-3xl border border-[#e5482a]/35 bg-[linear-gradient(135deg,#ffffff_0%,#f5f2eb_58%,#e8e5de_100%)] shadow-[0_0_0_1px_rgba(229,72,42,.18),0_20px_60px_rgba(21,21,21,.12)]">
              <div aria-hidden="true" className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(229,72,42,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(229,72,42,.06)_1px,transparent_1px)] [background-size:28px_28px]" />
              <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.25fr_.75fr] lg:items-center lg:p-10">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#e5482a]/25 bg-[#e5482a]/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.18em] text-[#b82c20]">
                    <span className="size-1.5 rounded-full bg-[#e5482a]" /> First login workspace
                  </div>
                  <h2 className="mt-5 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-[#111111] sm:text-4xl" id="launch-title">Let&apos;s prepare your Saudi job campaign.</h2>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-stone-700 sm:text-base">Complete the steps below and we will prepare roles that match your location, experience, and preferences. Every activity shown here is evidence-based.</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#151515] px-5 py-3 text-sm font-extrabold !text-[#f5f2eb] transition hover:bg-[#e5482a] hover:!text-[#151515] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a] focus-visible:ring-offset-2" href="/dashboard/settings">Complete your preferences <ArrowRight className="size-4" /></Link>
                    <a className="inline-flex items-center justify-center rounded-xl border border-[#151515]/25 bg-[#f5f2eb]/75 px-5 py-3 text-sm font-bold text-[#151515] transition hover:border-[#e5482a] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a]" href="#how-it-works">How campaign tracking works</a>
                  </div>
                </div>
                <CampaignPath />
              </div>
            </section>

            <section aria-label="Campaign launch details" className="mt-7 grid gap-7 xl:grid-cols-[1.55fr_1fr]">
              <LaunchChecklist completed={checklist.completed} total={checklist.total} />
              <ProofFirstCard />
            </section>

            <section aria-labelledby="campaign-summary-title" className="mt-7">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-stone-500">Campaign overview</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#111111]" id="campaign-summary-title">Your activity will appear here</h2></div>
                <span className="hidden text-xs text-stone-500 sm:block">No data is hidden behind these totals.</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard detail="Starts after profile review." icon={<Search className="size-4" />} label="Roles sourced" value={metrics.sourced} />
                <MetricCard detail="Nothing needs review yet." icon={<FileText className="size-4" />} label="Ready for review" value={metrics.readyForReview} />
                <MetricCard detail="Evidence required before counting." icon={<Check className="size-4" />} label="Verified submitted" value={metrics.verifiedSubmitted} />
                <MetricCard detail="You are all caught up." icon={<ShieldCheck className="size-4" />} label="Needs your action" value={metrics.needsAction} />
              </div>
            </section>

            <section className="mt-7 grid gap-7 xl:grid-cols-[1.55fr_1fr]">
              <article className="rounded-3xl border border-[#e8e5de] bg-[#f5f2eb] p-5 shadow-sm sm:p-7" id="recent-activity">
                <div className="flex items-center justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-stone-500">Recent activity</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#151515]">Nothing has been submitted yet</h2></div><a className="text-sm font-bold text-[#e5482a] hover:text-[#b82c20]" href="#recent-activity">View applications</a></div>
                <div className="mt-6 rounded-2xl border border-dashed border-[#151515]/25 bg-white px-5 py-8 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-stone-300 bg-white text-stone-500"><FileText className="size-6" /></span>
                  <p className="mt-4 text-sm font-bold text-[#111111]">Your campaign activity will be listed in time order.</p>
                  <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-stone-500">First, upload your CV. Then you will see profile-review updates, matching activity, application proof, or any action that needs your help.</p>
                </div>
              </article>

              <aside className="rounded-3xl border border-[#e5482a]/25 bg-[#e8e5de] p-5 sm:p-7">
                <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#b82c20]">Need help?</p>
                <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#111111]">Your campaign team is here.</h2>
                <p className="mt-3 text-sm leading-6 text-stone-700">If you are unsure what to upload or need help with a required action, send us a message. Your dashboard will remain honest about what is waiting and why.</p>
                <div className="mt-6 space-y-3">
                  <a className="flex items-center gap-3 rounded-xl border border-[#e5482a]/25 bg-[#f5f2eb] p-3 text-left transition hover:border-[#e5482a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a]" href={whatsappHelpUrl} rel="noreferrer" target="_blank"><span className="grid size-9 place-items-center rounded-lg bg-[#e5482a]/10 text-[#e5482a]"><MessageCircle className="size-5" /></span><span><span className="block text-xs font-bold text-[#151515]">Message support</span><span className="mt-0.5 block text-[11px] text-stone-500">WhatsApp campaign help</span></span><ArrowRight className="ml-auto size-4 text-stone-500" /></a>
                  <Link className="flex items-center gap-3 rounded-xl border border-[#151515]/20 bg-[#f5f2eb] p-3 text-left transition hover:border-[#e5482a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a]" href="/support"><span className="grid size-9 place-items-center rounded-lg bg-white text-stone-700"><CircleHelp className="size-5" /></span><span><span className="block text-xs font-bold text-[#151515]">Open support center</span><span className="mt-0.5 block text-[11px] text-stone-500">Campaign rules and evidence guide</span></span><ArrowRight className="ml-auto size-4 text-stone-500" /></Link>
                </div>
              </aside>
            </section>

            <footer className="mt-10 border-t border-[#151515]/20 py-6 text-xs text-stone-500"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p>AutoApply SA dashboard. Application outcomes are shown only when the associated evidence is available.</p><div className="flex gap-4"><Link className="hover:text-[#151515]" href="/privacy">Privacy</Link><Link className="hover:text-[#151515]" href="/terms">Terms</Link><Link className="hover:text-[#151515]" href="/support">Support</Link></div></div></footer>
          </div>
        </main>
      </div>
    </div>
  );
}

function BrandMark() {
  return <><span className="grid size-10 place-items-center rounded-xl bg-[#e5482a] text-[#151515] shadow-[0_0_0_1px_rgba(229,72,42,.18),0_10px_25px_rgba(21,21,21,.22)]"><span className="font-mono text-sm font-bold">A</span></span><span className="text-base font-extrabold tracking-tight">AutoApply <span className="text-[#e5482a]">SA</span></span></>;
}

function SidebarLink({ active = false, href, icon, label, onNavigate, suffix }: { active?: boolean; href: string; icon: React.ReactNode; label: string; onNavigate: () => void; suffix?: number }) {
  return <Link aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a] ${active ? "bg-[#e5482a] text-[#151515] shadow-[0_0_0_1px_rgba(229,72,42,.18),0_10px_25px_rgba(21,21,21,.22)]" : "text-slate-300 hover:bg-white/10 hover:text-white"}`} href={href} onClick={onNavigate}>{icon}{label}{suffix !== undefined ? <span className="ml-auto rounded-full border border-white/25 px-2 py-0.5 font-mono text-[10px]">{suffix}</span> : null}</Link>;
}

function CampaignPath() {
  const stages = [
    ["Profile setup", "CV and job preferences create your matching profile."],
    ["Role matching", "Suitable Saudi roles are screened against your profile."],
    ["Application preparation", "You see any required action before it blocks progress."],
    ["Verified activity", "Evidence appears in your Applications area."],
  ];
  return <div aria-hidden="true" className="rounded-2xl border border-[#151515]/10 bg-white/75 p-5 backdrop-blur-sm"><div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.16em] text-stone-500">Your campaign path</span><span className="rounded-full border border-[#151515]/20 px-2 py-1 font-mono text-[10px] text-stone-500">01 / 04</span></div><div className="mt-7 space-y-4">{stages.map(([title, detail], index) => <div className="flex gap-4" key={title}><div className="flex flex-col items-center"><span className={`grid size-9 place-items-center rounded-full border text-xs font-bold ${index === 0 ? "border-[#e5482a]/50 bg-[#e5482a]/10 text-[#e5482a]" : "border-[#151515]/20 bg-white text-stone-500"}`}>{index + 1}</span>{index < stages.length - 1 ? <span className="h-7 w-px bg-[#151515]/20" /> : null}</div><div><p className={`text-sm font-bold ${index === 0 ? "text-[#151515]" : "text-stone-700"}`}>{title}</p><p className="mt-0.5 text-xs leading-5 text-stone-500">{detail}</p></div></div>)}</div></div>;
}

function LaunchChecklist({ completed, total }: { completed: number; total: number }) {
  const items = [
    { step: "1", title: "Upload your CV", detail: "Upload a readable PDF or Word CV. We will show its review status here.", state: "Start here", action: "Upload CV", href: "/#cv-intake" },
    { step: "2", title: "Confirm job preferences", detail: "Choose your locations, role lanes, seniority, and availability.", state: "Locked", action: "Available after CV" },
    { step: "3", title: "Review your profile summary", detail: "Check the information that will guide matching and application preparation.", state: "Locked", action: "Available after preferences" },
    { step: "4", title: "Start your campaign", detail: "Review the campaign plan before any application workflow begins.", state: "Locked", action: "Available after profile review" },
  ];
  return <article className="rounded-3xl border border-[#e8e5de] bg-[#f5f2eb] p-5 shadow-sm sm:p-7"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#e5482a]">Launch checklist</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-[#151515] [font-family:Space_Grotesk,sans-serif]">Four steps to start your campaign</h2><p className="mt-2 text-sm leading-6 text-stone-600">You always know what is done, what needs you, and what is still locked.</p></div><span className="rounded-full border border-[#e5482a]/20 bg-[#e5482a]/10 px-3 py-1.5 font-mono text-xs text-[#b82c20]">{completed} / {total} complete</span></div><ol className="mt-7 space-y-3">{items.map((item, index) => <li className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center ${index === 0 ? "border-[#e5482a]/30 bg-white" : "border-[#151515]/15 bg-[#f5f2eb]"}`} key={item.step}><span className={`grid size-10 shrink-0 place-items-center rounded-xl border font-mono text-xs ${index === 0 ? "border-[#e5482a]/30 bg-[#e5482a]/10 text-[#e5482a]" : "border-[#151515]/20 bg-white text-stone-500"}`}>{item.step.padStart(2, "0")}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-extrabold text-[#151515]">{item.step}. {item.title}</p><span className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${index === 0 ? "bg-[#e5482a] text-[#151515]" : "border border-[#151515]/20 text-stone-500"}`}>{item.state}</span></div><p className="mt-1 text-xs leading-5 text-stone-600">{item.detail}</p></div>{item.href ? <a className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#151515] px-4 py-2.5 text-xs font-extrabold !text-[#f5f2eb] transition hover:bg-[#e5482a] hover:!text-[#151515] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a]" href={item.href}>{item.action}</a> : <span className="text-xs font-semibold text-stone-500">{item.action}</span>}</li>)}</ol></article>;
}

function ProofFirstCard() {
  const statuses = [
    ["Verified submitted", "A portal confirmation and required evidence have been captured. Only these count as verified applications.", <Check className="size-4" />],
    ["Email accepted", "A mail provider accepted a CV-attached message. It is tracked separately from verified portal submissions.", <FileText className="size-4" />],
    ["Needs your action", "A CAPTCHA, consent screen, login, or missing fact needs your input. It will never be silently bypassed.", <ShieldCheck className="size-4" />],
  ];
  return <article className="rounded-3xl border border-[#e8e5de] bg-[#f5f2eb] p-5 shadow-sm sm:p-7" id="how-it-works"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-stone-600">Proof-first tracking</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-[#151515] [font-family:Space_Grotesk,sans-serif]">What each status means</h2><p className="mt-2 text-sm leading-6 text-stone-600">Your dashboard never turns a guess into a completed application.</p><div className="mt-7 space-y-5">{statuses.map(([title, detail, icon]) => <div className="flex gap-3" key={String(title)}><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-[#e5482a]/25 bg-[#e5482a]/10 text-[#e5482a]">{icon}</span><div><p className="text-sm font-bold text-[#151515]">{title}</p><p className="mt-1 text-xs leading-5 text-stone-600">{detail}</p></div></div>)}</div><Link className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#e5482a] hover:text-[#b82c20]" href="/support">Read the evidence standard <ArrowRight className="size-4" /></Link></article>;
}

function MetricCard({ detail, icon, label, value }: { detail: string; icon: React.ReactNode; label: string; value: number }) {
  return <div className="rounded-2xl border border-[#e8e5de] bg-[#f5f2eb] p-5"><div className="flex items-center justify-between"><span className="text-xs font-bold text-stone-600">{label}</span><span className="grid size-8 place-items-center rounded-lg bg-white text-stone-500">{icon}</span></div><p className="mt-5 text-3xl font-semibold tracking-tight text-[#151515] [font-family:Space_Grotesk,sans-serif]">{value}</p><p className="mt-1 text-xs text-stone-500">{detail}</p></div>;
}
