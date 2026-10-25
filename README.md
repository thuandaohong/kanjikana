# kanjiviet

Website tĩnh học kanji, viết bằng [Astro](https://astro.build) + Tailwind CSS v4 và deploy lên Cloudflare Pages.

## Chạy local

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # xuất ra thư mục dist/
npm run preview   # xem bản build
```

## Dữ liệu

`src/data/generated/kanji.json` được tạo bằng `npm run data` và commit vào repo, nên khi deploy không cần chạy lại.
Danh sách chủ đề tự soạn nằm trong `src/data/themes.json`. Sửa xong thì chạy lại `npm run data`.

## Cấu trúc

```
src/
  data/site.ts        # tên site, menu, footer: đổi thương hiệu ở đây
  data/kanji.ts       # truy vấn kanji: JLPT, Kanken, 214 bộ thủ, chủ đề
  data/themes.json    # danh sách kanji theo chủ đề (tự soạn)
  data/generated/     # kanji.json, strokes.json, vocab.json do scripts/build-data.mjs tạo ra
  styles/global.css   # design tokens (màu sáng/tối, font)
  layouts/            # BaseLayout (head, header, footer), ProseLayout
  components/         # Header, Footer, ThemeToggle, SearchBox, HeroGrid, ...
  pages/              # mỗi file là một route
public/               # favicon, _headers của Cloudflare
```

## Deploy lên Cloudflare Pages

1. Push repo lên GitHub.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**, rồi chọn repo.
3. Cấu hình build:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Biến môi trường: `NODE_VERSION=22`
4. Save and Deploy. Mỗi lần push lên `main` sẽ tự deploy, các nhánh khác có link preview riêng.

Hoặc deploy thẳng từ máy: `npx wrangler pages deploy dist --project-name kanjiviet`.

Sau khi có domain thật, sửa `site` trong `astro.config.mjs`.

## Tiến độ

- [x] Giai đoạn 0: khởi tạo dự án, design tokens, dark mode
- [x] Giai đoạn 1: header (dropdown, tìm kiếm, đổi giao diện, menu mobile), footer, trang chủ, About, Credits, 404
- [x] Giai đoạn 2: pipeline dữ liệu (KANJIDIC2, JLPT, KanjiVG, từ vựng)
- [x] Giai đoạn 3: danh sách kanji (JLPT, jōyō, Kanken, bộ thủ, chủ đề)
- [x] Giai đoạn 4: trang chi tiết kanji, hoạt ảnh thứ tự nét (KanjiVG), từ vựng ví dụ theo JLPT
- [ ] Giai đoạn 5: Hiragana / Katakana
- [ ] Giai đoạn 6: tìm kanji, flashcards, furigana
- [ ] Giai đoạn 7: dịch (Pages Functions)
- [ ] Giai đoạn 8: đa ngôn ngữ
- [ ] Giai đoạn 9: SEO, sitemap, analytics
