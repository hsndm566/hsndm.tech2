/** Shared client-side SEO metadata for the static routed application. */
export const SITE_URL = "https://hsndm.tech";
export const SOCIAL_IMAGE_URL = `${SITE_URL}/manus-storage/autoapply-hero-operations_ad007abc.jpg`;

type SeoOptions = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
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

export function applyPageSeo({ title, description, path, noindex = false }: SeoOptions) {
  const url = `${SITE_URL}${path}`;
  document.title = title;
  setMeta('meta[name="description"]', "name", "description", description);
  setMeta('meta[name="robots"]', "name", "robots", noindex ? "noindex, follow" : "index, follow");
  setMeta('meta[property="og:title"]', "property", "og:title", title);
  setMeta('meta[property="og:description"]', "property", "og:description", description);
  setMeta('meta[property="og:url"]', "property", "og:url", url);
  setMeta('meta[property="og:image"]', "property", "og:image", SOCIAL_IMAGE_URL);
  setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
  setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
  setMeta('meta[name="twitter:image"]', "name", "twitter:image", SOCIAL_IMAGE_URL);

  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}
