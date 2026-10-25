// Tạo src/data/generated/kanji.json từ các nguồn mở.
//
//   node scripts/build-data.mjs
//
// Nguồn:
// - KANJIDIC2 (EDRDG, CC BY-SA 4.0) qua gói npm `kanjidic2-json`: âm on/kun,
//   âm Hán Việt, pinyin, âm Hán-Hàn, nghĩa tiếng Anh, số nét, bộ thủ, cấp lớp, tần suất.
// - Cấp JLPT mới (N5–N1) từ davidluzgouveia/kanji-data (MIT), dựa trên danh
//   sách của Jonathan Waller (tanos.co.uk).
// - Thứ tự nét từ KanjiVG (CC BY-SA 3.0), lưu tạm trong .cache/kanjivg.
// - Cấp Kanken 4級–2級 của chữ jōyō trung học từ fosskers/kanji (Data/Kanji/Levels.hs),
//   lưu tạm trong .cache/kanken.
// - Từ vựng ví dụ từ jamsinclair/open-anki-jlpt-decks (MIT), cũng dựa trên tanos.
//   Các cách đọc và nghĩa tiếng Anh sai trong nguồn được sửa bằng src/data/vocab-fixes.json.
//
// File kết quả được commit vào repo, nên khi deploy không cần chạy lại script.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const JLPT_URL = 'https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json';
const KANJIVG_URL = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji';
const KANKEN_URL = 'https://raw.githubusercontent.com/fosskers/kanji/master/lib/Data/Kanji/Levels.hs';
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

// KANJIDIC2 ghi pinyin bằng số thanh điệu ("xue2", "lu:4", "e^2"); đổi sang dấu ("xué", "lǜ", "ế").
const TONE_MARKS = ['\u0304', '\u0301', '\u030c', '\u0300'];
function pinyin(raw) {
  const m = raw.replace(/u:/g, 'ü').replace(/e\^/g, 'ê').match(/^(\D+)(\d?)/);
  if (!m) return raw;
  const [, syl, tone] = m;
  const mark = TONE_MARKS[Number(tone) - 1];
  if (!mark) return syl;
  // Dấu đặt trên a hoặc e nếu có, trên o của "ou", còn lại trên nguyên âm cuối.
  let i = syl.search(/[aeê]/);
  if (i < 0) i = syl.indexOf('ou');
  if (i < 0) i = Math.max(...[...'iouü'].map((v) => syl.lastIndexOf(v)));
  if (i < 0) return syl;
  return (syl.slice(0, i) + (syl[i] + mark).normalize('NFC') + syl.slice(i + 1)).normalize('NFC');
}
// Một số mục gộp nhiều âm trong một chuỗi ("fu3 tiao4"); tách ra và bỏ trùng.
const pinyinList = (list = []) => [...new Set(list.flatMap((p) => p.split(' ')).map(pinyin))];

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
    py: pinyinList(r.pinyin),
    ko: r.korean_h ?? [],
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

// ---------- Âm đọc của 214 bộ thủ ----------
// [pinyin, âm Hán-Hàn] của chữ đại diện cho mỗi bộ (khối Kangxi Radicals chuẩn hoá NFKC), theo thứ tự.
const radicals = Array.from({ length: 214 }, (_, i) => {
  const r = byChar.get(String.fromCodePoint(0x2f00 + i).normalize('NFKC'))?.readings ?? {};
  return [pinyinList(r.pinyin)[0] ?? '', r.korean_h?.[0] ?? ''];
});
await writeFile(new URL('radicals.json', GEN), JSON.stringify(radicals));

// ---------- Chữ khác thuộc mỗi bộ (không có trang riêng) ----------
// Bổ sung cho trang bộ thủ những chữ ngoài danh sách của site, ưu tiên: chữ nhân danh hoặc có xếp hạng
// tần suất (nhóm 0), JIS X 0208 cấp 1 (nhóm 1), JIS cấp 2 (nhóm 2); trong nhóm xếp theo số nét.
// Bỏ grade 10 (dạng chữ cũ của chữ jōyō). Mỗi phần tử: [chữ, nhóm, Hán Việt, pinyin, âm Hán-Hàn, nghĩa EN, on, kun].
const EXTRA_PER_RADICAL = 30;
const inSite = new Set(out.map((k) => k.c));
// Không liệt kê chính chữ bộ thủ và các dạng biến thể (đã hiện ở đầu trang).
for (let i = 0; i < 214; i++) inSite.add(String.fromCodePoint(0x2f00 + i).normalize('NFKC'));
for (const r of JSON.parse(await readFile(new URL('../src/data/radicals-info.json', import.meta.url), 'utf8'))) for (const v of r.variants) inSite.add(v.c);
const jisRow = (k) => {
  const j = k.codepoints?.jis208;
  return j ? Number(j.split('-')[1]) : null;
};
const extraByRadical = {};
for (const k of kanjidic) {
  if (inSite.has(k.literal) || k.grade === 10) continue;
  const row = jisRow(k);
  const tier = k.grade === 9 || k.freq ? 0 : row && row <= 47 ? 1 : row ? 2 : null;
  if (tier === null) continue;
  const r = k.readings ?? {};
  (extraByRadical[k.radicals.classical] ??= []).push({
    tier,
    strokes: k.strokeCounts[0],
    row: [
      k.literal,
      tier,
      r.vietnam?.[0] ?? '',
      pinyinList(r.pinyin)[0] ?? '',
      r.korean_h?.[0] ?? '',
      (k.meanings?.en ?? []).slice(0, 3).join(', '),
      (r.ja_on ?? []).slice(0, 2).join('、'),
      (r.ja_kun ?? []).slice(0, 2).map((x) => x.replace('.', '')).join('、'),
    ],
  });
}
for (const [rad, list] of Object.entries(extraByRadical)) {
  list.sort((a, b) => a.tier - b.tier || a.strokes - b.strokes || a.row[0].localeCompare(b.row[0]));
  extraByRadical[rad] = list.slice(0, EXTRA_PER_RADICAL).map((x) => x.row);
}
await writeFile(new URL('radical-extra.json', GEN), JSON.stringify(extraByRadical));
console.log(`Chữ thêm cho bộ thủ: ${Object.values(extraByRadical).flat().length}`);
console.log(`Bộ thủ: ${radicals.filter(([p, k]) => p && k).length}/214 có đủ pinyin và âm Hán-Hàn`);

// ---------- Cấp Kanken 4級–2級 ----------
// Cấp 10級–5級 trùng với cấp lớp tiểu học (KANJIDIC2, chương trình 2020) nên không cần dữ liệu riêng.
// Phần jōyō trung học được chia theo danh sách của fosskers/kanji; danh sách tiểu học trong file
// là bảng cũ trước 2020 nên bỏ qua.
const kankenFile = new URL('../.cache/kanken/Levels.hs', import.meta.url);
if (!existsSync(kankenFile)) {
  console.log('Tải danh sách cấp Kanken…');
  const r = await fetch(KANKEN_URL);
  if (!r.ok) throw new Error(`Không tải được ${KANKEN_URL}: ${r.status}`);
  await mkdir(new URL('../.cache/kanken/', import.meta.url), { recursive: true });
  await writeFile(kankenFile, await r.text());
}
const levelsHs = await readFile(kankenFile, 'utf8');
// File dùng dạng chữ cũ cho 4 chữ thêm vào jōyō năm 2010; đổi về dạng của KANJIDIC2.
const VARIANTS = { 叱: '𠮟', 剥: '剝', 填: '塡', 頬: '頰' };
const kankenList = (name) => {
  const m = levelsHs.match(new RegExp(`^${name} = S\\.fromDistinctAscList \\$\\n((?:\\s+"[^"]*"(?: \\+\\+)?\\n?)+)`, 'm'));
  if (!m) throw new Error(`Không tìm thấy danh sách ${name} trong Levels.hs`);
  return [...[...m[1].matchAll(/"([^"]*)"/g)].map((x) => x[1]).join('')].map((c) => VARIANTS[c] ?? c);
};
const secondary = new Set(out.filter((k) => k.grade === 8).map((k) => k.c));
const kanken = {};
for (const [key, name] of [['4', 'fourth'], ['3', 'third'], ['pre2', 'preSecond'], ['2', 'second']]) {
  kanken[key] = kankenList(name).filter((c) => secondary.has(c)).join('');
}
const assigned = new Set(Object.values(kanken).join(''));
const unassigned = [...secondary].filter((c) => !assigned.has(c));
await writeFile(new URL('kanken.json', GEN), JSON.stringify(kanken));
console.log(`Kanken: ${Object.entries(kanken).map(([k, v]) => `${k === 'pre2' ? '準2' : k}級 ${[...v].length}`).join(', ')}` + (unassigned.length ? `, chưa xếp cấp: ${unassigned.join('')}` : ''));

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

// Thứ tự nét cho 214 bộ thủ và các dạng biến thể (亻, 氵…) trong src/data/radicals-info.json.
const radicalInfo = JSON.parse(await readFile(new URL('../src/data/radicals-info.json', import.meta.url), 'utf8'));
const radicalChars = new Set();
for (let i = 0; i < 214; i++) radicalChars.add(String.fromCodePoint(0x2f00 + i).normalize('NFKC'));
for (const r of radicalInfo) for (const v of r.variants) radicalChars.add(v.c);
const radicalStrokes = {};
const radicalQueue = [...radicalChars];
await Promise.all(
  Array.from({ length: 16 }, async () => {
    for (let c; (c = radicalQueue.shift()); ) {
      const paths = strokes[c] ?? (await kanjivg(c).then((svg) => svg && [...svg.matchAll(/<path id="kvg:[^"]*-s\d+"[^>]*\sd="([^"]+)"/g)].map((m) => m[1])));
      if (paths?.length) radicalStrokes[c] = paths;
    }
  }),
);
await writeFile(new URL('radical-strokes.json', GEN), JSON.stringify(Object.fromEntries([...radicalChars].filter((c) => radicalStrokes[c]).map((c) => [c, radicalStrokes[c]]))));
console.log(`Thứ tự nét bộ thủ: ${Object.keys(radicalStrokes).length}/${radicalChars.size} chữ`);

// ---------- Chữ có chứa mỗi bộ (theo thành phần) ----------
// Ngoài bộ chính thức của từ điển (mỗi chữ một bộ), liệt kê mọi chữ của site có chứa bộ đó làm thành phần,
// dựa trên cây thành phần trong KanjiVG (kvg:element, kvg:original), duyệt đệ quy qua các thành phần con.
const toRadical = new Map();
for (let i = 0; i < 214; i++) toRadical.set(String.fromCodePoint(0x2f00 + i).normalize('NFKC'), i + 1);
for (const r of radicalInfo) for (const v of r.variants) if (!toRadical.has(v.c)) toRadical.set(v.c, r.n);
const componentCache = new Map();
async function components(c, depth = 0) {
  if ([...c].length !== 1 || depth > 6) return new Set();
  if (componentCache.has(c)) return componentCache.get(c);
  const result = new Set();
  componentCache.set(c, result);
  const file = new URL(c.codePointAt(0).toString(16).padStart(5, '0') + '.svg', CACHE);
  if (!existsSync(file)) return result;
  const svg = await readFile(file, 'utf8');
  for (const m of svg.matchAll(/kvg:element="([^"]+)"(?:[^>]*?kvg:original="([^"]+)")?/g)) {
    for (const x of [m[1], m[2]]) {
      if (!x || x === c || [...x].length !== 1) continue;
      result.add(x);
      for (const y of await components(x, depth + 1)) result.add(y);
    }
  }
  return result;
}
const radicalMembers = {};
for (const k of out) {
  const rads = new Set([k.rad]);
  if (toRadical.has(k.c)) rads.add(toRadical.get(k.c));
  for (const x of await components(k.c)) if (toRadical.has(x)) rads.add(toRadical.get(x));
  for (const n of rads) radicalMembers[n] = (radicalMembers[n] ?? '') + k.c;
}
await writeFile(new URL('radical-members.json', GEN), JSON.stringify(radicalMembers));
console.log(`Chữ chứa bộ thủ: trung bình ${(Object.values(radicalMembers).join('').length / out.length).toFixed(1)} bộ mỗi chữ`);
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

// Bản sửa tay cho dữ liệu nguồn: { "từ|cách đọc gốc": { reading?, en?, why } }.
const vocabFixes = JSON.parse(await readFile(new URL('../src/data/vocab-fixes.json', import.meta.url), 'utf8'));
const usedFixes = new Set();

const words = [];
const seenWords = new Set();
for (const level of [5, 4, 3, 2, 1]) {
  const r = await fetch(`${VOCAB_URL}/n${level}.csv`);
  if (!r.ok) throw new Error(`Không tải được từ vựng N${level}: ${r.status}`);
  const [, ...rows] = parseCsv(await r.text());
  for (let [word, reading, meaning] of rows) {
    if (!word) continue;
    const key = `${word}|${reading}`;
    const fix = vocabFixes[key];
    if (fix) {
      usedFixes.add(key);
      reading = fix.reading ?? reading;
      meaning = fix.en ?? meaning;
    }
    // Sau khi sửa cách đọc có thể trùng với một mục khác; giữ mục ở cấp dễ hơn.
    if (seenWords.has(`${word}|${reading}`)) continue;
    seenWords.add(`${word}|${reading}`);
    words.push([word, reading, meaning, level]);
  }
}
const unusedFixes = Object.keys(vocabFixes).filter((k) => !usedFixes.has(k));
console.log(`Sửa từ vựng: áp dụng ${usedFixes.size}/${Object.keys(vocabFixes).length}` + (unusedFixes.length ? `, không khớp: ${unusedFixes.join(' ')}` : ''));

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
