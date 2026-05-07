import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, MapPin, CheckCircle, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import SocialShare from "@/components/SocialShare";

type CheckoutStep = "address" | "payment" | "confirm";

interface AddressData {
    fullName: string;
    phoneNumber: string;
    addressLine: string;
    city: string;
    district: string;
    postalCode: string;
}

const DISTRICTS_BY_CITY: Record<string, string[]> = {
    "İstanbul": ["Adalar", "Avcılar", "Bağcıklar", "Bahçelievler", "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer", "Şile", "Şişli", "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu"],
    "Ankara": ["Altındağ", "Çankaya", "Etimesgut", "Keçiören", "Mamak", "Sincan", "Yenimahalle"],
    "İzmir": ["Aliağa", "Balçova", "Bornova", "Çeşme", "Çiğli", "Gaziemir", "Karşıyaka", "Konak"],
};

const mockPaymentMethods = [
    { id: 1, name: "Kredi Kartı", slug: "card", icon: "💳" },
    { id: 2, name: "Kapıda Ödeme", slug: "cash", icon: "💵" },
    { id: 3, name: "Sodexo", slug: "sodexo", icon: "🍽️" },
    { id: 4, name: "Multinet", slug: "multinet", icon: "💳" },
    { id: 5, name: "Edenred", slug: "edenred", icon: "🎫" },
    { id: 6, name: "Metropol", slug: "metropol", icon: "🏙️" },
];

export default function Checkout() {
    const [, navigate] = useLocation();
    const { items, totalPrice, clearCart } = useCart();
    const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{code: string; type: string; value: number} | null>(null);
    const [couponError, setCouponError] = useState("");
    const [showSocialShare, setShowSocialShare] = useState(false);
    const [completedOrderNumber, setCompletedOrderNumber] = useState("");
    const [cardData, setCardData] = useState({ number: "", name: "", expiry: "", cvv: "" });

    const [addressData, setAddressData] = useState<AddressData>({
        fullName: "Ergin Kapukaya",
        phoneNumber: "905319588088",
        addressLine: "",
        city: "İstanbul",
        district: "",
        postalCode: "",
    });

    const createOrderMutation = trpc.adminOrders.create.useMutation();

    if (items.length === 0 && currentStep !== "confirm") {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <p className="text-gray-600 mb-4 font-bold">Sepetiniz boş</p>
                    <button onClick={() => navigate("/")} className="px-6 py-2 bg-orange-500 text-white font-bold rounded-lg">Menüye Dön</button>
                </div>
                <Footer />
            </div>
        );
    }

    const handleAddressSubmit = () => {
        if (!addressData.fullName || !addressData.phoneNumber || !addressData.addressLine || !addressData.district) {
            toast.error("Lütfen tüm alanları doldurun");
            return;
        }
        setCurrentStep("payment");
        toast.success("Adres kaydedildi!");
    };

    const handlePaymentSubmit = () => {
        if (!paymentMethod) {
            toast.error("Lütfen bir ödeme yöntemi seçin");
            return;
        }
        const isCard = ["card", "sodexo", "multinet", "edenred", "metropol"].includes(paymentMethod);
        if (isCard && (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv)) {
            toast.error("Lütfen kart bilgilerini eksiksiz giriniz!");
            return;
        }
        setCurrentStep("confirm");
        toast.success("Ödeme yöntemi seçildi!");
    };

    // Şefin gizli notunu müşteri adı/telefonuyla eşleştir
    const applyCoupon = () => {
        setCouponError("");
        if (!couponCode.trim()) return;
        try {
            const campaigns = JSON.parse(localStorage.getItem("artem_campaigns") || "[]");
            const found = campaigns.find((c: any) =>
                c.code === couponCode.toUpperCase() && c.active &&
                new Date(c.expiresAt) > new Date() && c.usedCount < c.usageLimit
            );
            if (!found) { setCouponError("Geçersiz veya süresi dolmuş kod!"); return; }
            setAppliedCoupon({ code: found.code, type: found.type, value: found.value });
            const updated = campaigns.map((c: any) => c.code === found.code ? { ...c, usedCount: c.usedCount + 1 } : c);
            localStorage.setItem("artem_campaigns", JSON.stringify(updated));
        } catch { setCouponError("Hata oluştu!"); }
    };
    const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(""); setCouponError(""); };
    const discountAmount = appliedCoupon ? (appliedCoupon.type === "percent" ? (totalPrice * appliedCoupon.value) / 100 : Math.min(appliedCoupon.value, totalPrice)) : 0;
    const finalPrice = Math.max(0, totalPrice - discountAmount);

    const getChefNote = () => {
        try {
            const saved = localStorage.getItem("artem_chef_notes");
            if (!saved) return null;
            const notes = JSON.parse(saved);
            return notes.find((n: any) =>
                n.customerName.toLowerCase() === addressData.fullName.toLowerCase() ||
                (n.phone && n.phone === addressData.phoneNumber)
            ) ?? null;
        } catch { return null; }
    };

    const handleConfirmOrder = async () => {
        // Minimum sipariş kontrolü
        const minOrder = Number(localStorage.getItem("artem_min_order") || "0");
        if (minOrder > 0 && finalPrice < minOrder) {
            toast.error(`Minimum sipariş tutarı ${minOrder} ₺!`);
            return;
        }

        // Çalışma saatleri kontrolü
        const hours = JSON.parse(localStorage.getItem("artem_hours") || "{}");
        const now = new Date();
        const dayOfWeek = now.getDay();
        const key = dayOfWeek === 0 ? "sunday" : dayOfWeek === 6 ? "saturday" : "weekday";
        const openTime = hours[key+"_open"] || "08:00";
        const closeTime = hours[key+"_close"] || "22:00";
        const [openH, openM] = openTime.split(":").map(Number);
        const [closeH, closeM] = closeTime.split(":").map(Number);
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const openMinutes = openH * 60 + openM;
        const closeMinutes = closeH * 60 + closeM;
        if (openMinutes > 0 && (nowMinutes < openMinutes || nowMinutes > closeMinutes)) {
            toast.error(`Şu an kapalıyız! Çalışma saatlerimiz: ${openTime} - ${closeTime}`);
            return;
        }

        setLoading(true);
        const orderNote = `Müşteri: ${addressData.fullName} | Tel: ${addressData.phoneNumber} | Adres: ${addressData.addressLine} / ${addressData.district} | Ödeme: ${paymentMethod} | Ürünler: ${items.map(i => `${i.quantity}x ${i.name}`).join(", ")}`;

        try {
            // totalPrice TL cinsinden geliyor — kuruşa çevirip tam sayıya yuvarlıyoruz
            const totalInKurus = Math.round(Number(finalPrice) * 100);
            const orderNumber = `ARTEM-${Date.now().toString().slice(-6)}`;

            await createOrderMutation.mutateAsync({
                totalAmount: totalInKurus,
                orderNumber,
                statusNotes: orderNote,
            });

            // Profil sayfası için localStorage'a kaydet
            const savedOrders = JSON.parse(localStorage.getItem("artem_orders") || "[]");
            const newOrder = {
                id: orderNumber,
                date: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
                status: "HAZIRLANIYOR",
                total: `₺${finalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}${appliedCoupon ? ` (${appliedCoupon.code} indirimi uygulandı)` : ""})`,
                items: items.map(i => `${i.quantity}x ${i.name}`).join(", "),
                images: items.map(i => ({ name: i.name, image: i.image, quantity: i.quantity, price: i.price })),
                payment: paymentMethod === "cash" ? "Kapıda Ödeme" : paymentMethod === "card" ? "Kredi Kartı" : paymentMethod ?? "Belirtilmedi",
                address: `${addressData.addressLine}, ${addressData.district} / ${addressData.city}`,
                phone: addressData.phoneNumber,
            };
            savedOrders.unshift(newOrder);
            localStorage.setItem("artem_orders", JSON.stringify(savedOrders));

            clearCart();
            toast.success("Siparişiniz başarıyla alındı! 🎉", {
                description: `Sipariş No: ${orderNumber}`,
                duration: 4000,
            });
            // Sosyal paylaşım göster
            setCompletedOrderNumber(orderNumber);
            setTimeout(() => setShowSocialShare(true), 1500);
            setTimeout(() => navigate("/orders"), 8000);
        } catch (error: any) {
            console.error("Sipariş hatası:", error);
            toast.error("Hata oluştu, tekrar deneyin.", {
                description: error?.message ?? "Bilinmeyen hata",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="h-14 md:h-16" />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <button onClick={() => navigate("/")} className="flex items-center gap-2 text-orange-600 font-bold mb-8">
                    <ChevronLeft size={20} /> Geri Dön
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {currentStep === "address" && (
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-6"><MapPin className="text-orange-500" size={24} /> <h2 className="text-2xl font-black">Teslimat Adresi</h2></div>
                                <div className="space-y-4">
                                    <input type="text" placeholder="Ad Soyad" value={addressData.fullName} onChange={(e) => setAddressData({ ...addressData, fullName: e.target.value })} className="w-full px-4 py-3 border rounded-lg" />
                                    <input type="tel" placeholder="Telefon" value={addressData.phoneNumber} onChange={(e) => setAddressData({ ...addressData, phoneNumber: e.target.value })} className="w-full px-4 py-3 border rounded-lg" />
                                    <textarea placeholder="Tam Adres" value={addressData.addressLine} onChange={(e) => setAddressData({ ...addressData, addressLine: e.target.value })} className="w-full px-4 py-3 border rounded-lg" rows={3} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <select value={addressData.city} onChange={(e) => setAddressData({ ...addressData, city: e.target.value })} className="w-full px-4 py-3 border rounded-lg"><option>İstanbul</option><option>Ankara</option><option>İzmir</option></select>
                                        <select value={addressData.district} onChange={(e) => setAddressData({ ...addressData, district: e.target.value })} className="w-full px-4 py-3 border rounded-lg">
                                            <option value="">İlçe Seçin</option>
                                            {DISTRICTS_BY_CITY[addressData.city]?.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === "payment" && (
                            <div className="space-y-6">

                                {/* 🎁 İndirim Kodu */}
                                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
                                    <p className="font-black text-gray-800 mb-3 flex items-center gap-2">🎁 İndirim Kodu</p>
                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between bg-green-100 border border-green-300 rounded-xl px-4 py-3">
                                            <div>
                                                <p className="font-black text-green-700 text-lg">{appliedCoupon.code}</p>
                                                <p className="text-xs text-green-600 mt-0.5">
                                                    {appliedCoupon.type === "percent" ? `%${appliedCoupon.value} indirim uygulandı!` : `${appliedCoupon.value} ₺ indirim uygulandı!`}
                                                </p>
                                            </div>
                                            <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 font-bold px-3 py-1 bg-red-50 rounded-lg">✕ Kaldır</button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex gap-2">
                                                <input type="text" value={couponCode}
                                                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                                                    placeholder="Kampanya kodu girin..."
                                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-mono font-bold uppercase"
                                                />
                                                <button onClick={applyCoupon}
                                                    className="px-5 py-3 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition-colors">
                                                    Uygula
                                                </button>
                                            </div>
                                            {couponError && <p className="text-red-500 text-sm font-bold mt-2">{couponError}</p>}
                                        </>
                                    )}
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-6"><CreditCard className="text-orange-500" size={24} /><h2 className="text-2xl font-black">Ödeme Yöntemi</h2></div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {mockPaymentMethods.map((method) => (
                                            <button key={method.id} onClick={() => setPaymentMethod(method.slug)} className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === method.slug ? "border-orange-500 bg-orange-50 shadow-md" : "border-gray-100"}`}>
                                                <div className="text-4xl mb-2">{method.icon}</div>
                                                <p className="font-bold text-sm">{method.name}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {["card", "sodexo", "multinet", "edenred", "metropol"].includes(paymentMethod || "") && (
                                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-in fade-in">
                                        <h3 className="text-lg font-black mb-4 uppercase">{paymentMethod} Bilgileri</h3>
                                        <div className="space-y-3">
                                            <input type="text" placeholder="Kart Numarası" value={cardData.number} onChange={(e) => setCardData({ ...cardData, number: e.target.value })} className="w-full px-4 py-3 border rounded-lg font-mono" />
                                            <input type="text" placeholder="Kart Sahibi" value={cardData.name} onChange={(e) => setCardData({ ...cardData, name: e.target.value })} className="w-full px-4 py-3 border rounded-lg" />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input type="text" placeholder="AA/YY" value={cardData.expiry} onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })} className="w-full px-4 py-3 border rounded-lg text-center font-mono" />
                                                <input type="text" placeholder="CVV" value={cardData.cvv} onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })} className="w-full px-4 py-3 border rounded-lg text-center font-mono" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStep === "confirm" && (
                            <div className="space-y-4">
                                {/* Onay başlığı */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                                    <CheckCircle size={56} className="text-green-500 mx-auto mb-3" />
                                    <h2 className="text-2xl font-black mb-1">Siparişi Tamamla</h2>
                                    <p className="text-gray-500 text-sm mb-4">Lütfen bilgilerinizi kontrol edip onaylayın.</p>
                                    {(() => {
                                        const chefNote = getChefNote();
                                        if (!chefNote) return null;
                                        return (
                                            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-left mb-2 animate-in fade-in duration-500">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-2xl shrink-0">{chefNote.emoji}</span>
                                                    <div>
                                                        <p className="font-black text-amber-800 text-sm mb-1">👨‍🍳 Şef Notunuz Hazır!</p>
                                                        <p className="text-amber-700 text-sm font-semibold leading-relaxed">{chefNote.note}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Teslimat bilgileri */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="font-black text-gray-700 text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <MapPin size={16} className="text-orange-500" /> Teslimat Bilgileri
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Ad Soyad</p>
                                            <p className="font-black text-gray-800">{addressData.fullName}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Telefon</p>
                                            <p className="font-black text-gray-800">{addressData.phoneNumber}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 sm:col-span-2">
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Adres</p>
                                            <p className="font-black text-gray-800">{addressData.addressLine}, {addressData.district} / {addressData.city}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Ödeme yöntemi */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="font-black text-gray-700 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <CreditCard size={16} className="text-orange-500" /> Ödeme Yöntemi
                                    </h3>
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 inline-flex items-center gap-2">
                                        <span className="text-xl">{mockPaymentMethods.find(m => m.slug === paymentMethod)?.icon}</span>
                                        <span className="font-black text-orange-700">{mockPaymentMethods.find(m => m.slug === paymentMethod)?.name}</span>
                                    </div>
                                </div>

                                {/* Sipariş edilen ürünler */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="font-black text-gray-700 text-sm uppercase tracking-wide mb-4">🍽️ Sipariş Edilen Ürünler</h3>
                                    <div className="space-y-3">
                                        {items.map(item => (
                                            <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                                <img src={item.image} className="w-12 h-12 rounded-lg object-cover" alt={item.name} />
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                                                    <p className="text-xs text-gray-500">{item.quantity} Adet × {item.price.toLocaleString()} TL</p>
                                                </div>
                                                <p className="font-black text-orange-600">{(item.price * item.quantity).toLocaleString()} TL</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <span className="font-black text-gray-700">Toplam</span>
                                        <span className="font-black text-2xl text-red-600">{finalPrice.toLocaleString()} TL</span>
                                    {appliedCoupon && <span className="text-xs text-green-600 font-bold block">({discountAmount.toLocaleString("tr-TR")} ₺ indirim uygulandı)</span>}
                                    </div>
                                </div>

                                {/* Onay butonları */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button onClick={handleConfirmOrder} disabled={loading}
                                        className="flex-1 py-4 bg-green-600 text-white font-black rounded-xl text-lg hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg">
                                        {loading ? "GÖNDERİLİYOR..." : "✓ SİPARİŞİ ONAYLA"}
                                    </button>
                                    <button onClick={() => navigate("/")}
                                        className="flex-1 py-4 bg-gray-100 text-gray-800 font-black rounded-xl hover:bg-gray-200">
                                        VAZGEÇ
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="text-lg font-black mb-6">Sipariş Özeti</h3>
                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3 items-center p-2 rounded-lg border-b">
                                        <img src={item.image} className="w-12 h-12 rounded-lg object-cover" alt={item.name} />
                                        <div className="flex-1">
                                            <p className="font-bold text-sm leading-tight">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.quantity} Adet</p>
                                        </div>
                                        <p className="font-black text-orange-600">{(item.price * item.quantity).toLocaleString()} TL</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between font-black text-xl mb-6">
                                <span>Toplam</span>
                                <span className="text-red-600">{finalPrice.toLocaleString()} TL</span>
                                    {appliedCoupon && <span className="text-xs text-green-600 font-bold block">({discountAmount.toLocaleString("tr-TR")} ₺ indirim uygulandı)</span>}
                            </div>

                            {currentStep === "address" && (
                                <button onClick={handleAddressSubmit} className="w-full py-4 bg-orange-500 text-white font-black rounded-xl hover:bg-orange-600 transition-all shadow-lg">DEVAM ET</button>
                            )}
                            {currentStep === "payment" && (
                                <button onClick={handlePaymentSubmit} className="w-full py-4 bg-orange-500 text-white font-black rounded-xl hover:bg-orange-600 transition-all shadow-lg">ÖDEME BİLGİLERİNİ KAYDET</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {showSocialShare && (
                <SocialShare
                    orderNumber={completedOrderNumber}
                    onClose={() => { setShowSocialShare(false); navigate("/orders"); }}
                />
            )}
            <Footer />
        </div>
    );
}