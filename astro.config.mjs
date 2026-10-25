// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Đặt SITE_URL trong biến môi trường của Cloudflare Pages khi có domain thật.
const site = process.env.SITE_URL || 'https://kanjiviet.pages.dev';

export default defineConfig({
  site,
  // Xuất dạng /trang.html: Cloudflare Pages phục vụ thẳng /trang, không cần chuyển hướng
  // sang /trang/ như khi dùng /trang/index.html.
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  vite: { plugins: [tailwindcss()] },
});
