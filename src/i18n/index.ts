// Đa ngôn ngữ: tiếng Việt (mặc định, URL gốc) và tiếng Anh (dưới /en/).
export const LANGS = ['vi', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'vi';

export const LANG_LABELS: Record<Lang, string> = { vi: 'Tiếng Việt', en: 'English' };
export const OG_LOCALES: Record<Lang, string> = { vi: 'vi_VN', en: 'en_US' };

/** Ngôn ngữ của trang hiện tại, lấy từ Astro.currentLocale. */
export const getLang = (astro: { currentLocale?: string }): Lang =>
  astro.currentLocale === 'en' ? 'en' : 'vi';

/** Chọn bản dịch theo ngôn ngữ: pick(lang, { vi: …, en: … }). */
export const pick = <T>(lang: Lang, v: Record<Lang, T>): T => v[lang];

/** Bỏ tiền tố ngôn ngữ: "/en/kanji" → "/kanji". */
export const stripLang = (path: string) => path.replace(/^\/en(?=\/|$)/, '') || '/';

/** Đường dẫn của trang ở ngôn ngữ cho trước: localize("/kanji", "en") → "/en/kanji". */
export const localize = (path: string, lang: Lang) => {
  const base = stripLang(path);
  if (lang === DEFAULT_LANG) return base;
  return base === '/' ? '/en' : `/en${base}`;
};

/** Hàm tạo link theo ngôn ngữ cho một trang: const l = linker(lang); l('/kanji'). */
export const linker = (lang: Lang) => (path: string) => localize(path, lang);
