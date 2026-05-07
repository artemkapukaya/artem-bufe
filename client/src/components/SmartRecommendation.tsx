import { useState, useEffect } from "react";
import { ShoppingCart, Sparkles, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { products as staticProducts } from "@/lib/data";
import { toast } from "sonner";

// Hangi ürünün yanına ne gider — kural tabanlı "AI"
const PAIRINGS: Record<string, string[]> = {
  // Çiğ ürünler yanına içecek ve çorba
  "cig-urunler":    ["mercimek-corba-porsiyon", "mercimek-corba-az", "et-suyu-corba"],
  // Izgara yanına çorba ve tatlı
  "izgara-urunler": ["mercimek-corba-porsiyon", "ekmek-kadayifi", "ekmek-kadayifi-kaymakli"],
  // Burger yanına patates ve içecek
  "ekmek-arasi":    ["porsiyon-patates", "porsiyon-citir-3lu", "porsiyon-3lu-set"],
  // Döner yanına tatlı
  "doner":          ["ekmek-kadayifi", "ekmek-kadayifi-kaymakli", "porsiyon-patates"],
  // Tatlı yanına çay
  "tatli-icecek":   ["mercimek-corba-porsiyon"],
};

// Satış sayısı simülasyonu — gerçekçilik için
function getSalesCount(productId: string): number {
  const key = `artem_sales_${productId}`;
  const saved = localStorage.getItem(key);
  if (saved) return Number(saved);
  // İlk kez — rastgele ama tutarlı sayı ata
  const count = 12 + Math.floor(Math.random() * 88);
  localStorage.setItem(key, String(count));
  return count;
}

function incrementSales(productId: string) {
  const key = `artem_sales_${productId}`;
  const current = Number(localStorage.getItem(key) ?? 0);
  localStorage.setItem(key, String(current + 1));
}

interface SmartRecommendationProps {
  addedProductId: string;
  addedProductCategory: string;
  onClose: () => void;
}

export default function SmartRecommendation({
  addedProductId,
  addedProductCategory,
  onClose,
}: SmartRecommendationProps) {
  const { addItem } = useCart();
  const [customProducts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("artem_custom_products") || "[]"); } catch { return []; }
  });

  const allProducts = [...staticProducts, ...customProducts];
  const pairedIds   = PAIRINGS[addedProductCategory] ?? [];

  // Eşleşen ürünleri bul (max 2)
  const recommendations = pairedIds
    .map(id => allProducts.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, 2) as typeof staticProducts;

  if (recommendations.length === 0) return null;

  const salesCount = getSalesCount(addedProductId);

  const handleAdd = (product: typeof staticProducts[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    incrementSales(product.id);
    toast.success(`${product.name} sepete eklendi!`, { duration: 1500 });
    onClose();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1500] w-80 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-300" />
            <span className="text-white font-black text-sm">Akıllı Öneri</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Sosyal kanıt */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs text-gray-500 font-bold">
            🔥 Bu ürünü alan <span className="text-orange-500 font-black">{salesCount} kişi</span> yanında genellikle şunları da aldı:
          </p>
        </div>

        {/* Önerilen ürünler */}
        <div className="p-3 space-y-2">
          {recommendations.map(product => (
            <div key={product.id}
              className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors group">
              <img
                src={product.image || "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=80&h=80&fit=crop"}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover shrink-0"
                onError={e => { e.currentTarget.src = "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=80&h=80&fit=crop"; }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{product.name}</p>
                <p className="font-black text-orange-600 text-sm">{product.price.toLocaleString("tr-TR")} ₺</p>
              </div>
              <button
                onClick={() => handleAdd(product)}
                className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center
                           hover:bg-orange-600 group-hover:scale-110 transition-all shrink-0"
              >
                <ShoppingCart size={15} />
              </button>
            </div>
          ))}
        </div>

        <div className="px-4 pb-3">
          <button onClick={onClose} className="w-full text-xs text-gray-400 hover:text-gray-600 font-bold py-1">
            Teşekkürler, gerek yok →
          </button>
        </div>
      </div>
    </div>
  );
}

// Yardımcı hook — ProductCard'da kullanılacak
export { getSalesCount, incrementSales };
