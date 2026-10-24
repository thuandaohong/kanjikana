// Dữ liệu tạm cho trang chủ. Ở giai đoạn 2, số lượng JLPT sẽ được tính
// tự động từ KANJIDIC2 thay vì ghi cứng ở đây.
export const JLPT_COUNTS: Record<string, number> = {
  n5: 80,
  n4: 170,
  n3: 370,
  n2: 380,
  n1: 1136,
};

export type Theme = { slug: string; name: string; kanji: string[] };

export const THEMES: Theme[] = [
  { slug: 'numbers', name: 'Số đếm', kanji: [...'一二三四五六七八九十百千万億零'] },
  { slug: 'animals', name: 'Động vật', kanji: [...'犬猫馬牛羊豚鳥魚虫貝竜熊鹿猿象蛇亀兎狐'] },
  {
    slug: 'nature-and-landscape',
    name: 'Thiên nhiên & Cảnh quan',
    kanji: [...'山川木林森花草空雨雪風雲石海湖池田野火水土金天日月星光'],
  },
  {
    slug: 'people-and-society',
    name: 'Con người & Xã hội',
    kanji: [...'人男女子父母兄弟姉妹友王民族家私彼客員社会国市町村先生'],
  },
  { slug: 'body', name: 'Cơ thể', kanji: [...'目耳口手足頭顔首心体肩腕指歯毛血骨背胸腹鼻舌皮爪'] },
  {
    slug: 'emotions-and-feelings',
    name: 'Cảm xúc',
    kanji: [...'愛恋喜楽悲怒恐驚笑泣好嫌怖幸寂悩憂感情安苦怨'],
  },
];

// Các chữ trang trí trên lưới ở phần hero: [chữ, cột, hàng]
export const HERO_KANJI: [string, number, number][] = [
  ['行', 1, 1],
  ['午', 3, 1],
  ['土', 2, 2],
];
