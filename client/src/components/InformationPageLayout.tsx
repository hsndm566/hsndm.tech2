import { ArrowLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

type InformationSection = { heading: string; detail: string };

type InformationPageLayoutProps = {
  content: {
    kicker: string;
    title: string;
    intro: string;
    reviewNote?: string;
    sections: InformationSection[];
  };
  language: "en" | "ar";
  root: string;
};

export function InformationPageLayout({ content, language, root }: InformationPageLayoutProps) {
  const arabic = language === "ar";
  const enquiry = arabic ? "/ar/enquire" : "/enquire";
  const returnHome = arabic ? "العودة للرئيسية" : "BACK TO HOME";
  const homeLabel = arabic ? "الرئيسية" : "Home";
  const breadcrumbLabel = arabic ? "مسار التنقل" : "Breadcrumb";
  const readingGuide = arabic ? "دليل القراءة" : "READING GUIDE";
  const readingGuideLabel = arabic ? "أقسام هذه الصفحة" : "Sections on this page";
  const nextStep = arabic ? "الخطوة التالية تبقى بيدك" : "Your next step remains yours";
  const nextStepDetail = arabic ? "ابدأ بملخص واضح، ثم أكّد ما تريد إرساله." : "Start with a clear brief, then confirm what you want to send.";
  const startCampaign = arabic ? "ابدأ الحملة" : "START A CAMPAIGN";

  return (
    <main className="min-h-screen bg-[#f3f0e9] text-[#151515]" lang={language} dir={arabic ? "rtl" : "ltr"}>
      <header className="border-b border-black/10 bg-[#fbf9f5]">
        <div className="page-frame flex items-center justify-between gap-5 py-5">
          <Link href={root} className="inline-flex items-center gap-3" aria-label="AutoApply SA home">
            <img src="/manus-storage/autoapply-symbol_80d77010.png" alt="AutoApply SA brand mark" className="h-10 w-10 rounded-xl bg-[#151515] p-1 object-contain" width={40} height={40} />
            <span className="font-bold">AutoApply <em className="not-italic text-[#e5482a]">SA</em></span>
          </Link>
          <Link href={root} className="flex min-h-11 items-center gap-1 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a] focus-visible:ring-offset-2">{returnHome}<ArrowLeft size={14} /></Link>
        </div>
      </header>

      <section className="page-frame max-w-4xl py-16">
        <nav aria-label={breadcrumbLabel} className="mb-8 flex flex-wrap items-center gap-2 font-mono text-xs text-black/55">
          <Link href={root} className="underline-offset-4 hover:text-[#e5482a] hover:underline">{homeLabel}</Link><span>/</span><b className="font-medium text-black/75">{content.kicker}</b>
        </nav>
        <p className="font-mono text-xs text-[#e5482a]">{content.kicker}</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">{content.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-black/70">{content.intro}</p>
        {content.reviewNote ? <aside className="mt-7 border-s-4 border-[#e5482a] bg-white p-4 text-sm leading-6 text-black/75" role="note">{content.reviewNote}</aside> : null}

        <nav aria-label={readingGuideLabel} className="mt-10 border-y border-black/15 py-5">
          <p className="font-mono text-xs text-[#e5482a]">{readingGuide}</p>
          <ol className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {content.sections.map((section, index) => {
              const sectionId = `information-${language}-${index + 1}`;
              return <li key={sectionId}><a href={`#${sectionId}`} className="group flex min-h-11 items-center gap-3 text-sm text-black/70 outline-none transition-colors hover:text-[#e5482a] focus-visible:ring-2 focus-visible:ring-[#e5482a] focus-visible:ring-offset-2"><span className="font-mono text-xs text-[#e5482a]">{String(index + 1).padStart(2, "0")}</span><span>{section.heading}</span></a></li>;
            })}
          </ol>
        </nav>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {content.sections.map((section, index) => {
            const sectionId = `information-${language}-${index + 1}`;
            const headingId = `${sectionId}-heading`;
            return <article id={sectionId} key={section.heading} aria-labelledby={headingId} className="scroll-mt-8 border border-black/10 border-s-2 border-s-[#e5482a] bg-white p-6"><span className="font-mono text-xs text-[#e5482a]">{String(index + 1).padStart(2, "0")}</span><h2 id={headingId} className="mt-3 text-xl font-bold">{section.heading}</h2><p className="mt-3 leading-7 text-black/70">{section.detail}</p></article>;
          })}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-5 border border-black/10 bg-[#151515] p-7 text-white md:flex-row md:items-center">
          <div><div className="flex items-center gap-2 text-sm"><ShieldCheck size={17} className="text-[#e5482a]" /><b>{nextStep}</b></div><p className="mt-2 text-sm text-white/70">{nextStepDetail}</p></div>
          <Link href={enquiry} className="flex min-h-11 items-center gap-2 bg-[#f3f0e9] px-5 py-3 font-mono text-xs outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-[#e5482a] focus-visible:ring-offset-2" style={{ color: "#151515" }}>{startCampaign}<ArrowUpRight size={15} /></Link>
        </div>
      </section>
    </main>
  );
}
