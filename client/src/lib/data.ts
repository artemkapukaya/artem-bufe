export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  hasOptions?: boolean;
}

export interface Category {
  id: string;
  name: string;
  count: number;
  image: string;
  icon: string;
}

export const categories: Category[] = [
  {
    id: "cig-urunler",
    name: "ÇİĞ ÜRÜNLER",
    count: 38,
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200&h=200&fit=crop",
    icon: "🥩",
  },
  {
    id: "corba-kahvalti",
    name: "ÇORBA-KAHVALTI ve ŞARKÜTERİ",
    count: 54,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=200&h=200&fit=crop",
    icon: "🍲",
  },
  {
    id: "izgara-urunler",
    name: "IZGARA ÜRÜNLER",
    count: 17,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop",
    icon: "🔥",
  },
  {
    id: "ekmek-arasi",
    name: "EKMEK ARASI",
    count: 31,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop",
    icon: "🥪",
  },
  {
    id: "doner",
    name: "DÖNER",
    count: 7,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200&h=200&fit=crop",
    icon: "🌯",
  },
  {
    id: "citir-soguk",
    name: "ÇITIR ve SOĞUK ÜRÜNLER",
    count: 27,
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=200&h=200&fit=crop",
    icon: "🍗",
  },
  {
    id: "tatli-icecek",
    name: "TATLI - İÇECEKLER",
    count: 16,
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop",
    icon: "🍰",
  },
  {
    id: "mangal",
    name: "MANGAL ve KÖMÜRÜ",
    count: 7,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop",
    icon: "🪨",
  },
];

export const products: Product[] = [
  // ÇİĞ ÜRÜNLER
  {
    id: "kebap",
    name: "Kebap",
    description: "Özel baharatlarla hazırlanmış taze kebap, ızgarada pişirilmeye hazır.",
    price: 650,
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop",
    category: "cig-urunler",
    hasOptions: true,
  },
  {
    id: "artem-kofte",
    name: "Artem Köfte",
    description: "Geleneksel tarifle hazırlanmış Artem Köfte, doyurucu ve nefis bir seçimdir.",
    price: 650,
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop",
    category: "cig-urunler",
    hasOptions: true,
  },
  {
    id: "dana-kavurma",
    name: "Dana Kavurma",
    description: "Taze dana etinden hazırlanmış kavurma, sofranıza lezzet katacak.",
    price: 900,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
    category: "cig-urunler",
    hasOptions: true,
  },
  // ÇORBA-KAHVALTI
  {
    id: "mercimek-corba-az",
    name: "Mercimek Çorba (Az)",
    description: "Sıcak servis edilen Mercimek Çorba (Az), başlangıçlar için ideal bir seçimdir.",
    price: 70,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop",
    category: "corba-kahvalti",
    hasOptions: true,
  },
  {
    id: "mercimek-corba-porsiyon",
    name: "Mercimek Çorba (Porsiyon)",
    description: "Sıcak servis edilen Mercimek Çorba (Porsiyon), başlangıçlar için ideal bir seçimdir.",
    price: 90,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop",
    category: "corba-kahvalti",
    hasOptions: true,
  },
  {
    id: "et-suyu-corba",
    name: "Az Et Suyu Çorba (Az)",
    description: "Sıcak servis edilen Az Et Suyu Çorba (Az), başlangıçlar için ideal bir seçimdir.",
    price: 90,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop",
    category: "corba-kahvalti",
    hasOptions: true,
  },
  // IZGARA ÜRÜNLER
  {
    id: "1-porsiyon-kofte",
    name: "1 Porsiyon Köfte",
    description: "Geleneksel tarifle hazırlanmış 1 Porsiyon Köfte, doyurucu ve nefis bir seçimdir.",
    price: 240,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
    category: "izgara-urunler",
    hasOptions: true,
  },
  {
    id: "300gr-kofte",
    name: "300 Gr. Köfte",
    description: "Geleneksel tarifle hazırlanmış 300 Gr. Köfte, doyurucu ve nefis bir seçimdir.",
    price: 360,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
    category: "izgara-urunler",
    hasOptions: true,
  },
  {
    id: "500gr-kofte",
    name: "500 Gr. Köfte",
    description: "Geleneksel tarifle hazırlanmış 500 Gr. Köfte, doyurucu ve nefis bir seçimdir.",
    price: 600,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
    category: "izgara-urunler",
    hasOptions: true,
  },
  // EKMEK ARASI
  {
    id: "tek-kofte-burger",
    name: "Tek Köfte Burger Menü",
    description: "Geleneksel tarifle hazırlanmış Tek Köfte Burger Menü, doyurucu ve nefis bir seçimdir.",
    price: 180,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    category: "ekmek-arasi",
    hasOptions: true,
  },
  {
    id: "cift-kofte-burger",
    name: "Çift Köfte Burger Menü",
    description: "Geleneksel tarifle hazırlanmış Çift Köfte Burger Menü, doyurucu ve nefis bir seçimdir.",
    price: 240,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    category: "ekmek-arasi",
    hasOptions: true,
  },
  {
    id: "yarim-porsiyon-ekmek",
    name: "Yarım Porsiyon Ekmek Arası Köfte Menü",
    description: "Geleneksel tarifle hazırlanmış Yarım Porsiyon Ekmek Arası Köfte Menü.",
    price: 180,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    category: "ekmek-arasi",
    hasOptions: true,
  },
  // DÖNER
  {
    id: "porsiyon-et-doner",
    name: "Porsiyon Et Döner",
    description: "Porsiyon Et Döner, sofralarınıza lezzet katacak nefis bir seçimdir.",
    price: 240,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop",
    category: "doner",
    hasOptions: false,
  },
  {
    id: "1-5-porsiyon-doner",
    name: "1,5 Porsiyon Et Döner",
    description: "1,5 Porsiyon Döner, sofralarınıza lezzet katacak nefis bir seçimdir.",
    price: 360,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop",
    category: "doner",
    hasOptions: false,
  },
  {
    id: "yarim-kg-doner",
    name: "Yarım Kg Et Döner",
    description: "Yarım Kg Et Döner, sofralarınıza lezzet katacak nefis bir seçimdir.",
    price: 850,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop",
    category: "doner",
    hasOptions: false,
  },
  // ÇITIR
  {
    id: "porsiyon-citir-3lu",
    name: "Porsiyon Çıtır 3'lü",
    description: "Crispy ve lezzetli Porsiyon Çıtır 3'lü set.",
    price: 180,
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop",
    category: "citir-soguk",
    hasOptions: false,
  },
  {
    id: "porsiyon-3lu-set",
    name: "Porsiyon 3'lü Set",
    description: "Doyurucu Porsiyon 3'lü Set, tam bir lezzet deneyimi.",
    price: 220,
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop",
    category: "citir-soguk",
    hasOptions: false,
  },
  {
    id: "porsiyon-patates",
    name: "Porsiyon Patates",
    description: "Çıtır çıtır Porsiyon Patates, atıştırmalık için ideal.",
    price: 80,
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop",
    category: "citir-soguk",
    hasOptions: false,
  },
  // TATLI
  {
    id: "ekmek-kadayifi",
    name: "Ekmek Kadayıfı",
    description: "Geleneksel lezzet Ekmek Kadayıfı, tatlı severlerin vazgeçilmezi.",
    price: 120,
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop",
    category: "tatli-icecek",
    hasOptions: false,
  },
  {
    id: "ekmek-kadayifi-kaymakli",
    name: "Ekmek Kadayıfı (Kaymaklı)",
    description: "Kaymaklı Ekmek Kadayıfı, tatlı severlerin vazgeçilmezi.",
    price: 150,
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop",
    category: "tatli-icecek",
    hasOptions: false,
  },
  {
    id: "ekmek-kadayifi-bol-kaymakli",
    name: "Ekmek Kadayıfı (Bol Kaymaklı)",
    description: "Bol Kaymaklı Ekmek Kadayıfı, tatlı severlerin vazgeçilmezi.",
    price: 180,
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop",
    category: "tatli-icecek",
    hasOptions: false,
  },
  // MANGAL
  {
    id: "mangal-komuru",
    name: "Mangal Kömürü",
    description: "Kaliteli mangal kömürü, mükemmel ızgara deneyimi için.",
    price: 100,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
    category: "mangal",
    hasOptions: false,
  },
  {
    id: "kucuk-boy-mangal",
    name: "Küçük Boy Mangal",
    description: "Küçük Boy Mangal, piknik ve bahçe keyfi için ideal.",
    price: 400,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
    category: "mangal",
    hasOptions: false,
  },
  {
    id: "buyuk-boy-mangal",
    name: "Büyük Boy Mangal",
    description: "Büyük Boy Mangal, aile ve grup aktiviteleri için mükemmel.",
    price: 500,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
    category: "mangal",
    hasOptions: false,
  },
];

export const brands = [
  { name: "BURGER A", color: "#FF6B00" },
  { name: "EKMEK ARASI A", color: "#1a1a1a" },
  { name: "DÖNER A", color: "#dc2626" },
  { name: "HIZLI KASAP", color: "#dc2626" },
  { name: "YOLBOYU LEZZETLERİ", color: "#16a34a" },
  { name: "SOSİS A", color: "#1a1a1a" },
];
