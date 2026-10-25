// Cấu hình chung của site. Đổi tên/thương hiệu tại đây.
export const SITE = {
  name: 'kanjiviet',
  nameParts: ['kanji', 'viet'] as const,
  title: 'Kanjiviet – Học kanji dễ hơn',
  description:
    'Danh sách và công cụ miễn phí để học kanji và từ vựng tiếng Nhật. Phù hợp mọi trình độ.',
  lang: 'vi',
};

export type NavLink = { label: string; href: string; badge?: string };
export type NavGroup = { title?: string; links: NavLink[] };
export type NavMenu = { label: string; groups: NavGroup[] };

export const JLPT_LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'] as const;

export const NAV: NavMenu[] = [
  {
    label: 'Kanji',
    groups: [
      {
        title: 'Theo cấp JLPT',
        links: JLPT_LEVELS.map((l) => ({
          label: `JLPT ${l.toUpperCase()}`,
          href: `/kanji/jlpt/${l}`,
        })),
      },
      {
        title: 'Danh sách khác',
        links: [
          { label: 'Toàn bộ kanji jōyō', href: '/kanji/all' },
          { label: 'Theo cấp Kanken', href: '/kanji/kanken' },
          { label: 'Theo bộ thủ', href: '/kanji/radicals' },
          { label: 'Theo chủ đề', href: '/kanji/themes' },
          { label: 'Giới thiệu về kanji', href: '/kanji' },
        ],
      },
    ],
  },
  {
    label: 'Kana',
    groups: [
      {
        links: [
          { label: 'Hiragana', href: '/hiragana' },
          { label: 'Katakana', href: '/katakana' },
        ],
      },
    ],
  },
  {
    label: 'Công cụ',
    groups: [
      {
        links: [
          { label: 'Tạo furigana', href: '/tools/furigana' },
          { label: 'Tìm kanji', href: '/kanji/search' },
          { label: 'Flashcards', href: '/flashcards' },
        ],
      },
    ],
  },
];

export const FOOTER: { title: string; links: NavLink[] }[] = [
  {
    title: 'Kanji',
    links: [
      { label: 'Tất cả chữ', href: '/kanji/all' },
      { label: 'Theo cấp JLPT', href: '/kanji/jlpt' },
      { label: 'Theo cấp Kanken', href: '/kanji/kanken' },
      { label: 'Theo bộ thủ', href: '/kanji/radicals' },
      { label: 'Theo chủ đề', href: '/kanji/themes' },
    ],
  },
  {
    title: 'Kana',
    links: [
      { label: 'Hiragana', href: '/hiragana' },
      { label: 'Katakana', href: '/katakana' },
    ],
  },
  {
    title: 'Công cụ',
    links: [
      { label: 'Furigana', href: '/tools/furigana' },
      { label: 'Tìm kanji', href: '/kanji/search' },
      { label: 'Flashcards', href: '/flashcards' },
    ],
  },
  {
    title: 'Thông tin',
    links: [
      { label: 'Giới thiệu', href: '/about' },
      { label: 'Nguồn dữ liệu', href: '/credits' },
    ],
  },
];
