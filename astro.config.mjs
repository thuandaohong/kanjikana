// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://kanjiviet.pages.dev',
  trailingSlash: 'ignore',
  vite: { plugins: [tailwindcss()] },
});
