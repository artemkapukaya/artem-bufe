import { useState } from "react";
import { 
  User, Package, MapPin, LogOut, ChevronRight, 
  Plus, Edit2, Trash2, Search, FileText 
} from "lucide-react";

// Menü ve İçerik Yönetimi için Tipler
type ActiveView = "profile" | "orders" | "addresses" | "billing";

export default function UserProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ActiveView>("profile");
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Login kontrolü

  // 1. RESİM: SAĞ ÜST AÇILIR MENÜ (DROPDOWN)
  const ProfileDropdown = () => (
    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-100">
      {/* Header: Turuncu-Kırmızı Gradient Area */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold border border-white/30">
            E
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">Ergin Kapukaya</p>
            <p className="text-sm opacity-80">905319588088</p>
          </div>
        </div>
      </div>

      {/* Menü Seçenekleri */}
      <div className="p-2">
        <MenuButton 
          icon={<User className="text-blue-500" />} 
          label="Hesabım" 
          subLabel="Profil ve ayarlar" 
          onClick={() => { setView("profile"); setIsOpen(false); }}
        />
        <MenuButton 
          icon={<Package className="text-green-500" />} 
          label="Siparişlerim" 
          subLabel="Geçmiş siparişler" 
          onClick={() => { setView("orders"); setIsOpen(false); }}
        />
        <MenuButton 
          icon={<MapPin className="text-purple-500" />} 
          label="Adreslerim" 
          subLabel="Teslimat adresleri" 
          onClick={() => { setView("addresses"); setIsOpen(false); }}
        />
        
        <div className="border-t my-2" />
        
        <button className="w-full flex items-center gap-4 p-4 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors">
          <LogOut size={20} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative p-4 flex justify-end bg-gray-50 min-h-screen">
      {/* SAĞ ÜST TETİKLEYİCİ BUTON */}
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white p-2 px-4 rounded-full shadow-md border hover:shadow-lg transition-all"
        >
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">EK</div>
          <span className="font-medium text-sm text-gray-700 font-black">Profilim</span>
        </button>
        {isOpen && <ProfileDropdown />}
      </div>

      {/* ANA İÇERİK ALANI (Tıklandığında Değişen Yer) */}
      <div className="fixed inset-0 top-20 flex justify-center items-start overflow-auto p-4 md:p-10 pointer-events-none">
        <div className="w-full max-w-5xl pointer-events-auto">
          {view === "addresses" && <AddressesView />}
          {view === "orders" && <OrdersView />}
        </div>
      </div>
    </div>
  );
}

// YARDIMCI BİLEŞEN: MENÜ BUTONU (1. Resimdeki Stil)
function MenuButton({ icon, label, subLabel, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-white shadow-sm transition-colors">
          {icon}
        </div>
        <div className="text-left">
          <p className="font-bold text-gray-800 text-sm leading-tight">{label}</p>
          <p className="text-xs text-gray-400">{subLabel}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  );
}

// 2. VE 4. RESİM: ADRESLERİM GÖRÜNÜMÜ
function AddressesView() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="text-orange-500" />
            <h2 className="text-2xl font-black text-gray-800">Adreslerim</h2>
          </div>
          <p className="text-gray-500 text-sm">Teslimat adreslerinizi yönetin</p>
        </div>
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-orange-200 hover:scale-105 transition-transform">
          <Plus size={20} /> Yeni adres ekle
        </button>
      </div>

      <div className="grid gap-4">
        {/* Örnek Adres Kartı */}
        <div className="border-2 border-orange-100 rounded-3xl p-6 relative bg-orange-50/30">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Teslimat Adresi</span>
                    <h3 className="font-black text-lg">Ev</h3>
                    <p className="text-gray-600 text-sm leading-relaxed max-w-md">
                        Rami Kışla, oto tec sanayi sitesi, Bina No: 15-1, Kat: 1, Daire No: 15<br/>
                        Topçular, Eyüpsultan, İstanbul
                    </p>
                    <p className="text-xs text-gray-400 italic">Tarif: oto tec sanayi sitesi 2. blok Artem büfe</p>
                </div>
                <div className="flex flex-col gap-2">
                    <button className="flex items-center gap-2 border px-4 py-2 rounded-xl text-sm font-bold hover:bg-white"><Edit2 size={14}/> Düzenle</button>
                    <button className="flex items-center gap-2 border px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50"><Trash2 size={14}/> Sil</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

// 3. RESİM: SİPARİŞLERİM GÖRÜNÜMÜ
function OrdersView() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
            <Package className="text-orange-500" />
            <h2 className="text-2xl font-black text-gray-800">Siparişlerim</h2>
        </div>
        
        {/* Filtreleme Alanı */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Arama</label>
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input placeholder="Sipariş no..." className="w-full pl-10 pr-4 py-2 rounded-xl border-none focus:ring-2 focus:ring-orange-500 text-sm"/></div>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Durum</label>
                <select className="w-full px-4 py-2 rounded-xl border-none text-sm"><option>Tüm Siparişler</option></select>
            </div>
            {/* Diğer filtreler... */}
        </div>

        {/* Sipariş Kartı */}
        <div className="border-t-4 border-orange-500 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h4 className="font-black text-lg text-gray-800">Sipariş #17394287</h4>
                            <span className="bg-green-100 text-green-600 text-[10px] font-black px-3 py-1 rounded-full">TAMAMLANDI</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">14 Nisan 2026 10:41 • Kapıda Ödeme (Nakit)</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-gray-800">651,00 ₺</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Toplam</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Teslimat</p>
                        <div className="flex gap-2">
                            <MapPin size={16} className="text-gray-300" />
                            <p className="text-xs font-bold text-gray-600">Ev <br/><span className="font-normal text-gray-400 text-[10px]">Topçular, Eyüpsultan</span></p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Ürünler</p>
                        <div className="flex gap-2 flex-wrap">
                            <span className="bg-white px-2 py-1 rounded-lg border text-[10px] font-bold"><b className="text-orange-500">1x</b> POŞET</span>
                            <span className="bg-white px-2 py-1 rounded-lg border text-[10px] font-bold"><b className="text-orange-500">1x</b> Ç. KÖFTE</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                    <button className="flex-1 border-2 py-3 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-colors">Sipariş Detayları</button>
                    <button className="flex-1 bg-orange-500 text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-orange-100 hover:bg-orange-600 transition-colors">Tekrar Sipariş Ver</button>
                </div>
            </div>
        </div>
    </div>
  );
}