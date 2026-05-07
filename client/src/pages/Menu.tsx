import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { categories as staticCategories, products as staticProducts } from "@/lib/data";

function useAllProducts() {
    const [customProducts, setCustomProducts] = useState<typeof staticProducts>(() => {
        try {
            const saved = localStorage.getItem("artem_custom_products");
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [orderStats, setOrderStats] = useState<Record<string, number>>({});

    // DB'den yükle
    trpc.adminProducts.list.useQuery(undefined, {
        onSuccess: (data: any) => {
            if (data && data.length > 0) {
                setCustomProducts(data);
                localStorage.setItem("artem_custom_products", JSON.stringify(data));
            }
        },
        refetchOnWindowFocus: true,
        staleTime: 0,
    });

    useEffect(() => {
        const load = () => {
            try {
                const saved = localStorage.getItem("artem_custom_products");
                if (saved) setCustomProducts(JSON.parse(saved));
            } catch {
                setCustomProducts([]);
            }

            try {
                const orders = JSON.parse(localStorage.getItem("artem_orders") || "[]");
                const stats: Record<string, number> = {};

                orders.forEach((order: any) => {
                    order.images?.forEach((item: any) => {
                        stats[item.name] = (stats[item.name] || 0) + item.quantity;
                    });
                });

                setOrderStats(stats);
            } catch { }
        };

        load();
        window.addEventListener("artem_products_updated", load);
        window.addEventListener("storage", load);

        return () => {
            window.removeEventListener("artem_products_updated", load);
            window.removeEventListener("storage", load);
        };
    }, []);

    const allProducts = [...staticProducts, ...customProducts];

    return allProducts.map((p: any) => ({
        ...p,
        orderCount: orderStats[p.name] ?? 0,
    }));
}

function useAllCategories() {
    const [overrides, setOverrides] = useState<Record<string, any>>({});
    const [customIds, setCustomIds] = useState<string[]>([]);

    useEffect(() => {
        const load = () => {
            try {
                const saved = localStorage.getItem("artem_category_overrides");
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setOverrides(parsed.overrides ?? {});
                    setCustomIds(parsed.customIds ?? []);
                }
            } catch { }
        };

        load();
        window.addEventListener("artem_products_updated", load);
        return () => window.removeEventListener("artem_products_updated", load);
    }, []);

    const merged = staticCategories.map((sc) => ({
        ...sc,
        name: overrides[sc.id]?.name ?? sc.name,
        image: overrides[sc.id]?.image ?? sc.image,
        icon: overrides[sc.id]?.icon ?? sc.icon,
    }));

    const custom = customIds.map((id) => ({
        id,
        name: overrides[id]?.name ?? id,
        image: overrides[id]?.image ?? "",
        icon: overrides[id]?.icon ?? "🍽️",
        count: overrides[id]?.count ?? 0,
    }));

    return [...merged, ...custom];
}

export default function Menu() {
    const products = useAllProducts();
    const categories = useAllCategories();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredProducts = products
        .filter((p: any) => {
            const matchesSearch = searchQuery
                ? p.name.toLowerCase().includes(searchQuery.toLowerCase())
                : true;
            const matchesCategory =
                activeCategory === "all" || p.category === activeCategory;

            return matchesSearch && matchesCategory;
        })
        .sort((a: any, b: any) => (b.orderCount ?? 0) - (a.orderCount ?? 0));

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="h-14 md:h-16" />

            <div className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-black">MENÜMÜZ</h1>
                    <p className="text-gray-400 mt-1">Tüm lezzetlerimizi keşfedin</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="relative max-w-xl mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Menüde ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-white shadow-sm"
                    />
                </div>

                <div className="flex gap-6">
                    <div className="hidden md:block w-56 shrink-0">
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm sticky top-20">
                            <div className="p-3 bg-gray-900 text-white">
                                <h3 className="font-bold text-sm">KATEGORİLER</h3>
                            </div>
                            <div className="p-2">
                                <button
                                    onClick={() => setActiveCategory("all")}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${activeCategory === "all"
                                            ? "bg-orange-50 text-orange-600"
                                            : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    Tümü ({products.length})
                                </button>

                                {categories.map((cat) => {
                                    const count = products.filter((p: any) => p.category === cat.id).length;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${activeCategory === cat.id
                                                    ? "bg-orange-50 text-orange-600"
                                                    : "text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            {cat.name} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <p className="text-lg font-semibold">Ürün bulunamadı</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {filteredProducts.map((product: any, index) => (
                                    <div key={product.id} className="relative">
                                        {index === 0 && (
                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md z-10 shadow">
                                                ⭐ EN ÇOK SATILAN
                                            </div>
                                        )}
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}