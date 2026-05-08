/**
 * ARTEM BÜFE FAST FOOD - Ana Sayfa
 * Köfteci Yusuf sitesinin birebir klonu
 * - Sticky header (bg-gray-900)
 * - Tam genişlik slider banner (4 slide, otomatik geçiş)
 * - Arama çubuğu
 * - Yatay kaydırmalı kategori çubuğu
 * - Ürün kartları (kategori bazlı)
 * - Markalarımız bölümü
 * - Footer
 */
import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Search, ChevronLeft, ChevronRight, ChevronRight as ArrowRight } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { categories as staticCategories, products as staticProducts, brands } from "@/lib/data";
import LuckyWheel from "@/components/LuckyWheel";
import SmartRecommendation from "@/components/SmartRecommendation";

// localStorage'dan admin tarafından eklenen özel ürünleri ve kategorileri al
function useAllProducts() {
  const { data: customProducts = [] } = trpc.adminProducts.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  return [...staticProducts, ...(customProducts as typeof staticProducts)];
}


function useAllCategories() {
  const { data: dbData } = trpc.adminCategories.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const overrides = (dbData as any)?.overrides ?? {};
  const customIds: string[] = (dbData as any)?.customIds ?? [];

  const merged = staticCategories
    .filter(sc => !(overrides[sc.id] as any)?.hidden)
    .map(sc => ({
      ...sc,
      name:  overrides[sc.id]?.name  ?? sc.name,
      image: overrides[sc.id]?.image ?? sc.image,
      icon:  overrides[sc.id]?.icon  ?? sc.icon,
    }));

  const custom = customIds.map((id: string) => ({
    id,
    name:  overrides[id]?.name  ?? id,
    image: overrides[id]?.image ?? "",
    icon:  overrides[id]?.icon  ?? "🍽️",
    count: 0,
  }));

  return [...merged, ...custom];
}

const bannerSlides = [
  {
    id: 1,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663487052184/bLocZyMmJdJmEC4xZVbbo2/banner1-ecYdtaat9DAsbjyCRcLU8o.webp",
    alt: "Enfes İki Lezzet Buluştu",
  },
  {
    id: 2,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663487052184/bLocZyMmJdJmEC4xZVbbo2/banner2-egWhQvcSxFEzQFXKibJTkp.webp",
    alt: "Döner Lezzet",
  },
  {
    id: 3,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663487052184/bLocZyMmJdJmEC4xZVbbo2/banner3-8p5LQWAyLXqhAyTkM9dis7.webp",
    alt: "Izgara Lezzet",
  },
  {
    id: 4,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663487052184/bLocZyMmJdJmEC4xZVbbo2/banner4-eHA3MUJpp5x94etbSd2dWe.webp",
    alt: "Çıtır Lezzet",
  },
];

export default function Home() {
  const products = useAllProducts();
  const categories = useAllCategories();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("cig-urunler");
  const [showWheel, setShowWheel] = useState(false);
  const [lastAdded, setLastAdded] = useState<{ id: string; category: string } | null>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-slide
  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
  }, []);

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoSlide]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    startAutoSlide();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
    startAutoSlide();
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    startAutoSlide();
  };

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesSearch;
  });

  const getProductsByCategory = (categoryId: string) =>
    filteredProducts.filter((p) => p.category === categoryId);

  // Scroll to category section
  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    const el = document.getElementById(`cat-${catId}`);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const scrollCategories = (dir: "left" | "right") => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        left: dir === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Spacer for fixed header */}
      <div className="h-14 md:h-16" />

      {/* ===== BANNER SLIDER ===== */}
      <section className="relative w-full bg-black overflow-hidden" style={{ minHeight: "280px", maxHeight: "520px", aspectRatio: "16/6" }}>
        {/* Slides */}
        <div className="relative w-full h-full">
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Prev/Next buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all duration-200"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all duration-200"
        >
          <ChevronRight size={18} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-6 h-2.5 bg-white scale-110"
                  : "w-2.5 h-2.5 bg-red-500 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ===== SEARCH BAR ===== */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Menüde ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-white shadow-sm transition-colors"
          />
        </div>
      </div>



      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Section title */}
        <h2 className="text-xl font-black text-gray-800 mb-4">Ürünlerimiz</h2>

        {/* Category scroll */}
        <div className="relative mb-6">
          <button
            onClick={() => scrollCategories("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors -ml-2"
          >
            <ChevronLeft size={16} />
          </button>
          <div
            ref={categoryScrollRef}
            className="category-scroll flex gap-3 overflow-x-auto pb-2 px-2 scroll-smooth"
            style={{ scrollbarWidth: "thin" }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all duration-200 shrink-0 w-28 ${
                  activeCategory === cat.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-orange-300"
                }`}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-3xl">{(cat as any).icon || "🍽️"}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-bold text-center leading-tight ${
                    activeCategory === cat.id ? "text-orange-600" : "text-gray-700"
                  }`}
                >
                  {cat.name}
                </span>
                <span className="text-xs text-gray-400">{cat.count} ürün</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => scrollCategories("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors -mr-2"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Products by category */}
        {searchQuery ? (
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-4">
              "{searchQuery}" için {filteredProducts.length} sonuç
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredProducts.map((product) => (
                <div key={product.id} onClick={() => {
                  setTimeout(() => setLastAdded({ id: product.id, category: product.category }), 600);
                }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>{
            (() => {
              const activeCatIds = new Set(filteredProducts.map(p => p.category));
              return categories.filter(c => activeCatIds.has(c.id));
            })().map((cat) => {
              const catProducts = getProductsByCategory(cat.id);
              if (catProducts.length === 0) return null;
              return (
                <div key={cat.id} id={`cat-${cat.id}`} className="mb-8 scroll-mt-20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">{(cat as any).icon || "🍽️"}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-base text-gray-800">{cat.name}</h3>
                        <p className="text-xs text-gray-500">{catProducts.length} ürün</p>
                      </div>
                    </div>
                    <Link
                      href={`/menu#${cat.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full hover:bg-orange-600 transition-colors"
                    >
                      Tümü <ArrowRight size={12} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {catProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })
          }</>
        )}
      </div>

      {/* ===== MARKALARIMIZ ===== */}
      <section className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-800 mb-2">Markalarımız</h2>
            <p className="text-gray-500 text-sm">Güvenilir ve kaliteli markalarla en iyi deneyimi sunuyoruz</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {brands.map((brand) => (
              <div
                key={brand.name}
                className="px-6 py-3 border-2 rounded-xl font-black text-sm tracking-wide hover:shadow-md transition-shadow cursor-pointer"
                style={{ borderColor: brand.color, color: brand.color }}
              >
                {brand.name}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-6">Binlerce müşterinin güvendiği markalar</p>
        </div>
      </section>

      {showWheel && <LuckyWheel onClose={() => setShowWheel(false)} />}

      {/* Sağ alt sabit yuvarlak çark butonu */}
      <button
        onClick={() => setShowWheel(true)}
        title="Ne Yiyeceğime Karar Ver!"
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full
                   bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500
                   text-white text-2xl shadow-2xl
                   hover:scale-110 active:scale-95 transition-all duration-200
                   flex items-center justify-center
                   ring-4 ring-white ring-offset-2 ring-offset-transparent"
      >
        🎰
      </button>
      {lastAdded && (
        <SmartRecommendation
          addedProductId={lastAdded.id}
          addedProductCategory={lastAdded.category}
          onClose={() => setLastAdded(null)}
        />
      )}
      <Footer />
    </div>
  );
}
