// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Đặt SITE_URL trong biến môi trường của Cloudflare Pages khi có domain thật.
const site = process.env.SITE_URL || 'https://kanjiba.pages.dev';

export default defineConfig({
  site,
  // Xuất dạng /trang.html: Cloudflare Pages phục vụ thẳng /trang, không cần chuyển hướng
  // sang /trang/ như khi dùng /trang/index.html.
  trailingSlash: 'never',
  build: { format: 'file' },
  // Tiếng Việt ở URL gốc; tiếng Anh, Trung, Hàn, Indonesia dưới /en/, /zh/, /ko/, /id/.
  i18n: {
    defaultLocale: 'vi',
    locales: ['vi', 'en', 'zh', 'ko', 'id'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      i18n: { defaultLocale: 'vi', locales: { vi: 'vi-VN', en: 'en-US', zh: 'zh-Hans', ko: 'ko-KR', id: 'id-ID' } },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
