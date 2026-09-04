import { ClerkDashboardShell } from "@/components/ClerkDashboardShell";
import { useClerkSession } from "@/components/ClerkSessionBoundary";
import Dashboard from "@/pages/Dashboard";
import ProfileSettings from "@/pages/ProfileSettings";
import { installOptionalSentry } from "@/lib/sentryTelemetry";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { Link, Route, Switch } from "wouter";
import { useEffect } from "react";

function CustomerAuthPage({ mode }: { mode: "sign-in" | "sign-up" }) {
  const clerk = useClerkSession();
  const isSignIn = mode === "sign-in";

  if (!clerk.enabled) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3f0e9] px-5 py-12 text-[#151515]">
        <section className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-7 shadow-xl sm:p-9">
          <p className="font-mono text-xs font-bold uppercase tracking-[.18em] text-[#e5482a]">AutoApply SA · Jeddah</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Secure customer access</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">Sign-in is temporarily unavailable on this host. Your account and campaign data remain protected.</p>
          <Link className="mt-6 inline-flex rounded-xl bg-[#151515] px-5 py-3 text-sm font-bold !text-white" href="/support">Contact support</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f0e9] px-4 py-8 text-[#151515] sm:px-6 sm:py-12">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <section className="rounded-3xl bg-[#151515] p-7 text-[#f5f2eb] shadow-2xl sm:p-10">
          <Link className="inline-flex items-center gap-3 !text-[#f5f2eb]" href="https://www.hsndm.tech/">
            <img alt="AutoApply SA" className="h-11 w-11 rounded-xl bg-white object-contain p-1" src="/manus-storage/autoapply-symbol_80d77010.png" />
            <span className="text-lg font-extrabold tracking-tight">AutoApply SA</span>
          </Link>
          <p className="mt-8 font-mono text-xs font-bold uppercase tracking-[.18em] text-[#e5482a]">Candidate workspace</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{isSignIn ? "Welcome back." : "Start your workspace."}</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-stone-300">Track targeting, prepared applications, verified submissions, and campaign progress from one protected dashboard.</p>
          <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-stone-300">
            Nothing is submitted without your approval. Your dashboard shows the status and available evidence for each tracked application.
          </div>
        </section>

        <section className="flex min-h-[600px] items-center justify-center rounded-3xl border border-black/10 bg-white p-4 shadow-xl sm:p-8">
          {isSignIn ? (
            <SignIn
              appearance={{ variables: { colorPrimary: "#e5482a", colorText: "#151515" } }}
              forceRedirectUrl="/dashboard"
              routing="hash"
              signUpUrl="/sign-up"
            />
          ) : (
            <SignUp
              appearance={{ variables: { colorPrimary: "#e5482a", colorText: "#151515" } }}
              forceRedirectUrl="/dashboard"
              routing="hash"
              signInUrl="/sign-in"
            />
          )}
        </section>
      </div>
    </main>
  );
}

/** Dashboard-only route graph. Keeping it separate prevents Clerk from entering public startup. */
export default function DashboardEntry() {
  useEffect(() => {
    installOptionalSentry();
  }, []);

  return (
    <ClerkDashboardShell>
      <Switch>
        <Route path="/sign-in" component={() => <CustomerAuthPage mode="sign-in" />} />
        <Route path="/sign-up" component={() => <CustomerAuthPage mode="sign-up" />} />
        <Route path="/dashboard/settings" component={ProfileSettings} />
        <Route path="/dashboard" component={Dashboard} />
      </Switch>
    </ClerkDashboardShell>
  );
}
