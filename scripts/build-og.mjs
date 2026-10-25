// Tạo ảnh chia sẻ (Open Graph, 1200×630) cho từng ngôn ngữ: public/og/{lang}.png.
//
//   node scripts/build-og.mjs
//
// Dựng một trang HTML dùng font tự host của dự án rồi chụp bằng Chrome headless.
// Đường dẫn Chrome lấy từ biến môi trường CHROME, mặc định là bản cài trên macOS.
// Ảnh được commit vào repo nên khi deploy không cần chạy lại script.
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ROOT = new URL('../', import.meta.url);
const CACHE = new URL('.cache/og/', ROOT);
const OUT = new URL('public/og/', ROOT);

// Tiêu đề có thể chứa <br> để tự chọn chỗ xuống dòng (chữ Trung/Hàn không tự ngắt đẹp).
// Tên thương hiệu tách hai phần như logo: "kanji" + "ba" (tô màu).
const NAME = ['kanji', 'ba'];

const LANGS = {
  vi: { html: 'vi', title: 'Học kanji dễ hơn với âm Hán Việt', tags: 'JLPT N5–N1 · thứ tự nét · flashcards · furigana' },
  en: { html: 'en', title: 'Kanji lists and tools for Japanese learners', tags: 'JLPT N5–N1 · stroke order · flashcards · furigana' },
  zh: { html: 'zh-Hans', title: '借助拼音，<br>轻松学日语汉字', tags: 'JLPT N5–N1 · 笔顺 · 闪卡 · 假名注音' },
  ko: { html: 'ko', title: '한자음으로 쉽게 배우는<br>일본어 한자', tags: 'JLPT N5–N1 · 획순 · 플래시카드 · 후리가나' },
  id: { html: 'id', title: 'Belajar kanji bahasa Jepang dengan mudah', tags: 'JLPT N5–N1 · urutan goresan · flashcard · furigana' },
};

const FONTS = [
  'be-vietnam-pro/vietnamese-500.css',
  'be-vietnam-pro/latin-500.css',
  'be-vietnam-pro/latin-700.css',
  'noto-serif/vietnamese-700.css',
  'noto-serif/latin-700.css',
  'noto-serif-jp/400.css',
  'noto-serif-jp/700.css',
].map((f) => `<link rel="stylesheet" href="../../node_modules/@fontsource/${f}">`);

const page = ({ html, title, tags }) => `<!doctype html>
<html lang="${html}">
<head>
<meta charset="utf-8">
${FONTS.join('\n')}
<style>
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    background: #fdfdfd; color: #232326; font-family: 'Be Vietnam Pro', sans-serif;
  }
  /* Lưới ô tập viết bên phải, mờ dần sang trái */
  .grid {
    position: absolute; inset: 0 0 0 auto; width: 640px;
    display: grid; grid-template-columns: repeat(4, 160px); grid-template-rows: repeat(4, 160px);
    -webkit-mask-image: linear-gradient(to right, transparent, #000 30%);
  }
  .grid div { position: relative; display: grid; place-items: center; border-left: 1px solid #ececef; border-top: 1px solid #ececef; }
  .grid span { font-family: 'Noto Serif JP', serif; font-size: 112px; color: #c8c8cc; }
  .grid .hl { color: #e11d2e; font-weight: 700; }
  .content { position: absolute; left: 80px; top: 150px; width: 640px; }
  .logo { display: flex; align-items: center; gap: 18px; font-size: 38px; font-weight: 700; letter-spacing: -0.5px; }
  .logo b { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 15px; background: #e11d2e;
    color: #fff; font: 700 38px 'Noto Serif JP', serif; }
  .logo em { font-style: normal; color: #e11d2e; }
  h1 { margin-top: 44px; font: 700 54px/1.2 'Noto Serif', 'Noto Serif JP', serif; }
  /* Font serif hệ thống cho chữ Trung/Hàn không có bản đậm, nên dùng sans đậm. */
  :lang(zh) h1, :lang(ko) h1 { font-family: 'Be Vietnam Pro', 'PingFang SC', 'Apple SD Gothic Neo', sans-serif; line-height: 1.3; }
  :lang(ko) h1 { word-break: keep-all; }
  p { margin-top: 30px; font-size: 25px; font-weight: 500; color: #5c5c66; }
</style>
</head>
<body>
  <div class="grid">
    ${['', '漢', '', '', '', '', '学', '', '', '字', '', '語', '', '', '', '']
      .map((c) => `<div>${c ? `<span lang="ja" class="${c === '学' ? 'hl' : ''}">${c}</span>` : ''}</div>`)
      .join('')}
  </div>
  <div class="content">
    <div class="logo"><b lang="ja">字</b><span>${NAME[0]}<em>${NAME[1]}</em></span></div>
    <h1>${title}</h1>
    <p>${tags}</p>
  </div>
</body>
</html>`;

await mkdir(CACHE, { recursive: true });
await mkdir(OUT, { recursive: true });
for (const [lang, v] of Object.entries(LANGS)) {
  const htmlFile = new URL(`${lang}.html`, CACHE);
  await writeFile(htmlFile, page(v));
  execFileSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=5000',
    `--screenshot=${fileURLToPath(new URL(`${lang}.png`, OUT))}`,
    htmlFile.href,
  ], { stdio: 'ignore' });
  console.log(`Đã tạo public/og/${lang}.png`);
}
