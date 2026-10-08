import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve(process.env.AUTOAPPLY_STATIC_OUTPUT_DIR || "dist/public");
const indexPage = resolve(output, "index.html");
const siteUrl = "https://www.hsndm.tech";
const canonicalPath = (path) => path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;

const pageMetadata = {
  ar: {
    title: "AutoApply SA — نُعِدّ طلباتك للوظائف وأنت توافق",
    description: "أخبرنا بالوظائف التي تريدها. نبحث عن فرص حقيقية في السعودية ونُعدّ طلبات مخصّصة — تراجع وتوافق قبل إرسال أي شيء.",
    path: "/ar", lang: "ar", direction: "rtl", locale: "ar_SA", faqSchema: "ar",
  },
  "ar/enquire": {
    title: "ابدأ حملتك | أوتوأبلاي السعودية",
    description: "ابدأ حملة AutoApply SA للبحث عن وظيفة داخل السعودية وشارك الأدوار المستهدفة وتفضيلاتك قبل اعتماد اتجاه الحملة.",
    path: "/ar/enquire", lang: "ar", direction: "rtl", locale: "ar_SA",
  },
  "ar/thank-you": {
    title: "ملخص الحملة جاهز | أوتوأبلاي السعودية",
    description: "تم تجهيز ملخص حملتك للخطوة التالية في أوتوأبلاي السعودية.",
    path: "/ar/thank-you", lang: "ar", direction: "rtl", locale: "ar_SA", robots: "noindex, follow",
  },
  enquire: {
    title: "Start a Campaign | AutoApply SA",
    description: "Start an AutoApply SA job-application campaign for Saudi Arabia. Share your target roles and preferences before any campaign direction is confirmed.",
    path: "/enquire", lang: "en", direction: "ltr", locale: "en_SA",
  },
  "thank-you": {
    title: "Campaign Brief Sent | AutoApply SA",
    description: "Your AutoApply SA campaign brief is ready for the next step.",
    path: "/thank-you", lang: "en", direction: "ltr", locale: "en_SA", robots: "noindex, follow",
  },
  "how-it-works": { title: "How AutoApply SA Works | Saudi Job Search", description: "How AutoApply SA works: review your CV, set Saudi role targets, confirm your campaign direction, and track applications in your dashboard.", path: "/how-it-works", lang: "en", direction: "ltr", locale: "en_SA" },
  support: { title: "Saudi Job Campaign Support | AutoApply SA", description: "Get help with your AutoApply SA campaign, dashboard access, or privacy requests for Saudi Arabia job seekers.", path: "/support", lang: "en", direction: "ltr", locale: "en_SA" },
  "case-studies": { title: "KAIA Terminal 1 Case Study | AutoApply SA", description: "Read an owner-supplied operations-improvement case-study summary using DMAIC and value-stream mapping in Jeddah.", path: "/case-studies", lang: "en", direction: "ltr", locale: "en_SA" },
  "campaign-report-sample": { title: "Illustrative Campaign Report Format | AutoApply SA", description: "See the fields, cadence, and limits of an illustrative AutoApply SA campaign update format.", path: "/campaign-report-sample", lang: "en", direction: "ltr", locale: "en_SA" },
  about: { title: "About AutoApply SA | Saudi Job Search Workspace", description: "Learn how AutoApply SA helps Saudi job seekers organise a search while keeping clear customer and employer-submission boundaries.", path: "/about", lang: "en", direction: "ltr", locale: "en_SA", agentFallback: { eyebrow: "About AutoApply SA", heading: "A clearer workspace for a Saudi job search.", intro: "AutoApply SA is a Saudi Arabia-focused job-search organiser and application tracker. It helps candidates review CV skills, choose target roles and locations, save relevant opportunities, and keep their next steps in one place in Arabic or English.", sections: [["What the product does", "The public site explains the service, while the signed-in workspace keeps each candidate's profile, preferences, and application records separate. CV feedback and role-matching guidance support informed decisions, not a promise of a job, interview, or employer response."], ["Current boundary", "Saving an opportunity or preparing a profile is not an employer submission. AutoApply SA does not currently submit applications to employers automatically. Candidates decide which opportunities to pursue and review information before any external action."], ["How to verify product information", "Agents and developers can use the public, read-only API for factual product and plan information. It never exposes candidate profiles, CVs, private applications, credentials, or employer contact data."]], links: [["/contact/", "Contact AutoApply SA"], ["/privacy/", "Privacy"], ["/developers/", "Developer documentation"]] } },
  contact: { title: "Contact AutoApply SA | Account and Privacy Help", description: "Contact AutoApply SA for product, account-access, or privacy questions and learn what information should never be shared in support.", path: "/contact", lang: "en", direction: "ltr", locale: "en_SA", agentFallback: { eyebrow: "Contact AutoApply SA", heading: "How to reach AutoApply SA safely.", intro: "For product, account-access, privacy, or website questions, email AutoApply SA at apply@hsndm.tech. Use the same email address associated with your account for profile or application requests, but do not send passwords, verification codes, or national identity numbers by email or chat.", sections: [["What to include", "Describe the page or feature you were using, the approximate time of the issue, and the email address associated with the account when appropriate. For a privacy request, state whether you need access to, correction of, or removal of information."], ["Product and account safety", "AutoApply SA will not ask you to share a password, one-time sign-in code, or payment-card number in a support conversation. The public API is read-only and must not receive CVs, candidate identifiers, credentials, or application forms."], ["Useful links", "Read the Privacy Policy for data-handling information, the Terms for service boundaries, and the developer documentation for the public catalogue API. The public product pages state when a capability is not currently enabled."]], links: [["mailto:apply@hsndm.tech", "apply@hsndm.tech"], ["/privacy/", "Privacy"], ["/developers/", "Developer documentation"]] } },
  privacy: { title: "Privacy Policy | AutoApply SA", description: "Learn how AutoApply SA handles Saudi job-search campaign information, CVs, contact details, and privacy requests.", path: "/privacy", lang: "en", direction: "ltr", locale: "en_SA" },
  terms: { title: "Terms & Conditions | AutoApply SA", description: "Read the AutoApply SA service terms for previews, campaign enquiries, candidate tracking, cancellation, and service boundaries.", path: "/terms", lang: "en", direction: "ltr", locale: "en_SA" },
  "ar/how-it-works": { title: "كيف تعمل أوتوأبلاي السعودية | البحث عن عمل", description: "كيف تعمل AutoApply SA: راجع سيرتك، حدّد أدوارك المستهدفة داخل السعودية، واعتمد اتجاه الحملة، ثم تابع الطلبات في لوحتك.", path: "/ar/how-it-works", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/support": { title: "دعم حملات التقديم في السعودية | AutoApply SA", description: "احصل على المساعدة في حملة AutoApply SA أو دخول لوحة المرشح أو طلبات الخصوصية للباحثين عن عمل في السعودية.", path: "/ar/support", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/case-studies": { title: "دراسة حالة مبنى الركاب 1 | AutoApply SA", description: "اطلع على ملخص دراسة حالة في تحسين العمليات باستخدام DMAIC ورسم تدفق القيمة في جدة.", path: "/ar/case-studies", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/campaign-report-sample": { title: "نموذج تقرير الحملة التوضيحي | أوتوأبلاي السعودية", description: "اطلع على الحقول والوتيرة والحدود في نموذج توضيحي لتحديث الحملة.", path: "/ar/campaign-report-sample", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/about": { title: "عن أوتوأبلاي السعودية | مساحة البحث عن عمل", description: "تعرّف على كيفية مساعدة أوتوأبلاي السعودية للباحثين عن عمل مع توضيح حدود الخدمة وإرسال الطلبات.", path: "/ar/about", lang: "ar", direction: "rtl", locale: "ar_SA", agentFallback: { eyebrow: "عن أوتوأبلاي السعودية", heading: "مساحة أوضح لتنظيم البحث عن عمل في السعودية.", intro: "أوتوأبلاي السعودية هي مساحة لتنظيم البحث عن عمل في السعودية ومتابعة الطلبات. تساعد المرشحين على مراجعة مهارات السيرة الذاتية وتحديد الأدوار والمدن المستهدفة وحفظ الفرص ومتابعة الخطوات القادمة بالعربية أو الإنجليزية.", sections: [["ما الذي يقدمه المنتج", "يشرح الموقع العام الخدمة، بينما تحفظ مساحة العمل بعد تسجيل الدخول ملف كل مرشح وتفضيلاته وسجلات طلباته بشكل منفصل. تهدف إرشادات السيرة والمطابقة إلى دعم القرار الواعي ولا تعد بوظيفة أو مقابلة أو رد من جهة عمل."], ["الحدود الحالية", "حفظ فرصة أو تجهيز ملف لا يعني إرسال طلب إلى جهة عمل. لا ترسل أوتوأبلاي السعودية الطلبات إلى أصحاب العمل تلقائيا في الوقت الحالي. يبقى المرشح مسؤولا عن اختيار الفرص ومراجعة المعلومات قبل أي إجراء خارجي."], ["كيفية التحقق من معلومات المنتج", "يمكن للوكلاء والمطورين استخدام واجهة عامة للقراءة فقط للتحقق من معلومات المنتج والباقات. لا تعرض هذه الواجهة ملفات المرشحين أو السير الذاتية أو الطلبات الخاصة أو بيانات الدخول أو جهات اتصال أصحاب العمل."]], links: [["/ar/contact/", "تواصل"], ["/ar/privacy/", "الخصوصية"], ["/developers/", "وثائق المطورين"]] } },
  "ar/contact": { title: "تواصل مع أوتوأبلاي السعودية | مساعدة الحساب والخصوصية", description: "تواصل مع أوتوأبلاي السعودية لاستفسارات المنتج أو الحساب أو الخصوصية وتعرّف على المعلومات التي لا ينبغي مشاركتها في الدعم.", path: "/ar/contact", lang: "ar", direction: "rtl", locale: "ar_SA", agentFallback: { eyebrow: "تواصل مع أوتوأبلاي السعودية", heading: "كيفية التواصل مع أوتوأبلاي السعودية بأمان.", intro: "للاستفسارات عن المنتج أو الوصول إلى الحساب أو الخصوصية أو الموقع، راسل أوتوأبلاي السعودية على apply@hsndm.tech. استخدم عنوان البريد المرتبط بحسابك عندما يخص الطلب ملفك أو سجلات طلباتك، ولا ترسل كلمات المرور أو رموز التحقق أو أرقام الهوية بالبريد أو الدردشة.", sections: [["ما الذي يجب تضمينه", "اذكر الصفحة أو الميزة التي كنت تستخدمها والوقت التقريبي للمشكلة والبريد المرتبط بالحساب عند الحاجة. لطلبات الخصوصية، وضح إن كنت تطلب الوصول إلى المعلومات أو تصحيحها أو حذفها."], ["سلامة المنتج والحساب", "لن تطلب منك أوتوأبلاي السعودية مشاركة كلمة مرور أو رمز تسجيل دخول لمرة واحدة أو رقم بطاقة دفع في محادثة دعم. واجهة البرمجة العامة للقراءة فقط ولا ينبغي إرسال السير الذاتية أو معرفات المرشحين أو بيانات الدخول أو نماذج الطلبات إليها."], ["روابط مفيدة", "اقرأ سياسة الخصوصية لمعلومات معالجة البيانات والشروط لحدود الخدمة ووثائق المطورين لواجهة الكتالوج العامة. الموقع متاح بالعربية والإنجليزية، وتوضح صفحات المنتج العامة عندما لا تكون ميزة ما مفعلة حاليا."]], links: [["mailto:apply@hsndm.tech", "apply@hsndm.tech"], ["/ar/privacy/", "الخصوصية"], ["/developers/", "وثائق المطورين"]] } },
  "ar/privacy": { title: "سياسة الخصوصية | أوتوأبلاي السعودية", description: "تعرّف على كيفية تعامل AutoApply SA مع معلومات حملة البحث عن عمل والسيرة الذاتية وطلبات الخصوصية.", path: "/ar/privacy", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/terms": { title: "الشروط والأحكام | أوتوأبلاي السعودية", description: "اقرأ شروط خدمة AutoApply SA للمعاينة واستفسار الحملة وتتبع الطلبات وحدود الخدمة.", path: "/ar/terms", lang: "ar", direction: "rtl", locale: "ar_SA" },
  pricing: { title: "Saudi Job-Application Plans | AutoApply SA", description: "Saudi job-application campaign plans from 99 SAR/month. Review scope, compare plans, and start with a conversation.", path: "/pricing", lang: "en", direction: "ltr", locale: "en_SA" },
  services: { title: "Job Application Services | AutoApply SA", description: "Saudi-focused job-application support: campaign targeting, opportunity matching, application preparation, approval, and tracking.", path: "/services", lang: "en", direction: "ltr", locale: "en_SA" },
  "ar/pricing": { title: "خطط حملات التقديم في السعودية | AutoApply SA", description: "خطط لحملات التقديم للوظائف في السعودية تبدأ من 99 ريالاً شهرياً. راجع النطاق وقارن الخطط وابدأ بمحادثة.", path: "/ar/pricing", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/services": { title: "خدمات التقديم الوظيفي | AutoApply SA", description: "دعم موجّه للسعودية لاستهداف الوظائف ومطابقة الفرص وتجهيز الطلبات والموافقة والمتابعة.", path: "/ar/services", lang: "ar", direction: "rtl", locale: "ar_SA" },
  ats: { title: "ATS CV Review for Saudi Jobs | AutoApply SA", description: "Check your CV's ATS readiness for Saudi Arabia job applications — free browser-based preview, no file upload required.", path: "/ats", lang: "en", direction: "ltr", locale: "en_SA" },
};

const notFoundMetadata = {
  title: "Page Not Found | AutoApply SA",
  description: "The requested AutoApply SA page could not be found. Return to the application engine or start a campaign.",
  path: "/404", lang: "en", direction: "ltr", locale: "en_SA", robots: "noindex, nofollow",
};

const faqSchemas = {
  ar: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "هل تضمنون حصولي على وظيفة؟", acceptedAnswer: { "@type": "Answer", text: "لا يمكن لأحد ضمان مقابلة أو عرض. نزيد عدد الطلبات المناسبة المرسلة بالنيابة عنك، بينما تعتمد النتيجة على السوق وملفك." } },
      { "@type": "Question", name: "ماذا لو لم يعجبني طلب تم إعداده؟", acceptedAnswer: { "@type": "Answer", text: "لا يُرسل أي طلب قبل موافقتك. يمكنك طلب التعديل أو تجاوزه." } },
      { "@type": "Question", name: "هل الخدمة للتقنية والهندسة فقط؟", acceptedAnswer: { "@type": "Answer", text: "لا، الخدمة تعمل عبر مجالات متعددة." } },
      { "@type": "Question", name: "ماذا أحتاج أن أقدّم؟", acceptedAnswer: { "@type": "Answer", text: "سيرتك الذاتية والوظائف أو المجالات التي تستهدفها." } },
      { "@type": "Question", name: "كم طلباً سأحصل عليه؟", acceptedAnswer: { "@type": "Answer", text: "يعتمد ذلك على باقتك — راجع تفاصيل الباقات أعلاه." } },
      { "@type": "Question", name: "هل بياناتي آمنة؟", acceptedAnswer: { "@type": "Answer", text: "نعم. سيرتك الذاتية تبقى خاصة حتى توافق على وظيفة محددة. نستخدمها فقط لتجهيز الطلبات التي وافقت عليها، ولا تُباع لأي جهة. يمكنك طلب الحذف أو الإيقاف المؤقت في أي وقت من لوحة التحكم. الوصول إلى لوحة التحكم محمي بتسجيل الدخول عبر بريدك الإلكتروني." } },
      { "@type": "Question", name: "كيف تجدون هذه الوظائف؟", acceptedAnswer: { "@type": "Answer", text: "نبحث في إعلانات الوظائف عبر منصات متعددة ونطابقها مع ملفك." } },
    ],
  },
};

const faqSchemaPattern = /\s*<script id="homepage-faq-schema" type="application\/ld\+json">[\s\S]*?<\/script>/;
const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const replaceLoadingFallback = (html, metadata) => html
  .replace(/<h1 class="app-loading-title">[^<]*<\/h1>/, `<h1 class="app-loading-title">${escapeHtml(metadata.title)}</h1>`)
  .replace(/<p class="app-loading-copy">[^<]*<\/p>/, `<p class="app-loading-copy">${escapeHtml(metadata.description)}</p>`)
  .replace(/<h1 style="([^"]*)">[^<]*<\/h1>/, `<h1 style="$1">${escapeHtml(metadata.title)}</h1>`)
  .replace(/<p style="max-width:36rem;color:#64716d;line-height:1.7">[^<]*<\/p>/, `<p style="max-width:36rem;color:#64716d;line-height:1.7">${escapeHtml(metadata.description)}</p>`);

const replaceAgentFallback = (html, metadata) => {
  if (!metadata.agentFallback) return html;
  const fallback = metadata.agentFallback;
  const sections = fallback.sections.map(([heading, detail]) => `<h2>${escapeHtml(heading)}</h2><p>${escapeHtml(detail)}</p>`).join("");
  const links = fallback.links.map(([href, label]) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`).join(" · ");
  const markup = `<main id="agent-html-fallback" role="status" style="font-family:system-ui;padding:4rem;color:#065F46;background:#f8faf7;min-height:70vh"><p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;margin:0 0 1rem">${escapeHtml(fallback.eyebrow)}</p><h1 style="max-width:42rem;margin:0 0 1rem;font-size:clamp(2rem,5vw,3.4rem);line-height:1.1;color:#111827">${escapeHtml(fallback.heading)}</h1><p style="max-width:36rem;color:#64716d;line-height:1.7">${escapeHtml(fallback.intro)}</p><section>${sections}<p>${links}</p></section></main>`;
  return html.replace(/<main id="agent-html-fallback"[\s\S]*?<\/main>/, markup);
};

const staticMeta = (indexHtml, metadata) => {
  const url = `${siteUrl}${canonicalPath(metadata.path)}`;
  let withMetadata = indexHtml
    .replace(/<html lang="en"(?:\s+dir="ltr")?>/, `<html lang="${metadata.lang}" dir="${metadata.direction}">`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(metadata.description)}" />`)
    .replace(/<meta name="robots" content="[^"]*"\s*\/>/, `<meta name="robots" content="${metadata.robots || "index, follow"}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`)
    .replace(/<meta property="og:locale" content="[^"]*"\s*\/>/, `<meta property="og:locale" content="${metadata.locale}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(metadata.title)}</title>`);

  withMetadata = replaceAgentFallback(replaceLoadingFallback(withMetadata, metadata), metadata);

  if (metadata.faqSchema) {
    withMetadata = withMetadata.replace(
      faqSchemaPattern,
      `\n    <script id="homepage-faq-schema" type="application/ld+json">${JSON.stringify(faqSchemas[metadata.faqSchema])}</script>`,
    );
  } else {
    withMetadata = withMetadata.replace(faqSchemaPattern, "");
  }

  return withMetadata;
};

const rootHtml = await readFile(indexPage, "utf8");
await Promise.all(Object.entries(pageMetadata).map(async ([route, metadata]) => {
  const routeDirectory = resolve(output, route);
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(resolve(routeDirectory, "index.html"), staticMeta(rootHtml, metadata));
}));

await writeFile(resolve(output, "404.html"), staticMeta(rootHtml, notFoundMetadata));

const fallbackContent = (arabic) => `<!doctype html><html lang="${arabic ? "ar" : "en"}"${arabic ? " dir=\"rtl\"" : ""}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, follow"><title>${arabic ? "صفحة مساعدة آمنة | أوتوأبلاي السعودية" : "Safe fallback | AutoApply SA"}</title><style>body{margin:0;background:#f3f0e9;color:#151515;font:16px/1.55 system-ui,sans-serif}main{max-width:44rem;margin:8vh auto;padding:2rem;background:#fff;border:1px solid #ddd}a{color:#151515}small{color:#b43b28;text-transform:uppercase;letter-spacing:.08em}</style></head><body><main><small>AutoApply SA · ${arabic ? "مساعدة آمنة" : "safe fallback"}</small><h1>${arabic ? "تعذّر تحميل واجهة التطبيق." : "We could not load the application interface."}</h1><p>${arabic ? "لم تُرفع أي سيرة ذاتية، ولم يُرسل أي نموذج من هذه الصفحة. يمكنك إعادة المحاولة عندما تكون الواجهة متاحة أو التواصل معنا بأمان." : "No CV has been uploaded and no form has been sent from this page. You can retry when the interface is available or contact us safely."}</p><p><a href="${arabic ? "/ar" : "/"}">${arabic ? "إعادة المحاولة" : "Try again"}</a> · <a href="mailto:apply@hsndm.tech">apply@hsndm.tech</a> · <a href="https://wa.me/966571448656">WhatsApp</a></p><p><a href="${arabic ? "/fallback" : "/fallback/ar"}">${arabic ? "English" : "العربية"}</a></p></main></body></html>`;

await Promise.all([
  ["fallback", false],
  ["fallback/enquire", false],
  ["fallback/privacy", false],
  ["fallback/terms", false],
  ["fallback/ar", true],
  ["fallback/ar/enquire", true],
  ["fallback/ar/privacy", true],
  ["fallback/ar/terms", true],
].map(async ([route, arabic]) => {
  const directory = resolve(output, route);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), fallbackContent(arabic));
}));
