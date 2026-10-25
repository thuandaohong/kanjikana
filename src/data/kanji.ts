import raw from './generated/kanji.json';
import themesRaw from './themes.json';
import strokesRaw from './generated/strokes.json';
import vocabRaw from './generated/vocab.json';
import { type Lang, localize, pick } from '../i18n';

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
/** Các cấp lớp của bảng jōyō: 1–6 tiểu học, 8 trung học. */
export const JOYO_GRADES = [1, 2, 3, 4, 5, 6, 8] as const;
export const gradeLabel = (g: number, lang: Lang) =>
  g === 8 ? pick(lang, { vi: 'Trung học', en: 'Secondary school' }) : pick(lang, { vi: `Lớp ${g}`, en: `Grade ${g}` });

// Kanken cấp 10–5 trùng với bảng kanji theo lớp của tiểu học Nhật.
// KANJIDIC2 không tách riêng các cấp 4, 3, 準2, 2 nên tạm gộp phần trung học.
export type KankenGroup = { slug: string; name: string; note: Record<Lang, string>; match: (k: Kanji) => boolean };
export const KANKEN: KankenGroup[] = [
  ...[1, 2, 3, 4, 5, 6].map((g) => ({
    slug: `${11 - g}-kyu`,
    name: `${11 - g}級`,
    note: { vi: `Kanji lớp ${g} tiểu học`, en: `Elementary school grade ${g} kanji` },
    match: (k: Kanji) => k.grade === g,
  })),
  {
    slug: '4-2-kyu',
    name: '4級 – 2級',
    note: { vi: 'Phần còn lại của bảng jōyō (trung học)', en: 'Remaining jōyō kanji (secondary school)' },
    match: (k) => k.grade === 8,
  },
  {
    slug: 'jun1-1-kyu',
    name: '準1級 – 1級',
    note: { vi: 'Ngoài jōyō (chủ yếu là chữ dùng trong tên người)', en: 'Beyond jōyō (mostly name kanji)' },
    match: (k) => k.grade === null || k.grade > 8,
  },
];

// ---------- Bộ thủ ----------
// Tên Hán Việt của 214 bộ thủ Khang Hy, theo thứ tự.
const RADICAL_NAMES =
  'Nhất Cổn Chủ Phiệt Ất Quyết Nhị Đầu Nhân Nhi Nhập Bát Quynh Mịch Băng Kỷ Khảm Đao Lực Bao Chủy Phương Hễ Thập Bốc Tiết Hán Khư Hựu Khẩu Vi Thổ Sĩ Truy Tuy Tịch Đại Nữ Tử Miên Thốn Tiểu Uông Thi Triệt Sơn Xuyên Công Kỷ Cân Can Yêu Nghiễm Dẫn Củng Dặc Cung Kệ Sam Xích Tâm Qua Hộ Thủ Chi Phộc Văn Đẩu Cân Phương Vô Nhật Viết Nguyệt Mộc Khiếm Chỉ Đãi Thù Vô Tỷ Mao Thị Khí Thủy Hỏa Trảo Phụ Hào Tường Phiến Nha Ngưu Khuyển Huyền Ngọc Qua Ngõa Cam Sinh Dụng Điền Thất Nạch Bát Bạch Bì Mãnh Mục Mâu Thỉ Thạch Thị Nhựu Hòa Huyệt Lập Trúc Mễ Mịch Phẫu Võng Dương Vũ Lão Nhi Lỗi Nhĩ Duật Nhục Thần Tự Chí Cữu Thiệt Suyễn Chu Cấn Sắc Thảo Hô Trùng Huyết Hành Y Á Kiến Giác Ngôn Cốc Đậu Thỉ Trãi Bối Xích Tẩu Túc Thân Xa Tân Thần Sước Ấp Dậu Biện Lý Kim Trường Môn Phụ Đãi Chuy Vũ Thanh Phi Diện Cách Vi Cửu Âm Hiệt Phong Phi Thực Thủ Hương Mã Cốt Cao Bưu Đấu Sưởng Cách Quỷ Ngư Điểu Lỗ Lộc Mạch Ma Hoàng Thử Hắc Chỉ Mãnh Đỉnh Cổ Thử Tỵ Tề Xỉ Long Quy Dược'.split(
    ' ',
  );
// Tên tiếng Anh lấy từ tên ký tự Unicode của khối Kangxi Radicals (KANGXI RADICAL ONE → "one").
const RADICAL_NAMES_EN =
  'one|line|dot|slash|second|hook|two|lid|man|legs|enter|eight|down box|cover|ice|table|open box|knife|power|wrap|spoon|right open box|hiding enclosure|ten|divination|seal|cliff|private|again|mouth|enclosure|earth|scholar|go|go slowly|evening|big|woman|child|roof|inch|small|lame|corpse|sprout|mountain|river|work|oneself|turban|dry|short thread|dotted cliff|long stride|two hands|shoot|bow|snout|bristle|step|heart|halberd|door|hand|branch|rap|script|dipper|axe|square|not|sun|say|moon|tree|lack|stop|death|weapon|do not|compare|fur|clan|steam|water|fire|claw|father|double x|half tree trunk|slice|fang|cow|dog|profound|jade|melon|tile|sweet|life|use|field|bolt of cloth|sickness|dotted tent|white|skin|dish|eye|spear|arrow|stone|spirit|track|grain|cave|stand|bamboo|rice|silk|jar|net|sheep|feather|old|and|plow|ear|brush|meat|minister|self|arrive|mortar|tongue|oppose|boat|stopping|color|grass|tiger|insect|blood|walk enclosure|clothes|west|see|horn|speech|valley|bean|pig|badger|shell|red|run|foot|body|cart|bitter|morning|walk|city|wine|distinguish|village|gold|long|gate|mound|slave|short tailed bird|rain|blue|wrong|face|leather|tanned leather|leek|sound|leaf|wind|fly|eat|head|fragrant|horse|bone|tall|hair|fight|sacrificial wine|cauldron|ghost|fish|bird|salt|deer|wheat|hemp|yellow|millet|black|embroidery|frog|tripod|drum|rat|nose|even|tooth|dragon|turtle|flute'.split('|');
if (RADICAL_NAMES.length !== 214 || RADICAL_NAMES_EN.length !== 214) throw new Error('Cần đủ 214 tên bộ thủ');

export type Radical = { n: number; char: string; name: string; nameEn: string; kanji: Kanji[] };

export const RADICALS: Radical[] = RADICAL_NAMES.map((name, i) => ({
  n: i + 1,
  // Khối Unicode "Kangxi Radicals" (U+2F00…) chuẩn hoá NFKC ra chữ Hán thường.
  char: String.fromCodePoint(0x2f00 + i).normalize('NFKC'),
  name,
  nameEn: RADICAL_NAMES_EN[i],
  kanji: ALL.filter((k) => k.rad === i + 1),
}));

/** Tên bộ thủ để hiển thị: "Bộ Nhân" / "Radical “man”" */
export const radicalTitle = (r: Radical, lang: Lang) => pick(lang, { vi: `Bộ ${r.name}`, en: `Radical “${r.nameEn}”` });
/** Tên ngắn: "Nhân" / "man" */
export const radicalName = (r: Radical, lang: Lang) => pick(lang, { vi: r.name, en: r.nameEn });

// ---------- Chủ đề ----------
export type Theme = { slug: string; name: Record<Lang, string>; kanji: Kanji[] };
export const THEMES: Theme[] = themesRaw.map((t) => ({
  slug: t.slug,
  name: { vi: t.name, en: t.name_en },
  kanji: [...t.kanji].map((c) => BY_CHAR.get(c)).filter((k): k is Kanji => !!k),
}));

// ---------- Tiện ích hiển thị ----------
export const hvText = (k: Kanji) => k.hv.join(', ');
/** Nhãn ngắn dưới mỗi ô kanji: âm Hán Việt (vi) hoặc nghĩa đầu tiên (en). */
export const shortLabel = (k: Kanji, lang: Lang) => pick(lang, { vi: k.hv[0], en: k.en[0] }) ?? '';
/** KANJIDIC2 dùng "." để tách okurigana (た.べる). Bỏ dấu chấm và các bản trùng. */
export const kunPlain = (k: Kanji) => [...new Set(k.kun.map((r) => r.replace('.', '')))];
export const kanjiUrl = (c: string, lang: Lang) => localize(`/kanji/${c}`, lang);

// ---------- Thứ tự nét & từ vựng ----------
/** Path SVG của từng nét (khung 109×109, KanjiVG) */
export const STROKES = strokesRaw as Record<string, string[]>;

/** [từ, cách đọc, nghĩa tiếng Anh, cấp JLPT] */
export type Word = [string, string, string, number];
export const VOCAB = vocabRaw as unknown as Record<string, Word[]>;
