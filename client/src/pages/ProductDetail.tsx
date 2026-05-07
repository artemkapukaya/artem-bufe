import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { ChevronLeft, Heart, ShoppingCart, Plus, Minus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { products as staticProducts } from "@/lib/data";
import { toast } from "sonner";

interface OptionItem {
  id: string;
  label: string;
  emoji: string;
  priceModifier?: number;
  isDefault?: boolean;
}

interface OptionGroup {
  id: string;
  name: string;
  type: "single" | "multi" | "remove";
  required?: boolean;
  items: OptionItem[];
}

interface Selected {
  groupId: string;
  groupName: string;
  type: "single" | "multi" | "remove";
  itemId: string;
  label: string;
  emoji: string;
  price: number;
}

// Komagene tarzı seçenek şablonları
const TEMPLATES: Record<string, OptionGroup[]> = {
  "cig-urunler": [
    {
      id: "size", name: "Porsiyon Seçimi", type: "single", required: true,
      items: [
        { id: "s1", label: "Küçük", emoji: "🔵", priceModifier: 0, isDefault: true },
        { id: "s2", label: "Orta", emoji: "⚪", priceModifier: 1500 },
        { id: "s3", label: "Büyük", emoji: "⬜", priceModifier: 3000 },
      ]
    },
    {
      id: "acilık", name: "Acılık Seçimi", type: "single", required: false,
      items: [
        { id: "a0", label: "Acısız", emoji: "😊", isDefault: true },
        { id: "a1", label: "Az Acılı", emoji: "🌶️" },
        { id: "a2", label: "Orta Acılı", emoji: "🌶️🌶️" },
        { id: "a3", label: "Çok Acılı", emoji: "🌶️🌶️🌶️" },
      ]
    },
    {
      id: "lavash", name: "Lavaş Seçimi", type: "single", required: false,
      items: [
        { id: "l0", label: "Lavaşsız", emoji: "🚫", isDefault: true },
        { id: "l1", label: "İnce Lavaş", emoji: "🫓", priceModifier: 500 },
        { id: "l2", label: "Kalın Lavaş", emoji: "🍞", priceModifier: 500 },
        { id: "l3", label: "Tam Buğday", emoji: "🌾", priceModifier: 500 },
      ]
    },
    {
      id: "garnish", name: "Garnitür Seçimi", type: "multi", required: false,
      items: [
        { id: "g0", label: "Garnitür İstemiyorum", emoji: "⛔" },
        { id: "g1", label: "Göbek Marul", emoji: "🥬" },
        { id: "g2", label: "Domates", emoji: "🍅" },
        { id: "g3", label: "Mısır", emoji: "🌽" },
        { id: "g4", label: "Roka", emoji: "🌿" },
        { id: "g5", label: "Havuç", emoji: "🥕" },
        { id: "g6", label: "Jalapeno", emoji: "🫑" },
        { id: "g7", label: "Dereotu", emoji: "🌱" },
        { id: "g8", label: "Maydanoz", emoji: "🌿" },
        { id: "g9", label: "Nane", emoji: "🍀" },
        { id: "g10", label: "Turp", emoji: "🔴" },
        { id: "g11", label: "Taze Soğan", emoji: "🧅" },
        { id: "g12", label: "Salatalık", emoji: "🥒" },
        { id: "g13", label: "Sivri Biber", emoji: "🌶️" },
        { id: "g14", label: "Turşu", emoji: "🥒" },
        { id: "g15", label: "Kapya Biber", emoji: "🫑" },
      ]
    },
    {
      id: "sauce", name: "Sos Seçimi", type: "single", required: false,
      items: [
        { id: "s0", label: "Sos İstemiyorum", emoji: "🚫", isDefault: true },
        { id: "s1", label: "Ekşi Çiğ Köfte Sosu", emoji: "🍷" },
        { id: "s2", label: "Limon", emoji: "🍋" },
        { id: "s3", label: "Burger Sosu", emoji: "🥣" },
        { id: "s4", label: "Afrika Ateşi", emoji: "🔥" },
        { id: "s5", label: "Çiğ Köfte Sosu", emoji: "🌶️" },
        { id: "s6", label: "Çok Acı Sos", emoji: "💥" },
        { id: "s7", label: "Creamy Jalapeno", emoji: "🫙" },
      ]
    },
    {
      id: "nar", name: "Nar Ekşisi", type: "single", required: false,
      items: [
        { id: "n0", label: "İstemiyorum", emoji: "🚫", isDefault: true },
        { id: "n1", label: "Az", emoji: "🍇" },
        { id: "n2", label: "Normal", emoji: "🍇🍇" },
        { id: "n3", label: "Bol", emoji: "🍇🍇🍇" },
      ]
    },
  ],
  "izgara-urunler": [
    {
      id: "cooking", name: "Pişirme Derecesi", type: "single", required: true,
      items: [
        { id: "c1", label: "Az Pişmiş", emoji: "🥩" },
        { id: "c2", label: "Orta Pişmiş", emoji: "🥩🔥", isDefault: true },
        { id: "c3", label: "İyi Pişmiş", emoji: "🔥🔥" },
      ]
    },
    {
      id: "remove", name: "Çıkarılacak Malzeme", type: "remove", required: false,
      items: [
        { id: "r1", label: "Soğan", emoji: "🧅" },
        { id: "r2", label: "Domates", emoji: "🍅" },
        { id: "r3", label: "Biber", emoji: "🫑" },
        { id: "r4", label: "Maydanoz", emoji: "🌿" },
      ]
    },
    {
      id: "sauce", name: "Sos Seçimi", type: "single", required: false,
      items: [
        { id: "s0", label: "Sosgz", emoji: "🚫", isDefault: true },
        { id: "s1", label: "Acı Sos", emoji: "🌶️" },
        { id: "s2", label: "Sarımsaklı", emoji: "🧄" },
        { id: "s3", label: "BBQ", emoji: "🍖" },
      ]
    },
  ],
  "ekmek-arasi": [
    {
      id: "bread", name: "Ekmek Seçimi", type: "single", required: false,
      items: [
        { id: "b1", label: "Normal", emoji: "🍞", isDefault: true },
        { id: "b2", label: "Tam Buğday", emoji: "🌾" },
        { id: "b3", label: "Dürüm", emoji: "🌯" },
      ]
    },
    {
      id: "remove", name: "Çıkarılacak", type: "remove", required: false,
      items: [
        { id: "r1", label: "Soğan", emoji: "🧅" },
        { id: "r2", label: "Domates", emoji: "🍅" },
        { id: "r3", label: "Turşu", emoji: "🥒" },
        { id: "r4", label: "Marul", emoji: "🥬" },
        { id: "r5", label: "Sos", emoji: "🥣" },
      ]
    },
    {
      id: "sauce", name: "Sos Ekle", type: "multi", required: false,
      items: [
        { id: "s1", label: "Ketçap", emoji: "🍅" },
        { id: "s2", label: "Mayonez", emoji: "🥣" },
        { id: "s3", label: "Hardal", emoji: "💛" },
        { id: "s4", label: "Acı Sos", emoji: "🌶️" },
        { id: "s5", label: "Sarımsaklı", emoji: "🧄" },
      ]
    },
  ],
  "doner": [
    {
      id: "type", name: "Servis Şekli", type: "single", required: true,
      items: [
        { id: "t1", label: "Tabak", emoji: "🍽️", isDefault: true },
        { id: "t2", label: "Dürüm", emoji: "🌯" },
        { id: "t3", label: "Ekmek Arası", emoji: "🥪" },
      ]
    },
    {
      id: "remove", name: "Çıkarılacak", type: "remove", required: false,
      items: [
        { id: "r1", label: "Soğan", emoji: "🧅" },
        { id: "r2", label: "Domates", emoji: "🍅" },
        { id: "r3", label: "Maydanoz", emoji: "🌿" },
        { id: "r4", label: "Turşu", emoji: "🥒" },
      ]
    },
    {
      id: "sauce", name: "Sos", type: "single", required: false,
      items: [
        { id: "s0", label: "Sosgz", emoji: "🚫", isDefault: true },
        { id: "s1", label: "Acı Sos", emoji: "🌶️" },
        { id: "s2", label: "Sarımsaklı", emoji: "🧄" },
      ]
    },
  ],
};

const DEFAULT_GROUPS: OptionGroup[] = [
  {
    id: "extras", name: "Özel İstek", type: "multi", required: false,
    items: [
      { id: "e1", label: "Az Tuzlu", emoji: "🧂" },
      { id: "e2", label: "Az Yağlı", emoji: "💧" },
      { id: "e3", label: "Acısız", emoji: "😊" },
    ]
  }
];

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Selected[]>([]);
  const [liked, setLiked] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);

  const [allProducts, setAllProducts] = useState(() => {
    try {
      const custom = JSON.parse(localStorage.getItem("artem_custom_products") || "[]");
      return [...staticProducts, ...custom];
    } catch { return [...staticProducts]; }
  });

  useEffect(() => {
    const load = () => {
      try {
        const custom = JSON.parse(localStorage.getItem("artem_custom_products") || "[]");
        setAllProducts([...staticProducts, ...custom]);
      } catch {}
    };
    window.addEventListener("artem_products_updated", load);
    return () => window.removeEventListener("artem_products_updated", load);
  }, []);

  const product = params?.id ? allProducts.find(p => p.id === params.id) : null;
  const groups: OptionGroup[] = product
    ? ((product as any).optionGroups?.length > 0
        ? (product as any).optionGroups
        : (TEMPLATES[product.category] ?? DEFAULT_GROUPS))
    : [];

  useEffect(() => {
    if (!product) return;
    const defaults: Selected[] = [];
    groups.forEach(g => {
      g.items.filter(i => i.isDefault).forEach(item => {
        defaults.push({ groupId: g.id, groupName: g.name, type: g.type, itemId: item.id, label: item.label, emoji: item.emoji, price: item.priceModifier || 0 });
      });
    });
    setSelected(defaults);
  }, [product?.id]);

  const isSelected = (gid: string, iid: string) => selected.some(s => s.groupId === gid && s.itemId === iid);

  // Emoji yoksa varsayılan ata
  const getEmoji = (item: OptionItem, groupType: string) => {
    if (item.emoji) return item.emoji;
    if (groupType === "remove") return "🚫";
    return "🍽️";
  };

  const toggle = (group: OptionGroup, item: OptionItem) => {
    setSelected(prev => {
      if (group.type === "single") {
        const rest = prev.filter(s => s.groupId !== group.id);
        const already = prev.find(s => s.groupId === group.id && s.itemId === item.id);
        if (already && !group.required) return rest;
        return [...rest, { groupId: group.id, groupName: group.name, type: group.type, itemId: item.id, label: item.label, emoji: item.emoji, price: item.priceModifier || 0 }];
      } else {
        const exists = prev.find(s => s.groupId === group.id && s.itemId === item.id);
        if (exists) return prev.filter(s => !(s.groupId === group.id && s.itemId === item.id));
        return [...prev, { groupId: group.id, groupName: group.name, type: group.type, itemId: item.id, label: item.label, emoji: item.emoji, price: item.priceModifier || 0 }];
      }
    });
  };

  const extraPrice = selected.reduce((sum, s) => sum + s.price, 0) / 100;
  const unitPrice = (product?.price || 0) + extraPrice;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (!product) return;
    const missing = groups.filter(g => g.required && !selected.find(s => s.groupId === g.id)).map(g => g.name);
    if (missing.length > 0) { toast.error(`Lütfen seçin: ${missing.join(", ")}`); return; }
    for (let i = 0; i < quantity; i++) {
      addItem({ id: `${product.id}-${Date.now()}-${i}`, name: product.name, price: unitPrice, image: product.image, selectedOptions: selected.map(s => ({ name: s.groupName, value: s.label, priceModifier: s.price })) });
    }
    toast.success(`${quantity}x ${product.name} sepete eklendi! 🎉`);
    const sk = `artem_sales_${product.id}`;
    localStorage.setItem(sk, String(Number(localStorage.getItem(sk) || 0) + quantity));
    setQuantity(1);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="h-16" />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-400 text-lg mb-4">Ürün bulunamadı</p>
          <button onClick={() => navigate("/menu")} className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl">Menüye Dön</button>
        </div>
        <Footer />
      </div>
    );
  }

  const sales = Number(localStorage.getItem(`artem_sales_${product.id}`) || Math.floor(20 + Math.random() * 80));

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="h-14 md:h-16" />

      {/* Geri */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <button onClick={() => navigate(-1 as any)} className="flex items-center gap-1 text-red-500 font-bold text-sm hover:text-red-600 mb-4">
          <ChevronLeft size={18} /> Geri Dön
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-24">
        {/* Ürün üst kısım */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Sol — Resim */}
          <div className="w-full md:w-80 shrink-0">
            <div className="relative rounded-3xl overflow-hidden bg-gray-50 shadow-lg">
              <img
                src={product.image || "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500"}
                alt={product.name}
                className="w-full h-72 md:h-80 object-cover"
                onError={e => { e.currentTarget.src = "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500"; }}
              />
              <button
                onClick={() => setLiked(!liked)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${liked ? "bg-red-500" : "bg-white"}`}
              >
                <Heart size={20} className={liked ? "text-white fill-white" : "text-gray-400"} />
              </button>
            </div>
          </div>

          {/* Sağ — Bilgi */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{product.name}</h1>
            {product.description && <p className="text-gray-500 mb-4 leading-relaxed">{product.description}</p>}

            {/* Rozetler */}
            <div className="flex flex-wrap gap-2 mb-5">
              {sales > 30 && (
                <span className="bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full">⭐ En Çok Satılan</span>
              )}
              <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full">🔥 Bugün {Math.floor(sales * 0.15) + 1} sipariş</span>
              <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-1.5 rounded-full">⚡ 30-45 dk</span>
            </div>

            {/* Fiyat */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-4xl font-black text-red-500">{unitPrice.toLocaleString("tr-TR")} TL</span>
              {extraPrice > 0 && <span className="text-sm text-gray-400">+{extraPrice.toLocaleString("tr-TR")} TL seçenek</span>}
            </div>

            {/* Adet */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-black text-xl transition-colors">
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-black text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-black text-xl transition-colors">
                  <Plus size={18} />
                </button>
              </div>
              <div className="text-sm text-gray-500 font-bold">
                Toplam: <span className="text-red-500 font-black text-base">{totalPrice.toLocaleString("tr-TR")} TL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seçenek Grupları — Komagene tarzı */}
        <div className="space-y-6">
          {groups.map((group, gi) => (
            <div key={group.id} className="border border-gray-200 rounded-2xl overflow-hidden">
              {/* Başlık */}
              <div className={`px-5 py-4 flex items-center justify-between ${
                group.type === "remove"
                  ? "bg-red-50"
                  : "bg-gray-50"
              }`}>
                <h3 className="font-black text-gray-800 text-base">
                  <span className="text-red-500 mr-2">{gi + 1}.</span>
                  {group.name}
                  {group.required && <span className="ml-2 text-xs text-red-500 font-bold">(Zorunlu)</span>}
                </h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  group.type === "remove" ? "bg-red-100 text-red-600" :
                  group.type === "single" ? "bg-orange-100 text-orange-600" :
                  "bg-green-100 text-green-600"
                }`}>
                  {group.type === "single" ? "Tek seçim" : group.type === "remove" ? "Çıkar" : "Çoklu"}
                </span>
              </div>

              {/* Malzemeler */}
              <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {group.items.map(item => {
                  const sel = isSelected(group.id, item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle(group, item)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all relative ${
                        sel
                          ? group.type === "remove"
                            ? "border-red-400 bg-red-50 shadow-md"
                            : "border-red-400 bg-red-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-red-300 hover:shadow-sm"
                      }`}
                    >
                      {/* Seçim göstergesi */}
                      {sel && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-[10px] font-black">✓</span>
                        </div>
                      )}

                      {/* Emoji */}
                      {(() => {
                        const emoji = getEmoji(item, group.type);
                        const imgMap: Record<string, string> = {
                          "🥬": "https://img.icons8.com/color/96/lettuce.png",
                          "🍅": "https://img.icons8.com/color/96/tomato.png",
                          "🌽": "https://img.icons8.com/color/96/corn.png",
                          "🌿": "https://img.icons8.com/color/96/basil.png",
                          "🥕": "https://img.icons8.com/color/96/carrot.png",
                          "🫑": "https://img.icons8.com/color/96/green-pepper.png",
                          "🌱": "https://img.icons8.com/color/96/plant-under-rain.png",
                          "🍀": "https://img.icons8.com/color/96/four-leaf-clover.png",
                          "🔴": "https://img.icons8.com/color/96/beet.png",
                          "🧅": "https://img.icons8.com/color/96/onion.png",
                          "🥒": "https://img.icons8.com/color/96/cucumber.png",
                          "🌶️": "https://img.icons8.com/color/96/hot-pepper.png",
                          "🚫": "https://img.icons8.com/color/96/cancel--v1.png",
                          "⛔": "https://img.icons8.com/color/96/no-entry.png",
                          "🍷": "https://img.icons8.com/color/96/wine-glass.png",
                          "🍋": "https://img.icons8.com/color/96/lemon.png",
                          "🥣": "https://img.icons8.com/color/96/bowl-of-rice.png",
                          "🔥": "https://img.icons8.com/color/96/fire-element.png",
                          "🍇": "https://img.icons8.com/color/96/grapes.png",
                          "🍞": "https://img.icons8.com/color/96/bread.png",
                          "🌯": "https://img.icons8.com/color/96/burrito.png",
                          "🥩": "https://img.icons8.com/color/96/steak-rare.png",
                          "🧄": "https://img.icons8.com/color/96/garlic.png",
                          "🍽️": "https://img.icons8.com/color/96/restaurant.png",
                          "😊": "https://img.icons8.com/color/96/happy--v1.png",
                          "🥪": "https://img.icons8.com/color/96/sandwich.png",
                          "🫓": "https://img.icons8.com/color/96/pita-bread.png",
                          "💛": "https://img.icons8.com/color/96/mustard.png",
                          "🍖": "https://img.icons8.com/color/96/meat.png",
                        };
                        const imgSrc = imgMap[emoji];
                        return imgSrc ? (
                          <img src={imgSrc} alt={item.label}
                            className={`w-14 h-14 object-contain ${group.type === "remove" && sel ? "opacity-30" : ""}`}
                            onError={e => { e.currentTarget.style.display="none"; }} />
                        ) : (
                          <span className={`text-3xl leading-none ${group.type === "remove" && sel ? "opacity-30" : ""}`}>{emoji}</span>
                        );
                      })()}

                      {/* İsim */}
                      <span className={`text-[11px] font-bold text-center leading-tight ${sel ? "text-red-600" : "text-gray-700"}`}>
                        {item.label}
                      </span>

                      {/* Fiyat */}
                      {item.priceModifier && item.priceModifier > 0 ? (
                        <span className="text-[10px] font-black text-orange-500">+{(item.priceModifier / 100).toFixed(0)}₺</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Seçim özeti */}
        {selected.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Seçimleriniz</p>
            <div className="flex flex-wrap gap-2">
              {selected.map((s, i) => (
                <span key={i} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                  s.type === "remove" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-700"
                }`}>
                  <span>{s.emoji || "🍽️"}</span>
                  <span>{s.label}</span>
                  {s.price > 0 && <span className="text-orange-500">+{(s.price/100).toFixed(0)}₺</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Sepete Ekle — Komagene tarzı */}
      <div className="fixed bottom-0 left-0 z-30 bg-white border-t border-gray-200 shadow-2xl px-4 py-3" style={{right: "0", maxWidth: "100%"}}>
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden shrink-0">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-black transition-colors">
              <Minus size={16} />
            </button>
            <span className="w-10 text-center font-black">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-black transition-colors">
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-3 py-3.5 bg-red-500 hover:bg-red-600 text-white font-black text-base rounded-xl transition-all active:scale-95 shadow-lg"
          >
            <ShoppingCart size={20} />
            SEPETE EKLE
            <span className="bg-white/20 px-3 py-1 rounded-lg font-black">
              {totalPrice.toLocaleString("tr-TR")} TL
            </span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
