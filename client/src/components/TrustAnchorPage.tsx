import { Link } from "wouter";

import { useLocale } from "../v2/locale";

type TrustAnchorKind = "about" | "contact";

export function TrustAnchorPage({ kind }: { kind: TrustAnchorKind }) {
  const { path, t } = useLocale();
  const isAbout = kind === "about";

  return (
    <main className="legal wrap">
      <p className="section-label">
        {isAbout ? t("ABOUT AUTOAPPLY SA", "عن أوتوأبلاي السعودية") : t("CONTACT AUTOAPPLY SA", "تواصل مع أوتوأبلاي السعودية")}
      </p>
      <h1>
        {isAbout
          ? t("A clearer workspace for a Saudi job search.", "مساحة أوضح لتنظيم البحث عن عمل في السعودية.")
          : t("How to reach AutoApply SA safely.", "كيفية التواصل مع أوتوأبلاي السعودية بأمان.")}
      </h1>

      {isAbout ? (
        <>
          <p>
            {t(
              "AutoApply SA is a Saudi Arabia-focused job-search organiser and application tracker. It helps candidates review CV skills, choose target roles and locations, save relevant opportunities, and keep their next steps in one place in Arabic or English.",
              "أوتوأبلاي السعودية هي مساحة لتنظيم البحث عن عمل في السعودية ومتابعة الطلبات. تساعد المرشحين على مراجعة مهارات السيرة الذاتية وتحديد الأدوار والمدن المستهدفة وحفظ الفرص ومتابعة الخطوات القادمة بالعربية أو الإنجليزية.",
            )}
          </p>
          <h2>{t("What the product does", "ما الذي يقدمه المنتج")}</h2>
          <p>
            {t(
              "The public site explains the service, while the signed-in workspace keeps each candidate's profile, preferences, and application records separate. CV feedback and role-matching guidance are meant to support informed decisions, not to promise a job, interview, or employer response.",
              "يشرح الموقع العام الخدمة، بينما تحفظ مساحة العمل بعد تسجيل الدخول ملف كل مرشح وتفضيلاته وسجلات طلباته بشكل منفصل. تهدف إرشادات السيرة والمطابقة إلى دعم القرار الواعي ولا تعد بوظيفة أو مقابلة أو رد من جهة عمل.",
            )}
          </p>
          <h2>{t("Current boundary", "الحدود الحالية")}</h2>
          <p>
            {t(
              "Saving an opportunity or preparing a profile is not an employer submission. AutoApply SA does not currently submit applications to employers automatically. Candidates remain responsible for deciding which opportunities to pursue and for reviewing information before any external action.",
              "حفظ فرصة أو تجهيز ملف لا يعني إرسال طلب إلى جهة عمل. لا ترسل أوتوأبلاي السعودية الطلبات إلى أصحاب العمل تلقائيا في الوقت الحالي. يبقى المرشح مسؤولا عن اختيار الفرص ومراجعة المعلومات قبل أي إجراء خارجي.",
            )}
          </p>
          <h2>{t("How to verify product information", "كيفية التحقق من معلومات المنتج")}</h2>
          <p>
            {t(
              "Agents and developers can use the public, read-only API for factual product and plan information. It never exposes candidate profiles, CVs, private applications, credentials, or employer contact data. The Privacy and Terms pages explain the customer-facing data and service boundaries.",
              "يمكن للوكلاء والمطورين استخدام واجهة عامة للقراءة فقط للتحقق من معلومات المنتج والباقات. لا تعرض هذه الواجهة ملفات المرشحين أو السير الذاتية أو الطلبات الخاصة أو بيانات الدخول أو جهات اتصال أصحاب العمل. توضح صفحات الخصوصية والشروط حدود البيانات والخدمة للعملاء.",
            )}
          </p>
        </>
      ) : (
        <>
          <p>
            {t(
              "For product, account-access, privacy, or website questions, email AutoApply SA at apply@hsndm.tech. Use the same email address that is associated with your account when a request concerns your own profile or application records, but do not send passwords, verification codes, or national identity numbers by email or chat.",
              "للاستفسارات عن المنتج أو الوصول إلى الحساب أو الخصوصية أو الموقع، راسل أوتوأبلاي السعودية على apply@hsndm.tech. استخدم عنوان البريد المرتبط بحسابك عندما يخص الطلب ملفك أو سجلات طلباتك، ولا ترسل كلمات المرور أو رموز التحقق أو أرقام الهوية بالبريد أو الدردشة.",
            )}
          </p>
          <h2>{t("What to include", "ما الذي يجب تضمينه")}</h2>
          <p>
            {t(
              "Describe the page or feature you were using, the approximate time of the issue, and the email address associated with the account when appropriate. For a privacy request, state whether you need access to, correction of, or removal of information. Clear, minimal details help protect your privacy and make the request easier to route.",
              "اذكر الصفحة أو الميزة التي كنت تستخدمها والوقت التقريبي للمشكلة والبريد المرتبط بالحساب عند الحاجة. لطلبات الخصوصية، وضح إن كنت تطلب الوصول إلى المعلومات أو تصحيحها أو حذفها. تساعد التفاصيل الواضحة والمحدودة على حماية الخصوصية وتوجيه الطلب بدقة.",
            )}
          </p>
          <h2>{t("Product and account safety", "سلامة المنتج والحساب")}</h2>
          <p>
            {t(
              "AutoApply SA will not ask you to share a password, one-time sign-in code, or payment-card number in a support conversation. The public API is also read-only and must not receive CVs, candidate identifiers, credentials, or application forms. Sign in through the official portal for account-specific work.",
              "لن تطلب منك أوتوأبلاي السعودية مشاركة كلمة مرور أو رمز تسجيل دخول لمرة واحدة أو رقم بطاقة دفع في محادثة دعم. واجهة البرمجة العامة للقراءة فقط ولا ينبغي إرسال السير الذاتية أو معرفات المرشحين أو بيانات الدخول أو نماذج الطلبات إليها. استخدم البوابة الرسمية للعمل المرتبط بحسابك.",
            )}
          </p>
          <h2>{t("Useful links", "روابط مفيدة")}</h2>
          <p>
            {t(
              "Read the Privacy Policy for data-handling information, the Terms for service boundaries, and the developer documentation for the public catalogue API. The website is available in Arabic and English, and the public product pages state when a capability is not currently enabled.",
              "اقرأ سياسة الخصوصية لمعلومات معالجة البيانات والشروط لحدود الخدمة ووثائق المطورين لواجهة الكتالوج العامة. الموقع متاح بالعربية والإنجليزية، وتوضح صفحات المنتج العامة عندما لا تكون ميزة ما مفعلة حاليا.",
            )}
          </p>
        </>
      )}

      <p>
        {isAbout ? (
          <Link className="button" href={path("/contact")}>{t("Contact AutoApply SA", "تواصل مع أوتوأبلاي السعودية")}</Link>
        ) : (
          <a className="button" href="mailto:apply@hsndm.tech">apply@hsndm.tech</a>
        )}
        {" "}
        <Link className="text-link" href={path("/privacy")}>{t("Privacy", "الخصوصية")}</Link>
      </p>
    </main>
  );
}
