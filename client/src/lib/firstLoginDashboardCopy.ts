export type FirstLoginLocale = "en" | "ar";

export type FirstLoginCopy = {
  languageToggle: string;
  openNavigation: string;
  closeNavigation: string;
  dashboardHome: string;
  signOut: string;
  workspaceLabel: string;
  workspaceHeadline: string;
  workspaceSubtext: string;
  nav: { overview: string; applications: string; profile: string; documents: string; help: string };
  customerDashboard: string;
  greeting: string;
  campaignNotStarted: string;
  updatedNow: string;
  hero: { eyebrow: string; title: string; body: string; primaryCta: string; secondaryCta: string };
  pathLabel: string;
  path: Array<{ title: string; detail: string }>;
  checklist: {
    eyebrow: string;
    title: string;
    body: string;
    complete: string;
    startHere: string;
    locked: string;
    items: Array<{ title: string; detail: string; availability: string; action?: string }>;
  };
  proof: {
    eyebrow: string;
    title: string;
    body: string;
    action: string;
    statuses: Array<{ title: string; detail: string }>;
  };
  overview: { eyebrow: string; title: string; note: string };
  metrics: Array<{ label: string; note: string }>;
  activity: { eyebrow: string; title: string; action: string; emptyTitle: string; emptyBody: string };
  help: { eyebrow: string; title: string; body: string; whatsappTitle: string; whatsappSubtext: string; supportTitle: string; supportSubtext: string };
  footer: { note: string; privacy: string; terms: string; support: string };
};

export const firstLoginDashboardCopy: Record<FirstLoginLocale, FirstLoginCopy> = {
  en: {
    languageToggle: "العربية",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
    dashboardHome: "AutoApply SA dashboard home",
    signOut: "Sign out",
    workspaceLabel: "Campaign workspace",
    workspaceHeadline: "Your career progress, with proof.",
    workspaceSubtext: "We only show a role as submitted after required evidence has been captured.",
    nav: { overview: "Overview", applications: "Applications", profile: "Profile & preferences", documents: "Documents", help: "Help & support" },
    customerDashboard: "Customer dashboard",
    greeting: "Good to see you,",
    campaignNotStarted: "Campaign not started",
    updatedNow: "Updated just now",
    hero: {
      eyebrow: "First login workspace",
      title: "Let's prepare your Saudi job campaign.",
      body: "Complete the steps below and we will prepare roles that match your location, experience, and preferences. Every activity shown here is evidence-based.",
      primaryCta: "Complete your preferences",
      secondaryCta: "How campaign tracking works",
    },
    pathLabel: "Your campaign path",
    path: [
      { title: "Profile setup", detail: "CV and job preferences create your matching profile." },
      { title: "Role matching", detail: "Suitable Saudi roles are screened against your profile." },
      { title: "Application preparation", detail: "You see any required action before it blocks progress." },
      { title: "Verified activity", detail: "Evidence appears in your Applications area." },
    ],
    checklist: {
      eyebrow: "Launch checklist",
      title: "Four steps to start your campaign",
      body: "You always know what is done, what needs you, and what is still locked.",
      complete: "complete",
      startHere: "Start here",
      locked: "Locked",
      items: [
        { title: "Upload your CV", detail: "Upload a readable PDF or Word CV. We will show its review status here.", availability: "", action: "Upload CV" },
        { title: "Confirm job preferences", detail: "Choose your locations, role lanes, seniority, and availability.", availability: "Available after CV" },
        { title: "Review your profile summary", detail: "Check the information that will guide matching and application preparation.", availability: "Available after preferences" },
        { title: "Start your campaign", detail: "Review the campaign plan before any application workflow begins.", availability: "Available after profile review" },
      ],
    },
    proof: {
      eyebrow: "Proof-first tracking",
      title: "What each status means",
      body: "Your dashboard never turns a guess into a completed application.",
      action: "Read the evidence standard",
      statuses: [
        { title: "Verified submitted", detail: "A portal confirmation and required evidence have been captured. Only these count as verified applications." },
        { title: "Email accepted", detail: "A mail provider accepted a CV-attached message. It is tracked separately from verified portal submissions." },
        { title: "Needs your action", detail: "A CAPTCHA, consent screen, login, or missing fact needs your input. It will never be silently bypassed." },
      ],
    },
    overview: { eyebrow: "Campaign overview", title: "Your activity will appear here", note: "No data is hidden behind these totals." },
    metrics: [
      { label: "Roles sourced", note: "Starts after profile review." },
      { label: "Ready for review", note: "Nothing needs review yet." },
      { label: "Verified submitted", note: "Evidence required before counting." },
      { label: "Needs your action", note: "You are all caught up." },
    ],
    activity: { eyebrow: "Recent activity", title: "Nothing has been submitted yet", action: "View applications", emptyTitle: "Your campaign activity will be listed in time order.", emptyBody: "First, upload your CV. Then you will see profile-review updates, matching activity, application proof, or any action that needs your help." },
    help: { eyebrow: "Need help?", title: "Your campaign team is here.", body: "If you are unsure what to upload or need help with a required action, send us a message. Your dashboard will remain honest about what is waiting and why.", whatsappTitle: "Message support", whatsappSubtext: "WhatsApp campaign help", supportTitle: "Open support center", supportSubtext: "Campaign rules and evidence guide" },
    footer: { note: "AutoApply SA dashboard. Application outcomes are shown only when the associated evidence is available.", privacy: "Privacy", terms: "Terms", support: "Support" },
  },
  ar: {
    languageToggle: "English",
    openNavigation: "فتح القائمة",
    closeNavigation: "إغلاق القائمة",
    dashboardHome: "الصفحة الرئيسية للوحة تحكم AutoApply SA",
    signOut: "تسجيل الخروج",
    workspaceLabel: "مساحة عمل الحملة",
    workspaceHeadline: "تقدّمك المهني، مدعوم بالأدلة.",
    workspaceSubtext: "لا نعرض الوظيفة كمُرسلة إلا بعد توثيق الدليل المطلوب.",
    nav: { overview: "نظرة عامة", applications: "الطلبات", profile: "الملف الشخصي والتفضيلات", documents: "المستندات", help: "المساعدة والدعم" },
    customerDashboard: "لوحة تحكم العميل",
    greeting: "سعداء برؤيتك،",
    campaignNotStarted: "لم تبدأ الحملة بعد",
    updatedNow: "آخر تحديث الآن",
    hero: {
      eyebrow: "مساحة أول تسجيل دخول",
      title: "لنجهّز حملة التوظيف الخاصة بك في السعودية.",
      body: "أكمل الخطوات أدناه وسنُجهّز لك وظائف تناسب موقعك وخبرتك وتفضيلاتك. كل نشاط يظهر هنا مبني على دليل موثّق.",
      primaryCta: "أكمل تفضيلاتك",
      secondaryCta: "كيف يعمل تتبّع الحملة",
    },
    pathLabel: "مسار حملتك",
    path: [
      { title: "إعداد الملف الشخصي", detail: "سيرتك الذاتية وتفضيلات الوظيفة تُنشئ ملف المطابقة الخاص بك." },
      { title: "مطابقة الوظائف", detail: "يتم فحص الوظائف السعودية المناسبة مقابل ملفك الشخصي." },
      { title: "تجهيز الطلب", detail: "ترى أي إجراء مطلوب قبل أن يوقف التقدّم." },
      { title: "نشاط موثّق", detail: "يظهر الدليل في قسم الطلبات الخاص بك." },
    ],
    checklist: {
      eyebrow: "قائمة بدء الحملة",
      title: "أربع خطوات لبدء حملتك",
      body: "تعرف دائمًا ما تم إنجازه، وما يحتاج منك إجراءً، وما لا يزال مقفلاً.",
      complete: "مكتمل",
      startHere: "ابدأ هنا",
      locked: "مقفل",
      items: [
        { title: "ارفع سيرتك الذاتية", detail: "ارفع سيرة ذاتية بصيغة PDF أو Word قابلة للقراءة. سنعرض حالة مراجعتها هنا.", availability: "", action: "رفع السيرة الذاتية" },
        { title: "أكّد تفضيلات الوظيفة", detail: "اختر مواقعك، ومجالات الوظائف، والمستوى الوظيفي، وتوفّرك.", availability: "متاح بعد رفع السيرة الذاتية" },
        { title: "راجع ملخص ملفك الشخصي", detail: "تحقق من المعلومات التي ستوجّه المطابقة وتجهيز الطلبات.", availability: "متاح بعد التفضيلات" },
        { title: "ابدأ حملتك", detail: "راجع خطة الحملة قبل بدء أي مسار تقديم للطلبات.", availability: "متاح بعد مراجعة الملف الشخصي" },
      ],
    },
    proof: {
      eyebrow: "تتبّع قائم على الإثبات",
      title: "ماذا تعني كل حالة",
      body: "لوحة التحكم لا تُحوّل التخمين إلى طلب مكتمل أبدًا.",
      action: "اطّلع على معيار الإثبات",
      statuses: [
        { title: "مُرسل وموثّق", detail: "تم توثيق تأكيد من المنصة والدليل المطلوب. هذه فقط تُحتسب كطلبات موثّقة." },
        { title: "تم قبول البريد الإلكتروني", detail: "قَبِل مزوّد البريد رسالة مرفق بها السيرة الذاتية. يُتتبّع هذا بشكل منفصل عن الطلبات الموثّقة عبر المنصة." },
        { title: "يحتاج إجراء منك", detail: "رمز تحقق، أو شاشة موافقة، أو تسجيل دخول، أو معلومة ناقصة تحتاج إدخالك. لن يتم تجاوزها دون علمك أبدًا." },
      ],
    },
    overview: { eyebrow: "نظرة عامة على الحملة", title: "سيظهر نشاطك هنا", note: "لا توجد بيانات مخفية خلف هذه الأرقام." },
    metrics: [
      { label: "الوظائف المصدَّرة", note: "يبدأ بعد مراجعة الملف الشخصي." },
      { label: "جاهز للمراجعة", note: "لا شيء بحاجة لمراجعة الآن." },
      { label: "مُرسل وموثّق", note: "يتطلب دليلاً قبل الاحتساب." },
      { label: "يحتاج إجراء منك", note: "أنت على اطّلاع بكل شيء." },
    ],
    activity: { eyebrow: "النشاط الأخير", title: "لم يتم إرسال أي شيء بعد", action: "عرض الطلبات", emptyTitle: "سيُعرض نشاط حملتك مرتّبًا حسب الوقت.", emptyBody: "ابدأ برفع سيرتك الذاتية. بعدها سترى تحديثات مراجعة الملف الشخصي، ونشاط المطابقة، وإثبات الطلبات، أو أي إجراء يحتاج مساعدتك." },
    help: { eyebrow: "تحتاج مساعدة؟", title: "فريق حملتك جاهز لمساعدتك.", body: "إذا لم تكن متأكدًا مما ترفعه أو تحتاج مساعدة في إجراء مطلوب، أرسل لنا رسالة. ستبقى لوحة التحكم صادقة حول ما هو معلّق ولماذا.", whatsappTitle: "راسل الدعم", whatsappSubtext: "مساعدة الحملة عبر WhatsApp", supportTitle: "افتح مركز الدعم", supportSubtext: "قواعد الحملة ودليل الإثبات" },
    footer: { note: "لوحة تحكم AutoApply SA. تُعرض نتائج الطلبات فقط عند توفّر الدليل المرتبط بها.", privacy: "الخصوصية", terms: "الشروط", support: "الدعم" },
  },
};
