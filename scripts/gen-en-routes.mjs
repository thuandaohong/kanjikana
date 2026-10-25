// Sinh các route tiếng Anh trong src/pages/en/ bằng cách bọc lại trang tiếng Việt tương ứng.
// Mỗi trang tự đọc ngôn ngữ từ Astro.currentLocale nên chỉ cần một bản mã nguồn.
// Chạy tự động trước `dev` và `build`; thư mục en/ không được commit.
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const PAGES = fileURLToPath(new URL('../src/pages/', import.meta.url));
const OUT = join(PAGES, 'en');
// Không cần bản tiếng Anh: endpoint dữ liệu, robots.txt và trang 404 (đã song ngữ).
const SKIP = [/^en\//, /^data\//, /^robots\.txt\.ts$/, /^404\.astro$/];

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

await rm(OUT, { recursive: true, force: true });
let count = 0;
for await (const file of walk(PAGES)) {
  const rel = relative(PAGES, file).split('\\').join('/');
  if (!rel.endsWith('.astro') || SKIP.some((re) => re.test(rel))) continue;
  const target = join(OUT, rel);
  let importPath = relative(dirname(target), file).split('\\').join('/');
  if (!importPath.startsWith('.')) importPath = './' + importPath;
  const dynamic = /export (async )?function getStaticPaths|export const getStaticPaths/.test(await readFile(file, 'utf8'));
  const body = dynamic
    ? `---\n// Tự sinh bởi scripts/gen-en-routes.mjs – không sửa tay.\nimport Page, { getStaticPaths as paths } from '${importPath}';\nexport const getStaticPaths = paths;\n---\n<Page {...Astro.props} />\n`
    : `---\n// Tự sinh bởi scripts/gen-en-routes.mjs – không sửa tay.\nimport Page from '${importPath}';\n---\n<Page {...Astro.props} />\n`;
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, body);
  count++;
}
console.log(`Đã sinh ${count} route tiếng Anh trong src/pages/en`);
