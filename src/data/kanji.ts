import raw from './generated/kanji.json';
import themesRaw from './themes.json';

export type Kanji = {
  c: string;
  /** Âm Hán Việt */
  hv: string[];
  en: string[];
  on: string[];
  kun: string[];
  strokes: number;
  /** Số thứ tự bộ thủ Khang Hy (1–214) */
  rad: number;
  /** Cấp lớp theo KANJIDIC2: 1–6 tiểu học, 8 trung học, 9–10 jinmeiyō */
  grade: number | null;
  jlpt: number | null;
  freq: number | null;
};

export const ALL: Kanji[] = raw as Kanji[];
export const BY_CHAR = new Map(ALL.map((k) => [k.c, k]));

export const JOYO = ALL.filter((k) => k.grade !== null && k.grade <= 8);

// ---------- JLPT ----------
export const JLPT_LEVELS = [5, 4, 3, 2, 1] as const;
export const jlptSlug = (n: number) => `n${n}`;
export const byJlpt = (n: number) => ALL.filter((k) => k.jlpt === n);

// ---------- Cấp lớp & Kanken ----------
export const GRADE_LABELS: Record<number, string> = {
  1: 'Lớp 1',
  2: 'Lớp 2',
  3: 'Lớp 3',
  4: 'Lớp 4',
  5: 'Lớp 5',
  6: 'Lớp 6',
  8: 'Trung học',
};

// Kanken cấp 10–5 trùng với bảng kanji theo lớp của tiểu học Nhật.
// KANJIDIC2 không tách riêng các cấp 4, 3, 準2, 2 nên tạm gộp phần trung học.
export type KankenGroup = { slug: string; name: string; note: string; match: (k: Kanji) => boolean };
export const KANKEN: KankenGroup[] = [
  ...[1, 2, 3, 4, 5, 6].map((g) => ({
    slug: `${11 - g}-kyu`,
    name: `${11 - g}級`,
    note: `Kanji lớp ${g} tiểu học`,
    match: (k: Kanji) => k.grade === g,
  })),
  {
    slug: '4-2-kyu',
    name: '4級 – 2級',
    note: 'Phần còn lại của bảng jōyō (trung học)',
    match: (k) => k.grade === 8,
  },
  {
    slug: 'jun1-1-kyu',
    name: '準1級 – 1級',
    note: 'Ngoài jōyō (chủ yếu là chữ dùng trong tên người)',
    match: (k) => k.grade === null || k.grade > 8,
  },
];

// ---------- Bộ thủ ----------
// Tên Hán Việt của 214 bộ thủ Khang Hy, theo thứ tự.
const RADICAL_NAMES =
  'Nhất Cổn Chủ Phiệt Ất Quyết Nhị Đầu Nhân Nhi Nhập Bát Quynh Mịch Băng Kỷ Khảm Đao Lực Bao Chủy Phương Hễ Thập Bốc Tiết Hán Khư Hựu Khẩu Vi Thổ Sĩ Truy Tuy Tịch Đại Nữ Tử Miên Thốn Tiểu Uông Thi Triệt Sơn Xuyên Công Kỷ Cân Can Yêu Nghiễm Dẫn Củng Dặc Cung Kệ Sam Xích Tâm Qua Hộ Thủ Chi Phộc Văn Đẩu Cân Phương Vô Nhật Viết Nguyệt Mộc Khiếm Chỉ Đãi Thù Vô Tỷ Mao Thị Khí Thủy Hỏa Trảo Phụ Hào Tường Phiến Nha Ngưu Khuyển Huyền Ngọc Qua Ngõa Cam Sinh Dụng Điền Thất Nạch Bát Bạch Bì Mãnh Mục Mâu Thỉ Thạch Thị Nhựu Hòa Huyệt Lập Trúc Mễ Mịch Phẫu Võng Dương Vũ Lão Nhi Lỗi Nhĩ Duật Nhục Thần Tự Chí Cữu Thiệt Suyễn Chu Cấn Sắc Thảo Hô Trùng Huyết Hành Y Á Kiến Giác Ngôn Cốc Đậu Thỉ Trãi Bối Xích Tẩu Túc Thân Xa Tân Thần Sước Ấp Dậu Biện Lý Kim Trường Môn Phụ Đãi Chuy Vũ Thanh Phi Diện Cách Vi Cửu Âm Hiệt Phong Phi Thực Thủ Hương Mã Cốt Cao Bưu Đấu Sưởng Cách Quỷ Ngư Điểu Lỗ Lộc Mạch Ma Hoàng Thử Hắc Chỉ Mãnh Đỉnh Cổ Thử Tỵ Tề Xỉ Long Quy Dược'.split(
    ' ',
  );
if (RADICAL_NAMES.length !== 214) throw new Error(`Cần 214 tên bộ thủ, có ${RADICAL_NAMES.length}`);

export type Radical = { n: number; char: string; name: string; kanji: Kanji[] };

export const RADICALS: Radical[] = RADICAL_NAMES.map((name, i) => ({
  n: i + 1,
  // Khối Unicode "Kangxi Radicals" (U+2F00…) chuẩn hoá NFKC ra chữ Hán thường.
  char: String.fromCodePoint(0x2f00 + i).normalize('NFKC'),
  name,
  kanji: ALL.filter((k) => k.rad === i + 1),
}));

// ---------- Chủ đề ----------
export type Theme = { slug: string; name: string; kanji: Kanji[] };
export const THEMES: Theme[] = themesRaw.map((t) => ({
  slug: t.slug,
  name: t.name,
  kanji: [...t.kanji].map((c) => BY_CHAR.get(c)).filter((k): k is Kanji => !!k),
}));

// ---------- Tiện ích hiển thị ----------
export const hvText = (k: Kanji) => k.hv.join(', ');
/** KANJIDIC2 dùng "." để tách okurigana (た.べる). Bỏ dấu chấm và các bản trùng. */
export const kunPlain = (k: Kanji) => [...new Set(k.kun.map((r) => r.replace('.', '')))];
export const kanjiUrl = (c: string) => `/kanji/${c}`;
