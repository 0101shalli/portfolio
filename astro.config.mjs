// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Canonical URL used for the sitemap, RSS feed and social cards.
// Set SITE_URL in Vercel once your custom domain is live.
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://portfolio-indol-ten-20.vercel.app');

export default defineConfig({
  site,
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') })],
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
