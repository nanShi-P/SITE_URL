import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

const siteUrl = process.env.SITE_URL || 'https://example.github.io';
const base = new URL(siteUrl).pathname.replace(/\/$/, '') || '/';

export default defineConfig({
  site: siteUrl,
  base,
  integrations: [tailwind(), sitemap()],
  output: 'static',
});
