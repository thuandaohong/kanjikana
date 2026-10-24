// Tạo src/data/generated/kanji.json từ các nguồn mở.
//
//   node scripts/build-data.mjs
//
// Nguồn:
// - KANJIDIC2 (EDRDG, CC BY-SA 4.0) qua gói npm `kanjidic2-json`: âm on/kun,
//   âm Hán Việt, nghĩa tiếng Anh, số nét, bộ thủ, cấp lớp, tần suất.
// - Cấp JLPT mới (N5–N1) từ davidluzgouveia/kanji-data (MIT), dựa trên danh
//   sách của Jonathan Waller (tanos.co.uk).
//
// File kết quả được commit vào repo, nên khi deploy không cần chạy lại script.
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const JLPT_URL = 'https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json';
const OUT = new URL('../src/data/generated/kanji.json', import.meta.url);

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

await mkdir(new URL('.', OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(out));
const count = (f) => out.filter(f).length;
console.log(`Đã ghi ${out.length} kanji vào ${OUT.pathname}`);
console.log(`  jōyō: ${count((k) => JOYO_GRADES.has(k.grade))}`);
for (const n of [5, 4, 3, 2, 1]) console.log(`  N${n}: ${count((k) => k.jlpt === n)}`);
