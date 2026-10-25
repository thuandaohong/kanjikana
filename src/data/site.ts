// Cấu hình chung của site. Đổi tên/thương hiệu tại đây.
import { type Lang, linker, pick } from '../i18n';

export const SITE = {
  name: 'kanjiviet',
  nameParts: ['kanji', 'viet'] as const,
  title: {
    vi: 'Kanjiviet – Học kanji dễ hơn',
    en: 'Kanjiviet – Learn kanji the easy way',
  },
  description: {
    vi: 'Danh sách và công cụ miễn phí để học kanji và từ vựng tiếng Nhật. Phù hợp mọi trình độ.',
    en: 'Free lists and tools to learn Japanese kanji and vocabulary. Suitable for all levels.',
  },
};

export type NavLink = { label: string; href: string };
export type NavGroup = { title?: string; links: NavLink[] };
export type NavMenu = { label: string; groups: NavGroup[] };

const JLPT_LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'] as const;

export function nav(lang: Lang): NavMenu[] {
  const l = linker(lang);
  const t = (vi: string, en: string) => pick(lang, { vi, en });
  return [
    {
      label: 'Kanji',
      groups: [
        {
          title: t('Theo cấp JLPT', 'By JLPT level'),
          links: JLPT_LEVELS.map((n) => ({ label: `JLPT ${n.toUpperCase()}`, href: l(`/kanji/jlpt/${n}`) })),
        },
        {
          title: t('Danh sách khác', 'More lists'),
          links: [
            { label: t('Toàn bộ kanji jōyō', 'All jōyō kanji'), href: l('/kanji/all') },
            { label: t('Theo cấp Kanken', 'By Kanken level'), href: l('/kanji/kanken') },
            { label: t('Theo bộ thủ', 'By radical'), href: l('/kanji/radicals') },
            { label: t('Theo chủ đề', 'By theme'), href: l('/kanji/themes') },
            { label: t('Giới thiệu về kanji', 'About kanji'), href: l('/kanji') },
          ],
        },
      ],
    },
    {
      label: 'Kana',
      groups: [
        {
          links: [
            { label: 'Hiragana', href: l('/hiragana') },
            { label: 'Katakana', href: l('/katakana') },
          ],
        },
      ],
    },
    {
      label: t('Công cụ', 'Tools'),
      groups: [
        {
          links: [
            { label: t('Tạo furigana', 'Furigana generator'), href: l('/tools/furigana') },
            { label: t('Tìm kanji', 'Kanji search'), href: l('/kanji/search') },
            { label: 'Flashcards', href: l('/flashcards') },
          ],
        },
      ],
    },
  ];
}

export function footer(lang: Lang): { title: string; links: NavLink[] }[] {
  const l = linker(lang);
  const t = (vi: string, en: string) => pick(lang, { vi, en });
  return [
    {
      title: 'Kanji',
      links: [
        { label: t('Tất cả chữ', 'All characters'), href: l('/kanji/all') },
        { label: t('Theo cấp JLPT', 'By JLPT level'), href: l('/kanji/jlpt') },
        { label: t('Theo cấp Kanken', 'By Kanken level'), href: l('/kanji/kanken') },
        { label: t('Theo bộ thủ', 'By radical'), href: l('/kanji/radicals') },
        { label: t('Theo chủ đề', 'By theme'), href: l('/kanji/themes') },
      ],
    },
    {
      title: 'Kana',
      links: [
        { label: 'Hiragana', href: l('/hiragana') },
        { label: 'Katakana', href: l('/katakana') },
      ],
    },
    {
      title: t('Công cụ', 'Tools'),
      links: [
        { label: 'Furigana', href: l('/tools/furigana') },
        { label: t('Tìm kanji', 'Kanji search'), href: l('/kanji/search') },
        { label: 'Flashcards', href: l('/flashcards') },
      ],
    },
    {
      title: t('Thông tin', 'About'),
      links: [
        { label: t('Giới thiệu', 'About'), href: l('/about') },
        { label: t('Nguồn dữ liệu', 'Credits'), href: l('/credits') },
      ],
    },
  ];
}
