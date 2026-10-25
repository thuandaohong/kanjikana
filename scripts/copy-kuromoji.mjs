// Sao chép kuromoji (bản cho trình duyệt) và từ điển vào public/kuromoji
// để công cụ furigana tải về khi cần. Chạy tự động trước `dev` và `build`.
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

const SRC = new URL('../node_modules/kuromoji/', import.meta.url);
const OUT = new URL('../public/kuromoji/', import.meta.url);

await mkdir(OUT, { recursive: true });
await cp(new URL('dict/', SRC), new URL('dict/', OUT), { recursive: true });

// Một số host tự thêm "Content-Encoding: gzip" cho file .gz, khiến trình duyệt
// giải nén sẵn và kuromoji giải nén lần hai thì lỗi. Vá để chỉ giải nén khi
// dữ liệu còn mang chữ ký gzip (1f 8b).
const ORIGINAL = `        var gz = new zlib.Zlib.Gunzip(new Uint8Array(arraybuffer));
        var typed_array = gz.decompress();
        callback(null, typed_array.buffer);`;
const PATCHED = `        var bytes = new Uint8Array(arraybuffer);
        if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) {
            callback(null, arraybuffer);
            return;
        }
        var gz = new zlib.Zlib.Gunzip(bytes);
        var typed_array = gz.decompress();
        callback(null, typed_array.buffer);`;
const js = await readFile(new URL('build/kuromoji.js', SRC), 'utf8');
if (!js.includes(ORIGINAL)) throw new Error('Không tìm thấy đoạn cần vá trong kuromoji.js (phiên bản đã đổi?)');
await writeFile(new URL('kuromoji.js', OUT), js.replace(ORIGINAL, PATCHED));
console.log('Đã chép kuromoji vào public/kuromoji');
