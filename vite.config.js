import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'node:fs';
import foodData from './data/export.json';

// TODO: Replace with your actual production domain
const BASE_URL = 'https://inseason-foods.com';

/** Vite plugin: generates sitemap.xml into dist/ after build */
function sitemapPlugin() {
  return {
    name: 'generate-sitemap',
    closeBundle() {
      const urls = [
        BASE_URL + '/',
        ...foodData.map((item) => `${BASE_URL}/item/${item.image}`),
      ];
      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map((url) => `  <url><loc>${url}</loc></url>`),
        '</urlset>',
      ].join('\n');
      writeFileSync('./dist/sitemap.xml', xml, 'utf-8');
    },
  };
}

export default defineConfig({
  plugins: [react(), sitemapPlugin()],
  server: {
    fs: {
      allow: ['..'],
    },
  },
  ssgOptions: {
    // Pre-render the homepage and every item detail page
    includedRoutes(paths) {
      const itemPaths = foodData.map((item) => `/item/${item.image}`);
      return ['/', ...itemPaths];
    },
    formatting: 'minify',

    // Inject per-page title, description, and canonical URL into each pre-rendered page
    onPageRendered(route, html) {
      if (route.startsWith('/item/')) {
        const slug = route.replace('/item/', '');
        const item = foodData.find((i) => i.image === slug);
        if (item) {
          const titleDe = `${item.name_de} \u2013 Saison, Lagerung &amp; Tipps | Saisonkalender`;
          const titleEn = `${item.name_en} \u2013 Season, Storage &amp; Tips | In Season`;
          const descDe = `Wann hat ${item.name_de} Saison? Alle Infos zu Lagerung, Haltbarkeit und Tipps f\u00fcr ${item.name_de} (${item.latName}).`;
          const pageUrl = `${BASE_URL}/item/${slug}`;

          return html
            .replace(
              /(<title>)[^<]*(<\/title>)/,
              `$1${titleDe}$2`
            )
            .replace(
              /(<meta name="description" content=")[^"]*(")/,
              `$1${descDe}$2`
            )
            .replace(
              /(<meta property="og:title" content=")[^"]*(")/,
              `$1${titleDe}$2`
            )
            .replace(
              /(<meta property="og:description" content=")[^"]*(")/,
              `$1${descDe}$2`
            )
            .replace(
              /(<meta property="og:url" content=")[^"]*(")/,
              `$1${pageUrl}$2`
            )
            .replace(
              /(<meta name="twitter:title" content=")[^"]*(")/,
              `$1${titleEn}$2`
            )
            .replace(
              /(<meta name="twitter:description" content=")[^"]*(")/,
              `$1${descDe}$2`
            )
            .replace(
              /(<link rel="canonical" href=")[^"]*(")/,
              `$1${pageUrl}$2`
            );
        }
      }
      return html;
    },
  },
});
