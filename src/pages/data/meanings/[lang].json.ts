// Nghĩa đã dịch của từng ngôn ngữ cho các công cụ chạy trên trình duyệt (tìm kiếm, flashcards).
// Sinh tĩnh lúc build tại /data/meanings/{vi,zh,ko,id}.json.
import { MEANINGS } from '../../../data/kanji';

export function getStaticPaths() {
  return Object.keys(MEANINGS).map((lang) => ({ params: { lang } }));
}

export function GET({ params }: { params: { lang: keyof typeof MEANINGS } }) {
  return new Response(JSON.stringify(MEANINGS[params.lang]), { headers: { 'Content-Type': 'application/json' } });
}
