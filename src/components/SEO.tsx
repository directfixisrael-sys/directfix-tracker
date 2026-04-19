import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

const setMeta = (selector: string, attr: string, value: string) => {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    const [key, val] = selector.replace(/[\[\]"]/g, "").split("=");
    el.setAttribute(key, val);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
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

export const SEO = ({ title, description, image, url, type = "website" }: SEOProps) => {
  useEffect(() => {
    const fullUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const fullImage = image
      ? image.startsWith("http")
        ? image
        : `${typeof window !== "undefined" ? window.location.origin : ""}${image}`
      : undefined;

    document.title = title;
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:type"]', "content", type);
    if (fullUrl) setMeta('meta[property="og:url"]', "content", fullUrl);
    if (fullImage) {
      setMeta('meta[property="og:image"]', "content", fullImage);
      setMeta('meta[name="twitter:image"]', "content", fullImage);
    }
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    if (fullUrl) setLink("canonical", fullUrl);
  }, [title, description, image, url, type]);

  return null;
};

export default SEO;