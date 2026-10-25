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
  // Tiếng Việt ở URL gốc, tiếng Anh dưới /en/.
  i18n: {
    defaultLocale: 'vi',
    locales: ['vi', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      i18n: { defaultLocale: 'vi', locales: { vi: 'vi-VN', en: 'en-US' } },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
