import { useState, useEffect } from "react";
import { MapPin, Package, User, ChevronRight, LogOut, X, Trash2, Edit2, Plus, Mail, ShoppingBag, Phone, Building2, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ProfilePage() {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState<"orders" | "account" | "addresses" | "coins">("orders");
    const [showAddrModal, setShowAddrModal] = useState(false);
    const [showKvkkModal, setShowKvkkModal] = useState(false);
    const [editingAddr, setEditingAddr] = useState<any>(null);
    const [addrType, setAddrType] = useState<"Bireysel" | "Kurumsal">("Bireysel");

    // Siparişler — localStorage'dan yükle (DB'ye de bakıyoruz)
    const [realOrders, setRealOrders] = useState<any[]>([]);

    const [vault, setVault] = useState<any>({
        user: { fullName: "Ergin Kapukaya", email: "ergin@artembufe.com", phone: "+90 531 958 80 88", regDate: "24 Nisan 2026" },
        addresses: [],
    });

    // localStorage'dan siparişleri ve vault'u yükle
    useEffect(() => {
        const loadOrders = () => {
            try {
                const saved = localStorage.getItem("artem_orders");
                setRealOrders(saved ? JSON.parse(saved) : []);
            } catch { setRealOrders([]); }
        };
        const savedVault = localStorage.getItem("artem_user_vault");
        if (savedVault) try { setVault(JSON.parse(savedVault)); } catch {}

        loadOrders();
        const interval = setInterval(loadOrders, 5000);
        return () => clearInterval(interval);
    }, [activeTab]);

    useEffect(() => {
        localStorage.setItem("artem_user_vault", JSON.stringify(vault));
    }, [vault]);

    // Gem hesaplama
    const totalSpent = realOrders.reduce((sum: number, o: any) => {
        const amount = parseFloat((o.total ?? "0").replace(/[^0-9,]/g, "").replace(",", ".")) || 0;
        return sum + amount;
    }, 0);
    const totalGems = Math.floor(totalSpent / 100) * 5;
    const gemLevel  = totalGems >= 500 ? "💎 Platin" : totalGems >= 200 ? "🥇 Altın" : totalGems >= 50 ? "🥈 Gümüş" : "🥉 Bronz";
    const nextLevel = totalGems >= 500 ? null : totalGems >= 200 ? 500 : totalGems >= 50 ? 200 : 50;
    const progress  = nextLevel ? Math.min((totalGems / nextLevel) * 100, 100) : 100;

    const statusColor: Record<string, string> = {
        "HAZIRLANIYOR": "bg-blue-100 text-blue-600",
        "YOLDA": "bg-orange-100 text-orange-600",
        "TESLİM EDİLDİ": "bg-green-100 text-green-600",
        "İPTAL EDİLDİ": "bg-red-100 text-red-600",
        "BEKLENİYOR": "bg-yellow-100 text-yellow-600",
    };

    const deleteOrder = (orderId: string) => {
        const updated = realOrders.filter((o: any) => o.id !== orderId);
        setRealOrders(updated);
        localStorage.setItem("artem_orders", JSON.stringify(updated));
        toast.success("Sipariş silindi.");
    };

    const clearAllOrders = () => {
        if (!window.confirm("Tüm sipariş geçmişinizi silmek istediğinize emin misiniz?")) return;
        setRealOrders([]);
        localStorage.removeItem("artem_orders");
        toast.success("Tüm siparişler temizlendi.");
    };

    const handleSaveAddress = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const newAddr = {
            id: editingAddr ? editingAddr.id : Date.now().toString(),
            title: data.get("title")?.toString(),
            type: addrType,
            phone: data.get("phone")?.toString(),
            detail: data.get("detail")?.toString(),
            taxOffice: addrType === "Kurumsal" ? data.get("taxOffice")?.toString() : "",
            taxNumber: addrType === "Kurumsal" ? data.get("taxNumber")?.toString() : "",
        };
        setVault({ ...vault, addresses: editingAddr
            ? vault.addresses.map((a: any) => a.id === editingAddr.id ? newAddr : a)
            : [...vault.addresses, newAddr]
        });
        toast.success("Adres kaydedildi.");
        setShowAddrModal(false);
        setEditingAddr(null);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col pt-20 font-sans text-gray-800">
            <Header />
            <main className="flex-1 max-w-[1200px] mx-auto w-full p-4 md:p-8">
                <div className="flex flex-col lg:flex-row gap-8 mt-6">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 shrink-0">
                        <div className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100 sticky top-28">
                            <div className="px-4 py-6 text-center border-b border-gray-50 mb-4">
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500">
                                    <User size={40} />
                                </div>
                                <h2 className="font-bold text-lg">{vault.user.fullName}</h2>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{vault.user.phone}</p>
                                {totalGems > 0 && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                                        <span className="text-sm">💎</span>
                                        <span className="text-xs font-black text-amber-600">{totalGems} Gem — {gemLevel}</span>
                                    </div>
                                )}
                            </div>
                            <nav className="space-y-1">
                                <SideTab icon={<Package size={18} />} label="Siparişlerim" active={activeTab === "orders"} onClick={() => setActiveTab("orders")} badge={realOrders.length} />
                                <SideTab icon={<User size={18} />} label="Hesap Bilgilerim" active={activeTab === "account"} onClick={() => setActiveTab("account")} />
                                <SideTab icon={<MapPin size={18} />} label="Adreslerim" active={activeTab === "addresses"} onClick={() => setActiveTab("addresses")} />
                                <SideTab icon={<span className="text-base">💎</span>} label="Artem Gem" active={activeTab === "coins"} onClick={() => setActiveTab("coins")} badge={totalGems > 0 ? totalGems : 0} />
                                <button onClick={() => logout()} className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 font-bold text-sm hover:bg-red-50 mt-4 transition-all">
                                    <LogOut size={18} /> Çıkış Yap
                                </button>
                            </nav>
                        </div>
                    </aside>

                    <div className="flex-1">
                        {/* SİPARİŞLERİM */}
                        {activeTab === "orders" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="flex items-center justify-between ml-2">
                                    <h3 className="font-bold text-xl tracking-tight">Siparişlerim</h3>
                                    {realOrders.length > 0 && (
                                        <button onClick={clearAllOrders} className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all border border-red-100 hover:border-red-300">
                                            <Trash2 size={12} /> Tümünü Temizle
                                        </button>
                                    )}
                                </div>
                                {realOrders.length === 0 ? (
                                    <div className="bg-white rounded-[32px] p-20 text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 uppercase text-xs">
                                        Siparişiniz bulunmuyor.
                                    </div>
                                ) : realOrders.map((order: any) => (
                                    <div key={order.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group hover:border-red-500 transition-all duration-300">
                                        <div className="p-5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between gap-2">
                                            <span className="text-[11px] font-black uppercase text-gray-400 truncate">#{order.id} | {order.date}</span>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase ${statusColor[order.status] ?? "bg-orange-100 text-orange-600"}`}>{order.status}</span>
                                                <button onClick={() => deleteOrder(order.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-all border border-red-100">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-3">
                                            {order.images && order.images.length > 0 ? order.images.map((item: any, i: number) => (
                                                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0" />
                                                    ) : (
                                                        <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100 shrink-0">
                                                            <ShoppingBag size={24} className="text-orange-400" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                                                        <p className="text-xs text-gray-400 font-bold mt-0.5">{item.quantity} Adet × {item.price?.toLocaleString("tr-TR")} TL</p>
                                                    </div>
                                                    <p className="font-black text-red-600 text-sm shrink-0">{((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString("tr-TR")} TL</p>
                                                </div>
                                            )) : (
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-red-500"><ShoppingBag size={28} /></div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800">{order.items}</h4>
                                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{order.payment}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mx-6 mb-6 mt-2 rounded-2xl overflow-hidden border border-gray-100">
                                            <div className="divide-y divide-gray-50">
                                                {order.address && (
                                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/60">
                                                        <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0"><MapPin size={13} className="text-orange-500" /></div>
                                                        <div className="min-w-0">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Teslimat Adresi</p>
                                                            <p className="text-xs font-bold text-gray-700 truncate">{order.address}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {order.phone && (
                                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/60">
                                                        <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0"><Phone size={13} className="text-green-500" /></div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Telefon</p>
                                                            <p className="text-xs font-bold text-gray-700">{order.phone}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {order.payment && (
                                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/60">
                                                        <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                                                            <span className="text-sm">{order.payment === "Kapıda Ödeme" ? "💵" : "💳"}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Ödeme Yöntemi</p>
                                                            <p className="text-xs font-bold text-gray-700">{order.payment}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-red-600 to-orange-500">
                                                <p className="text-white font-black text-xs uppercase tracking-widest opacity-80">Toplam Tutar</p>
                                                <p className="text-white font-black text-2xl tracking-tighter">{order.total}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ARTEM GEM */}
                        {activeTab === "coins" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h3 className="font-bold text-xl ml-2 tracking-tight">Artem Gem 💎</h3>
                                <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-[32px] p-7 text-white shadow-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-white/70 text-sm font-bold uppercase tracking-widest">Toplam Gem</p>
                                            <p className="text-6xl font-black mt-1">{totalGems}</p>
                                            <p className="text-white/80 text-sm mt-1 font-bold">💰 {totalSpent.toLocaleString("tr-TR")} TL harcandı</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-5xl mb-2">💎</div>
                                            <p className="font-black text-sm bg-white/20 px-3 py-1 rounded-full">{gemLevel}</p>
                                        </div>
                                    </div>
                                    {nextLevel && (
                                        <div>
                                            <div className="flex justify-between text-xs text-white/70 font-bold mb-1.5">
                                                <span>{totalGems} Gem</span>
                                                <span>Sonraki seviye: {nextLevel} Gem</span>
                                            </div>
                                            <div className="w-full bg-white/20 rounded-full h-2.5">
                                                <div className="bg-white rounded-full h-2.5 transition-all duration-500" style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-6">
                                    <h4 className="font-black text-gray-800 mb-4">Gem Ödülleri</h4>
                                    <div className="space-y-3">
                                        {[
                                            { gems: 50,  reward: "Mercimek Çorbası Bedava 🍲",  color: "text-green-600",  bg: "bg-green-50 border-green-200" },
                                            { gems: 100, reward: "%10 Sipariş İndirimi 🎁",      color: "text-blue-600",   bg: "bg-blue-50 border-blue-200" },
                                            { gems: 200, reward: "Ücretsiz Teslimat (1 Ay) 🚀",  color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
                                            { gems: 500, reward: "VIP Müşteri Statüsü 👑",       color: "text-amber-600",  bg: "bg-amber-50 border-amber-200" },
                                        ].map(({ gems, reward, color, bg }) => (
                                            <div key={gems} className={`flex items-center justify-between p-4 rounded-2xl border ${bg}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-black text-lg ${color}`}>{gems} 💎</span>
                                                    <span className="font-semibold text-gray-700 text-sm">{reward}</span>
                                                </div>
                                                {totalGems >= gems
                                                    ? <span className="bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full">✓ Kazanıldı</span>
                                                    : <span className="text-xs text-gray-400 font-bold">{gems - totalGems} Gem daha</span>
                                                }
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* HESAP BİLGİLERİM */}
                        {activeTab === "account" && (
                            <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-xl mb-8 border-b pb-4">Profil Bilgileri</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <ProfileField label="Ad Soyad" value={vault.user.fullName} onChange={(v: any) => setVault({ ...vault, user: { ...vault.user, fullName: v } })} />
                                    <ProfileField label="E-Posta" value={vault.user.email} onChange={(v: any) => setVault({ ...vault, user: { ...vault.user, email: v } })} />
                                    <ProfileField label="Telefon No" value={vault.user.phone} readOnly />
                                    <ProfileField label="Kayıt Tarihi" value={vault.user.regDate} readOnly />
                                </div>
                                <div className="mt-10 flex items-center justify-between gap-6 border-t pt-8">
                                    <button onClick={() => toast.success("Değişiklikler kaydedildi.")} className="bg-red-600 text-white font-black uppercase text-[11px] py-5 px-12 rounded-2xl hover:bg-black transition-all shadow-xl">Kaydet</button>
                                </div>
                            </div>
                        )}

                        {/* ADRESLERİM */}
                        {activeTab === "addresses" && (
                            <div className="space-y-6">
                                <div className="bg-white p-8 rounded-[32px] border border-gray-100 flex justify-between items-center shadow-sm">
                                    <h3 className="font-bold text-xl">Adreslerim</h3>
                                    <button onClick={() => { setEditingAddr(null); setShowAddrModal(true); }} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg">
                                        <Plus size={16} /> Yeni Ekle
                                    </button>
                                </div>
                                {vault.addresses.length === 0 && (
                                    <div className="bg-white rounded-[28px] border-2 border-dashed border-gray-100 p-12 text-center text-gray-400 font-bold text-xs uppercase">Kayıtlı adres yok</div>
                                )}
                                {vault.addresses.map((addr: any) => (
                                    <div key={addr.id} className="bg-white p-6 rounded-[28px] border border-gray-100 flex justify-between items-center group hover:border-red-500 transition-all">
                                        <div className="flex gap-5 items-center">
                                            <div className="p-4 bg-gray-50 rounded-2xl text-gray-400"><MapPin size={24} /></div>
                                            <div>
                                                <h4 className="font-bold text-sm uppercase">{addr.title}</h4>
                                                <p className="text-xs text-gray-400 font-medium max-w-md">{addr.detail}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingAddr(addr); setAddrType(addr.type); setShowAddrModal(true); }} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-blue-600"><Edit2 size={18} /></button>
                                            <button onClick={() => setVault({ ...vault, addresses: vault.addresses.filter((a: any) => a.id !== addr.id) })} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-red-600"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* ADRES MODAL */}
            {showAddrModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
                    <form onSubmit={handleSaveAddress} className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold">{editingAddr ? 'Adresi Düzenle' : 'Yeni Adres'}</h3>
                            <button type="button" onClick={() => setShowAddrModal(false)}><X className="text-gray-300" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl mb-4">
                                {["Bireysel", "Kurumsal"].map((t: any) => (
                                    <button key={t} type="button" onClick={() => setAddrType(t)} className={`flex-1 py-3.5 text-[10px] font-black rounded-xl uppercase transition-all ${addrType === t ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}>{t}</button>
                                ))}
                            </div>
                            <input required name="title" defaultValue={editingAddr?.title} placeholder="Adres Başlığı" className="w-full bg-gray-50 border rounded-2xl px-6 py-4 font-bold outline-none focus:border-red-500" />
                            <input required name="phone" defaultValue={editingAddr?.phone || vault.user.phone} placeholder="İletişim Numarası" className="w-full bg-gray-50 border rounded-2xl px-6 py-4 font-bold outline-none focus:border-red-500" />
                            <textarea required name="detail" defaultValue={editingAddr?.detail} placeholder="Mahalle, Cadde, Sokak, No..." className="w-full bg-gray-50 border rounded-2xl px-6 py-4 font-bold outline-none h-32 focus:border-red-500 resize-none" />
                            <button type="submit" className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all">KAYDET</button>
                        </div>
                    </form>
                </div>
            )}
            <Footer />
        </div>
    );
}

function SideTab({ icon, label, active, onClick, badge }: any) {
    return (
        <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${active ? 'bg-red-50 text-red-600 shadow-sm border border-red-100' : 'text-gray-500 hover:bg-gray-50'}`}>
            <div className="flex items-center gap-3 font-bold text-sm uppercase tracking-tighter">{icon} {label}</div>
            <div className="flex items-center gap-2">
                {badge > 0 && <span className="bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">{badge > 99 ? "99+" : badge}</span>}
                <ChevronRight size={14} className={active ? 'opacity-100' : 'opacity-0'} />
            </div>
        </button>
    );
}

function ProfileField({ label, value, onChange, readOnly }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{label}</label>
            <input readOnly={readOnly} value={value} onChange={(e) => onChange && onChange(e.target.value)}
                className={`w-full bg-gray-50 border border-gray-100 rounded-[22px] px-6 py-4 font-bold text-sm outline-none transition-all ${readOnly ? 'opacity-50' : 'focus:border-red-500'}`} />
        </div>
    );
}
