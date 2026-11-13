import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve(process.env.AUTOAPPLY_STATIC_OUTPUT_DIR || "dist/public");
const indexPage = resolve(output, "index.html");
const siteUrl = "https://www.hsndm.tech";
const canonicalPath = (path) => path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;
const alternatePaths = {
  "/": { en: "/", ar: "/ar" }, "/ar": { en: "/", ar: "/ar" },
  "/about": { en: "/about", ar: "/ar/about" }, "/ar/about": { en: "/about", ar: "/ar/about" },
  "/contact": { en: "/contact", ar: "/ar/contact" }, "/ar/contact": { en: "/contact", ar: "/ar/contact" },
  "/privacy": { en: "/privacy", ar: "/ar/privacy" }, "/ar/privacy": { en: "/privacy", ar: "/ar/privacy" },
  "/terms": { en: "/terms", ar: "/ar/terms" }, "/ar/terms": { en: "/terms", ar: "/ar/terms" },
};
const alternateLinks = (metadata) => {
  if (metadata.robots || !alternatePaths[metadata.path]) return "";
  const paths = alternatePaths[metadata.path];
  return [`en|${paths.en}`, `ar|${paths.ar}`, `x-default|${paths.en}`]
    .map((item) => { const [language, path] = item.split("|"); return `<link rel="alternate" hreflang="${language}" href="${siteUrl}${canonicalPath(path)}" />`; })
    .join("\n");
};

const pageMetadata = {
  ar: {
    title: "أوتوأبلاي السعودية | نظّم بحثك عن عمل في السعودية",
    description: "نظّم بحثك عن عمل في السعودية. راجع مهارات سيرتك، وحدد الأدوار والمدن، وتابع خطواتك بالعربية أو الإنجليزية.",
    path: "/ar", lang: "ar", direction: "rtl", locale: "ar_SA",
    agentFallback: { eyebrow: "أوتوأبلاي السعودية · بحث وظيفي منظّم", heading: "نظّم بحثك عن عمل في السعودية بخطوات أوضح.", intro: "يساعدك AutoApply SA على مراجعة مهارات سيرتك وتحديد الأدوار والمدن التي تهمك ومتابعة فرصك وخطواتك القادمة بالعربية أو الإنجليزية.", sections: [["كيف تساعدك مساحة البحث", "راجع خبراتك، وحدد تفضيلاتك، واحفظ الفرص وسجل خطوات المتابعة في مكان واحد."], ["القرار والتحكم بيدك", "تنظيم فرصة أو تجهيز خطوة لا يعني إرسال طلب إلى جهة عمل. راجع المعلومات بنفسك، ولا توجد ضمانات لوظيفة أو مقابلة."], ["ابدأ من هنا", "استخدم أدوات الموقع العامة للتعرّف على المنتج، وسجّل الدخول إلى مساحة العمل لإدارة بياناتك الخاصة."]], links: [["/ar/about/", "عن AutoApply SA"], ["/ar/contact/", "تواصل معنا"], ["/developers/", "وثائق المطورين"]] },
  },
  "ar/enquire": { title: "الاستفسارات | AutoApply SA", description: "تواصل مع AutoApply SA للاستفسار عن المنتج الحالي ونطاق الخدمة.", path: "/ar/contact", lang: "ar", direction: "rtl", locale: "ar_SA", robots: "noindex, follow" },
  enquire: { title: "Enquiries | AutoApply SA", description: "Contact AutoApply SA with questions about the current product and service scope.", path: "/contact", lang: "en", direction: "ltr", locale: "en_SA", robots: "noindex, follow" },
  "how-it-works": { title: "How AutoApply SA works", description: "See how AutoApply SA helps you organise your Saudi job search.", path: "/", lang: "en", direction: "ltr", locale: "en_SA", robots: "noindex, follow" },
  support: { title: "Support and contact | AutoApply SA", description: "Contact AutoApply SA for product, account, or privacy support.", path: "/contact", lang: "en", direction: "ltr", locale: "en_SA", robots: "noindex, follow" },
  about: { title: "About AutoApply SA | Saudi Job Search Workspace", description: "Learn how AutoApply SA helps Saudi job seekers organise a search while keeping clear customer and employer-submission boundaries.", path: "/about", lang: "en", direction: "ltr", locale: "en_SA", agentFallback: { eyebrow: "About AutoApply SA", heading: "A clearer workspace for a Saudi job search.", intro: "AutoApply SA is a Saudi Arabia-focused job-search organiser and application tracker. It helps candidates review CV skills, choose target roles and locations, save relevant opportunities, and keep their next steps in one place in Arabic or English.", sections: [["What the product does", "The public site explains the service, while the signed-in workspace keeps each candidate's profile, preferences, and application records separate. CV feedback and role-matching guidance support informed decisions, not a promise of a job, interview, or employer response."], ["Current boundary", "Saving an opportunity or preparing a profile is not an employer submission. AutoApply SA does not currently submit applications to employers automatically. Candidates decide which opportunities to pursue and review information before any external action."], ["How to verify product information", "Agents and developers can use the public, read-only API for factual product and plan information. It never exposes candidate profiles, CVs, private applications, credentials, or employer contact data."]], links: [["/contact/", "Contact AutoApply SA"], ["/privacy/", "Privacy"], ["/developers/", "Developer documentation"]] } },
  contact: { title: "Contact AutoApply SA | Account and Privacy Help", description: "Contact AutoApply SA for product, account-access, or privacy questions and learn what information should never be shared in support.", path: "/contact", lang: "en", direction: "ltr", locale: "en_SA", agentFallback: { eyebrow: "Contact AutoApply SA", heading: "How to reach AutoApply SA safely.", intro: "For product, account-access, privacy, or website questions, email AutoApply SA at apply@hsndm.tech. Use the same email address associated with your account for profile or application requests, but do not send passwords, verification codes, or national identity numbers by email or chat.", sections: [["What to include", "Describe the page or feature you were using, the approximate time of the issue, and the email address associated with the account when appropriate. For a privacy request, state whether you need access to, correction of, or removal of information."], ["Product and account safety", "AutoApply SA will not ask you to share a password, one-time sign-in code, or payment-card number in a support conversation. The public API is read-only and must not receive CVs, candidate identifiers, credentials, or application forms."], ["Useful links", "Read the Privacy Policy for data-handling information, the Terms for service boundaries, and the developer documentation for the public catalogue API. The public product pages state when a capability is not currently enabled."]], links: [["mailto:apply@hsndm.tech", "apply@hsndm.tech"], ["/privacy/", "Privacy"], ["/developers/", "Developer documentation"]] } },
  privacy: { title: "Privacy Policy | AutoApply SA", description: "Learn how AutoApply SA handles Saudi job-search campaign information, CVs, contact details, and privacy requests.", path: "/privacy", lang: "en", direction: "ltr", locale: "en_SA", agentFallback: { eyebrow: "Privacy | AutoApply SA", heading: "Privacy and your account information.", intro: "CV text extraction happens in your browser. Creating an account sends your sign-in information to Supabase. Saving your profile stores the fields shown in the form. When you upload a CV inside your signed-in workspace, the original file is stored in a private user-owned Supabase Storage folder so it can be attached to applications you approve.", sections: [], links: [["/terms/", "Terms & Conditions"], ["/contact/", "Privacy questions"]] } },
  terms: { title: "Terms & Conditions | AutoApply SA", description: "Read the AutoApply SA service terms for previews, campaign enquiries, candidate tracking, cancellation, and service boundaries.", path: "/terms", lang: "en", direction: "ltr", locale: "en_SA", agentFallback: { eyebrow: "Terms & Conditions | AutoApply SA", heading: "Using AutoApply SA.", intro: "This site supports CV exploration and application organisation when account services are connected. It does not guarantee jobs or interviews. Saving a job is not an employer submission. Pricing is shown before any payment step.", sections: [], links: [["/privacy/", "Privacy Policy"], ["/contact/", "Contact"]] } },
  "ar/how-it-works": { title: "كيف تعمل AutoApply SA", description: "تعرّف على كيفية مساعدة AutoApply SA في تنظيم بحثك عن عمل في السعودية.", path: "/ar", lang: "ar", direction: "rtl", locale: "ar_SA", robots: "noindex, follow" },
  "ar/support": { title: "الدعم والتواصل | AutoApply SA", description: "تواصل مع AutoApply SA للحصول على مساعدة بشأن المنتج أو الحساب أو الخصوصية.", path: "/ar/contact", lang: "ar", direction: "rtl", locale: "ar_SA", robots: "noindex, follow" },
  "ar/about": { title: "عن أوتوأبلاي السعودية | مساحة البحث عن عمل", description: "تعرّف على كيفية مساعدة أوتوأبلاي السعودية للباحثين عن عمل مع توضيح حدود الخدمة وإرسال الطلبات.", path: "/ar/about", lang: "ar", direction: "rtl", locale: "ar_SA", agentFallback: { eyebrow: "عن أوتوأبلاي السعودية", heading: "مساحة أوضح لتنظيم البحث عن عمل في السعودية.", intro: "أوتوأبلاي السعودية هي مساحة لتنظيم البحث عن عمل في السعودية ومتابعة الطلبات. تساعد المرشحين على مراجعة مهارات السيرة الذاتية وتحديد الأدوار والمدن المستهدفة وحفظ الفرص ومتابعة الخطوات القادمة بالعربية أو الإنجليزية.", sections: [["ما الذي يقدمه المنتج", "يشرح الموقع العام الخدمة، بينما تحفظ مساحة العمل بعد تسجيل الدخول ملف كل مرشح وتفضيلاته وسجلات طلباته بشكل منفصل. تهدف إرشادات السيرة والمطابقة إلى دعم القرار الواعي ولا تعد بوظيفة أو مقابلة أو رد من جهة عمل."], ["الحدود الحالية", "حفظ فرصة أو تجهيز ملف لا يعني إرسال طلب إلى جهة عمل. لا ترسل أوتوأبلاي السعودية الطلبات إلى أصحاب العمل تلقائيا في الوقت الحالي. يبقى المرشح مسؤولا عن اختيار الفرص ومراجعة المعلومات قبل أي إجراء خارجي."], ["كيفية التحقق من معلومات المنتج", "يمكن للوكلاء والمطورين استخدام واجهة عامة للقراءة فقط للتحقق من معلومات المنتج والباقات. لا تعرض هذه الواجهة ملفات المرشحين أو السير الذاتية أو الطلبات الخاصة أو بيانات الدخول أو جهات اتصال أصحاب العمل."]], links: [["/ar/contact/", "تواصل"], ["/ar/privacy/", "الخصوصية"], ["/developers/", "وثائق المطورين"]] } },
  "ar/contact": { title: "تواصل مع أوتوأبلاي السعودية | مساعدة الحساب والخصوصية", description: "تواصل مع أوتوأبلاي السعودية لاستفسارات المنتج أو الحساب أو الخصوصية وتعرّف على المعلومات التي لا ينبغي مشاركتها في الدعم.", path: "/ar/contact", lang: "ar", direction: "rtl", locale: "ar_SA", agentFallback: { eyebrow: "تواصل مع أوتوأبلاي السعودية", heading: "كيفية التواصل مع أوتوأبلاي السعودية بأمان.", intro: "للاستفسارات عن المنتج أو الوصول إلى الحساب أو الخصوصية أو الموقع، راسل أوتوأبلاي السعودية على apply@hsndm.tech. استخدم عنوان البريد المرتبط بحسابك عندما يخص الطلب ملفك أو سجلات طلباتك، ولا ترسل كلمات المرور أو رموز التحقق أو أرقام الهوية بالبريد أو الدردشة.", sections: [["ما الذي يجب تضمينه", "اذكر الصفحة أو الميزة التي كنت تستخدمها والوقت التقريبي للمشكلة والبريد المرتبط بالحساب عند الحاجة. لطلبات الخصوصية، وضح إن كنت تطلب الوصول إلى المعلومات أو تصحيحها أو حذفها."], ["سلامة المنتج والحساب", "لن تطلب منك أوتوأبلاي السعودية مشاركة كلمة مرور أو رمز تسجيل دخول لمرة واحدة أو رقم بطاقة دفع في محادثة دعم. واجهة البرمجة العامة للقراءة فقط ولا ينبغي إرسال السير الذاتية أو معرفات المرشحين أو بيانات الدخول أو نماذج الطلبات إليها."], ["روابط مفيدة", "اقرأ سياسة الخصوصية لمعلومات معالجة البيانات والشروط لحدود الخدمة ووثائق المطورين لواجهة الكتالوج العامة. الموقع متاح بالعربية والإنجليزية، وتوضح صفحات المنتج العامة عندما لا تكون ميزة ما مفعلة حاليا."]], links: [["mailto:apply@hsndm.tech", "apply@hsndm.tech"], ["/ar/privacy/", "الخصوصية"], ["/developers/", "وثائق المطورين"]] } },
  "ar/privacy": { title: "سياسة الخصوصية | أوتوأبلاي السعودية", description: "تعرّف على كيفية تعامل AutoApply SA مع معلومات حملة البحث عن عمل والسيرة الذاتية وطلبات الخصوصية.", path: "/ar/privacy", lang: "ar", direction: "rtl", locale: "ar_SA", agentFallback: { eyebrow: "الخصوصية | AutoApply SA", heading: "الخصوصية ومعلومات حسابك.", intro: "تتم قراءة نص السيرة داخل متصفحك. إنشاء الحساب يرسل معلومات الدخول إلى Supabase. حفظ الملف يخزن الحقول المعروضة. عند رفع السيرة داخل مساحة العمل بعد تسجيل الدخول، يُحفظ الملف الأصلي في مجلد خاص مملوك لحسابك في Supabase Storage ليتم إرفاقه بالطلبات التي توافق عليها.", sections: [], links: [["/ar/terms/", "الشروط والأحكام"], ["/ar/contact/", "استفسارات الخصوصية"]] } },
  "ar/terms": { title: "الشروط والأحكام | أوتوأبلاي السعودية", description: "اقرأ شروط خدمة AutoApply SA للمعاينة واستفسار الحملة وتتبع الطلبات وحدود الخدمة.", path: "/ar/terms", lang: "ar", direction: "rtl", locale: "ar_SA", agentFallback: { eyebrow: "الشروط والأحكام | AutoApply SA", heading: "استخدام AutoApply SA.", intro: "يدعم الموقع استكشاف السيرة وتنظيم الطلبات عند اتصال خدمات الحساب. لا يضمن وظائف أو مقابلات. حفظ وظيفة لا يعني إرسال طلب إلى جهة عمل. تظهر الأسعار قبل أي خطوة دفع.", sections: [], links: [["/ar/privacy/", "سياسة الخصوصية"], ["/ar/contact/", "تواصل معنا"]] } },
  pricing: { title: "Plans and pricing | AutoApply SA", description: "See current AutoApply SA plans and monthly prices on the homepage.", path: "/", lang: "en", direction: "ltr", locale: "en_SA", robots: "noindex, follow" },
  services: { title: "Current features | AutoApply SA", description: "Explore the current AutoApply SA job-search features on the homepage.", path: "/", lang: "en", direction: "ltr", locale: "en_SA", robots: "noindex, follow" },
  "ar/pricing": { title: "الباقات والأسعار | AutoApply SA", description: "اطلع على باقات AutoApply SA وأسعارها الشهرية الحالية في الصفحة الرئيسية.", path: "/ar", lang: "ar", direction: "rtl", locale: "ar_SA", robots: "noindex, follow" },
  "ar/services": { title: "المزايا الحالية | AutoApply SA", description: "استكشف مزايا AutoApply SA الحالية لتنظيم البحث عن عمل في الصفحة الرئيسية.", path: "/ar", lang: "ar", direction: "rtl", locale: "ar_SA", robots: "noindex, follow" },
  ats: { title: "CV tools | AutoApply SA", description: "Explore current CV review and job-search features on the AutoApply SA homepage.", path: "/", lang: "en", direction: "ltr", locale: "en_SA", robots: "noindex, follow" },
  "ar/ats": { title: "أدوات السيرة الذاتية | AutoApply SA", description: "استكشف مزايا مراجعة السيرة وتنظيم البحث عن عمل في الصفحة الرئيسية.", path: "/ar", lang: "ar", direction: "rtl", locale: "ar_SA", robots: "noindex, follow" },

};

const notFoundMetadata = {
  title: "Page Not Found | AutoApply SA",
  description: "This AutoApply SA page could not be found. Return to the homepage or contact us for help.",
  path: "/404", lang: "en", direction: "ltr", locale: "en_SA", robots: "noindex, nofollow",
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
  const alternates = alternateLinks(metadata);
  let withMetadata = indexHtml
    .replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]+"\s*\/>\s*/g, "")
    .replace(/<html lang="en"(?:\s+dir="ltr")?>/, `<html lang="${metadata.lang}" dir="${metadata.direction}">`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(metadata.description)}" />`)
    .replace(/<meta name="robots" content="[^"]*"\s*\/>/, `<meta name="robots" content="${metadata.robots || "index, follow"}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />${alternates ? `\n${alternates}` : ""}`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`)
    .replace(/<meta property="og:locale" content="[^"]*"\s*\/>/, `<meta property="og:locale" content="${metadata.locale}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(metadata.title)}</title>`);

  withMetadata = replaceAgentFallback(replaceLoadingFallback(withMetadata, metadata), metadata);

  withMetadata = withMetadata.replace(faqSchemaPattern, "");

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
