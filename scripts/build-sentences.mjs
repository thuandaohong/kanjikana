// Tạo src/data/generated/sentences.json: câu ví dụ cho từng kanji, lấy từ Tatoeba (CC BY 2.0 FR).
//
//   1. Tải dữ liệu một lần vào .cache/tatoeba/ (xem README):
//      {jpn,eng,vie,cmn,kor,ind}_sentences.tsv.bz2 và links.tar.bz2
//   2. npm run sentences
//
// Cần lệnh bzcat và tar (có sẵn trên macOS/Linux). File kết quả được commit vào repo,
// nên khi deploy không cần chạy lại script.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import kuromoji from 'kuromoji';

const ROOT = new URL('../', import.meta.url);
const CACHE = fileURLToPath(new URL('.cache/tatoeba/', ROOT));
const GEN = new URL('src/data/generated/', ROOT);

// Ngôn ngữ của site → mã ngôn ngữ trong Tatoeba.
const LANGS = { en: 'eng', vi: 'vie', zh: 'cmn', ko: 'kor', id: 'ind' };
const PER_KANJI = 3;
const MIN_LEN = 5;
const MAX_LEN = 30;

for (const f of [...Object.values(LANGS), 'jpn'].map((l) => `${l}_sentences.tsv.bz2`).concat('links.tar.bz2')) {
  if (!existsSync(CACHE + f)) throw new Error(`Thiếu ${CACHE}${f}. Xem hướng dẫn tải trong README.`);
}

/** Đọc từng dòng đầu ra của một lệnh (bzcat, tar…). */
async function* lines(cmd, args) {
  const p = spawn(cmd, args, { cwd: CACHE });
  const exit = new Promise((res, rej) => p.on('close', (code) => (code ? rej(new Error(`${cmd} lỗi ${code}`)) : res())));
  yield* createInterface({ input: p.stdout, crlfDelay: Infinity });
  await exit;
}
/** Câu của một ngôn ngữ: id → nội dung. `keep` lọc theo id (nếu có). */
async function readSentences(lang, keep) {
  const map = new Map();
  for await (const line of lines('bzcat', [`${lang}_sentences.tsv.bz2`])) {
    const [id, , text] = line.split('\t');
    if (text && (!keep || keep.has(+id))) map.set(+id, text);
  }
  return map;
}
/** Liên kết bản dịch: với mỗi id trong `from`, danh sách id được dịch sang. */
async function readLinks(from) {
  const map = new Map();
  for await (const line of lines('tar', ['-xjOf', 'links.tar.bz2'])) {
    const [a, b] = line.split('\t');
    if (from.has(+a)) (map.get(+a) ?? map.set(+a, []).get(+a)).push(+b);
  }
  return map;
}

// ---------- Dữ liệu của site ----------
const kanji = JSON.parse(await readFile(new URL('kanji.json', GEN), 'utf8'));
const vocab = JSON.parse(await readFile(new URL('vocab.json', GEN), 'utf8'));
const LEVEL = new Map(kanji.map((k) => [k.c, k.jlpt ?? 0]));
const KANJI_RE = /[㐀-鿿豈-﫿々]/g;

// ---------- Câu tiếng Nhật hợp lệ ----------
console.log('Đọc câu tiếng Nhật…');
const jpn = new Map();
for (const [id, text] of await readSentences('jpn')) {
  const t = text.trim();
  if (t.length < MIN_LEN || t.length > MAX_LEN || /[A-Za-z０-９Ａ-Ｚａ-ｚ]/.test(t) || !/[。？！?!]$/.test(t)) continue;
  jpn.set(id, t);
}
console.log(`  ${jpn.size} câu đạt độ dài`);

console.log('Đọc liên kết bản dịch (lượt 1)…');
const jpnLinks = await readLinks(new Set(jpn.keys()));
const eng = await readSentences('eng', new Set([...jpnLinks.values()].flat()));
// Bỏ câu không có bản dịch tiếng Anh trực tiếp (dùng làm bản dịch dự phòng).
for (const id of jpn.keys()) if (!(jpnLinks.get(id) ?? []).some((t) => eng.has(t))) jpn.delete(id);
console.log(`  ${jpn.size} câu có bản dịch tiếng Anh`);

console.log('Đọc liên kết bản dịch (lượt 2, qua câu tiếng Anh)…');
const engLinks = await readLinks(new Set(eng.keys()));
const others = {};
for (const [site, tat] of Object.entries(LANGS)) {
  if (site === 'en') continue;
  const ids = new Set();
  for (const id of jpn.keys()) for (const t of jpnLinks.get(id) ?? []) {
    ids.add(t);
    for (const u of engLinks.get(t) ?? []) ids.add(u);
  }
  others[site] = await readSentences(tat, ids);
  console.log(`  ${site}: ${others[site].size} câu`);
}

/** Bản dịch của một câu: ưu tiên dịch trực tiếp từ tiếng Nhật, sau đó qua câu tiếng Anh. */
function translations(id) {
  const direct = jpnLinks.get(id) ?? [];
  const en = direct.map((t) => eng.get(t)).find(Boolean);
  const out = { en };
  const via = direct.filter((t) => eng.has(t)).flatMap((t) => engLinks.get(t) ?? []);
  for (const [site, map] of Object.entries(others)) {
    const text = direct.map((t) => map.get(t)).find(Boolean) ?? via.map((t) => map.get(t)).find(Boolean);
    if (text) out[site] = text;
  }
  return out;
}

// ---------- Chọn câu cho từng kanji ----------
console.log('Chọn câu…');
const byKanji = new Map();
for (const [id, text] of jpn) {
  for (const c of new Set(text.match(KANJI_RE) ?? [])) {
    if (LEVEL.has(c)) (byKanji.get(c) ?? byKanji.set(c, []).get(c)).push(id);
  }
}

function pickFor(k) {
  const words = (vocab[k.c] ?? []).map(([w]) => w);
  const target = k.jlpt ?? 0;
  const scored = (byKanji.get(k.c) ?? []).map((id) => {
    const text = jpn.get(id);
    const tr = translations(id);
    const word = words.find((w) => text.includes(w));
    // Kanji khó hơn chữ đang học (cấp JLPT nhỏ hơn, hoặc ngoài JLPT) làm câu khó đọc.
    const hard = (text.match(KANJI_RE) ?? []).filter((c) => c !== k.c && (LEVEL.get(c) ?? 0) < target).length;
    const score = (word ? 10 : 0) + 2 * (Object.keys(tr).length - 1) - 3 * hard - 0.15 * text.length;
    return { id, text, tr, word, score };
  });
  scored.sort((a, b) => b.score - a.score || a.id - b.id);
  // Lấy câu tốt nhất, cố gắng mỗi câu minh hoạ một từ khác nhau.
  const picked = [];
  const usedWords = new Set();
  for (const s of scored) {
    if (picked.length >= PER_KANJI) break;
    if (s.word && usedWords.has(s.word) && scored.length > PER_KANJI * 2) continue;
    picked.push(s);
    if (s.word) usedWords.add(s.word);
  }
  return picked;
}

// ---------- Furigana ----------
// Giống src/lib/furigana.ts: chỉ đặt cách đọc trên phần kanji của mỗi từ.
const KANJI_ONE = /[㐀-鿿豈-﫿々〆ヶ]/;
const toHiragana = (s) => s.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
function alignReading(surface, reading) {
  const hira = toHiragana(reading);
  if (!KANJI_ONE.test(surface)) return [[surface]];
  const parts = surface.match(/[㐀-鿿豈-﫿々〆ヶ]+|[^㐀-鿿豈-﫿々〆ヶ]+/g);
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('^' + parts.map((p) => (KANJI_ONE.test(p) ? '(.+?)' : `(${escape(toHiragana(p))})`)).join('') + '$');
  const m = hira.match(re);
  if (!m) return [[surface, hira]];
  return parts.map((p, i) => (KANJI_ONE.test(p) ? [p, m[i + 1]] : [p]));
}
const tokenizer = await new Promise((res, rej) =>
  kuromoji.builder({ dicPath: fileURLToPath(new URL('node_modules/kuromoji/dict/', ROOT)) }).build((e, t) => (e ? rej(e) : res(t))),
);
/** Câu → các đoạn [chữ] hoặc [kanji, cách đọc]; gộp các đoạn không có cách đọc liền nhau. */
function ruby(text) {
  const out = [];
  for (const tok of tokenizer.tokenize(text)) {
    const r = tok.reading && tok.reading !== '*' ? tok.reading : '';
    for (const seg of r ? alignReading(tok.surface_form, r) : [[tok.surface_form]]) {
      const last = out.at(-1);
      if (seg.length === 1 && last && last.length === 1) last[0] += seg[0];
      else out.push(seg);
    }
  }
  return out;
}

const result = {};
let total = 0;
for (const k of kanji) {
  const picked = pickFor(k);
  if (!picked.length) continue;
  result[k.c] = picked.map((s) => ({ i: s.id, j: ruby(s.text), t: s.tr }));
  total += picked.length;
}
await writeFile(new URL('sentences.json', GEN), JSON.stringify(result));
const cover = (lang) => Object.values(result).flat().filter((s) => s.t[lang]).length;
console.log(`Câu ví dụ: ${total} câu cho ${Object.keys(result).length}/${kanji.length} kanji`);
for (const lang of Object.keys(LANGS)) console.log(`  có bản dịch ${lang}: ${cover(lang)} (${Math.round((cover(lang) / total) * 100)}%)`);
