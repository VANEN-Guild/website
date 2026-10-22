// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL und BASE_PATH werden im GitHub-Workflow gesetzt.
// Lokal (npm run dev) läuft die Seite unter "/".
const site = process.env.SITE_URL || 'https://www.vanen.info';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'file' },
  // Alte Adressen umbenannter Seiten (Ziel braucht den Base-Path, Astro ergänzt ihn hier nicht)
  redirects: {
    '/news/world-of-wacraft-forever': `${base.replace(/\/$/, '')}/news/world-of-warcraft-forever`,
  },
  integrations: [sitemap()],
});
