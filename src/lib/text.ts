// Tiện ích xử lý chuỗi dùng chung cho lúc build và trên trình duyệt.

/** Katakana → hiragana (giữ nguyên ký tự khác). */
export const toHiragana = (s: string) =>
  s.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));

/** Bỏ dấu tiếng Việt và chữ hoa: "Học" → "hoc", "Đại" → "dai". */
export const foldVi = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase();

const ROMAJI: Record<string, string> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', ゐ: 'i', ゑ: 'e', を: 'o', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ゔ: 'vu', ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o',
};
const SMALL_Y: Record<string, string> = { ゃ: 'a', ゅ: 'u', ょ: 'o' };

/** Kana → romaji kiểu Hepburn, đủ dùng cho tìm kiếm. Ký tự không phải kana bị bỏ. */
export function toRomaji(input: string): string {
  const s = toHiragana(input);
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const next = s[i + 1];
    if (ch === 'っ') {
      const r = ROMAJI[next] ?? '';
      out += r.startsWith('ch') ? 't' : (r[0] ?? '');
      continue;
    }
    if (ch === 'ー') {
      out += out.at(-1) ?? '';
      continue;
    }
    let r = ROMAJI[ch];
    if (!r) continue;
    if (next && SMALL_Y[next] && r.endsWith('i')) {
      // き+ゃ → kya, し+ゃ → sha, じ+ゃ → ja
      const base = r.slice(0, -1);
      r = (/(sh|ch|j)$/.test(base) ? base : base + 'y') + SMALL_Y[next];
      i++;
    }
    out += r;
  }
  return out;
}

/** Đường dẫn công khai của trang: bỏ đuôi .html do build dạng file ("/a/b.html" → "/a/b"). */
export const publicPath = (pathname: string) => pathname.replace(/(\/index)?\.html$/, '') || '/';
