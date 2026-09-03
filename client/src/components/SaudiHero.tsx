import { ArrowUpRight, Check, FileText, ShieldCheck } from "lucide-react";

export function SaudiHero({ arabic = false }: { arabic?: boolean }) {
  const t = arabic;
  return <section className="saudi-hero" aria-labelledby={t ? "arabic-hero-heading" : "hero-heading"}>
    <div className="saudi-hero-grid page-frame">
      <div className="saudi-intro">
        <p className="saudi-eyebrow">{t ? "طموحك يستحق خطوة أوضح" : "YOUR NEXT CHAPTER, WITH CLARITY"} <span>SA / السعودية</span></p>
        <h1 id={t ? "arabic-hero-heading" : "hero-heading"}>
          <span data-anime-hero-word>{t ? "خطوتك المهنية القادمة." : "Your next career move."}</span>
          <em data-anime-hero-word>{t ? "بتركيز أكبر." : "More focused."}</em>
        </h1>
        <p className="saudi-description">{t ? "نساعدك على تجهيز طلباتك للوظائف في السعودية. ملف واحد، أهداف واضحة، ومراجعتك قبل الإرسال." : "Job applications for your ambitions in Saudi Arabia. One profile, clear targets, and your review before anything is sent."}</p>
        <div className="saudi-actions"><a href="#pricing" className="saudi-primary">{t ? "اختر خطة التقديم" : "Find your campaign plan"} <ArrowUpRight size={20}/></a><a href="#how" className="saudi-secondary">{t ? "كيف تعمل الخدمة؟" : "See how it works"} <span aria-hidden="true">↓</span></a></div>
        <p className="saudi-price">{t ? "من 99 ريال شهرياً · ابدأ بمحادثة، دون بطاقة دفع" : "From 99 SAR / month · Start a conversation, no card needed"}</p>
        <div className="saudi-assurance"><ShieldCheck size={19}/><span>{t ? "أنت تختار الاتجاه. وأنت توافق على الخطوة التالية." : "You set the direction. You approve the next step."}</span></div>
      </div>
      <div className="saudi-workspace" aria-label={t ? "معاينة توضيحية وليست بيانات حساب" : "Illustrative workspace, not account data"}>
        <div className="saudi-window"><span className="saudi-window-brand">AutoApply <b>SA</b></span><span>{t ? "معاينة المنتج" : "PRODUCT PREVIEW"}</span></div>
        <div className="saudi-workspace-body">
          <div className="saudi-preview-heading"><div><p>{t ? "مساحتك المهنية" : "YOUR CAREER WORKSPACE"}</p><h2>{t ? "كل خطوة، أمامك." : "Every step. In view."}</h2></div><span className="saudi-avatar" aria-hidden="true">SA</span></div>
          <div className="saudi-profile"><FileText size={26}/><div><strong>{t ? "ملفك، نقطة البداية" : "Your profile comes first"}</strong><p>{t ? "الخبرات · المهارات · المدن المفضلة" : "Experience · Skills · Preferred cities"}</p></div><Check size={18}/></div>
          <p className="saudi-preview-label">{t ? "من الاستعداد إلى المتابعة" : "FROM PREPARATION TO FOLLOW-THROUGH"}</p>
          <ol className="saudi-steps">{(t ? [["01","جهّز ملفك","راجع سيرتك وحدد الوظائف التي تناسبك."],["02","راجع طلباتك","تحقق من التفاصيل قبل إعطاء الموافقة."],["03","تابع التقدم","ارجع إلى سجل طلباتك وخطواتك التالية."]] : [["01","Prepare your profile","Review your CV and choose your target roles."],["02","Review applications","Check the details before giving your approval."],["03","Follow your progress","Keep your applications and next steps in view."]]).map(([n,title,body])=><li key={n}><span>{n}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
          <div className="saudi-preview-footer"><ShieldCheck size={16}/>{t ? "معاينة توضيحية · لا تتضمن طلبات فعلية" : "Illustrative preview · No real applications shown"}</div>
        </div>
      </div>
    </div>
    <div className="saudi-market page-frame"><span>{t ? "مصمم للباحثين عن عمل في السعودية" : "BUILT AROUND YOUR SAUDI JOB SEARCH"}</span><div>{t ? "الرياض" : "Riyadh"}<i/>{t ? "جدة" : "Jeddah"}<i/>{t ? "الدمام" : "Dammam"}<i/>{t ? "وما بعدها" : "And beyond"}</div><span>{t ? "بالعربية والإنجليزية" : "العربية + English"}</span></div>
  </section>;
}

