// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages: the deploy workflow sets these. With a custom domain,
// SITE_URL is the domain and BASE_URL is "/".
const base = process.env.BASE_URL ?? '/';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://freelance-cli3nts.github.io/yordan-website/',
  base,
  devToolbar: { enabled: false },
});
