import { useState } from "react";
import { 
  Trash2, Plus, Minus, ShoppingBag, CreditCard, 
  Truck, ShieldCheck, ChevronRight, MapPin 
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

export default function CartPage() {
  // Örnek sepet verisi (Normalde Context veya Redux'tan gelecek)
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Yusuf Köfte Menü", price: 145, qty: 1, img: "https://images.unsplash.com/photo-1547050605-2f268da56360?auto=format&fit=crop&q=80&w=200" },
    { id: 2, name: "Artem Özel Soslu Tavuk", price: 120, qty: 1, img: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=200" },
  ]);

  const subTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const shipping = subTotal > 500 ? 0 : 25; // 500 TL üzeri bedava olsun

  const updateQty = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast.error("Ürün sepetten çıkarıldı.");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col pt-20">
      <Header />
      
      <main className="flex-1 max-w-[1200px] mx-auto w-full p-4 md:p-8">
        {/* Sayfa Başlığı */}
        <div className="flex items-center gap-3 mb-8 ml-2">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-red-600">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase text-gray-900">Sepetim</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{cartItems.length} Ürün Var</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* SEPET LİSTESİ */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex items-center gap-6 group hover:border-red-500 transition-all">
                <img src={item.img} alt={item.name} className="w-24 h-24 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                  <p className="text-red-600 font-black text-xl tracking-tighter">₺{item.price}</p>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
                  <button onClick={() => updateQty(item.id, -1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-red-500 transition-colors"><Minus size={16}/></button>
                  <span className="font-black text-sm w-4 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-red-500 transition-colors"><Plus size={16}/></button>
                </div>

                <button onClick={() => removeItem(item.id)} className="p-4 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            {cartItems.length === 0 && (
              <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100">
                <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold">Sepetin şu an boş krall!</p>
              </div>
            )}
          </div>

          {/* SİPARİŞ ÖZETİ (ÖDEME ÖNCESİ) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl sticky top-28">
              <h3 className="font-black text-lg uppercase tracking-widest border-b pb-4 mb-6">Sipariş Özeti</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between font-bold text-gray-400 text-sm uppercase">
                  <span>Ara Toplam</span>
                  <span className="text-gray-800 tracking-tighter">₺{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-400 text-sm uppercase">
                  <span>Teslimat</span>
                  <span className="text-green-500 tracking-tighter">{shipping === 0 ? "Ücretsiz" : `₺${shipping.toFixed(2)}`}</span>
                </div>
                <div className="h-px bg-gray-50 my-2"></div>
                <div className="flex justify-between items-end">
                  <span className="font-black text-xs uppercase text-gray-400 mb-1">Toplam Tutar</span>
                  <span className="text-4xl font-black text-red-600 tracking-tighter leading-none">₺{(subTotal + shipping).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-red-600 text-white py-5 rounded-[20px] font-black uppercase text-xs tracking-[2px] shadow-xl shadow-red-100 hover:bg-black transition-all flex items-center justify-center gap-3">
                  ÖDEMEYE GEÇ <ChevronRight size={18} />
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-4">
                  <ShieldCheck size={14} className="text-green-500" /> %100 Güvenli Ödeme
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}