import { ArrowLeft, CheckCircle2, ExternalLink, Laptop, ShieldCheck, TerminalSquare } from "lucide-react";
import { Link } from "wouter";

const repoUrl = "https://github.com/hsndm566/applypilot-saudi";

export default function BrowserHelper() {
  return (
    <main className="min-h-screen bg-[#f3f0e9] px-5 py-8 text-[#151515] sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold hover:text-[#e5482a]">
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl border border-[#151515]/10 bg-[#fbf9f5] shadow-sm">
          <div className="border-b border-[#151515]/10 bg-[#151515] p-7 text-[#f5f2eb] sm:p-10">
            <p className="font-mono text-[11px] uppercase tracking-[.18em] text-[#e5482a]">AutoApply Local Browser Helper</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Use AutoApply with your own Chrome. No Web Store install.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75">This uses the open-source ApplyPilot browser runner already maintained in the AutoApply stack. It launches Chrome locally through Playwright, so there is no Chrome Web Store fee and no extension-store dependency.</p>
          </div>

          <div className="grid gap-6 p-7 sm:p-10 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold">One-time setup</h2>
              <Step number="1" title="Install Python 3.11+ and Node.js 18+" detail="Chrome or Chromium must also be installed on the computer that will run applications." />
              <Step number="2" title="Install the AutoApply browser runner" detail="Open Terminal or PowerShell and run the command shown below." />
              <Code>pip install git+https://github.com/hsndm566/applypilot-saudi.git</Code>
              <Step number="3" title="Initialize your local profile" detail="The setup wizard stores the candidate profile on the local machine." />
              <Code>applypilot init</Code>
              <Step number="4" title="Verify the browser helper" detail="Doctor checks Chrome, Node, Python and the AI/browser dependencies before a run." />
              <Code>applypilot doctor</Code>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-extrabold">Safe first run</h2>
              <div className="rounded-2xl border border-[#e5482a]/25 bg-[#fff6f2] p-5">
                <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#e5482a]" /><div><p className="font-bold">Preview before submitting</p><p className="mt-1 text-sm leading-6 text-[#151515]/70">Start with dry-run mode. It can fill and inspect forms without submitting them.</p></div></div>
                <div className="mt-4"><Code>applypilot apply --dry-run</Code></div>
              </div>
              <div className="rounded-2xl border border-[#151515]/10 p-5">
                <div className="flex items-start gap-3"><Laptop className="mt-0.5 size-5 shrink-0" /><div><p className="font-bold">Normal local browser run</p><p className="mt-1 text-sm leading-6 text-[#151515]/70">When the candidate is ready, the runner opens local Chrome and executes the configured application workflow.</p></div></div>
                <div className="mt-4"><Code>applypilot apply</Code></div>
              </div>
              <div className="rounded-2xl border border-emerald-700/20 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
                <div className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0" /><p>The browser helper is a local companion, not a browser extension. Firebase cannot silently grant browser-control permissions; using the local Playwright runner avoids that restriction while keeping Chrome under the customer's control.</p></div>
              </div>
              <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#151515] px-5 py-3 text-sm font-extrabold text-[#f5f2eb] transition hover:bg-[#e5482a] hover:text-[#151515]">
                <ExternalLink className="size-4" /> View source and updates
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Step({ number, title, detail }: { number: string; title: string; detail: string }) {
  return <div className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#151515] text-xs font-extrabold text-white">{number}</span><div><p className="font-bold">{title}</p><p className="mt-1 text-sm leading-6 text-[#151515]/65">{detail}</p></div></div>;
}

function Code({ children }: { children: string }) {
  return <div className="flex items-center gap-3 overflow-x-auto rounded-xl bg-[#151515] px-4 py-3 font-mono text-xs text-[#f5f2eb]"><TerminalSquare className="size-4 shrink-0 text-[#e5482a]" /><code>{children}</code></div>;
}
