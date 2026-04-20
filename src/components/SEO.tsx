import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  /** JSON-LD structured data object(s) */
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const SITE_ORIGIN = "https://track.directfix.co.il";
const JSONLD_ID = "seo-page-jsonld";

const setMeta = (selector: string, attrName: string, attrValue: string, content: string) => {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setLink = (rel: string, href: string) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

export const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  noindex = false,
  jsonLd,
}: SEOProps) => {
  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : SITE_ORIGIN;
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    const fullUrl = url || `${origin}${path}`;
    const fullImage = image
      ? image.startsWith("http") ? image : `${origin}${image}`
      : `${origin}/og-technician.png`;

    document.title = title;

    setMeta('meta[name="description"]', "name", "description", description);
    if (keywords) setMeta('meta[name="keywords"]', "name", "keywords", keywords);
    setMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );

    // Open Graph
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:type"]', "property", "og:type", type);
    setMeta('meta[property="og:url"]', "property", "og:url", fullUrl);
    setMeta('meta[property="og:image"]', "property", "og:image", fullImage);
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", "DirectFix - דיירקט פיקס");
    setMeta('meta[property="og:locale"]', "property", "og:locale", document.documentElement.lang === "en" ? "en_US" : "he_IL");

    // Twitter
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", fullImage);

    // Canonical + hreflang
    setLink("canonical", fullUrl);

    // JSON-LD (per-page) — replace any prior page-level JSON-LD
    const prev = document.getElementById(JSONLD_ID);
    if (prev) prev.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = JSONLD_ID;
      script.text = JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd]);
      document.head.appendChild(script);
    }
  }, [title, description, keywords, image, url, type, noindex, JSON.stringify(jsonLd)]);

  return null;
};

export default SEO;
