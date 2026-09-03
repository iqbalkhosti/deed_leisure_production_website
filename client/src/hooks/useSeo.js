import { useEffect } from 'react';
import site from '../data/site';

/**
 * Per-page document metadata for a single-page app.
 *
 * Search crawlers render JS these days, so setting the tags on mount is enough
 * for indexing; the immediate win is correct titles in browser tabs, bookmarks,
 * and history. Link previews on social platforms use the static tags in
 * index.html, which cover the site as a whole.
 */
function upsertMeta(selector, attribute, value, content) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, value);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export default function useSeo({ title, description, path }) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${site.name}` : `${site.name} — ${site.tagline}`;
    document.title = fullTitle;

    if (description) {
      upsertMeta('meta[name="description"]', 'name', 'description', description);
      upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    }
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);

    if (path) {
      const href = new URL(path, site.url).toString();
      let canonical = document.head.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', href);
      upsertMeta('meta[property="og:url"]', 'property', 'og:url', href);
    }
  }, [title, description, path]);
}
