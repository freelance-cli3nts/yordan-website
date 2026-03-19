// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

const base = process.env.BASE_URL ?? '/';


// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  site: process.env.SITE_URL ?? 'https://example.com',
  base
});

