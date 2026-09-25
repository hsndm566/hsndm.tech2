/** Shared client-side SEO metadata for the static routed application. */
export const SITE_URL = "https://www.hsndm.tech";
export const SOCIAL_IMAGE_URL = `${SITE_URL}/manus-storage/autoapply-hero-operations_ad007abc.jpg`;
export const SOCIAL_IMAGE_ALT = "AutoApply SA job application service";
const LOGO_URL = `${SITE_URL}/autoapplysa-mark.svg`;

type SeoOptions = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  language?: "en" | "ar";
};

function setMeta(selector: string, attribute: "name" | "property", value: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.content = content;
}

function canonicalPath(path: string) {
  if (path === "/") return "/";
  return `/${path.replace(/^\/+|\/+$/g, "")}/`;
}

function setLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let element = document.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    if (hreflang) element.hreflang = hreflang;
    document.head.appendChild(element);
  }
  element.href = href;
}

function setStructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "AutoApply SA",
        url: SITE_URL,
        logo: LOGO_URL,
        contactPoint: {
          "@type": "ContactPoint",
          email: "apply@hsndm.tech",
          telephone: "+966571448656",
          contactType: "customer support",
          areaServed: "SA",
          availableLanguage: ["English", "Arabic"],
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "AutoApply SA",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        image: SOCIAL_IMAGE_URL,
        offers: {
          "@type": "Offer",
          priceCurrency: "SAR",
        },
      },
    ],
  };
  let element = document.querySelector<HTMLScriptElement>('script[type="application/ld+json"][data-autoapply-schema="site"]');
  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.dataset.autoapplySchema = "site";
    document.head.appendChild(element);
  }
  element.text = JSON.stringify(graph);
}

export function applyPageSeo({ title, description, path, noindex = false, language = path.startsWith("/ar") ? "ar" : "en" }: SeoOptions) {
  const url = `${SITE_URL}${canonicalPath(path)}`;
  document.title = title;
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  setMeta('meta[name="description"]', "name", "description", description);
  setMeta('meta[name="robots"]', "name", "robots", noindex ? "noindex, nofollow" : "index, follow");
  setMeta('meta[property="og:title"]', "property", "og:title", title);
  setMeta('meta[property="og:description"]', "property", "og:description", description);
  setMeta('meta[property="og:url"]', "property", "og:url", url);
  setMeta('meta[property="og:type"]', "property", "og:type", "website");
  setMeta('meta[property="og:image"]', "property", "og:image", SOCIAL_IMAGE_URL);
  setMeta('meta[property="og:image:alt"]', "property", "og:image:alt", SOCIAL_IMAGE_ALT);
  setMeta('meta[property="og:locale"]', "property", "og:locale", language === "ar" ? "ar_SA" : "en_SA");
  setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
  setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
  setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
  setMeta('meta[name="twitter:image"]', "name", "twitter:image", SOCIAL_IMAGE_URL);
  setMeta('meta[name="twitter:image:alt"]', "name", "twitter:image:alt", SOCIAL_IMAGE_ALT);

  setLink("canonical", url);
  setLink("alternate", `${SITE_URL}/ar/`, "ar");
  setLink("alternate", `${SITE_URL}/`, "en");
  setLink("alternate", `${SITE_URL}/`, "x-default");
  setStructuredData();
}
