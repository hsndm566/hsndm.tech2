import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { Download, FileText, Loader2, MessageCircle, Save, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { SearchableSaudiSelect } from "@/components/SearchableSaudiSelect";
import { saudiCities, saudiIndustries } from "@/lib/saudiTaxonomy";
import { extractAtsCvText } from "@/lib/atsUpload";
import { applyPageSeo } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";

const WHATSAPP_NUMBER = "966571448656";

export default function Ats() {
  const [text, setText] = useState("");
  const [file, setFile] = useState("");
  const [role, setRole] = useState("");
  const [city, setCity] = useState("Jeddah");
  const [industry, setIndustry] = useState("Technology & Software");
  const [extractionError, setExtractionError] = useState("");
  const [metadataSaved, setMetadataSaved] = useState(false);
  const [helpfulness, setHelpfulness] = useState<"yes" | "no" | null>(null);
  const { isAuthenticated } = useAuth();
  const analyze = trpc.campaign.ats.analyze.useMutation();
  const reportCvExtractionFailure = trpc.campaign.clientIssue.reportCvExtractionFailure.useMutation();
  const saveResumeMetadata = trpc.campaign.applications.profile.update.useMutation();

  useEffect(() => {
    applyPageSeo({
      title: "ATS Review | AutoApply SA",
      description: "Review CV structure, keywords, and evidence for Saudi Arabia job applications with AutoApply SA.",
      path: "/ats",
    });
  }, []);

  const choose = async (selected?: File) => {
    if (!selected) return;
    setFile(selected.name);
    setExtractionError("");
    const extracted = await extractAtsCvText(selected, () => reportCvExtractionFailure.mutate({ route: "/ats" }));
    setText(extracted);
    if (extracted.trim().length < 120) {
      setExtractionError("We could not read enough text from this file. Try a text-based PDF, DOCX, or TXT file, or paste your CV text below.");
    }
  };

  const targetRole = [role, industry, city].filter(Boolean).join(" · ");
  const canAnalyze = text.trim().length >= 120;
  const reviewNote = analyze.data ? `ATS preview completed: ${analyze.data.score}/100 for ${targetRole || "Saudi Arabia roles"}.` : "";
  const humanReviewHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello AutoApply SA, I completed the free ATS preview and would like a human follow-up. Target: ${targetRole || "Saudi Arabia roles"}. I will share my CV directly in this chat if needed.`)}`;

  const runAnalysis = () => {
    if (!canAnalyze || analyze.isPending) return;
    analyze.mutate({ cvText: text, targetRole });
  };

  const exportResult = () => {
    if (!analyze.data) return;
    const content = `AutoApply SA ATS review\n\nScore: ${analyze.data.score}/100\n\n${analyze.data.summary}\n\nStrengths\n${analyze.data.strengths.map(x => `- ${x}`).join("\n")}\n\nPriority improvements\n${analyze.data.gaps.map(x => `- ${x}`).join("\n")}\n\nOptimized CV bullets\n${analyze.data.optimizedBullets.map(x => `- ${x}`).join("\n")}\n\n${analyze.data.disclaimer}`;
    const blob = new Blob([content], { type: "text/plain" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "autoapply-sa-ats-review.txt";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const saveReviewMetadata = () => {
    if (!isAuthenticated || !analyze.data) return;
    saveResumeMetadata.mutate(
      { resumeFileName: file || undefined, resumeSummary: reviewNote.slice(0, 500) },
      { onSuccess: () => setMetadataSaved(true) },
    );
  };

  return (
    <main className="min-h-screen bg-[#f3f0e9] p-6 text-[#151515] md:p-12">
      <div className="mx-auto max-w-3xl space-y-7">
        <Link href="/" className="font-mono text-xs">← BACK TO AUTOAPPLY SA</Link>
        <header>
          <p className="font-mono text-xs text-[#e5482a]">AI ATS REVIEW / SAUDI ARABIA</p>
          <h1 className="mt-3 text-4xl font-bold">Make your CV easier to read, <i>not fictional.</i></h1>
          <p className="mt-3 text-[#151515]/70">Start with a free browser-based preview. Your file remains on this device; only extracted text is sent when you request the AI review.</p>
        </header>

        <section className="space-y-4 border border-black/10 bg-white p-6" aria-busy={analyze.isPending}>
          <label className="block cursor-pointer border-2 border-dashed border-black/20 p-5">
            <input className="sr-only" type="file" accept=".pdf,.docx,.txt" aria-describedby="ats-extraction-guidance" onChange={event => choose(event.target.files?.[0])} />
            <FileText className="mr-2 inline" /> <b>{file || "Choose a PDF, DOCX, or TXT CV"}</b>
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium">Target Saudi city<SearchableSaudiSelect options={saudiCities} value={city} onChange={setCity} placeholder="Search Saudi cities…" /></label>
            <label className="grid gap-1 text-sm font-medium">Target industry<SearchableSaudiSelect options={saudiIndustries} value={industry} onChange={setIndustry} placeholder="Search industries…" /></label>
          </div>
          <label className="grid gap-1 text-sm font-medium">Target role <span className="font-normal text-[#151515]/60">(optional)</span><input className="w-full border border-black/20 p-3 font-normal" value={role} onChange={event => setRole(event.target.value)} placeholder="Target role (optional)" /></label>
          <label className="grid gap-1 text-sm font-medium">CV text<textarea className="min-h-40 w-full border border-black/20 p-3 font-normal" value={text} onChange={event => { setText(event.target.value); if (extractionError) setExtractionError(""); }} placeholder="CV text appears here after local extraction." /></label>
          <p id="ats-extraction-guidance" className={extractionError ? "text-sm text-[#b42318]" : "text-sm text-[#151515]/60"} role={extractionError ? "alert" : "status"}>{extractionError || (canAnalyze ? "Ready for a free AI ATS preview." : "Add at least 120 readable CV characters to run the preview.")}</p>
          <button disabled={!canAnalyze || analyze.isPending} onClick={runAnalysis} className="bg-[#151515] px-5 py-3 text-white disabled:opacity-50">{analyze.isPending ? <><Loader2 className="mr-2 inline animate-spin" />Analysing CV signals…</> : <><Sparkles className="mr-2 inline" />Run free AI ATS preview</>}</button>
          {analyze.isPending && <div role="status" className="space-y-3 border border-[#e5482a]/30 bg-[#fff7f4] p-4"><p className="text-sm font-medium">Checking structure, keywords, and evidence…</p><div className="h-3 animate-pulse bg-black/10" /><div className="h-3 w-4/5 animate-pulse bg-black/10" /><div className="h-3 w-3/5 animate-pulse bg-black/10" /></div>}
          {analyze.error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-[#b42318]/30 bg-[#fff5f4] p-4 text-sm"><span>Unable to complete the review. Your CV text is still here—please try again.</span><button type="button" className="border border-[#151515] px-3 py-2" disabled={!canAnalyze || analyze.isPending} onClick={runAnalysis}>Try again</button></div>}
        </section>

        {analyze.data && (
          <section className="space-y-4 bg-[#151515] p-6 text-white">
            <div className="flex items-center justify-between gap-4"><h2 className="text-2xl">ATS readiness: {analyze.data.score}/100</h2><button onClick={exportResult} className="border px-3 py-2"><Download className="mr-1 inline" />Export</button></div>
            <p className="text-sm text-white/80">Most Saudi ATS systems reject CVs scoring below 70. Scores above 85 pass automatically.</p>
            <div className="flex items-center gap-3 border border-white/10 bg-white/5 p-3 text-xs" aria-label="ATS Helpful Feedback"><span>Were these results helpful?</span>{helpfulness ? <span className="font-medium text-[#e5482a]">Thank you for your feedback!</span> : <div className="flex gap-2"><button type="button" onClick={() => setHelpfulness("yes")} className="bg-white/10 px-2 py-1 hover:bg-white/25">Yes</button><button type="button" onClick={() => setHelpfulness("no")} className="bg-white/10 px-2 py-1 hover:bg-white/25">No</button></div>}</div>
            {analyze.data.score < 70 && <p className="bg-white/10 p-3 text-sm text-white">The Starter plan includes a full ATS optimization of your CV. <Link href="/pricing" className="font-medium text-[#e5482a] underline">View pricing plans →</Link></p>}
            <p>{analyze.data.summary}</p>
            <h3>Strengths</h3><ul>{analyze.data.strengths.map(item => <li key={item}>• {item}</li>)}</ul>
            <h3>Priority improvements</h3><ul>{analyze.data.gaps.map(item => <li key={item}>• {item}</li>)}</ul>
            <h3>Suggested bullets</h3><ul>{analyze.data.optimizedBullets.map(item => <li key={item}>• {item}</li>)}</ul>
            <small>{analyze.data.disclaimer}</small>
            <div className="space-y-3 border-t border-white/25 pt-4">
              <div className="my-4 border border-white/20 bg-white/10 p-4">{analyze.data.score < 70 ? <div className="space-y-2"><p className="text-sm font-medium">Fixed your CV? Check your new score →</p><label className="inline-block cursor-pointer bg-white px-4 py-2 text-sm font-medium text-[#151515] hover:bg-white/90"><input className="sr-only" type="file" accept=".pdf,.docx,.txt" onChange={event => choose(event.target.files?.[0])} />Upload revised CV & re-analyse</label></div> : <div className="space-y-2"><p className="text-sm font-medium">You&apos;re ready. Start a campaign →</p><Link href="/#cv-intake" className="inline-block bg-[#e5482a] px-4 py-2 text-sm font-medium text-white">Start a campaign on homepage</Link></div>}</div>
              <p className="text-sm text-white/80">Want a person to turn this preview into a targeted Saudi job-search plan? Request a human follow-up—share your CV only if you choose to do so in WhatsApp.</p>
              <a href={humanReviewHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#e5482a] px-4 py-2.5 text-sm font-medium text-white"><MessageCircle size={16} />Request a human ATS follow-up</a>
              {isAuthenticated ? <button onClick={saveReviewMetadata} disabled={saveResumeMetadata.isPending || metadataSaved} className="ml-3 inline-flex items-center gap-2 border border-white/50 px-4 py-2.5 text-sm font-medium disabled:opacity-60"><Save size={16} />{metadataSaved ? "Private review note saved" : "Save private review note"}</button> : <Link href="/dashboard" className="ml-3 inline-block text-sm underline">Sign in to save a private review note</Link>}
              <p className="text-xs text-white/60">Saved metadata contains only the filename label and review note—not the document file or CV text.</p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
