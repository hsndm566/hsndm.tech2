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
import { firstLoginDashboardCopy, type FirstLoginCopy, type FirstLoginLocale } from "@/lib/firstLoginDashboardCopy";
import { createFirstLoginDashboardViewModel, type DashboardIdentity } from "@/lib/firstLoginDashboardModel";
import React, { useEffect, useState } from "react";
import { Link } from "wouter";

type FirstLoginDashboardProps = {
  identity?: DashboardIdentity;
  onSignOut?: () => void;
};

const whatsappHelpUrl = "https://wa.me/966571448656?text=Hi%20AutoApply%20SA%2C%20I%20need%20help%20with%20my%20campaign%20dashboard.";

export function FirstLoginDashboard({ identity, onSignOut }: FirstLoginDashboardProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [locale, setLocale] = useState<FirstLoginLocale>(() => {
    try {
      const saved = window.localStorage.getItem("autoapply_dashboard_locale");
      if (saved === "ar" || saved === "en") return saved;
    } catch {
      // Use the browser language below when storage is unavailable.
    }
    return navigator.language.startsWith("ar") ? "ar" : "en";
  });
  const viewModel = createFirstLoginDashboardViewModel(identity);
  const { customer, campaign, checklist, metrics } = viewModel;
  const copy = firstLoginDashboardCopy[locale];
  const isArabic = locale === "ar";

  useEffect(() => {
    try {
      window.localStorage.setItem("autoapply_dashboard_locale", locale);
    } catch {
      // The selected locale remains available for the active session.
    }
  }, [locale]);

  // TODO: When the authenticated API contract is available, replace this truthful first-login
  // view model with GET https://api.hsndm.tech/v1/me/dashboard through the established client pattern.

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className={`min-h-screen bg-[#f5f2eb] text-[#151515] ${isArabic ? "font-[Noto_Sans_Arabic]" : ""}`} dir={isArabic ? "rtl" : "ltr"} lang={locale}>
      <a
        className="sr-only fixed left-4 top-4 z-[80] rounded-lg bg-[#e5482a] px-4 py-3 text-sm font-bold text-[#151515] focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-[#151515]"
        href="#main-content"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/15 bg-[#151515] px-4 text-[#f5f2eb] lg:hidden">
        <Link className="flex items-center gap-3" href="/dashboard" aria-label={copy.dashboardHome}>
          <BrandMark />
        </Link>
        <div className="flex items-center gap-2">
          <button aria-label="Switch dashboard language" className="rounded-lg border border-white/25 px-2.5 py-2 text-xs font-bold text-[#f5f2eb] transition hover:border-[#e5482a] hover:text-[#e5482a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a]" onClick={() => setLocale(isArabic ? "en" : "ar")} type="button">{copy.languageToggle}</button>
          <button aria-controls="dashboard-mobile-menu" aria-expanded={isMobileMenuOpen} aria-label={isMobileMenuOpen ? copy.closeNavigation : copy.openNavigation} className="rounded-lg border border-white/25 p-2 text-[#f5f2eb] transition hover:border-[#e5482a] hover:text-[#e5482a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a]" onClick={() => setIsMobileMenuOpen((open) => !open)} type="button">
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      <div className="min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          aria-label="Dashboard navigation"
          className={`${isMobileMenuOpen ? "block" : "hidden"} fixed inset-x-0 bottom-0 top-16 z-30 overflow-y-auto bg-[#151515] p-4 text-[#f5f2eb] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:p-5`}
          id="dashboard-mobile-menu"
        >
          <div className="hidden h-11 items-center lg:flex">
            <Link className="flex items-center gap-3" href="/dashboard" aria-label={copy.dashboardHome}>
              <BrandMark />
            </Link>
            <button aria-label="Switch dashboard language" className="ms-auto rounded-lg border border-white/25 px-2.5 py-1.5 text-xs font-bold text-[#f5f2eb] transition hover:border-[#e5482a] hover:text-[#e5482a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a]" onClick={() => setLocale(isArabic ? "en" : "ar")} type="button">{copy.languageToggle}</button>
          </div>

          <div className="mt-8 rounded-2xl border border-[#e5482a]/45 bg-[#e5482a]/10 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#e5482a]">{copy.workspaceLabel}</p>
            <p className="mt-2 text-sm font-semibold text-white">{copy.workspaceHeadline}</p>
            <p className="mt-1 text-xs leading-5 text-slate-300">{copy.workspaceSubtext}</p>
          </div>

          <nav aria-label="Main" className="mt-8 space-y-1">
            <SidebarLink active href="/dashboard" icon={<LayoutDashboard className="size-5" />} label={copy.nav.overview} onNavigate={closeMobileMenu} />
            <SidebarLink href="#recent-activity" icon={<FileText className="size-5" />} label={copy.nav.applications} onNavigate={closeMobileMenu} suffix={metrics.verifiedSubmitted} />
            <SidebarLink href="/dashboard/settings" icon={<UserRound className="size-5" />} label={copy.nav.profile} onNavigate={closeMobileMenu} />
            <SidebarLink href="/#upload" icon={<FileText className="size-5" />} label={copy.nav.documents} onNavigate={closeMobileMenu} />
          </nav>

          <div className="mt-8 border-t border-white/15 pt-6">
            <SidebarLink href="/support" icon={<CircleHelp className="size-5" />} label={copy.nav.help} onNavigate={closeMobileMenu} />
          </div>

          <div className="mt-auto hidden rounded-2xl border border-white/15 bg-white/5 p-3 lg:block">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-white/10 text-sm font-bold text-[#e5482a]">{customer.initials}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{customer.fullName}</p>
                <p className="truncate text-xs text-slate-400">{customer.email}</p>
              </div>
              {onSignOut ? (
                <button aria-label={copy.signOut} className="rounded p-1.5 text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" onClick={onSignOut} type="button">
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
                <p className="font-mono text-[10px] uppercase tracking-[.2em] text-stone-500">{copy.customerDashboard}</p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-[#151515] [font-family:Space_Grotesk,sans-serif] sm:text-2xl">{copy.greeting} {customer.firstName}.</h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-700/25 bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-950">
                  <span className="size-1.5 rounded-full bg-amber-700" /> {copy.campaignNotStarted}
                </span>
                <span className="hidden text-xs text-stone-500 sm:inline">{locale === "en" ? campaign.lastUpdated : copy.updatedNow}</span>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
            <section aria-labelledby="launch-title" className="relative overflow-hidden rounded-3xl border border-[#e5482a]/35 bg-[linear-gradient(135deg,#ffffff_0%,#f5f2eb_58%,#e8e5de_100%)] shadow-[0_0_0_1px_rgba(229,72,42,.18),0_20px_60px_rgba(21,21,21,.12)]">
              <div aria-hidden="true" className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(229,72,42,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(229,72,42,.06)_1px,transparent_1px)] [background-size:28px_28px]" />
              <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.25fr_.75fr] lg:items-center lg:p-10">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#e5482a]/25 bg-[#e5482a]/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.18em] text-[#b82c20]">
                    <span className="size-1.5 rounded-full bg-[#e5482a]" /> {copy.hero.eyebrow}
                  </div>
                  <h2 className="mt-5 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-[#111111] sm:text-4xl" id="launch-title">{copy.hero.title}</h2>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-stone-700 sm:text-base">{copy.hero.body}</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#151515] px-5 py-3 text-sm font-extrabold !text-[#f5f2eb] transition hover:bg-[#e5482a] hover:!text-[#151515] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a] focus-visible:ring-offset-2" href="/dashboard/settings">{copy.hero.primaryCta} <ArrowRight className={`size-4 ${isArabic ? "-scale-x-100" : ""}`} /></Link>
                    <a className="inline-flex items-center justify-center rounded-xl border border-[#151515]/25 bg-[#f5f2eb]/75 px-5 py-3 text-sm font-bold text-[#151515] transition hover:border-[#e5482a] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a]" href="#how-it-works">{copy.hero.secondaryCta}</a>
                  </div>
                </div>
                <CampaignPath copy={copy} />
              </div>
            </section>

            <section aria-label="Campaign launch details" className="mt-7 grid gap-7 xl:grid-cols-[1.55fr_1fr]">
              <LaunchChecklist completed={checklist.completed} copy={copy} isArabic={isArabic} total={checklist.total} />
              <ProofFirstCard copy={copy} isArabic={isArabic} />
            </section>

            <section aria-labelledby="campaign-summary-title" className="mt-7">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-stone-500">{copy.overview.eyebrow}</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#111111]" id="campaign-summary-title">{copy.overview.title}</h2></div>
                <span className="hidden text-xs text-stone-500 sm:block">{copy.overview.note}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard detail={copy.metrics[0].note} icon={<Search className="size-4" />} label={copy.metrics[0].label} value={metrics.sourced} />
                <MetricCard detail={copy.metrics[1].note} icon={<FileText className="size-4" />} label={copy.metrics[1].label} value={metrics.readyForReview} />
                <MetricCard detail={copy.metrics[2].note} icon={<Check className="size-4" />} label={copy.metrics[2].label} value={metrics.verifiedSubmitted} />
                <MetricCard detail={copy.metrics[3].note} icon={<ShieldCheck className="size-4" />} label={copy.metrics[3].label} value={metrics.needsAction} />
              </div>
            </section>

            <section className="mt-7 grid gap-7 xl:grid-cols-[1.55fr_1fr]">
              <article className="rounded-3xl border border-[#e8e5de] bg-[#f5f2eb] p-5 shadow-sm sm:p-7" id="recent-activity">
                <div className="flex items-center justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-stone-500">{copy.activity.eyebrow}</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#151515]">{copy.activity.title}</h2></div><a className="text-sm font-bold text-[#e5482a] hover:text-[#b82c20]" href="#recent-activity">{copy.activity.action}</a></div>
                <div className="mt-6 rounded-2xl border border-dashed border-[#151515]/25 bg-white px-5 py-8 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-stone-300 bg-white text-stone-500"><FileText className="size-6" /></span>
                  <p className="mt-4 text-sm font-bold text-[#111111]">{copy.activity.emptyTitle}</p>
                  <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-stone-500">{copy.activity.emptyBody}</p>
                </div>
              </article>

              <aside className="rounded-3xl border border-[#e5482a]/25 bg-[#e8e5de] p-5 sm:p-7">
                <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#b82c20]">{copy.help.eyebrow}</p>
                <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#111111]">{copy.help.title}</h2>
                <p className="mt-3 text-sm leading-6 text-stone-700">{copy.help.body}</p>
                <div className="mt-6 space-y-3">
                  <a className="flex items-center gap-3 rounded-xl border border-[#e5482a]/25 bg-[#f5f2eb] p-3 text-start transition hover:border-[#e5482a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a]" href={whatsappHelpUrl} rel="noreferrer" target="_blank"><span className="grid size-9 place-items-center rounded-lg bg-[#e5482a]/10 text-[#e5482a]"><MessageCircle className="size-5" /></span><span><span className="block text-xs font-bold text-[#151515]">{copy.help.whatsappTitle}</span><span className="mt-0.5 block text-[11px] text-stone-500">{copy.help.whatsappSubtext}</span></span><ArrowRight className={`ms-auto size-4 text-stone-500 ${isArabic ? "-scale-x-100" : ""}`} /></a>
                  <Link className="flex items-center gap-3 rounded-xl border border-[#151515]/20 bg-[#f5f2eb] p-3 text-start transition hover:border-[#e5482a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a]" href="/support"><span className="grid size-9 place-items-center rounded-lg bg-white text-stone-700"><CircleHelp className="size-5" /></span><span><span className="block text-xs font-bold text-[#151515]">{copy.help.supportTitle}</span><span className="mt-0.5 block text-[11px] text-stone-500">{copy.help.supportSubtext}</span></span><ArrowRight className={`ms-auto size-4 text-stone-500 ${isArabic ? "-scale-x-100" : ""}`} /></Link>
                </div>
              </aside>
            </section>

            <footer className="mt-10 border-t border-[#151515]/20 py-6 text-xs text-stone-500"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p>{copy.footer.note}</p><div className="flex gap-4"><Link className="hover:text-[#151515]" href="/privacy">{copy.footer.privacy}</Link><Link className="hover:text-[#151515]" href="/terms">{copy.footer.terms}</Link><Link className="hover:text-[#151515]" href="/support">{copy.footer.support}</Link></div></div></footer>
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

function CampaignPath({ copy }: { copy: FirstLoginCopy }) {
  return <div aria-hidden="true" className="rounded-2xl border border-[#151515]/10 bg-white/75 p-5 backdrop-blur-sm"><div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.16em] text-stone-500">{copy.pathLabel}</span><span className="rounded-full border border-[#151515]/20 px-2 py-1 font-mono text-[10px] text-stone-500">01 / 04</span></div><div className="mt-7 space-y-4">{copy.path.map(({ title, detail }, index) => <div className="flex gap-4" key={title}><div className="flex flex-col items-center"><span className={`grid size-9 place-items-center rounded-full border text-xs font-bold ${index === 0 ? "border-[#e5482a]/50 bg-[#e5482a]/10 text-[#e5482a]" : "border-[#151515]/20 bg-white text-stone-500"}`}>{index + 1}</span>{index < copy.path.length - 1 ? <span className="h-7 w-px bg-[#151515]/20" /> : null}</div><div><p className={`text-sm font-bold ${index === 0 ? "text-[#151515]" : "text-stone-700"}`}>{title}</p><p className="mt-0.5 text-xs leading-5 text-stone-500">{detail}</p></div></div>)}</div></div>;
}

function LaunchChecklist({ completed, copy, isArabic, total }: { completed: number; copy: FirstLoginCopy; isArabic: boolean; total: number }) {
  return <article className="rounded-3xl border border-[#e8e5de] bg-[#f5f2eb] p-5 shadow-sm sm:p-7"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#e5482a]">{copy.checklist.eyebrow}</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-[#151515] [font-family:Space_Grotesk,sans-serif]">{copy.checklist.title}</h2><p className="mt-2 text-sm leading-6 text-stone-600">{copy.checklist.body}</p></div><span className="rounded-full border border-[#e5482a]/20 bg-[#e5482a]/10 px-3 py-1.5 font-mono text-xs text-[#b82c20]">{completed} / {total} {copy.checklist.complete}</span></div><ol className="mt-7 space-y-3">{copy.checklist.items.map((item, index) => <li className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center ${index === 0 ? "border-[#e5482a]/30 bg-white" : "border-[#151515]/15 bg-[#f5f2eb]"}`} key={item.title}><span className={`grid size-10 shrink-0 place-items-center rounded-xl border font-mono text-xs ${index === 0 ? "border-[#e5482a]/30 bg-[#e5482a]/10 text-[#e5482a]" : "border-[#151515]/20 bg-white text-stone-500"}`}>{isArabic ? String(index + 1).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]) : String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-extrabold text-[#151515]">{isArabic ? "" : `${index + 1}. `}{item.title}</p><span className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${index === 0 ? "bg-[#e5482a] text-[#151515]" : "border border-[#151515]/20 text-stone-500"}`}>{index === 0 ? copy.checklist.startHere : copy.checklist.locked}</span></div><p className="mt-1 text-xs leading-5 text-stone-600">{item.detail}</p></div>{item.action ? <a className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#151515] px-4 py-2.5 text-xs font-extrabold !text-[#f5f2eb] transition hover:bg-[#e5482a] hover:!text-[#151515] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a]" href="/#upload">{item.action}</a> : <span className="text-xs font-semibold text-stone-500">{item.availability}</span>}</li>)}</ol></article>;
}

function ProofFirstCard({ copy, isArabic }: { copy: FirstLoginCopy; isArabic: boolean }) {
  const icons = [<Check className="size-4" />, <FileText className="size-4" />, <ShieldCheck className="size-4" />];
  return <article className="rounded-3xl border border-[#e8e5de] bg-[#f5f2eb] p-5 shadow-sm sm:p-7" id="how-it-works"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-stone-600">{copy.proof.eyebrow}</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-[#151515] [font-family:Space_Grotesk,sans-serif]">{copy.proof.title}</h2><p className="mt-2 text-sm leading-6 text-stone-600">{copy.proof.body}</p><div className="mt-7 space-y-5">{copy.proof.statuses.map(({ title, detail }, index) => <div className="flex gap-3" key={title}><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-[#e5482a]/25 bg-[#e5482a]/10 text-[#e5482a]">{icons[index]}</span><div><p className="text-sm font-bold text-[#151515]">{title}</p><p className="mt-1 text-xs leading-5 text-stone-600">{detail}</p></div></div>)}</div><Link className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#e5482a] hover:text-[#b82c20]" href="/support">{copy.proof.action} <ArrowRight className={`size-4 ${isArabic ? "-scale-x-100" : ""}`} /></Link></article>;
}

function MetricCard({ detail, icon, label, value }: { detail: string; icon: React.ReactNode; label: string; value: number }) {
  return <div className="rounded-2xl border border-[#e8e5de] bg-[#f5f2eb] p-5"><div className="flex items-center justify-between"><span className="text-xs font-bold text-stone-600">{label}</span><span className="grid size-8 place-items-center rounded-lg bg-white text-stone-500">{icon}</span></div><p className="mt-5 text-3xl font-semibold tracking-tight text-[#151515] [font-family:Space_Grotesk,sans-serif]">{value}</p><p className="mt-1 text-xs text-stone-500">{detail}</p></div>;
}
