import { toHiragana } from './text';

/** Một đoạn chữ: text kèm cách đọc (chỉ có ở phần chứa kanji). */
export type Segment = { text: string; reading?: string };

const KANJI = /[㐀-鿿豈-﫿々〆ヶ]/;

/**
 * Gắn cách đọc cho một từ, chỉ đặt furigana trên phần kanji:
 * ("食べる", "たべる") → [食|た] べる
 * ("取り扱い", "とりあつかい") → [取|と] り [扱|あつか] い
 */
export function alignReading(surface: string, reading: string): Segment[] {
  const hira = toHiragana(reading);
  if (!KANJI.test(surface)) return [{ text: surface }];

  // Chia từ thành các khúc kanji / không kanji.
  const parts = surface.match(/[㐀-鿿豈-﫿々〆ヶ]+|[^㐀-鿿豈-﫿々〆ヶ]+/g)!;
  // Khúc kana giữ nguyên làm mốc, khúc kanji khớp với một đoạn bất kỳ của cách đọc.
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    '^' + parts.map((p) => (KANJI.test(p) ? '(.+?)' : `(${escape(toHiragana(p))})`)).join('') + '$',
  );
  const m = hira.match(pattern);
  if (!m) return [{ text: surface, reading: hira }];
  return parts.map((p, i) => (KANJI.test(p) ? { text: p, reading: m[i + 1] } : { text: p }));
}
