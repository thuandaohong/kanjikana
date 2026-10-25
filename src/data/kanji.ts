import raw from './generated/kanji.json';
import themesRaw from './themes.json';
import strokesRaw from './generated/strokes.json';
import vocabRaw from './generated/vocab.json';
import radicalsRaw from './generated/radicals.json';
import kankenRaw from './generated/kanken.json';
import radicalInfoRaw from './radicals-info.json';
import radicalStrokesRaw from './generated/radical-strokes.json';
import radicalExtraRaw from './generated/radical-extra.json';
import meaningsVi from './meanings/vi.json';
import meaningsZh from './meanings/zh.json';
import meaningsKo from './meanings/ko.json';
import meaningsId from './meanings/id.json';
import wordsVi from './meanings/words-vi.json';
import wordsZh from './meanings/words-zh.json';
import wordsKo from './meanings/words-ko.json';
import wordsId from './meanings/words-id.json';
import sentencesRaw from './generated/sentences.json';
import sentencesVi from './meanings/sentences-vi.json';
import sentencesZh from './meanings/sentences-zh.json';
import sentencesKo from './meanings/sentences-ko.json';
import sentencesId from './meanings/sentences-id.json';
import { type Lang, localize, pick } from '../i18n';

export type Kanji = {
  c: string;
  /** Âm Hán Việt */
  hv: string[];
  /** Pinyin có dấu thanh điệu */
  py: string[];
  /** Âm Hán-Hàn (hangul) */
  ko: string[];
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
  g === 8
    ? pick(lang, { vi: 'Trung học', en: 'Secondary school', zh: '初高中', ko: '중고등학교', id: 'SMP–SMA' })
    : pick(lang, { vi: `Lớp ${g}`, en: `Grade ${g}`, zh: `${g}年级`, ko: `${g}학년`, id: `Kelas ${g}` });

// Kanken cấp 10–5 trùng với bảng kanji theo lớp của tiểu học Nhật. Phần jōyō trung học chia thành
// 4級, 3級, 準2級, 2級 theo src/data/generated/kanken.json (scripts/build-data.mjs).
// 準1級 và 1級 không có dữ liệu mở; chỉ gom các chữ ngoài jōyō mà site có.
/** Chữ jōyō trung học theo từng cấp Kanken: { "4": "…", "3": "…", "pre2": "…", "2": "…" } */
const KANKEN_SECONDARY = kankenRaw as Record<'4' | '3' | 'pre2' | '2', string>;
const SECONDARY_KANKEN: ['4' | '3' | 'pre2' | '2', string, Record<Lang, string>][] = [
  ['4', '4級', { vi: 'Trình độ đang học THCS', en: 'Junior high school level', zh: '初中在学程度', ko: '중학교 재학 수준', id: 'Tingkat SMP' }],
  ['3', '3級', { vi: 'Trình độ tốt nghiệp THCS', en: 'Junior high school graduate level', zh: '初中毕业程度', ko: '중학교 졸업 수준', id: 'Tingkat lulus SMP' }],
  ['pre2', '準2級', { vi: 'Trình độ đang học THPT', en: 'High school level', zh: '高中在学程度', ko: '고등학교 재학 수준', id: 'Tingkat SMA' }],
  ['2', '2級', { vi: 'Trình độ tốt nghiệp THPT, đủ toàn bộ jōyō', en: 'High school graduate level, all jōyō kanji', zh: '高中毕业程度，全部常用汉字', ko: '고등학교 졸업 수준, 상용한자 전체', id: 'Tingkat lulus SMA, semua kanji jōyō' }],
];
export type KankenGroup = { slug: string; name: string; note: Record<Lang, string>; match: (k: Kanji) => boolean };
export const KANKEN: KankenGroup[] = [
  ...[1, 2, 3, 4, 5, 6].map((g) => ({
    slug: `${11 - g}-kyu`,
    name: `${11 - g}級`,
    note: { vi: `Kanji lớp ${g} tiểu học`, en: `Elementary school grade ${g} kanji`, zh: `小学${g}年级汉字`, ko: `초등학교 ${g}학년 한자`, id: `Kanji kelas ${g} SD` },
    match: (k: Kanji) => k.grade === g,
  })),
  ...SECONDARY_KANKEN.map(([key, name, note]) => ({
    slug: `${key}-kyu`,
    name,
    note,
    match: (k: Kanji) => k.grade === 8 && KANKEN_SECONDARY[key].includes(k.c),
  })),
  {
    slug: 'jun1-1-kyu',
    name: '準1級 – 1級',
    note: {
      vi: 'Một phần: các chữ ngoài jōyō có trong site',
      en: 'Partial: the non-jōyō kanji on this site',
      zh: '部分：本站收录的常用汉字以外的字',
      ko: '일부: 이 사이트에 있는 상용한자 외 한자',
      id: 'Sebagian: kanji di luar jōyō yang ada di situs ini',
    },
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
// [pinyin, âm Hán-Hàn] của chữ đại diện mỗi bộ, do scripts/build-data.mjs tạo từ KANJIDIC2.
const RADICAL_READINGS = radicalsRaw as [string, string][];
if (RADICAL_NAMES.length !== 214 || RADICAL_NAMES_EN.length !== 214) throw new Error('Cần đủ 214 tên bộ thủ');

/** Vị trí của bộ trong chữ: 偏 trái, 旁 phải, 冠 trên, 脚 dưới, 垂 rủ trên-trái, 繞 bao dưới-trái, 構 bao quanh. */
export type RadicalPos = 'hen' | 'tsukuri' | 'kanmuri' | 'ashi' | 'tare' | 'nyou' | 'kamae' | 'other';
export type RadicalVariant = { c: string; ja: string; pos: RadicalPos };
/** Thông tin soạn tay trong src/data/radicals-info.json: tên tiếng Nhật, vị trí, nghĩa, dạng biến thể. */
type RadicalInfo = { n: number; ja: string; pos: RadicalPos; meaning: Record<Exclude<Lang, 'en'>, string>; variants: RadicalVariant[] };
const RADICAL_INFO = radicalInfoRaw as RadicalInfo[];
/**
 * Chữ khác thuộc một bộ, ngoài danh sách của site: [chữ, nhóm, Hán Việt, pinyin, âm Hán-Hàn, nghĩa EN, on, kun].
 * Nhóm 0: chữ nhân danh hoặc có xếp hạng tần suất; 1: JIS cấp 1; 2: JIS cấp 2 (ít gặp).
 */
export type RadicalExtra = [string, 0 | 1 | 2, string, string, string, string, string, string];
const RADICAL_EXTRA = radicalExtraRaw as unknown as Record<string, RadicalExtra[]>;
/** Nhãn ngắn dưới ô chữ: âm đọc theo ngôn ngữ của người học, hoặc nghĩa tiếng Anh đầu tiên. */
export const extraLabel = ([, , hv, py, ko, en]: RadicalExtra, lang: Lang) =>
  pick(lang, { vi: hv, en: '', zh: py, ko, id: '' }) || en.split(',')[0];

// 214 bộ Khang Hy xếp theo số nét: bộ đầu tiên của nhóm 1, 2, 3… 17 nét.
const STROKE_GROUP_START = [1, 7, 30, 61, 95, 118, 147, 167, 176, 187, 195, 201, 205, 209, 211, 212, 214];
const radicalStrokeCount = (n: number) => STROKE_GROUP_START.filter((start) => start <= n).length;

export type Radical = {
  n: number;
  char: string;
  name: string;
  nameEn: string;
  py: string;
  ko: string;
  /** Số nét */
  strokes: number;
  /** Tên bộ thủ tiếng Nhật (hiragana) */
  ja: string;
  pos: RadicalPos;
  meaning: Record<Exclude<Lang, 'en'>, string>;
  variants: RadicalVariant[];
  kanji: Kanji[];
  /** Chữ khác thuộc bộ, không có trang riêng (xem RadicalExtra). */
  extra: RadicalExtra[];
};

export const RADICALS: Radical[] = RADICAL_NAMES.map((name, i) => ({
  n: i + 1,
  // Khối Unicode "Kangxi Radicals" (U+2F00…) chuẩn hoá NFKC ra chữ Hán thường.
  char: String.fromCodePoint(0x2f00 + i).normalize('NFKC'),
  name,
  nameEn: RADICAL_NAMES_EN[i],
  py: RADICAL_READINGS[i][0],
  ko: RADICAL_READINGS[i][1],
  strokes: radicalStrokeCount(i + 1),
  ja: RADICAL_INFO[i].ja,
  pos: RADICAL_INFO[i].pos,
  meaning: RADICAL_INFO[i].meaning,
  variants: RADICAL_INFO[i].variants,
  kanji: ALL.filter((k) => k.rad === i + 1),
  extra: RADICAL_EXTRA[i + 1] ?? [],
}));
if (RADICAL_INFO.some((r, i) => r.n !== i + 1)) throw new Error('radicals-info.json phải đủ 214 bộ theo thứ tự');

/** Nghĩa của bộ thủ theo ngôn ngữ trang (bản tiếng Anh dùng tên Unicode). */
export const radicalMeaning = (r: Radical, lang: Lang) => (lang === 'en' ? r.nameEn : r.meaning[lang]);
/** Path SVG thứ tự nét của chữ bộ thủ và các dạng biến thể (KanjiVG). */
export const RADICAL_STROKES = radicalStrokesRaw as Record<string, string[]>;
export const RADICAL_POS_LABEL: Record<RadicalPos, Record<Lang, string>> = {
  hen: { vi: 'Bên trái (偏)', en: 'Left side (hen)', zh: '左侧（偏）', ko: '왼쪽 (변)', id: 'Kiri (hen)' },
  tsukuri: { vi: 'Bên phải (旁)', en: 'Right side (tsukuri)', zh: '右侧（旁）', ko: '오른쪽 (방)', id: 'Kanan (tsukuri)' },
  kanmuri: { vi: 'Phía trên (冠)', en: 'Top (kanmuri)', zh: '上部（冠）', ko: '위쪽 (머리)', id: 'Atas (kanmuri)' },
  ashi: { vi: 'Phía dưới (脚)', en: 'Bottom (ashi)', zh: '下部（脚）', ko: '아래쪽 (발)', id: 'Bawah (ashi)' },
  tare: { vi: 'Rủ từ trên xuống bên trái (垂)', en: 'Top-left hanging (tare)', zh: '左上包围（垂）', ko: '엄 (위·왼쪽을 덮음)', id: 'Menaungi kiri atas (tare)' },
  nyou: { vi: 'Bao phía dưới bên trái (繞)', en: 'Bottom-left wrap (nyō)', zh: '左下包围（繞）', ko: '받침 (아래·왼쪽을 감쌈)', id: 'Melingkar kiri bawah (nyō)' },
  kamae: { vi: 'Bao quanh (構)', en: 'Enclosure (kamae)', zh: '包围（构）', ko: '몸 (둘러쌈)', id: 'Mengelilingi (kamae)' },
  other: { vi: 'Đứng riêng hoặc nhiều vị trí', en: 'Standalone or varies', zh: '独立或位置不定', ko: '단독 또는 여러 위치', id: 'Berdiri sendiri / bervariasi' },
};
/** "1 nét" / "1 stroke" / "1 画" / "1획" / "1 goresan" */
export const strokeLabel = (n: number, lang: Lang) =>
  pick(lang, { vi: `${n} nét`, en: `${n} ${n === 1 ? 'stroke' : 'strokes'}`, zh: `${n} 画`, ko: `${n}획`, id: `${n} goresan` });

/** Tên bộ thủ để hiển thị: "Bộ Nhân" / "Radical “man”" / "人部" / "人 부수" */
export const radicalTitle = (r: Radical, lang: Lang) =>
  pick(lang, { vi: `Bộ ${r.name}`, en: `Radical “${r.nameEn}”`, zh: `${r.char}部`, ko: `${r.char} 부수`, id: `Radikal “${r.nameEn}”` });
/** Tên ngắn: "Nhân" / "man" / "rén" / "인". Bộ không có âm đọc thì dùng tên tiếng Anh. */
export const radicalName = (r: Radical, lang: Lang) =>
  pick(lang, { vi: r.name, en: r.nameEn, zh: r.py || r.nameEn, ko: r.ko || r.nameEn, id: r.nameEn });
/** Tên kèm chữ bộ thủ, mỗi chữ chỉ xuất hiện một lần: "Bộ Nhân 人" / "人部" */
export const radicalLabel = (r: Radical, lang: Lang) =>
  lang === 'zh' || lang === 'ko' ? radicalTitle(r, lang) : `${radicalTitle(r, lang)} ${r.char}`;

// ---------- Chủ đề ----------
export type Theme = { slug: string; name: Record<Lang, string>; kanji: Kanji[] };
export const THEMES: Theme[] = themesRaw.map((t) => ({
  slug: t.slug,
  name: { vi: t.name, en: t.name_en, zh: t.name_zh, ko: t.name_ko, id: t.name_id },
  kanji: [...t.kanji].map((c) => BY_CHAR.get(c)).filter((k): k is Kanji => !!k),
}));

// ---------- Tiện ích hiển thị ----------
export const hvText = (k: Kanji) => k.hv.join(', ');
/** Âm đọc theo ngôn ngữ của người học: Hán Việt (vi), pinyin (zh), âm Hán-Hàn (ko). Tiếng Anh, Indonesia không có. */
export const localReadings = (k: Kanji, lang: Lang): string[] | null =>
  pick(lang, { vi: k.hv, en: null, zh: k.py, ko: k.ko, id: null });
// ---------- Nghĩa theo ngôn ngữ ----------
// Nghĩa tiếng Việt, Trung, Hàn, Indonesia dịch (có hỗ trợ AI) từ nghĩa tiếng Anh của KANJIDIC2.
// Chữ nào chưa có bản dịch thì dùng nghĩa tiếng Anh.
export const MEANINGS: Record<Exclude<Lang, 'en'>, Record<string, string>> = {
  vi: meaningsVi as Record<string, string>,
  zh: meaningsZh as Record<string, string>,
  ko: meaningsKo as Record<string, string>,
  id: meaningsId as Record<string, string>,
};
/** Nghĩa đã dịch sang ngôn ngữ của trang, hoặc null nếu chưa có (bản tiếng Anh luôn là null). */
export const localMeaning = (k: Kanji, lang: Lang): string | null => (lang === 'en' ? null : MEANINGS[lang][k.c] || null);
/** Nghĩa để hiển thị: bản dịch nếu có, không thì tối đa `max` nghĩa tiếng Anh. */
export const meaningText = (k: Kanji, lang: Lang, max = 3) => localMeaning(k, lang) ?? k.en.slice(0, max).join(', ');

/** Tên cột/nhãn của âm đọc đó */
export const LOCAL_READING_LABEL: Record<Lang, string> = { vi: 'Hán Việt', en: '', zh: '拼音', ko: '한자음', id: '' };
/** Nhãn ngắn dưới mỗi ô kanji: âm đọc của người học, hoặc nghĩa đầu tiên (en, id, hoặc khi thiếu âm đọc). */
export const shortLabel = (k: Kanji, lang: Lang) =>
  localReadings(k, lang)?.[0] ?? localMeaning(k, lang)?.split(/[,、]/)[0].trim() ?? k.en[0] ?? '';
/** KANJIDIC2 dùng "." để tách okurigana (た.べる). Bỏ dấu chấm và các bản trùng. */
export const kunPlain = (k: Kanji) => [...new Set(k.kun.map((r) => r.replace('.', '')))];
export const kanjiUrl = (c: string, lang: Lang) => localize(`/kanji/${c}`, lang);
/** "79 kanji" / "79 个汉字" / "한자 79자" */
export const kanjiCount = (n: number, lang: Lang) =>
  pick(lang, { vi: `${n} kanji`, en: `${n} kanji`, zh: `${n} 个汉字`, ko: `한자 ${n}자`, id: `${n} kanji` });

// ---------- Thứ tự nét & từ vựng ----------
/** Path SVG của từng nét (khung 109×109, KanjiVG) */
export const STROKES = strokesRaw as Record<string, string[]>;

/** [từ, cách đọc, nghĩa tiếng Anh, cấp JLPT] */
export type Word = [string, string, string, number];
export const VOCAB = vocabRaw as unknown as Record<string, Word[]>;

// Nghĩa từ vựng ví dụ theo ngôn ngữ, khoá "từ|cách đọc" (dịch có hỗ trợ AI từ nghĩa tiếng Anh).
const WORD_MEANINGS: Record<Exclude<Lang, 'en'>, Record<string, string>> = {
  vi: wordsVi as Record<string, string>,
  zh: wordsZh as Record<string, string>,
  ko: wordsKo as Record<string, string>,
  id: wordsId as Record<string, string>,
};
/** Nghĩa của một từ ví dụ ở ngôn ngữ của trang, hoặc null nếu chưa có bản dịch (dùng nghĩa tiếng Anh). */
export const wordMeaning = ([word, reading]: Word, lang: Lang): string | null =>
  lang === 'en' ? null : WORD_MEANINGS[lang][`${word}|${reading}`] || null;

// ---------- Câu ví dụ (Tatoeba) ----------
/** Đoạn của câu: [chữ] hoặc [kanji, cách đọc] để hiện furigana. */
export type RubySegment = [string] | [string, string];
/** i: id câu trên Tatoeba; j: câu tiếng Nhật đã tách furigana; t: bản dịch có sẵn trên Tatoeba. */
export type Sentence = { i: number; j: RubySegment[]; t: Partial<Record<Lang, string>> };
/** Tối đa 3 câu cho mỗi kanji, do scripts/build-sentences.mjs tạo. */
export const SENTENCES = sentencesRaw as unknown as Record<string, Sentence[]>;

// Bản dịch câu do AI dịch (khi Tatoeba chưa có), đổi sang giản thể hoặc sửa lỗi; khoá là id câu.
const SENTENCE_FIXES: Record<Exclude<Lang, 'en'>, Record<string, string>> = {
  vi: sentencesVi as Record<string, string>,
  zh: sentencesZh as Record<string, string>,
  ko: sentencesKo as Record<string, string>,
  id: sentencesId as Record<string, string>,
};
/**
 * Bản dịch của câu theo ngôn ngữ trang. `ai`: bản dịch do AI làm hoặc sửa;
 * `fallback`: chưa có bản dịch nên dùng tiếng Anh.
 */
export function sentenceTranslation(s: Sentence, lang: Lang): { text: string; ai: boolean; fallback: boolean } {
  if (lang !== 'en') {
    const fixed = SENTENCE_FIXES[lang][String(s.i)];
    if (fixed) return { text: fixed, ai: true, fallback: false };
    const own = s.t[lang];
    if (own) return { text: own, ai: false, fallback: false };
  }
  return { text: s.t.en ?? '', ai: false, fallback: lang !== 'en' };
}
