import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, access, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const output = await mkdtemp(join(tmpdir(), "autoapply-static-routes-"));
const index = await readFile(new URL("../client/index.html", import.meta.url), "utf8");
const app = await readFile(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const landing = await readFile(new URL("../client/src/v2/Landing.tsx", import.meta.url), "utf8");

try {
  await writeFile(join(output, "index.html"), index);
  await run(process.execPath, [fileURLToPath(new URL("./prepare-static-routes.mjs", import.meta.url))], {
    env: { ...process.env, AUTOAPPLY_STATIC_OUTPUT_DIR: output },
  });

  const readRoute = (route) => readFile(join(output, route, "index.html"), "utf8");
  const englishHome = await readFile(join(output, "index.html"), "utf8");
  const arabicHome = await readRoute("ar");
  const pricing = await readRoute("pricing");
  const arabicPricing = await readRoute("ar/pricing");
  const services = await readRoute("services");
  const enquiry = await readRoute("enquire");
  const arabicEnquiry = await readRoute("ar/enquire");
  const about = await readRoute("about");
  const contact = await readRoute("contact");
  const privacy = await readRoute("privacy");
  const arabicPrivacy = await readRoute("ar/privacy");
  const terms = await readRoute("terms");
  const arabicTerms = await readRoute("ar/terms");
  const notFound = await readFile(join(output, "404.html"), "utf8");

  assert.match(englishHome, /AutoApply SA \| Organise your Saudi job search/);
  assert.match(arabicHome, /<html lang="ar" dir="rtl">/);
  assert.match(arabicHome, /نظّم بحثك عن عمل في السعودية/);
  assert.match(arabicHome, /لا يعني إرسال طلب إلى جهة عمل/);
  assert.doesNotMatch(arabicHome, /أخبرنا بالوظائف التي تريدها/);
  assert.doesNotMatch(arabicHome, /homepage-faq-schema/);
  assert.match(arabicHome, /كيف تساعدك مساحة البحث/);
  assert.doesNotMatch(landing, /يمكنك يمكنك/);
  assert.match(landing, /يمكنك قراءة نص سيرتك على جهازك/);

  const assertAlias = (html, canonical) => {
    assert.match(html, /<meta name="robots" content="noindex, follow"/);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://www\\.hsndm\\.tech${canonical.replaceAll("/", "\\/")}"`));
  };
  assertAlias(pricing, "/");
  const assertAlternates = (html, english, arabic) => {
    assert.match(html, new RegExp(`hreflang="en" href="https://www\\.hsndm\\.tech${english.replaceAll("/", "\\/")}"`));
    assert.match(html, new RegExp(`hreflang="ar" href="https://www\\.hsndm\\.tech${arabic.replaceAll("/", "\\/")}"`));
    assert.match(html, new RegExp(`hreflang="x-default" href="https://www\\.hsndm\\.tech${english.replaceAll("/", "\\/")}"`));
  };
  assertAlternates(about, "/about/", "/ar/about/");
  assertAlternates(await readRoute("ar/about"), "/about/", "/ar/about/");
  assertAlternates(contact, "/contact/", "/ar/contact/");
  assertAlternates(privacy, "/privacy/", "/ar/privacy/");
  assertAlternates(arabicPrivacy, "/privacy/", "/ar/privacy/");
  assertAlternates(terms, "/terms/", "/ar/terms/");
  assertAlternates(arabicTerms, "/terms/", "/ar/terms/");
  assert.doesNotMatch(pricing, /hreflang=/);
  assert.doesNotMatch(arabicPricing, /hreflang=/);
  assert.match(privacy, /CV text extraction happens in your browser/);
  assert.match(arabicPrivacy, /تتم قراءة نص السيرة داخل متصفحك/);
  assert.match(terms, /Saving a job is not an employer submission/);
  assert.match(arabicTerms, /حفظ وظيفة لا يعني إرسال طلب إلى جهة عمل/);
  assert.doesNotMatch(privacy, /How the job-search workspace helps/);
  assert.doesNotMatch(terms, /How the job-search workspace helps/);
  assertAlias(arabicPricing, "/ar/");
  assertAlias(services, "/");
  assertAlias(await readRoute("ar/services"), "/ar/");
  assertAlias(await readRoute("how-it-works"), "/");
  assertAlias(await readRoute("ar/how-it-works"), "/ar/");
  assertAlias(await readRoute("support"), "/contact/");
  assertAlias(await readRoute("ar/support"), "/ar/contact/");
  assertAlias(enquiry, "/contact/");
  assertAlias(arabicEnquiry, "/ar/contact/");
  assertAlias(await readRoute("ats"), "/");
  assertAlias(await readRoute("ar/ats"), "/ar/");

  for (const retired of ["thank-you", "ar/thank-you", "case-studies", "ar/case-studies", "campaign-report-sample", "ar/campaign-report-sample"]) {
    await assert.rejects(access(join(output, retired)), { code: "ENOENT" });
  }

  assert.match(app, /LegacyRouteAlias/);
  assert.match(app, /const LazyAuthPage=lazy\(\(\)=>import\('\.\/v2\/AuthPage'\)/);
  assert.match(app, /const LazyWorkspaceRoute=lazy\(\(\)=>import\('\.\/v2\/Workspace'\)/);
  assert.match(app, /<Suspense fallback=/);
  assert.equal((app.match(/<LazyAuthPage mode=/g) || []).length, 4);
  assert.match(app, /<LazyWorkspaceRoute\/>/);
  assert.doesNotMatch(app, /import \{AuthPage\} from/);
  assert.doesNotMatch(app, /import \{Workspace,SessionGate\} from/);
  assert.match(app, /routeSeoState/);
  assert.match(app, /noindex:routeState\.noindex/);
  assert.match(app, /Page not found/);
  assert.match(app, /!routeState\.known\?t\('Page not found \| AutoApply SA'/);
  assert.match(app, /https:\/\/app\.hsndm\.tech\/sign-in/);
  assert.doesNotMatch(app, /https:\/\/app\.hsndm\.tech\/login/);
  assert.match(about, /About AutoApply SA \| Saudi Job Search Workspace/);
  assert.match(contact, /Contact AutoApply SA \| Account and Privacy Help/);
  assert.match(notFound, /name="robots" content="noindex, nofollow"/);

  const visibleText = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  assert.ok(visibleText(about).length > 500, "About fallback should remain useful without JavaScript");
  assert.ok(visibleText(contact).length > 500, "Contact fallback should remain useful without JavaScript");

  console.log("Static routes, bilingual aliases, metadata, and retired-page behavior verified.");
} finally {
  await rm(output, { recursive: true, force: true });
}
