/**
 * Writes public/sitemap.xml before every build so the file can never drift from
 * the routes. Add a route in App.jsx, add it here, and the sitemap follows.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = process.env.SITE_URL ?? 'https://deedleisure.ca';

const ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/design-studio', priority: '0.9', changefreq: 'monthly' },
  { path: '/products', priority: '0.9', changefreq: 'monthly' },
  { path: '/contact', priority: '0.8', changefreq: 'yearly' },
  { path: '/our-process', priority: '0.7', changefreq: 'yearly' },
  { path: '/faq', priority: '0.7', changefreq: 'monthly' },
  { path: '/student-clubs', priority: '0.7', changefreq: 'yearly' },
  { path: '/corporate-teams', priority: '0.7', changefreq: 'yearly' },
  { path: '/ontario-tech-clubs', priority: '0.6', changefreq: 'yearly' },
  { path: '/our-team', priority: '0.5', changefreq: 'yearly' },
];

const today = new Date().toISOString().slice(0, 10);
const body = ROUTES.map(({ path, priority, changefreq }) => [
  '  <url>',
  `    <loc>${new URL(path, BASE_URL).toString()}</loc>`,
  `    <lastmod>${today}</lastmod>`,
  `    <changefreq>${changefreq}</changefreq>`,
  `    <priority>${priority}</priority>`,
  '  </url>',
].join('\n')).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

const target = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sitemap.xml');
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, xml);
console.log(`sitemap: ${ROUTES.length} routes → ${target}`);
