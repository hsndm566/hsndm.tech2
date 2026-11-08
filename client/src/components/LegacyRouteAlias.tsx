import { useEffect } from "react";

const alias = (
  target: string,
  canonicalPath: string,
  language: "en" | "ar",
  title: string,
  description: string,
  linkLabel: string,
) => ({ target, canonicalPath, language, title, description, linkLabel });

export const legacyRouteAliases = {
  "/pricing": alias("/contact", "/contact", "en", "Pricing information | AutoApply SA", "Contact AutoApply SA for current pricing information. Any fees and service scope are confirmed before payment.", "Contact AutoApply SA"),
  "/ar/pricing": alias("/ar/contact", "/ar/contact", "ar", "معلومات الأسعار | AutoApply SA", "تواصل مع AutoApply SA لمعرفة الأسعار الحالية. يتم تأكيد الرسوم ونطاق الخدمة قبل الدفع.", "تواصل مع AutoApply SA"),
  "/services": alias("/#features", "/", "en", "Current features | AutoApply SA", "Explore the current AutoApply SA job-search features on the homepage.", "Explore current features"),
  "/ar/services": alias("/ar/#features", "/ar", "ar", "المزايا الحالية | AutoApply SA", "استكشف مزايا AutoApply SA الحالية لتنظيم البحث عن عمل في الصفحة الرئيسية.", "استكشف المزايا الحالية"),
  "/how-it-works": alias("/#how", "/", "en", "How AutoApply SA works", "See how AutoApply SA helps you organise your Saudi job search.", "See how it works"),
  "/ar/how-it-works": alias("/ar/#how", "/ar", "ar", "كيف تعمل AutoApply SA", "تعرّف على كيفية مساعدة AutoApply SA في تنظيم بحثك عن عمل في السعودية.", "شاهد كيف يعمل"),
  "/support": alias("/contact", "/contact", "en", "Support and contact | AutoApply SA", "Contact AutoApply SA for product, account, or privacy support.", "Go to contact"),
  "/ar/support": alias("/ar/contact", "/ar/contact", "ar", "الدعم والتواصل | AutoApply SA", "تواصل مع AutoApply SA للحصول على مساعدة بشأن المنتج أو الحساب أو الخصوصية.", "الانتقال إلى التواصل"),
  "/enquire": alias("/contact", "/contact", "en", "Enquiries | AutoApply SA", "Contact AutoApply SA with questions about the current product and service scope.", "Go to contact"),
  "/ar/enquire": alias("/ar/contact", "/ar/contact", "ar", "الاستفسارات | AutoApply SA", "تواصل مع AutoApply SA للاستفسار عن المنتج الحالي ونطاق الخدمة.", "الانتقال إلى التواصل"),
  "/ats": alias("/#features", "/", "en", "CV tools | AutoApply SA", "Explore current CV review and job-search features on the AutoApply SA homepage.", "Explore CV features"),
  "/ar/ats": alias("/ar/#features", "/ar", "ar", "أدوات السيرة الذاتية | AutoApply SA", "استكشف مزايا مراجعة السيرة وتنظيم البحث عن عمل في الصفحة الرئيسية.", "استكشف مزايا السيرة"),
} as const;

export type LegacyAliasPath = keyof typeof legacyRouteAliases;
export type LegacyAliasConfig = (typeof legacyRouteAliases)[LegacyAliasPath];

export function getLegacyRouteAlias(path: string): LegacyAliasConfig | undefined {
  return Object.prototype.hasOwnProperty.call(legacyRouteAliases, path)
    ? legacyRouteAliases[path as LegacyAliasPath]
    : undefined;
}

export function LegacyRouteAlias({ path }: { path: LegacyAliasPath }) {
  const destination = legacyRouteAliases[path];

  useEffect(() => {
    window.location.replace(destination.target);
  }, [destination.target]);

  return (
    <main className="legal wrap" dir={destination.language === "ar" ? "rtl" : "ltr"} lang={destination.language}>
      <h1>{destination.title}</h1>
      <p>{destination.description}</p>
      <a className="button" href={destination.target}>{destination.linkLabel}</a>
    </main>
  );
}
