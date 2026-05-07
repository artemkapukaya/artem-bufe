import { ShoppingCart, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useLocation } from "wouter";
import type { Product } from "@/lib/data";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();
    const [, navigate] = useLocation();

    const handleDetails = () => {
        navigate(`/product/${product.id}`);
    };

    const handleAddToCart = () => {
        addItem({
            id: String(product.id),
            name: product.name,
            price: product.price,
            image: product.image,
        });

        toast.success(`✅ ${product.name} sepete eklendi!`, {
            description: `Fiyat: ${product.price.toLocaleString("tr-TR")} TL`,
            duration: 2000,
            position: "top-center",
        });
    };

    const handleImageClick = () => {
        navigate(`/product/${product.id}`);
    };

    return (
        <div className="product-card bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">

            {/* Image */}
            <div
                className="relative overflow-hidden bg-gray-50 cursor-pointer"
                style={{ aspectRatio: '4/3' }}
                onClick={handleImageClick}
            >
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                />

                {/* 🔥 Social Proof Badge (köşede hafif premium) */}
                {typeof product.orderCount === "number" && product.orderCount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md animate-pulse">
                        🔥 {product.orderCount} sipariş
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col flex-1">
                <h3 className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight mb-1">
                    {product.name}
                </h3>

                <p className="text-xs text-gray-500 line-clamp-2 flex-1 mb-2">
                    {product.description}
                </p>

                <div className="flex items-center justify-between mt-auto mb-2">
                    <span className="text-red-600 font-black text-base">
                        {product.price.toLocaleString("tr-TR")} TL
                    </span>
                </div>

                {/* Buttons */}
                <div className="flex gap-1.5 w-full">
                    <button
                        onClick={handleDetails}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
                    >
                        <Plus size={14} />
                        +Detaylar
                    </button>

                    <button
                        onClick={handleAddToCart}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold bg-green-500 text-white hover:bg-green-600 active:bg-green-700 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
                    >
                        <ShoppingCart size={14} />
                        Sepete Ekle
                    </button>
                </div>
            </div>
        </div>
    );
}