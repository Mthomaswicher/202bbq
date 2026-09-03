import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { siteData } from './scripts/site-data.js';

/**
 * Structured data, the <noscript> fallback and sitemap.xml are generated from
 * the same data files the React app renders, so they can never disagree with
 * the page (phone number, menu, FAQ, events).
 */
function siteDataPlugin() {
  return {
    name: '202bbq-site-data',
    transformIndexHtml(html) {
      const { jsonLd, noscript } = siteData();
      return html
        .replace('<!--JSONLD-->', jsonLd.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n  '))
        .replace('<!--NOSCRIPT-->', noscript);
    },
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://202barbecue.com/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), siteDataPlugin()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['react', 'react-dom'] },
      },
    },
  },
});
