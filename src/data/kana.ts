import { type Lang, pick } from '../i18n';

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

export function kanaTables(script: Script, lang: Lang): KanaTable[] {
  const conv = script === 'katakana' ? convert : (r: Cell[][]) => r;
  const t = (vi: string, en: string, zh: string, ko: string, id: string) => pick(lang, { vi, en, zh, ko, id });
  const tables: KanaTable[] = [
    {
      title: t('Âm cơ bản', 'Basic sounds', '清音', '기본음', 'Bunyi dasar'),
      note: t('Bảng gojūon (五十音) gồm 46 chữ.', 'The gojūon (五十音) table of 46 characters.', '五十音图，共 46 个假名。', '46자로 된 오십음도(五十音)입니다.', 'Tabel gojūon (五十音) yang terdiri dari 46 huruf.'),
      cols: 5,
      rows: conv(GOJUON),
    },
    {
      title: t('Âm đục và bán đục', 'Voiced sounds', '浊音与半浊音', '탁음과 반탁음', 'Bunyi bersuara'),
      note: t(
        'Thêm dấu ゛ (dakuten) hoặc ゜ (handakuten) vào âm cơ bản.',
        'Add ゛ (dakuten) or ゜ (handakuten) to a basic sound.',
        '在清音上加 ゛（浊点）或 ゜（半浊点）。',
        '기본음에 ゛(탁점) 또는 ゜(반탁점)을 붙입니다.',
        'Tambahkan ゛ (dakuten) atau ゜ (handakuten) pada bunyi dasar.',
      ),
      cols: 5,
      rows: conv(DAKUTEN),
    },
    {
      title: t('Âm ghép', 'Combined sounds', '拗音', '요음', 'Bunyi gabungan'),
      note: t('Chữ có cột i ghép với ya, yu, yo viết nhỏ.', 'An i-column character followed by a small ya, yu or yo.', 'い段假名后接小写的 ya、yu、yo。', 'い단 글자 뒤에 작은 ya, yu, yo를 붙입니다.', 'Huruf berkolom i yang diikuti ya, yu, atau yo kecil.'),
      cols: 3,
      rows: conv(YOON),
    },
  ];
  if (script === 'katakana') {
    tables.push({
      title: t('Âm mở rộng', 'Extended sounds', '外来语扩展音', '확장음', 'Bunyi tambahan'),
      note: t('Dùng để phiên âm từ nước ngoài.', 'Used to write sounds from foreign words.', '用于书写外来语的发音。', '외래어 발음을 표기할 때 씁니다.', 'Dipakai untuk menulis bunyi dari kata asing.'),
      cols: 4,
      rows: EXTENDED,
    });
  }
  return tables;
}

export const SCRIPTS: Record<Script, { name: Record<Lang, string>; jp: string; lead: Record<Lang, string>; other: Script }> = {
  hiragana: {
    name: { vi: 'Hiragana', en: 'Hiragana', zh: '平假名', ko: '히라가나', id: 'Hiragana' },
    jp: 'ひらがな',
    lead: {
      vi: 'Hiragana là bảng chữ mềm, dùng cho từ thuần Nhật, trợ từ và đuôi động từ, tính từ. Đây là bảng chữ nên học đầu tiên.',
      en: 'Hiragana is the cursive syllabary used for native Japanese words, particles and verb and adjective endings. It is the first script to learn.',
      zh: '平假名是圆润的音节文字，用于和语词、助词以及动词和形容词的词尾，是最先要学的文字。',
      ko: '히라가나는 둥근 모양의 음절 문자로, 고유 일본어, 조사, 동사·형용사 어미에 쓰입니다. 가장 먼저 배우는 문자입니다.',
      id: 'Hiragana adalah aksara suku kata berbentuk lengkung untuk kata asli bahasa Jepang, partikel, serta akhiran kata kerja dan kata sifat. Ini aksara pertama yang sebaiknya dipelajari.',
    },
    other: 'katakana',
  },
  katakana: {
    name: { vi: 'Katakana', en: 'Katakana', zh: '片假名', ko: '가타카나', id: 'Katakana' },
    jp: 'カタカナ',
    lead: {
      vi: 'Katakana là bảng chữ cứng, chủ yếu dùng cho từ mượn nước ngoài, tên riêng nước ngoài và từ tượng thanh.',
      en: 'Katakana is the angular syllabary, mostly used for loanwords, foreign names and onomatopoeia.',
      zh: '片假名是棱角分明的音节文字，主要用于外来语、外国人名和拟声词。',
      ko: '가타카나는 각진 모양의 음절 문자로, 주로 외래어, 외국 이름, 의성어에 쓰입니다.',
      id: 'Katakana adalah aksara suku kata berbentuk kaku, terutama untuk kata serapan, nama asing, dan onomatope.',
    },
    other: 'hiragana',
  },
};
