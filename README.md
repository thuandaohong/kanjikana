# kanjiviet

Website tĩnh học kanji, viết bằng [Astro](https://astro.build) + Tailwind CSS v4 và deploy lên Cloudflare Pages.

## Chạy local

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # xuất ra thư mục dist/
npm run preview   # xem bản build
npm run preview:cf  # xem bản build bằng môi trường mô phỏng Cloudflare Pages (wrangler)
```

## Đa ngôn ngữ

- Tiếng Việt nằm ở URL gốc, tiếng Anh dưới `/en/`. Mỗi trang tự lấy ngôn ngữ từ `Astro.currentLocale` (`getLang` trong `src/i18n`).
- Chuỗi dịch nằm ngay trong từng trang: `pick(lang, { vi: '…', en: '…' })`.
- `src/pages/en/` được `scripts/gen-en-routes.mjs` tự sinh trước `dev`/`build` và không được commit. Thêm trang mới vào `src/pages/` là tự có bản tiếng Anh.

## Dữ liệu

`src/data/generated/kanji.json` được tạo bằng `npm run data` và commit vào repo, nên khi deploy không cần chạy lại.
Danh sách chủ đề tự soạn nằm trong `src/data/themes.json`. Sửa xong thì chạy lại `npm run data`.

## Cấu trúc

```
src/
  data/site.ts        # tên site, menu, footer: đổi thương hiệu ở đây
  i18n/index.ts       # ngôn ngữ, localize(), pick()
  data/kanji.ts       # truy vấn kanji: JLPT, Kanken, 214 bộ thủ, chủ đề
  data/themes.json    # danh sách kanji theo chủ đề (tự soạn)
  data/kana.ts        # bảng hiragana/katakana
  data/generated/     # kanji.json, strokes.json, vocab.json, kana-strokes.json do scripts/build-data.mjs tạo ra
  styles/global.css   # design tokens (màu sáng/tối, font)
  layouts/            # BaseLayout (head, header, footer), ProseLayout
  components/         # Header, Footer, ThemeToggle, SearchBox, HeroGrid, ...
  pages/              # mỗi file là một route
public/               # favicon, _headers của Cloudflare
scripts/              # build-data.mjs (dữ liệu); copy-kuromoji.mjs, gen-en-routes.mjs (chạy tự động trước dev/build)
```

## Deploy lên Cloudflare Pages

1. Push repo lên GitHub.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**, rồi chọn repo.
3. Cấu hình build:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Biến môi trường:
     - `NODE_VERSION=22`
     - `SITE_URL=https://ten-mien-cua-ban` (dùng cho canonical, sitemap, ảnh chia sẻ; mặc định `https://kanjiviet.pages.dev`)
     - `PUBLIC_CF_BEACON_TOKEN=...` (tuỳ chọn, bật Cloudflare Web Analytics; lấy token ở Dashboard → Analytics & Logs → Web Analytics)
4. Save and Deploy. Mỗi lần push lên `main` sẽ tự deploy, các nhánh khác có link preview riêng.

Hoặc deploy thẳng từ máy: `npx wrangler pages deploy dist --project-name kanjiviet`.

Site build dạng `/trang.html` nên Cloudflare phục vụ thẳng `/trang`, không phải chuyển hướng sang `/trang/`.

## Tiến độ

- [x] Giai đoạn 0: khởi tạo dự án, design tokens, dark mode
- [x] Giai đoạn 1: header (dropdown, tìm kiếm, đổi giao diện, menu mobile), footer, trang chủ, About, Credits, 404
- [x] Giai đoạn 2: pipeline dữ liệu (KANJIDIC2, JLPT, KanjiVG, từ vựng)
- [x] Giai đoạn 3: danh sách kanji (JLPT, jōyō, Kanken, bộ thủ, chủ đề)
- [x] Giai đoạn 4: trang chi tiết kanji, hoạt ảnh thứ tự nét (KanjiVG), từ vựng ví dụ theo JLPT
- [x] Giai đoạn 5: Hiragana / Katakana (phát âm bằng Web Speech API, thứ tự nét)
- [x] Giai đoạn 6: tìm kanji, flashcards (lưu tiến độ trên trình duyệt), furigana (kuromoji chạy trên trình duyệt)
- [ ] Giai đoạn 7: dịch (Pages Functions), tạm hoãn, đã gỡ khỏi menu
- [x] Giai đoạn 8: tiếng Việt (URL gốc) và tiếng Anh (/en/), có hreflang và nút chuyển ngôn ngữ
- [x] Giai đoạn 9: sitemap, robots.txt, Open Graph, JSON-LD, font tự host, Lighthouse 95–100
