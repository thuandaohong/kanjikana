// Sinh các route cho ngôn ngữ khác tiếng Anh (src/pages/vi/, zh/, ko/, id/) bằng cách bọc lại trang
// gốc tương ứng. Mỗi trang tự đọc ngôn ngữ từ Astro.currentLocale nên chỉ cần một bản mã nguồn.
// Chạy tự động trước `dev` và `build`; các thư mục này không được commit.
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// Giữ khớp với PREFIXED_LANGS trong src/i18n/index.ts.
const LOCALES = ['vi', 'zh', 'ko', 'id'];

const PAGES = fileURLToPath(new URL('../src/pages/', import.meta.url));
// Không cần bản dịch: thư mục của chính các ngôn ngữ, endpoint dữ liệu, robots.txt và trang 404 (đã đa ngữ).
const SKIP = [new RegExp(`^(${LOCALES.join('|')})/`), /^data\//, /^robots\.txt\.ts$/, /^404\.astro$/];

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const sources = [];
for await (const file of walk(PAGES)) {
  const rel = relative(PAGES, file).split('\\').join('/');
  if (rel.endsWith('.astro') && !SKIP.some((re) => re.test(rel))) sources.push([file, rel]);
}

for (const locale of LOCALES) {
  const out = join(PAGES, locale);
  await rm(out, { recursive: true, force: true });
  for (const [file, rel] of sources) {
    const target = join(out, rel);
    let importPath = relative(dirname(target), file).split('\\').join('/');
    if (!importPath.startsWith('.')) importPath = './' + importPath;
    const dynamic = /export (async )?function getStaticPaths|export const getStaticPaths/.test(await readFile(file, 'utf8'));
    const body = dynamic
      ? `---\n// Tự sinh bởi scripts/gen-locale-routes.mjs – không sửa tay.\nimport Page, { getStaticPaths as paths } from '${importPath}';\nexport const getStaticPaths = paths;\n---\n<Page {...Astro.props} />\n`
      : `---\n// Tự sinh bởi scripts/gen-locale-routes.mjs – không sửa tay.\nimport Page from '${importPath}';\n---\n<Page {...Astro.props} />\n`;
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, body);
  }
}
console.log(`Đã sinh ${sources.length} route cho mỗi ngôn ngữ: ${LOCALES.join(', ')}`);
