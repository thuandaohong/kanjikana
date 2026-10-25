// Tạo src/data/generated/kanji.json từ các nguồn mở.
//
//   node scripts/build-data.mjs
//
// Nguồn:
// - KANJIDIC2 (EDRDG, CC BY-SA 4.0) qua gói npm `kanjidic2-json`: âm on/kun,
//   âm Hán Việt, nghĩa tiếng Anh, số nét, bộ thủ, cấp lớp, tần suất.
// - Cấp JLPT mới (N5–N1) từ davidluzgouveia/kanji-data (MIT), dựa trên danh
//   sách của Jonathan Waller (tanos.co.uk).
// - Thứ tự nét từ KanjiVG (CC BY-SA 3.0), lưu tạm trong .cache/kanjivg.
// - Từ vựng ví dụ từ jamsinclair/open-anki-jlpt-decks (MIT), cũng dựa trên tanos.
//
// File kết quả được commit vào repo, nên khi deploy không cần chạy lại script.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const JLPT_URL = 'https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json';
const KANJIVG_URL = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji';
const VOCAB_URL = 'https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src';
const GEN = new URL('../src/data/generated/', import.meta.url);
const OUT = new URL('kanji.json', GEN);
const CACHE = new URL('../.cache/kanjivg/', import.meta.url);

// Gói không export file JSON nên đọc thẳng từ node_modules.
const kanjidicPath = new URL('../node_modules/kanjidic2-json/KANJIS.json', import.meta.url);
const kanjidic = JSON.parse(await readFile(kanjidicPath, 'utf8'));
const byChar = new Map(kanjidic.map((k) => [k.literal, k]));

console.log('Tải danh sách JLPT…');
const res = await fetch(JLPT_URL);
if (!res.ok) throw new Error(`Không tải được ${JLPT_URL}: ${res.status}`);
const jlptData = await res.json();

const themes = JSON.parse(await readFile(new URL('../src/data/themes.json', import.meta.url), 'utf8'));

const JOYO_GRADES = new Set([1, 2, 3, 4, 5, 6, 8]);
const chars = new Set();
for (const k of kanjidic) if (JOYO_GRADES.has(k.grade)) chars.add(k.literal);
for (const [c, v] of Object.entries(jlptData)) if (v.jlpt_new) chars.add(c);
for (const t of themes) for (const c of t.kanji) chars.add(c);

const out = [];
for (const c of chars) {
  const k = byChar.get(c);
  if (!k) {
    console.warn(`Bỏ qua ${c}: không có trong KANJIDIC2`);
    continue;
  }
  const r = k.readings ?? {};
  out.push({
    c,
    hv: r.vietnam ?? [],
    en: k.meanings?.en ?? [],
    on: r.ja_on ?? [],
    kun: r.ja_kun ?? [],
    strokes: k.strokeCounts[0],
    rad: k.radicals.classical,
    grade: k.grade ?? null,
    jlpt: jlptData[c]?.jlpt_new ?? null,
    freq: k.freq ?? null,
  });
}

// Sắp xếp mặc định: chữ thông dụng trước, sau đó theo số nét.
out.sort((a, b) => (a.freq ?? 1e9) - (b.freq ?? 1e9) || a.strokes - b.strokes || a.c.localeCompare(b.c));

await mkdir(GEN, { recursive: true });
await writeFile(OUT, JSON.stringify(out));
const count = (f) => out.filter(f).length;
console.log(`Đã ghi ${out.length} kanji vào ${OUT.pathname}`);
console.log(`  jōyō: ${count((k) => JOYO_GRADES.has(k.grade))}`);
for (const n of [5, 4, 3, 2, 1]) console.log(`  N${n}: ${count((k) => k.jlpt === n)}`);

// ---------- Thứ tự nét (KanjiVG) ----------
// Mỗi chữ chỉ giữ lại danh sách path "d" theo đúng thứ tự nét, toạ độ trong khung 109×109.
await mkdir(CACHE, { recursive: true });
async function kanjivg(c) {
  const file = c.codePointAt(0).toString(16).padStart(5, '0') + '.svg';
  const cached = new URL(file, CACHE);
  if (existsSync(cached)) return readFile(cached, 'utf8');
  const r = await fetch(`${KANJIVG_URL}/${file}`);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`KanjiVG ${c}: ${r.status}`);
  const svg = await r.text();
  await writeFile(cached, svg);
  return svg;
}

const strokes = {};
const queue = out.map((k) => k.c);
let missing = [];
async function worker() {
  for (let c; (c = queue.shift()); ) {
    const svg = await kanjivg(c);
    if (!svg) {
      missing.push(c);
      continue;
    }
    strokes[c] = [...svg.matchAll(/<path id="kvg:[^"]*-s\d+"[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  }
}
console.log('Tải KanjiVG…');
await Promise.all(Array.from({ length: 16 }, worker));
await writeFile(new URL('strokes.json', GEN), JSON.stringify(strokes));
console.log(`Thứ tự nét: ${Object.keys(strokes).length} chữ` + (missing.length ? `, thiếu: ${missing.join('')}` : ''));

// ---------- Từ vựng ví dụ ----------
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') (field += '"'), i++;
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') row.push(field), (field = '');
    else if (ch === '\n') row.push(field), rows.push(row), (row = []), (field = '');
    else if (ch !== '\r') field += ch;
  }
  if (field || row.length) row.push(field), rows.push(row);
  return rows;
}

const words = [];
for (const level of [5, 4, 3, 2, 1]) {
  const r = await fetch(`${VOCAB_URL}/n${level}.csv`);
  if (!r.ok) throw new Error(`Không tải được từ vựng N${level}: ${r.status}`);
  const [, ...rows] = parseCsv(await r.text());
  for (const [word, reading, meaning] of rows) if (word) words.push([word, reading, meaning, level]);
}

// Với mỗi kanji: lấy tối đa 8 từ chứa chữ đó, ưu tiên cấp dễ rồi từ ngắn.
const MAX_WORDS = 8;
const vocab = {};
for (const k of out) {
  const list = words
    .filter(([w, reading]) => w.includes(k.c) && w !== reading)
    .sort((a, b) => b[3] - a[3] || a[0].length - b[0].length);
  if (list.length) vocab[k.c] = list.slice(0, MAX_WORDS);
}
await writeFile(new URL('vocab.json', GEN), JSON.stringify(vocab));
console.log(`Từ vựng: ${words.length} từ, ${Object.keys(vocab).length} kanji có ví dụ`);

// ---------- Thứ tự nét cho kana ----------
// Hiragana ぁ–ゖ và katakana ァ–ヶ (từng chữ đơn; âm ghép tự ghép từ các chữ này).
const kanaChars = [];
for (let cp = 0x3041; cp <= 0x3096; cp++) kanaChars.push(String.fromCodePoint(cp));
for (let cp = 0x30a1; cp <= 0x30f6; cp++) kanaChars.push(String.fromCodePoint(cp));
const kanaStrokes = {};
await Promise.all(
  Array.from({ length: 16 }, async () => {
    for (let c; (c = kanaChars.shift()); ) {
      const svg = await kanjivg(c);
      if (svg) kanaStrokes[c] = [...svg.matchAll(/<path id="kvg:[^"]*-s\d+"[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
    }
  }),
);
await writeFile(new URL('kana-strokes.json', GEN), JSON.stringify(kanaStrokes));
console.log(`Thứ tự nét kana: ${Object.keys(kanaStrokes).length} chữ`);
