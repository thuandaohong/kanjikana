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
      en: k.en.slice(0, 5),
      on: k.on,
      kun: kunPlain(k),
      jlpt: k.jlpt,
      grade: k.grade,
      strokes: k.strokes,
      // Trường phụ để tìm kiếm: Hán Việt không dấu và romaji của các cách đọc.
      hvf: k.hv.map(foldVi),
      ro: [...new Set(readings.map((r) => toRomaji(r.replace(/-/g, ''))))],
    };
  });
  const decks = [
    ...[5, 4, 3, 2, 1].map((n) => ({ id: `jlpt-n${n}`, group: 'JLPT', name: `JLPT N${n}`, chars: ALL.filter((k) => k.jlpt === n).map((k) => k.c).join('') })),
    ...KANKEN.map((g) => ({ id: `kanken-${g.slug}`, group: 'Kanken', name: `Kanken ${g.name}`, chars: ALL.filter(g.match).map((k) => k.c).join('') })),
    ...THEMES.map((t) => ({ id: `theme-${t.slug}`, group: 'Chủ đề', name: t.name, chars: t.kanji.map((k) => k.c).join('') })),
  ];
  return new Response(JSON.stringify({ kanji, decks }), { headers: { 'Content-Type': 'application/json' } });
}
