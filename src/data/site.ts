// Cấu hình chung của site. Đổi tên/thương hiệu tại đây.
import { type Lang, linker, pick } from '../i18n';

export const SITE = {
  name: 'kanjiba',
  /** Email liên hệ hiện ở trang Chính sách quyền riêng tư; để trống thì ẩn mục liên hệ. */
  contactEmail: '',
  nameParts: ['kanji', 'ba'] as const,
  title: {
    vi: 'Kanjiba – Học kanji dễ hơn',
    en: 'Kanjiba – Learn kanji the easy way',
    zh: 'Kanjiba – 轻松学日语汉字',
    ko: 'Kanjiba – 일본어 한자를 쉽게',
    id: 'Kanjiba – Belajar kanji dengan mudah',
  },
  description: {
    vi: 'Danh sách và công cụ miễn phí để học kanji và từ vựng tiếng Nhật. Phù hợp mọi trình độ.',
    en: 'Free lists and tools to learn Japanese kanji and vocabulary. Suitable for all levels.',
    zh: '免费的日语汉字与词汇学习列表和工具，适合各个水平的学习者。',
    ko: '일본어 한자와 어휘를 배우는 무료 목록과 도구. 모든 수준에 맞습니다.',
    id: 'Daftar dan alat gratis untuk belajar kanji dan kosakata bahasa Jepang. Cocok untuk semua level.',
  },
};

export type NavLink = { label: string; href: string };
export type NavGroup = { title?: string; links: NavLink[] };
export type NavMenu = { label: string; groups: NavGroup[] };

const JLPT_LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'] as const;

export function nav(lang: Lang): NavMenu[] {
  const l = linker(lang);
  const t = (vi: string, en: string, zh: string, ko: string, id: string) => pick(lang, { vi, en, zh, ko, id });
  return [
    {
      label: t('Kanji', 'Kanji', '汉字', '한자', 'Kanji'),
      groups: [
        {
          title: t('Theo cấp JLPT', 'By JLPT level', '按 JLPT 级别', 'JLPT 급수별', 'Per level JLPT'),
          links: JLPT_LEVELS.map((n) => ({ label: `JLPT ${n.toUpperCase()}`, href: l(`/kanji/jlpt/${n}`) })),
        },
        {
          title: t('Danh sách khác', 'More lists', '更多列表', '다른 목록', 'Daftar lainnya'),
          links: [
            { label: t('Toàn bộ kanji jōyō', 'All jōyō kanji', '全部常用汉字', '상용한자 전체', 'Semua kanji jōyō'), href: l('/kanji/all') },
            { label: t('Theo cấp Kanken', 'By Kanken level', '按汉检级别', '한자검정 급수별', 'Per level Kanken'), href: l('/kanji/kanken') },
            { label: t('Theo bộ thủ', 'By radical', '按部首', '부수별', 'Per radikal'), href: l('/kanji/radicals') },
            { label: t('Theo chủ đề', 'By theme', '按主题', '주제별', 'Per tema'), href: l('/kanji/themes') },
            { label: t('Giới thiệu về kanji', 'About kanji', '关于日语汉字', '일본 한자란', 'Tentang kanji'), href: l('/kanji') },
          ],
        },
      ],
    },
    {
      label: t('Kana', 'Kana', '假名', '가나', 'Kana'),
      groups: [
        {
          links: [
            { label: t('Hiragana', 'Hiragana', '平假名', '히라가나', 'Hiragana'), href: l('/hiragana') },
            { label: t('Katakana', 'Katakana', '片假名', '가타카나', 'Katakana'), href: l('/katakana') },
          ],
        },
      ],
    },
    {
      label: t('Công cụ', 'Tools', '工具', '도구', 'Alat'),
      groups: [
        {
          links: [
            { label: t('Tạo furigana', 'Furigana generator', '假名注音生成', '후리가나 생성기', 'Pembuat furigana'), href: l('/tools/furigana') },
            { label: t('Tìm kanji', 'Kanji search', '汉字搜索', '한자 검색', 'Cari kanji'), href: l('/kanji/search') },
            { label: t('Flashcards', 'Flashcards', '闪卡', '플래시카드', 'Flashcard'), href: l('/flashcards') },
            { label: t('Trắc nghiệm kanji', 'Kanji quiz', '汉字测验', '한자 퀴즈', 'Kuis kanji'), href: l('/tools/quiz') },
          ],
        },
      ],
    },
  ];
}

export function footer(lang: Lang): { title: string; links: NavLink[] }[] {
  const l = linker(lang);
  const t = (vi: string, en: string, zh: string, ko: string, id: string) => pick(lang, { vi, en, zh, ko, id });
  return [
    {
      title: t('Kanji', 'Kanji', '汉字', '한자', 'Kanji'),
      links: [
        { label: t('Tất cả chữ', 'All characters', '全部汉字', '한자 전체', 'Semua huruf'), href: l('/kanji/all') },
        { label: t('Theo cấp JLPT', 'By JLPT level', '按 JLPT 级别', 'JLPT 급수별', 'Per level JLPT'), href: l('/kanji/jlpt') },
        { label: t('Theo cấp Kanken', 'By Kanken level', '按汉检级别', '한자검정 급수별', 'Per level Kanken'), href: l('/kanji/kanken') },
        { label: t('Theo bộ thủ', 'By radical', '按部首', '부수별', 'Per radikal'), href: l('/kanji/radicals') },
        { label: t('Theo chủ đề', 'By theme', '按主题', '주제별', 'Per tema'), href: l('/kanji/themes') },
      ],
    },
    {
      title: t('Kana', 'Kana', '假名', '가나', 'Kana'),
      links: [
        { label: t('Hiragana', 'Hiragana', '平假名', '히라가나', 'Hiragana'), href: l('/hiragana') },
        { label: t('Katakana', 'Katakana', '片假名', '가타카나', 'Katakana'), href: l('/katakana') },
      ],
    },
    {
      title: t('Công cụ', 'Tools', '工具', '도구', 'Alat'),
      links: [
        { label: t('Furigana', 'Furigana', '假名注音', '후리가나', 'Furigana'), href: l('/tools/furigana') },
        { label: t('Tìm kanji', 'Kanji search', '汉字搜索', '한자 검색', 'Cari kanji'), href: l('/kanji/search') },
        { label: t('Flashcards', 'Flashcards', '闪卡', '플래시카드', 'Flashcard'), href: l('/flashcards') },
        { label: t('Trắc nghiệm kanji', 'Kanji quiz', '汉字测验', '한자 퀴즈', 'Kuis kanji'), href: l('/tools/quiz') },
      ],
    },
    {
      title: t('Thông tin', 'About', '信息', '정보', 'Info'),
      links: [
        { label: t('Giới thiệu', 'About', '关于', '소개', 'Tentang'), href: l('/about') },
        { label: t('Nguồn dữ liệu', 'Credits', '数据来源', '데이터 출처', 'Sumber data'), href: l('/credits') },
        { label: t('Quyền riêng tư', 'Privacy', '隐私政策', '개인정보 처리방침', 'Privasi'), href: l('/privacy') },
      ],
    },
  ];
}
