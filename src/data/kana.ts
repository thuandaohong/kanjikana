// Bảng kana. Mỗi ô là [hiragana, romaji] hoặc null cho ô trống.
// Katakana suy ra từ hiragana bằng cách cộng 0x60 vào mã Unicode.
export type Cell = [string, string] | null;
export type KanaTable = { title: string; note?: string; cols: number; rows: Cell[][] };

const row = (s: string, romaji: string): Cell[] => {
  const r = romaji.split(' ');
  return [...s].map((ch, i) => (ch === '・' ? null : [ch, r[i]]));
};

const GOJUON: Cell[][] = [
  row('あいうえお', 'a i u e o'),
  row('かきくけこ', 'ka ki ku ke ko'),
  row('さしすせそ', 'sa shi su se so'),
  row('たちつてと', 'ta chi tsu te to'),
  row('なにぬねの', 'na ni nu ne no'),
  row('はひふへほ', 'ha hi fu he ho'),
  row('まみむめも', 'ma mi mu me mo'),
  row('や・ゆ・よ', 'ya - yu - yo'),
  row('らりるれろ', 'ra ri ru re ro'),
  row('わ・・・を', 'wa - - - wo'),
  row('ん・・・・', 'n - - - -'),
];

const DAKUTEN: Cell[][] = [
  row('がぎぐげご', 'ga gi gu ge go'),
  row('ざじずぜぞ', 'za ji zu ze zo'),
  row('だぢづでど', 'da ji zu de do'),
  row('ばびぶべぼ', 'ba bi bu be bo'),
  row('ぱぴぷぺぽ', 'pa pi pu pe po'),
];

const YOON_BASE: [string, string][] = [
  ['き', 'ky'], ['し', 'sh'], ['ち', 'ch'], ['に', 'ny'], ['ひ', 'hy'], ['み', 'my'], ['り', 'ry'],
  ['ぎ', 'gy'], ['じ', 'j'], ['び', 'by'], ['ぴ', 'py'],
];
const YOON: Cell[][] = YOON_BASE.map(([k, r]) =>
  (['ゃ', 'ゅ', 'ょ'] as const).map((small, i) => [k + small, r + ['a', 'u', 'o'][i]] as Cell),
);

// Âm mở rộng chỉ dùng trong katakana (chủ yếu cho từ mượn).
const EXTENDED: Cell[][] = [
  [['ファ', 'fa'], ['フィ', 'fi'], ['フェ', 'fe'], ['フォ', 'fo']],
  [['ティ', 'ti'], ['ディ', 'di'], ['トゥ', 'tu'], ['ドゥ', 'du']],
  [['ウィ', 'wi'], ['ウェ', 'we'], ['ウォ', 'wo'], ['ヴ', 'vu']],
  [['ヴァ', 'va'], ['ヴィ', 'vi'], ['ヴェ', 've'], ['ヴォ', 'vo']],
  [['シェ', 'she'], ['ジェ', 'je'], ['チェ', 'che'], null],
];

export const toKatakana = (s: string) =>
  [...s].map((ch) => (ch >= 'ぁ' && ch <= 'ゖ' ? String.fromCodePoint(ch.codePointAt(0)! + 0x60) : ch)).join('');

const convert = (rows: Cell[][]): Cell[][] => rows.map((r) => r.map((c) => (c ? [toKatakana(c[0]), c[1]] : null)));

export type Script = 'hiragana' | 'katakana';

export function kanaTables(script: Script): KanaTable[] {
  const conv = script === 'katakana' ? convert : (r: Cell[][]) => r;
  const tables: KanaTable[] = [
    { title: 'Âm cơ bản', note: 'Bảng gojūon (五十音) gồm 46 chữ.', cols: 5, rows: conv(GOJUON) },
    { title: 'Âm đục và bán đục', note: 'Thêm dấu ゛ (dakuten) hoặc ゜ (handakuten) vào âm cơ bản.', cols: 5, rows: conv(DAKUTEN) },
    { title: 'Âm ghép', note: 'Chữ có cột i ghép với ya, yu, yo viết nhỏ.', cols: 3, rows: conv(YOON) },
  ];
  if (script === 'katakana') {
    tables.push({ title: 'Âm mở rộng', note: 'Dùng để phiên âm từ nước ngoài.', cols: 4, rows: EXTENDED });
  }
  return tables;
}

export const SCRIPTS: Record<Script, { name: string; jp: string; lead: string; other: Script }> = {
  hiragana: {
    name: 'Hiragana',
    jp: 'ひらがな',
    lead: 'Hiragana là bảng chữ mềm, dùng cho từ thuần Nhật, trợ từ và đuôi động từ, tính từ. Đây là bảng chữ nên học đầu tiên.',
    other: 'katakana',
  },
  katakana: {
    name: 'Katakana',
    jp: 'カタカナ',
    lead: 'Katakana là bảng chữ cứng, chủ yếu dùng cho từ mượn nước ngoài, tên riêng nước ngoài và từ tượng thanh.',
    other: 'hiragana',
  },
};
