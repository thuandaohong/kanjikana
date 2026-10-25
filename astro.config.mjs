// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

// Đặt SITE_URL trong biến môi trường của Cloudflare Pages khi có domain thật.
const site = process.env.SITE_URL || 'https://kanjiba.pages.dev';

// Trang kanji không có từ vựng lẫn câu ví dụ được đặt noindex và bỏ khỏi sitemap
// (giữ khớp với isThinKanji trong src/data/kanji.ts).
const readJson = (f) => JSON.parse(readFileSync(new URL(`./src/data/generated/${f}`, import.meta.url), 'utf8'));
const vocab = readJson('vocab.json');
const sentences = readJson('sentences.json');
const thin = new Set(readJson('kanji.json').map((k) => k.c).filter((c) => !vocab[c]?.length && !sentences[c]?.length));
const isThinPage = (url) => {
  const m = decodeURIComponent(new URL(url).pathname).match(/\/kanji\/([^/]+)$/);
  return !!m && thin.has(m[1]);
};

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
      filter: (page) => !page.includes('/404') && !isThinPage(page),
      i18n: { defaultLocale: 'vi', locales: { vi: 'vi-VN', en: 'en-US', zh: 'zh-Hans', ko: 'ko-KR', id: 'id-ID' } },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
