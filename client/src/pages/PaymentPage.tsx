import { ArrowLeft, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { applyPageSeo } from "@/lib/seo";

type PlanKey = "starter" | "pro" | "founder";

const planDetails: Record<PlanKey, { name: string; price: number; applications: string }> = {
  starter: { name: "Starter", price: 99, applications: "~40 applications" },
  pro: { name: "Pro", price: 149, applications: "~90 applications" },
  founder: { name: "Founder", price: 249, applications: "~150 applications" },
};

function selectedPlan(): PlanKey {
  if (typeof window === "undefined") return "pro";
  const value = new URLSearchParams(window.location.search).get("plan")?.toLowerCase();
  return value === "starter" || value === "founder" || value === "pro" ? value : "pro";
}

export default function PaymentPage({ success = false }: { success?: boolean }) {
  const plan = useMemo(selectedPlan, []);
  const details = planDetails[plan];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    applyPageSeo({
      title: success ? "Payment received | AutoApply SA" : `Pay for ${details.name} | AutoApply SA`,
      description: success
        ? "Return to AutoApply SA after completing payment through Dodo Payments."
        : `Secure checkout for the AutoApply SA ${details.name} campaign plan.`,
      path: success ? "/pay/success" : "/pay",
      noindex: true,
    });
  }, [details.name, success]);

  const startCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "";
      const response = await fetch(`${apiBase}/api/payments/dodo/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await response.json().catch(() => null)) as { checkoutUrl?: string; error?: string } | null;
      if (!response.ok || !data?.checkoutUrl) throw new Error(data?.error || "checkout-unavailable");
      window.location.assign(data.checkoutUrl);
    } catch {
      setError("Secure checkout is not available yet. Please contact AutoApply SA and we’ll help you complete payment.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-[#f3f0e9] px-5 py-12 text-[#151515]">
        <div className="mx-auto max-w-2xl border border-black/10 bg-white p-8 shadow-[0_24px_70px_rgba(21,21,21,.08)] md:p-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e5482a]/10 text-[#e5482a]"><Check /></div>
          <p className="mt-7 font-mono text-xs text-[#e5482a]">PAYMENT RETURN</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Thanks. We’re confirming your payment.</h1>
          <p className="mt-5 leading-7 text-black/70">Dodo Payments has returned you to AutoApply SA. Your campaign is activated only after the payment event and campaign scope are confirmed.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="inline-flex min-h-12 items-center bg-[#151515] px-5 py-3 font-mono text-xs font-bold text-white">OPEN DASHBOARD</Link>
            <Link href="/" className="inline-flex min-h-12 items-center gap-2 border border-black/15 px-5 py-3 font-mono text-xs font-bold"><ArrowLeft size={15} />HOME</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f0e9] text-[#151515]">
      <header className="border-b border-black/10 bg-[#fbf9f5]">
        <div className="page-frame flex items-center justify-between gap-5 py-5">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="AutoApply SA home">
            <img src="/manus-storage/autoapply-symbol_80d77010.png" alt="AutoApply SA brand mark" className="h-11 w-11 rounded-xl bg-[#151515] p-1 object-contain" width={44} height={44} />
            <span className="font-bold">AutoApply <em className="not-italic text-[#e5482a]">SA</em></span>
          </Link>
          <span className="inline-flex items-center gap-2 font-mono text-xs text-black/60"><LockKeyhole size={14} />SECURE PAYMENT</span>
        </div>
      </header>

      <section className="page-frame grid gap-8 py-12 lg:grid-cols-[1fr_420px] lg:py-20">
        <div>
          <p className="font-mono text-xs text-[#e5482a]">AUTOAPPLY SA / CHECKOUT</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight md:text-6xl">Confirm your {details.name} campaign.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/70">You’re paying for campaign support from AutoApply SA. Card details are entered only on Dodo Payments’ secure hosted checkout, not on AutoApply’s servers.</p>
          <div className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex gap-3 border border-black/10 bg-white p-4"><ShieldCheck className="shrink-0 text-[#e5482a]" size={19} /><span>Secure hosted checkout through Dodo Payments</span></div>
            <div className="flex gap-3 border border-black/10 bg-white p-4"><Check className="shrink-0 text-[#e5482a]" size={19} /><span>No employer application is submitted without your approval</span></div>
          </div>
        </div>

        <aside className="h-fit border border-black/10 bg-[#151515] p-7 text-white shadow-[0_24px_70px_rgba(21,21,21,.12)] md:p-8">
          <p className="font-mono text-xs text-[#e5482a]">SELECTED PLAN</p>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div><h2 className="text-3xl font-bold">{details.name}</h2><p className="mt-2 text-sm text-white/60">{details.applications}</p></div>
            <div className="text-right"><strong className="text-4xl">{details.price}</strong><div className="font-mono text-xs text-white/60">SAR / MO</div></div>
          </div>
          <div className="my-7 border-t border-white/15" />
          <p className="text-sm leading-6 text-white/70">Your Dodo checkout may show the payment methods available for your location and account configuration.</p>
          <button type="button" onClick={startCheckout} disabled={loading} className="mt-7 inline-flex min-h-12 w-full items-center justify-center bg-[#e5482a] px-5 py-3 font-mono text-xs font-bold text-white disabled:cursor-wait disabled:opacity-60">
            {loading ? "OPENING SECURE CHECKOUT…" : `PAY ${details.price} SAR WITH DODO`}
          </button>
          {error && <p role="alert" className="mt-4 text-sm leading-6 text-[#ffd4cb]">{error}</p>}
          <p className="mt-5 text-xs leading-5 text-white/50">Payments are processed by Dodo Payments. AutoApply SA never receives your full card number.</p>
        </aside>
      </section>
    </main>
  );
}
