import { ArrowUpRight, Check, FileText, ShieldCheck } from "lucide-react";

export function SaudiHero({ arabic = false }: { arabic?: boolean }) {
  const t = arabic;
  return <section className="saudi-hero" aria-labelledby={t ? "arabic-hero-heading" : "hero-heading"}>
    <div className="saudi-hero-grid page-frame">
      <div className="saudi-intro">
        <p className="saudi-eyebrow">{t ? "دعم تقديم وظيفي موجه للسعودية" : "SAUDI-FOCUSED APPLICATION SUPPORT"} <span>{t ? "جدة / السعودية" : "JEDDAH / KSA"}</span></p>
        <h1 id={t ? "arabic-hero-heading" : "hero-heading"}>
          <span data-anime-hero-word>{t ? "طلبات أكثر صلة." : "More relevant applications."}</span>
          <em data-anime-hero-word>{t ? "وأنت توافق على كل خطوة." : "You approve every one."}</em>
        </h1>
        <p className="saudi-description">{t ? "حدد وجهتك المهنية. نساعدك على العثور على فرص مناسبة، وتجهيز طلبات أقوى، وإبقاء كل خطوة واضحة أمامك قبل إرسال أي طلب." : "Tell us where you want to go. AutoApply SA helps find matching opportunities, prepare stronger applications, and keep each step visible before anything is submitted."}</p>
        <div className="saudi-actions">
          <a href={t ? "/ar/enquire" : "/enquire"} className="saudi-primary">{t ? "ابدأ حملتك" : "Start your campaign"} <ArrowUpRight size={20}/></a>
          <a href="#how" className="saudi-secondary">{t ? "شاهد كيف تعمل" : "See how it works"} <span aria-hidden="true">↓</span></a>
        </div>
        <p className="saudi-price">{t ? "خطط شهرية تبدأ من 99 ريال · لا توجد نتيجة توظيف مضمونة" : "Monthly plans from 99 SAR · No interview or hiring outcome is guaranteed"}</p>
        <div className="saudi-assurance"><ShieldCheck size={19}/><span>{t ? "اسمك. سيرتك. قرارك قبل الإرسال." : "Your name. Your CV. Your decision before submission."}</span></div>
      </div>
      <div className="saudi-workspace" aria-label={t ? "معاينة توضيحية وليست بيانات حساب حقيقية" : "Illustrative workspace, not real account data"}>
        <div className="saudi-window"><span className="saudi-window-brand">AutoApply <b>SA</b></span><span>{t ? "مساحة الحملة / معاينة" : "CAMPAIGN WORKSPACE / PREVIEW"}</span></div>
        <div className="saudi-workspace-body">
          <div className="saudi-preview-heading"><div><p>{t ? "قائمة طلباتك" : "YOUR APPLICATION QUEUE"}</p><h2>{t ? "كل شيء أمامك." : "Everything in view."}</h2></div><span className="saudi-avatar" aria-hidden="true">SA</span></div>
          <div className="saudi-profile"><FileText size={26}/><div><strong>{t ? "السيرة جاهزة كبداية" : "Your profile is the starting point"}</strong><p>{t ? "الخبرات · المهارات · المدن · الأدوار المستهدفة" : "Experience · Skills · Cities · Target roles"}</p></div><Check size={18}/></div>
          <p className="saudi-preview-label">{t ? "من المطابقة إلى الموافقة" : "FROM MATCHING TO APPROVAL"}</p>
          <ol className="saudi-steps">{(t ? [["01","مطابقة الفرصة","نربط الوظيفة بملفك واتجاهك المهني."],["02","تجهيز الطلب","نجهز الطلب والسياق المطلوب للوظيفة."],["03","مراجعتك أولاً","تراجع ما تم تجهيزه وتوافق قبل الخطوة التالية."]] : [["01","Match the opportunity","Connect the role to your profile and campaign direction."],["02","Prepare the application","Build the application context the role actually needs."],["03","Your review comes first","Check what was prepared and approve before the next step."]]).map(([n,title,body])=><li key={n}><span>{n}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
          <div className="saudi-preview-footer"><ShieldCheck size={16}/>{t ? "معاينة توضيحية · الموافقة مطلوبة قبل الإرسال" : "Illustrative preview · Approval required before submission"}</div>
        </div>
      </div>
    </div>
    <div className="saudi-market page-frame"><span>{t ? "مصمم للبحث الوظيفي داخل السعودية" : "BUILT AROUND THE SAUDI JOB SEARCH"}</span><div>{t ? "الرياض" : "Riyadh"}<i/>{t ? "جدة" : "Jeddah"}<i/>{t ? "الدمام" : "Dammam"}<i/>{t ? "ومدن أخرى" : "And beyond"}</div><span>{t ? "العربية + English" : "العربية + English"}</span></div>
  </section>;
}
