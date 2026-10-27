import { useEffect } from 'react';

const setMeta = (sel, attr, val) => {
  let el = document.head.querySelector(sel);
  if (!el) {
    const m = sel.match(/^(\w+)\[(\w+(?::\w+)?)="([^"]+)"\]$/);
    el = document.createElement(m ? m[1] : 'meta');
    if (m) el.setAttribute(m[2], m[3]);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, val);
};

/** Título, descripción, canonical, OG y JSON-LD para páginas SPA. */
export default function useSeo({ title, description, path, jsonLd, noindex = false, image = '/img/og-home.jpg' }) {
  useEffect(() => {
    if (!title) return;
    const url = `https://agutidesigns.io${path}`;
    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', url);
    const img = image.startsWith('http') ? image : `https://agutidesigns.io${image}`;
    setMeta('meta[property="og:image"]', 'content', img);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', img);
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, follow' : 'index, follow');
    let s;
    if (jsonLd) {
      document.head.querySelectorAll('script[data-seo-jsonld]').forEach((n) => n.remove());
      s = document.createElement('script');
      s.type = 'application/ld+json';
      s.dataset.seoJsonld = '1';
      s.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(s);
    }
    return () => s && s.remove();
  }, [title, description, path, image]); // eslint-disable-line react-hooks/exhaustive-deps
}
