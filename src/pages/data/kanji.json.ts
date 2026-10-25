// Dữ liệu gọn cho các công cụ chạy trên trình duyệt (tìm kiếm, flashcards).
// Được sinh tĩnh lúc build tại /data/kanji.json.
import { ALL, KANKEN, THEMES, kunPlain } from '../../data/kanji';
import { foldVi, toRomaji } from '../../lib/text';

export function GET() {
  const kanji = ALL.map((k) => {
    const readings = [...k.on, ...kunPlain(k)];
    return {
      c: k.c,
      hv: k.hv,
      py: k.py,
      ko: k.ko,
      en: k.en.slice(0, 5),
      on: k.on,
      kun: kunPlain(k),
      jlpt: k.jlpt,
      grade: k.grade,
      strokes: k.strokes,
      // Trường phụ để tìm kiếm: Hán Việt và pinyin không dấu, romaji của các cách đọc.
      hvf: k.hv.map(foldVi),
      pyf: [...new Set(k.py.map(foldVi))],
      ro: [...new Set(readings.map((r) => toRomaji(r.replace(/-/g, ''))))],
    };
  });
  // Tên nhóm và tên bộ thẻ có đủ các ngôn ngữ: { vi, en, zh, ko, id }.
  const same = (x: string) => ({ vi: x, en: x, zh: x, ko: x, id: x });
  const decks = [
    ...[5, 4, 3, 2, 1].map((n) => ({ id: `jlpt-n${n}`, group: same('JLPT'), name: same(`JLPT N${n}`), chars: ALL.filter((k) => k.jlpt === n).map((k) => k.c).join('') })),
    ...KANKEN.map((g) => ({ id: `kanken-${g.slug}`, group: { vi: 'Kanken', en: 'Kanken', zh: '汉检', ko: '한자검정', id: 'Kanken' }, name: { vi: `Kanken ${g.name}`, en: `Kanken ${g.name}`, zh: `汉检 ${g.name}`, ko: `한자검정 ${g.name}`, id: `Kanken ${g.name}` }, chars: ALL.filter(g.match).map((k) => k.c).join('') })),
    ...THEMES.map((t) => ({ id: `theme-${t.slug}`, group: { vi: 'Chủ đề', en: 'Themes', zh: '主题', ko: '주제', id: 'Tema' }, name: t.name, chars: t.kanji.map((k) => k.c).join('') })),
  ];
  return new Response(JSON.stringify({ kanji, decks }), { headers: { 'Content-Type': 'application/json' } });
}
