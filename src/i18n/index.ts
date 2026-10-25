// Đa ngôn ngữ: tiếng Việt (mặc định, URL gốc), tiếng Anh (/en/), tiếng Trung giản thể (/zh/), tiếng Hàn (/ko/),
// tiếng Indonesia (/id/).
export const LANGS = ['vi', 'en', 'zh', 'ko', 'id'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'vi';
/** Các ngôn ngữ có URL riêng dưới /{lang}/ */
export const PREFIXED_LANGS = LANGS.filter((l) => l !== DEFAULT_LANG);

export const LANG_LABELS: Record<Lang, string> = { vi: 'Tiếng Việt', en: 'English', zh: '简体中文', ko: '한국어', id: 'Bahasa Indonesia' };
/** Nhãn ngắn cho màn hình hẹp */
export const LANG_SHORT: Record<Lang, string> = { vi: 'VI', en: 'EN', zh: '中文', ko: '한국어', id: 'ID' };
/** Mã BCP 47 dùng cho <html lang> và hreflang */
export const HTML_LANGS: Record<Lang, string> = { vi: 'vi', en: 'en', zh: 'zh-Hans', ko: 'ko', id: 'id' };
export const OG_LOCALES: Record<Lang, string> = { vi: 'vi_VN', en: 'en_US', zh: 'zh_CN', ko: 'ko_KR', id: 'id_ID' };

const isLang = (s: string | undefined): s is Lang => (LANGS as readonly string[]).includes(s ?? '');

/** Ngôn ngữ của trang hiện tại, lấy từ Astro.currentLocale. */
export const getLang = (astro: { currentLocale?: string }): Lang =>
  isLang(astro.currentLocale) ? astro.currentLocale : DEFAULT_LANG;

/** Chọn bản dịch theo ngôn ngữ: pick(lang, { vi: …, en: …, zh: …, ko: …, id: … }). */
export const pick = <T>(lang: Lang, v: Record<Lang, T>): T => v[lang];

const PREFIX = new RegExp(`^/(${PREFIXED_LANGS.join('|')})(?=/|$)`);

/** Bỏ tiền tố ngôn ngữ: "/en/kanji" → "/kanji". */
export const stripLang = (path: string) => path.replace(PREFIX, '') || '/';

/** Đường dẫn của trang ở ngôn ngữ cho trước: localize("/kanji", "en") → "/en/kanji". */
export const localize = (path: string, lang: Lang) => {
  const base = stripLang(path);
  if (lang === DEFAULT_LANG) return base;
  return base === '/' ? `/${lang}` : `/${lang}${base}`;
};

/** Hàm tạo link theo ngôn ngữ cho một trang: const l = linker(lang); l('/kanji'). */
export const linker = (lang: Lang) => (path: string) => localize(path, lang);
