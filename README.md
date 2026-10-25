# Kanjiba

Website tĩnh học kanji, viết bằng [Astro](https://astro.build) + Tailwind CSS v4 và deploy lên Cloudflare Pages.

## Chạy local

Cần Node **22.22.0 trở lên** (Astro 7 không chạy trên Node 20). Dự án có `.nvmrc`, nên dùng nvm thì chỉ cần `nvm install && nvm use`.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # xuất ra thư mục dist/
npm run preview   # xem bản build
npm run preview:cf  # xem bản build bằng môi trường mô phỏng Cloudflare Pages (wrangler)
```

## Đa ngôn ngữ

- Tiếng Việt nằm ở URL gốc; tiếng Anh dưới `/en/`, tiếng Trung giản thể dưới `/zh/`, tiếng Hàn dưới `/ko/`, tiếng Indonesia dưới `/id/`. Mỗi trang tự lấy ngôn ngữ từ `Astro.currentLocale` (`getLang` trong `src/i18n`).
- Chuỗi dịch nằm ngay trong từng trang: `pick(lang, { vi: '…', en: '…', zh: '…', ko: '…', id: '…' })`, hoặc helper `t(vi, en, zh, ko, id)` khai báo đầu trang.
- Mỗi ngôn ngữ có "âm đọc của người học" thay cho cột Hán Việt: Hán Việt (vi), pinyin (zh), âm Hán-Hàn (ko); bản tiếng Anh và tiếng Indonesia nổi bật nghĩa. Nghĩa kanji theo từng ngôn ngữ nằm ở `src/data/meanings/{vi,zh,ko,id}.json` (dịch có hỗ trợ AI từ nghĩa tiếng Anh của KANJIDIC2, giấy phép CC BY-SA 4.0); chữ nào thiếu thì dùng nghĩa tiếng Anh. Nghĩa từ vựng ví dụ nằm ở `src/data/meanings/words-{lang}.json`, khoá là `"từ|cách đọc"`.
- `src/pages/en/`, `zh/`, `ko/`, `id/` được `scripts/gen-locale-routes.mjs` tự sinh trước `dev`/`build` và không được commit. Thêm trang mới vào `src/pages/` là tự có đủ các bản dịch.
- Thêm ngôn ngữ mới: thêm mã vào `LANGS` trong `src/i18n/index.ts`, `LOCALES` trong `scripts/gen-locale-routes.mjs`, `i18n.locales` trong `astro.config.mjs` và `.gitignore`, rồi bổ sung bản dịch (thiếu bản nào thì editor sẽ báo lỗi kiểu ở `pick`; `astro build` không kiểm tra kiểu).

## Dữ liệu

`src/data/generated/kanji.json` được tạo bằng `npm run data` và commit vào repo, nên khi deploy không cần chạy lại.

Ảnh chia sẻ (Open Graph) của từng ngôn ngữ nằm ở `public/og/{lang}.png`, tạo bằng `npm run og` (cần Google Chrome; đặt biến `CHROME` nếu Chrome không ở đường dẫn mặc định của macOS). Đổi tên site hoặc câu giới thiệu trong `scripts/build-og.mjs` thì chạy lại lệnh này.
Câu ví dụ lấy từ Tatoeba (CC BY 2.0 FR), tạo bằng `npm run sentences` và commit vào `src/data/generated/sentences.json`. Cần tải dữ liệu một lần vào `.cache/tatoeba/` (không commit):

```bash
mkdir -p .cache/tatoeba && cd .cache/tatoeba && for l in jpn eng vie cmn kor ind; do curl -fLO "https://downloads.tatoeba.org/exports/per_language/$l/${l}_sentences.tsv.bz2"; done && curl -fLO https://downloads.tatoeba.org/exports/links.tar.bz2
```

Bản dịch câu do AI dịch (khi Tatoeba chưa có), đổi sang giản thể hoặc sửa lỗi (kể cả bản tiếng Anh của Tatoeba dịch sai, ở `sentences-en.json`) nằm ở `src/data/meanings/sentences-{lang}.json`, khoá là id câu, nên chạy lại `npm run sentences` không làm mất.

Danh sách từ vựng ví dụ (open-anki-jlpt-decks) có một số cách đọc và nghĩa tiếng Anh sai. Bản sửa tay nằm ở `src/data/vocab-fixes.json`, khoá là `"từ|cách đọc gốc"`, giá trị `{ reading?, en?, why }`. File này được áp dụng mỗi lần chạy `npm run data`; script báo các bản sửa không còn khớp với nguồn. Sửa cách đọc thì nhớ đổi khoá tương ứng trong `src/data/meanings/words-*.json`.

Danh sách chủ đề tự soạn nằm trong `src/data/themes.json` (tên chủ đề có `name`, `name_en`, `name_zh`, `name_ko`, `name_id`). Sửa xong thì chạy lại `npm run data`.

## Cấu trúc

```
src/
  data/site.ts        # tên site, menu, footer: đổi thương hiệu ở đây (và trong scripts/build-og.mjs)
  i18n/index.ts       # ngôn ngữ, localize(), pick()
  data/kanji.ts       # truy vấn kanji: JLPT, Kanken, 214 bộ thủ, chủ đề
  data/themes.json    # danh sách kanji theo chủ đề (tự soạn)
  data/kana.ts        # bảng hiragana/katakana
  data/generated/     # kanji.json, strokes.json, vocab.json, kana-strokes.json, radicals.json, kanken.json, sentences.json do scripts/build-data.mjs tạo ra
  styles/global.css   # design tokens (màu sáng/tối, font)
  layouts/            # BaseLayout (head, header, footer), ProseLayout
  components/         # Header, Footer, ThemeToggle, SearchBox, HeroGrid, ...
  pages/              # mỗi file là một route
public/               # favicon, ảnh chia sẻ og/, _headers của Cloudflare
scripts/              # build-data.mjs (dữ liệu), build-og.mjs (ảnh chia sẻ); copy-kuromoji.mjs, gen-locale-routes.mjs (chạy tự động trước dev/build)
```

## Deploy lên Cloudflare Pages

1. Push repo lên GitHub.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**, rồi chọn repo.
   Đặt **Project name** là `kanjiba` để có địa chỉ `https://kanjiba.pages.dev`. Nếu tên đã có người dùng, Cloudflare sẽ thêm hậu tố ngẫu nhiên; khi đó đặt `SITE_URL` theo địa chỉ thật (bước 3).
3. Cấu hình build:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Biến môi trường:
     - `NODE_VERSION=22` (cần 22.22.0 trở lên)
     - `SITE_URL=https://ten-mien-cua-ban` (dùng cho canonical, sitemap, ảnh chia sẻ; mặc định `https://kanjiba.pages.dev`)
     - `PUBLIC_CF_BEACON_TOKEN=...` (tuỳ chọn, bật Cloudflare Web Analytics; lấy token ở Dashboard → Analytics & Logs → Web Analytics)
     - Quảng cáo Google AdSense (tuỳ chọn, xem mục Quảng cáo bên dưới)
4. Save and Deploy. Mỗi lần push lên `main` sẽ tự deploy, các nhánh khác có link preview riêng.

Hoặc deploy thẳng từ máy: `npx wrangler pages deploy dist --project-name kanjiba`.

Site build dạng `/trang.html` nên Cloudflare phục vụ thẳng `/trang`, không phải chuyển hướng sang `/trang/`.

Gói miễn phí của Cloudflare Pages giới hạn 20.000 file mỗi lần deploy. Mỗi ngôn ngữ thêm khoảng 2.600 trang; với 5 ngôn ngữ bản build có khoảng 13.600 file, nên chỉ còn chỗ cho khoảng 2 ngôn ngữ nữa. Kiểm tra bằng `find dist -type f | wc -l` sau khi build.

## Quảng cáo

Các vị trí quảng cáo đã đặt sẵn qua component `src/components/AdSlot.astro`: giữa phần thứ tự nét và từ vựng ở trang chi tiết kanji (`kanji`), dưới phần đầu trang của các trang danh sách (`list`), và phía trên footer ở mọi trang (`footer`). Không đặt biến môi trường nào thì không có quảng cáo và không nạp script nào. Không đặt quảng cáo trong vùng flashcards và công cụ furigana.

- `PUBLIC_ADSENSE_CLIENT=ca-pub-…`: mã nhà xuất bản; bật script AdSense và sinh `/ads.txt`.
- `PUBLIC_ADSENSE_SLOT_KANJI`, `PUBLIC_ADSENSE_SLOT_LIST`, `PUBLIC_ADSENSE_SLOT_FOOTER`: mã đơn vị quảng cáo cho từng vị trí (tạo trong AdSense → Quảng cáo → Theo đơn vị quảng cáo). Vị trí nào không có mã thì bị ẩn.
- `PUBLIC_ADS_PREVIEW=true`: khi chưa có AdSense, hiện khung giữ chỗ để xem bố cục (ví dụ `PUBLIC_ADS_PREVIEW=true npm run dev`).

Trang `/privacy` (Chính sách quyền riêng tư) đã có phần công bố về cookie quảng cáo mà AdSense yêu cầu. Điền `contactEmail` trong `src/data/site.ts` để hiện mục liên hệ. Với người dùng ở EEA, Anh và Thuỵ Sĩ, Google yêu cầu thông báo xin đồng ý: bật nó trong AdSense → Quyền riêng tư và thông báo, không cần sửa code.

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
- [x] Giai đoạn 21: trò chơi Hiragana/Katakana (/tools/kana-quiz): chọn bảng chữ và nhóm âm, 3 cách chơi (kana → cách đọc, cách đọc → kana, gõ romaji), chế độ 60 giây, ưu tiên chữ dễ nhầm làm đáp án nhiễu
- [x] Giai đoạn 20: mục “Chữ trông giống nhau” trên trang kanji (thành phần KanjiVG có trọng số IDF + nhóm dễ nhầm soạn tay `src/data/confusables.json`, ra `similar.json`); JSON-LD `DefinedTerm` cho trang kanji; sửa 114 bản dịch tiếng Anh sai của Tatoeba (`sentences-en.json`)
- [x] Giai đoạn 19: danh sách kanji dài (trên 80 chữ) tự chia trang 60 chữ ngay trên trình duyệt, không tạo thêm file; mọi link vẫn nằm trong HTML
- [x] Giai đoạn 18: trang kanji không có từ vựng lẫn câu ví dụ đặt noindex và bỏ khỏi sitemap (`isThinKanji`, `astro.config.mjs`); trang Giới thiệu có phần người làm site và email liên hệ
- [x] Giai đoạn 17: thêm 398 chữ nhân danh (jinmeiyō, KANJIDIC2 grade 9, bỏ ký tự tương thích U+F900…) có trang riêng; trang danh sách /kanji/jinmeiyo; site có 2.783 chữ, bản build khoảng 15.900 file
- [x] Giai đoạn 16: trang bộ thủ liệt kê mọi chữ có chứa bộ làm thành phần (theo cây thành phần KanjiVG, `radical-members.json`), có sắp xếp theo tần suất / số nét / JLPT
- [x] Giai đoạn 15: trang bộ thủ hiện thêm tối đa 30 chữ khác thuộc bộ (nhân danh, JIS cấp 1–2; không có trang riêng) từ KANJIDIC2, lưu ở `radical-extra.json`
- [x] Giai đoạn 14: trang bộ thủ có số nét (nhóm theo nét), tên tiếng Nhật, vị trí, dạng biến thể, nghĩa 5 ngôn ngữ và thứ tự nét; thông tin soạn tay ở `src/data/radicals-info.json`
- [x] Giai đoạn 13: tách cấp Kanken 4級, 3級, 準2級, 2級 (dữ liệu từ fosskers/kanji, lưu tạm ở .cache/kanken)
- [x] Giai đoạn 12: 37 chủ đề kanji; trắc nghiệm kanji (/tools/quiz); câu ví dụ từ Tatoeba có furigana
- [x] Giai đoạn 11: đổi tên thành Kanjiba, ảnh chia sẻ theo ngôn ngữ, chỗ đặt quảng cáo, trang Chính sách quyền riêng tư
- [x] Giai đoạn 10: tiếng Trung giản thể (/zh/, kèm pinyin) và tiếng Hàn (/ko/, kèm âm Hán-Hàn); tìm kiếm theo pinyin và hangul; tiếng Indonesia (/id/)
