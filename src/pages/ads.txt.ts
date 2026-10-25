// /ads.txt cho Google AdSense, sinh từ PUBLIC_ADSENSE_CLIENT lúc build ("ca-pub-123" → "pub-123").
// Chưa bật quảng cáo thì file chỉ có một dòng chú thích.
export function GET() {
  const client = import.meta.env.PUBLIC_ADSENSE_CLIENT;
  const body = client
    ? `google.com, ${client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`
    : '# Chưa bật quảng cáo.\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
