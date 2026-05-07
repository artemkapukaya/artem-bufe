import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice } = useCart();
  const [, navigate] = useLocation();

  const handleOrder = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b bg-gray-900 text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-orange-400" />
            <h2 className="font-bold text-lg">Sepetim</h2>
            {items.length > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)} ürün
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <ShoppingCart size={64} className="opacity-20" />
              <p className="font-semibold text-lg">Sepetiniz Boş</p>
              <p className="text-sm text-center">Sepetinizde henüz ürün bulunmuyor.</p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-2 px-6 py-2 bg-orange-500 text-white rounded-full font-bold text-sm hover:bg-orange-600 transition-colors"
              >
                Alışverişe Başla
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">{item.name}</p>
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                        {item.selectedOptions.map((opt, idx) => (
                          <p key={idx}>{opt.name}: {opt.value}</p>
                        ))}
                      </div>
                    )}
                    <p className="text-red-600 font-bold text-sm mt-0.5">
                      {(item.price * item.quantity).toLocaleString("tr-TR")} TL
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-600">Toplam</span>
              <span className="font-black text-xl text-red-600">
                {totalPrice.toLocaleString("tr-TR")} TL
              </span>
            </div>
            <button
              onClick={handleOrder}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-base rounded-xl hover:from-red-500 hover:to-orange-400 transition-all duration-200 shadow-md active:scale-95"
            >
              Ödeme Sayfasına Git
            </button>
          </div>
        )}
      </div>
    </>
  );
}
