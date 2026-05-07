import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  LayoutDashboard, Package, CreditCard, LogOut, Menu, X,
  Eye, EyeOff, Trash2, ChevronDown, AlertCircle, CheckCircle2,
  Truck, Clock, RefreshCw, ShoppingBag, TrendingUp, Bell, Volume2, VolumeX,
  BarChart3, Award, Zap, Users, Tag, Percent, Gift,
  Phone, MapPin, User, Wallet, UtensilsCrossed, StickyNote,
  Hash, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminPaymentMethods from "@/components/admin/AdminPaymentMethods";
import CampaignManager from "@/components/admin/CampaignManager";

type AdminTab = "dashboard" | "products" | "payments" | "orders" | "customers" | "campaigns" | "analytics" | "settings";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [adminUser, setAdminUser] = useState<{ username: string } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Record<number, string>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [prevOrderCount, setPrevOrderCount] = useState(0);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
      const exp = Number(localStorage.getItem("adminTokenExp") || sessionStorage.getItem("adminTokenExp") || "0");
      if (!token || Date.now() >= exp) {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminTokenExp");
        window.location.href = "/admin-login";
        return;
      }
      setAdminUser({ username: localStorage.getItem("adminUsername") ?? "Admin" });
    };
    checkSession();
    // Token süresini 4 saat uzat — aktif kullanımda oturum düşmesin
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (token) {
      sessionStorage.setItem("adminTokenExp", String(Date.now() + 4 * 60 * 60 * 1000));
    }
  }, []); // navigate dependency yok — sadece mount'ta çalış

  const {
    data: orders = [],
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = trpc.adminOrders.list.useQuery(undefined, {
    refetchInterval: 10_000,  // 10 saniyede bir otomatik yenile
    refetchOnWindowFocus: true,
  });

  const updateStatusMutation = trpc.adminOrders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Sipariş durumu güncellendi!");
      // İki kez refetch — DB yazma gecikmesine karşı
      refetchOrders();
      setTimeout(() => refetchOrders(), 1000);
    },
    onError: (err) => toast.error(`Hata: ${err.message}`),
  });

  const deleteMutation = trpc.adminOrders.delete.useMutation({
    onSuccess: () => { toast.success("Sipariş kalıcı olarak silindi!"); refetchOrders(); setDeletingOrderId(null); },
    onError: (err) => toast.error(`Hata: ${err.message}`),
  });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminTokenExp");
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminTokenExp");
    toast.success("Çıkış yapıldı!");
    setTimeout(() => { window.location.href = "/admin-login"; }, 400);
  };

  const handleUpdateStatus = async (orderId: number) => {
    const status = selectedStatus[orderId];
    if (!status) { toast.error("Lütfen bir durum seçin!"); return; }
    setUpdatingOrderId(orderId);
    try {
      await updateStatusMutation.mutateAsync({ id: orderId, status: status as any });
      setSelectedStatus(prev => ({ ...prev, [orderId]: "" }));
    } catch(e) {
      // hata zaten onError'da gösteriliyor
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = (orderId: number) => {
    if (!window.confirm("Bu siparişi kalıcı olarak silmek istediğinizden emin misiniz?")) return;
    setDeletingOrderId(orderId);
    deleteMutation.mutate({ id: orderId });
  };

  const handlePasswordChange = () => {
    const currentPass = localStorage.getItem("adminPasswordHash") ?? "admin123";
    if (passwordData.oldPassword !== currentPass) { toast.error("Mevcut şifre yanlış!"); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error("Yeni şifreler eşleşmiyor!"); return; }
    if (passwordData.newPassword.length < 6) { toast.error("Yeni şifre en az 6 karakter olmalıdır!"); return; }
    localStorage.setItem("adminPasswordHash", passwordData.newPassword);
    toast.success("Şifre başarıyla değiştirildi!");
    setShowPasswordForm(false);
    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  const statusLabel: Record<string, string> = {
    pending: "Bekleniyor", preparing: "Hazırlanıyor", on_the_way: "Yolda",
    delivered: "Teslim Edildi", completed: "Tamamlandı", cancelled: "İptal Edildi",
  };
  const statusColor: Record<string, string> = {
    pending: "text-yellow-600", preparing: "text-blue-600", on_the_way: "text-orange-500",
    delivered: "text-green-600", completed: "text-green-700", cancelled: "text-red-500",
  };
  const statusBg: Record<string, string> = {
    pending: "bg-yellow-50 border-yellow-200", preparing: "bg-blue-50 border-blue-200",
    on_the_way: "bg-orange-50 border-orange-200", delivered: "bg-green-50 border-green-200",
    completed: "bg-green-50 border-green-200", cancelled: "bg-red-50 border-red-200",
  };

  const StatusIcon = ({ status }: { status: string }) => {
    const cls = "w-5 h-5";
    if (status === "preparing")  return (
        <div className="relative flex items-center justify-center w-5 h-5">
          <AlertCircle className="w-5 h-5 text-red-500 relative z-10" />
          <span className="absolute w-5 h-5 rounded-full bg-red-400 animate-ping opacity-60" />
        </div>
      );
    if (status === "on_the_way") return <Truck className={`${cls} text-orange-500`} />;
    if (status === "delivered" || status === "completed") return <CheckCircle2 className={`${cls} text-green-500`} />;
    if (status === "cancelled")  return <X className={`${cls} text-red-500`} />;
    return <Clock className={`${cls} text-yellow-500`} />;
  };

  const parseNote = (note: string | null) => {
    if (!note) return {} as Record<string, string>;
    const get = (k: string) => { const m = note.match(new RegExp(`${k}:\\s*([^|]+)`)); return m?.[1]?.trim() ?? ""; };
    return {
      customerName: get("Müşteri"), customerPhone: get("Tel"),
      address: get("Adres"), paymentMethod: get("Ödeme"),
      items: get("Ürünler"), notes: get("Not"),
    };
  };

  const adminName = adminUser?.username ?? "Admin";
  const today = new Date().toDateString();
  const todayOrders    = orders.filter(o => new Date(o.createdAt).toDateString() === today);

  // Haftalık ciro grafiği verisi
  const weeklyData = (() => {
    const days = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === d.toDateString());
      const revenue = dayOrders.reduce((s, o) => s + o.totalAmount / 100, 0);
      return { day: days[d.getDay() === 0 ? 6 : d.getDay() - 1], revenue, count: dayOrders.length };
    });
  })();
  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue), 1);

  // En çok satan ürünler
  const topProducts = (() => {
    const map: Record<string, { name: string; count: number }> = {};
    orders.forEach(o => {
      const items = (o.statusNotes ?? "").match(/Ürünler:\s*([^|]+)/)?.[1] ?? "";
      items.split(",").forEach(item => {
        const m = item.trim().match(/(\d+)x\s+(.+)/);
        if (m) {
          const key = m[2].trim();
          map[key] = { name: key, count: (map[key]?.count ?? 0) + Number(m[1]) };
        }
      });
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  })();
  const preparingCount = orders.filter(o => (o.currentStatus ?? o.status) === "preparing").length;
  const onWayCount     = orders.filter(o => (o.currentStatus ?? o.status) === "on_the_way").length;
  const pendingCount   = orders.filter(o => (o.currentStatus ?? o.status) === "pending").length;
  const totalRevenue   = orders.reduce((s, o) => s + o.totalAmount / 100, 0);

  const navItems = [
    { id: "dashboard"  as AdminTab, label: "Dashboard",        icon: LayoutDashboard, badge: 0 },
    { id: "orders"     as AdminTab, label: "Siparişler",        icon: ShoppingBag,     badge: pendingCount },
    { id: "products"   as AdminTab, label: "Yemek Kartları",    icon: Package,         badge: 0 },
    { id: "payments"   as AdminTab, label: "Ödeme Yöntemleri",  icon: CreditCard,      badge: 0 },
    { id: "customers"  as AdminTab, label: "Müşteriler",        icon: Users,           badge: 0 },
    { id: "campaigns"  as AdminTab, label: "Kampanyalar",       icon: Tag,             badge: 0 },
    { id: "analytics"  as AdminTab, label: "Analitik",          icon: BarChart3,       badge: 0 },
    { id: "settings"   as AdminTab, label: "Ayarlar",           icon: LayoutDashboard, badge: 0 },
  ];

  return (
    <>
      <Header />
      <div className="flex bg-gray-100" style={{minHeight: "calc(100vh - 64px)", marginTop: "0"}}>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
          <nav className="flex-1 p-4 space-y-1 pt-4">
            {/* Ana sayfaya geri dön */}
            <a href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all mb-2 text-sm font-bold border border-gray-700">
              <span>←</span> Ana Sayfaya Dön
            </a>
            <div className="border-t border-gray-700 mb-2" />
            {navItems.map(({ id, label, icon: Icon, badge }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === id ? "bg-orange-600 text-white" : "text-gray-300 hover:bg-gray-800"}`}
              >
                <Icon size={20} />
                <span className="flex-1 text-left">{label}</span>
                {badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-700">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-all">
              <LogOut size={20} /><span>Çıkış Yap</span>
            </button>
          </div>
        </div>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto min-w-0 scroll-pt-4">
          <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <a href="/" className="text-orange-600 font-bold text-sm flex items-center gap-1">← Geri</a>
              <h1 className="font-black text-gray-800">Admin Paneli</h1>
            </div>
            <button onClick={() => {}} className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu size={24} />
            </button>
          </div>

          <div className="p-6 md:p-8 pt-6">

            {/* ── DASHBOARD ── */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-black text-gray-800 mb-1">Hoş Geldiniz, {adminName}!</h1>
                  <p className="text-gray-500 text-sm">ARTEM BÜFE Yönetim Paneli</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Toplam Sipariş", value: orders.length, icon: ShoppingBag, color: "text-blue-600" },
                    { label: "Bugünkü Sipariş", value: todayOrders.length, icon: Package, color: "text-orange-600" },
                    { label: "Hazırlanıyor", value: preparingCount, icon: AlertCircle, color: "text-yellow-600" },
                    { label: "Yolda", value: onWayCount, icon: Truck, color: "text-orange-500" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-xs font-bold">{label}</p>
                          <p className="text-3xl font-black text-gray-800 mt-1">{value}</p>
                        </div>
                        <Icon size={36} className={`${color} opacity-20`} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-bold">Toplam Ciro</p>
                        <p className="text-3xl font-black mt-1">
                          {totalRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                        </p>
                      </div>
                      <TrendingUp size={40} className="opacity-20" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-bold">Günlük Ciro</p>
                        <p className="text-3xl font-black mt-1">
                          {todayOrders.reduce((s: number, o: any) => s + o.totalAmount / 100, 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                        </p>
                        <p className="text-green-200 text-xs mt-1">{todayOrders.length} sipariş bugün</p>
                      </div>
                      <ShoppingBag size={40} className="opacity-20" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-gray-800">Son Siparişler</h2>
                    <button onClick={() => setActiveTab("orders")} className="text-orange-600 text-sm font-bold hover:underline">Tümünü Gör →</button>
                  </div>
                  {ordersLoading ? (
                    <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
                  ) : orders.length === 0 ? (
                    <p className="text-gray-400 text-center py-6 text-sm">Henüz sipariş yok</p>
                  ) : (
                    <div className="space-y-2">
                      {orders.slice(0, 5).map(order => {
                        const info = parseNote(order.statusNotes);
                        const st = order.currentStatus ?? order.status;
                        return (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <StatusIcon status={st} />
                              <div className="min-w-0">
                                <p className="font-bold text-gray-800 text-sm truncate">{info.customerName || `#${order.orderNumber}`}</p>
                                <p className="text-xs text-gray-400 truncate">{info.items || "—"}</p>
                              </div>
                            </div>
                            <div className="text-right ml-3 shrink-0">
                              <p className="font-black text-sm text-gray-800">{(order.totalAmount / 100).toLocaleString("tr-TR")} ₺</p>
                              <p className={`text-xs font-bold ${statusColor[st] ?? ""}`}>{statusLabel[st] ?? st}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── SİPARİŞLER ── */}
            {activeTab === "orders" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black text-gray-800">Siparişler</h1>
                    {newOrderAlert && (
                      <span className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full animate-bounce">
                        <Bell size={12} /> YENİ SİPARİŞ!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-sm border transition-all ${soundEnabled ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100" : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"}`}
                    >
                      {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                      {soundEnabled ? "Ses Açık" : "Ses Kapalı"}
                    </button>
                    <button onClick={() => refetchOrders()} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors text-sm">
                      <RefreshCw size={15} className={ordersLoading ? "animate-spin" : ""} />
                      Yenile
                    </button>
                  </div>
                </div>

                {ordersLoading ? (
                  <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-xl border animate-pulse" />)}</div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                    <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold">Henüz sipariş yok</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => {
                      const info = parseNote(order.statusNotes);
                      const st = order.currentStatus ?? order.status;
                      const isOpen = expandedOrder === order.id;

                      return (
                        <div key={order.id} className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 relative ${
                          st === "preparing" ? "border-2 border-red-400 shadow-red-100 shadow-md" :
                          st === "pending"   ? "border-2 border-yellow-300 shadow-yellow-50" :
                          st === "on_the_way"? "border-2 border-orange-300" :
                          "border border-gray-200"}`}>
          {/* Preparing nabız şeridi */}
          {st === "preparing" && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl animate-pulse" />
          )}
          {st === "pending" && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-l-xl" />
          )}

                          {/* ── Sipariş özet satırı ── */}
                          <div
                            className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setExpandedOrder(isOpen ? null : order.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl border ${statusBg[st] ?? "bg-gray-50 border-gray-200"}`}>
                                <StatusIcon status={st} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-gray-800 text-base">
                                    {info.customerName || "Misafir"}
                                  </span>
                                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded-full">
                                    #{order.orderNumber}
                                  </span>
                                  <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${statusBg[st]} ${statusColor[st]}`}>
                                    {statusLabel[st] ?? st}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  {info.customerPhone && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                      <Phone size={11} /> {info.customerPhone}
                                    </span>
                                  )}
                                  {info.address && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500 truncate">
                                      <MapPin size={11} /> {info.address}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-black text-gray-800 text-lg">
                                  {(order.totalAmount / 100).toLocaleString("tr-TR")} ₺
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {new Date(order.createdAt).toLocaleString("tr-TR", {
                                    day: "2-digit", month: "2-digit",
                                    hour: "2-digit", minute: "2-digit"
                                  })}
                                </p>
                              </div>
                              <ChevronDown size={18} className={`text-gray-300 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                            </div>
                          </div>

                          {/* ── Detay paneli ── */}
                          {isOpen && (
                            <div className="border-t border-gray-100 bg-gray-50">

                              {/* Müşteri bilgileri kartı */}
                              <div className="p-5 space-y-4">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                  Sipariş Detayları
                                </h3>

                                {/* Bilgi grid'i */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                                  {/* Müşteri Adı */}
                                  {info.customerName && (
                                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
                                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                                        <User size={16} className="text-orange-600" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Müşteri</p>
                                        <p className="font-black text-gray-800 text-sm">{info.customerName}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Telefon */}
                                  {info.customerPhone && (
                                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
                                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                        <Phone size={16} className="text-green-600" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Telefon</p>
                                        <a
                                          href={`tel:${info.customerPhone}`}
                                          className="font-black text-green-600 text-sm hover:underline"
                                          onClick={e => e.stopPropagation()}
                                        >
                                          {info.customerPhone}
                                        </a>
                                      </div>
                                    </div>
                                  )}

                                  {/* Adres */}
                                  {info.address && (
                                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
                                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                        <MapPin size={16} className="text-blue-600" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Adres</p>
                                        <p className="font-bold text-gray-800 text-sm leading-tight">{info.address}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Ödeme Yöntemi */}
                                  {/* Kupon bilgisi */}
                                  {(order.statusNotes ?? "").includes("indirimi uygulandı") && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0 text-lg">🎁</div>
                                      <div>
                                        <p className="text-xs font-black text-gray-500 uppercase">İndirim Kodu</p>
                                        <p className="font-black text-green-700">
                                          {(order.statusNotes ?? "").match(/([A-Z0-9]+) indirimi/)?.[1]} kuponu uygulandı
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  {info.paymentMethod && (
                                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
                                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                                        <Wallet size={16} className="text-purple-600" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Ödeme</p>
                                        <p className="font-black text-gray-800 text-sm capitalize">
                                          {info.paymentMethod === "cash" ? "💵 Kapıda Ödeme"
                                            : info.paymentMethod === "card" ? "💳 Kredi Kartı"
                                            : info.paymentMethod}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Sipariş No */}
                                  <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                      <Hash size={16} className="text-gray-600" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Sipariş No</p>
                                      <p className="font-black text-gray-800 text-sm font-mono">#{order.orderNumber}</p>
                                    </div>
                                  </div>

                                  {/* Tarih */}
                                  <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
                                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                                      <Calendar size={16} className="text-amber-600" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Tarih</p>
                                      <p className="font-bold text-gray-800 text-sm">
                                        {new Date(order.createdAt).toLocaleString("tr-TR")}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Sipariş edilen ürünler */}
                                {info.items && (
                                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                        <UtensilsCrossed size={16} className="text-red-600" />
                                      </div>
                                      <p className="text-xs font-black text-gray-400 uppercase tracking-wide">Sipariş Edilen Ürünler</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {info.items.split(",").map((item, i) => (
                                        <span
                                          key={i}
                                          className="bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-lg"
                                        >
                                          {item.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Müşteri notu */}
                                {info.notes && (
                                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                    <StickyNote size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                    <div>
                                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Müşteri Notu</p>
                                      <p className="text-gray-800 text-sm font-semibold">{info.notes}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Toplam tutar */}
                                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-4 flex items-center justify-between">
                                  <span className="text-white font-black text-sm">Toplam Tutar</span>
                                  <span className="text-white font-black text-2xl">
                                    {(order.totalAmount / 100).toLocaleString("tr-TR")} ₺
                                  </span>
                                </div>

                                {/* Durum güncelle */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                  <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-3">Durumu Güncelle</p>
                                  <div className="flex gap-2">
                                    <select
                                      value={selectedStatus[order.id] ?? ""}
                                      onChange={e => setSelectedStatus(p => ({ ...p, [order.id]: e.target.value }))}
                                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                                    >
                                      <option value="">Durum seçin…</option>
                                      <option value="pending">⏳ Bekleniyor</option>
                                      <option value="preparing">👨‍🍳 Hazırlanıyor</option>
                                      <option value="on_the_way">🛵 Yolda</option>
                                      <option value="delivered">✅ Teslim Edildi</option>
                                      <option value="cancelled">❌ İptal Edildi</option>
                                    </select>
                                    <button
                                      onClick={() => handleUpdateStatus(order.id)}
                                      disabled={updatingOrderId === order.id || !selectedStatus[order.id]}
                                      className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm transition-colors"
                                    >
                                      {updatingOrderId === order.id ? "…" : "Güncelle"}
                                    </button>
                                  </div>
                                </div>

                                {/* Sil butonu */}
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => handleDeleteOrder(order.id)}
                                    disabled={deletingOrderId === order.id}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm transition-colors"
                                  >
                                    <Trash2 size={15} />
                                    {deletingOrderId === order.id ? "Siliniyor…" : "Siparişi Sil"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "products"  && <AdminProducts />}
            {activeTab === "payments"  && <AdminPaymentMethods />}

            {/* ── MÜŞTERİLER ── */}
            {activeTab === "customers" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-black text-gray-800">Müşteri Analizi</h1>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Toplam Müşteri", value: Array.from(new Set(orders.map(o => o.customerName))).length, color: "text-blue-600" },
                    { label: "Ort. Sipariş", value: orders.length > 0 ? `${(orders.reduce((s,o) => s + o.totalAmount/100, 0) / orders.length).toFixed(0)} ₺` : "0 ₺", color: "text-orange-600" },
                    { label: "Tekrar Eden", value: Object.values(orders.reduce((acc:any,o) => { acc[o.customerName]=(acc[o.customerName]||0)+1; return acc; },{})).filter((c:any)=>c>1).length, color: "text-green-600" },
                  ].map(({label,value,color}) => (
                    <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                      <p className="text-gray-500 text-xs font-bold uppercase mb-1">{label}</p>
                      <p className={`text-3xl font-black ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-black text-gray-800 mb-4">🏆 En Sadık Müşteriler</h2>
                  <div className="space-y-3">
                    {Object.entries(orders.reduce((acc:any,o) => {
                      if(!acc[o.customerName]) acc[o.customerName]={count:0,total:0,phone:""};
                      acc[o.customerName].count++;
                      acc[o.customerName].total+=o.totalAmount/100;
                      const ph=(o.statusNotes??"").match(/Tel:\s*([^|]+)/)?.[1]?.trim()??"";
                      if(ph) acc[o.customerName].phone=ph;
                      return acc;
                    },{})).sort((a:any,b:any)=>b[1].count-a[1].count).slice(0,10)
                    .map(([name,data]:any,i) => (
                      <div key={name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${i===0?"bg-amber-400":i===1?"bg-gray-400":i===2?"bg-orange-600":"bg-gray-200 text-gray-600"}`}>{i+1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-800 text-sm">{name}</p>
                          <p className="text-xs text-gray-400">{data.phone||"—"} · {data.count} sipariş</p>
                        </div>
                        <p className="font-black text-orange-600 shrink-0 mr-3">{data.total.toLocaleString("tr-TR")} ₺</p>
                        {data.phone && (
                          <button
                            onClick={() => {
                              const code = `OZELMISAFIR${Math.random().toString(36).slice(2,6).toUpperCase()}`;
                              const campaigns = JSON.parse(localStorage.getItem("artem_campaigns") || "[]");
                              const newCamp = { id: Date.now().toString(), code, type: "percent", value: 15, description: `${name} için özel`, usageLimit: 1, usedCount: 0, expiresAt: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10), active: true, createdAt: new Date().toISOString() };
                              localStorage.setItem("artem_campaigns", JSON.stringify([...campaigns, newCamp]));
                              const msg = encodeURIComponent(`Merhaba ${name}! 🎉 Sizi çok özledik! Size özel %15 indirim kodunuz: *${code}* — 7 gün geçerli. Bekleriz! 🍽️ ARTEM BÜFE`);
                              window.open(`https://wa.me/${data.phone.replace(/\D/g,'')}?text=${msg}`, '_blank');
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 transition-colors shrink-0"
                          >
                            <span>📲</span> Kupon Gönder
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-black text-gray-800 mb-4">⏰ Saatlik Yoğunluk</h2>
                  <div className="flex items-end gap-0.5 h-20">
                    {Array.from({length:24},(_,h)=>{
                      const count=orders.filter(o=>new Date(o.createdAt).getHours()===h).length;
                      const max=Math.max(...Array.from({length:24},(_,hh)=>orders.filter(o=>new Date(o.createdAt).getHours()===hh).length),1);
                      return <div key={h} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-orange-400 rounded-t" style={{height:`${(count/max)*64}px`,minHeight:count>0?"3px":"0"}} title={`${h}:00 — ${count} sipariş`}/>
                        {h%6===0&&<span className="text-[8px] text-gray-400 font-bold">{h}</span>}
                      </div>;
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── KAMPANYALAR ── */}
            {activeTab === "campaigns" && <CampaignManager />}

            {/* ── ANALİTİK ── */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-black text-gray-800">Analitik</h1>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-black text-gray-800 mb-4">📈 Son 30 Gün</h2>
                  <div className="flex items-end gap-0.5 h-32">
                    {Array.from({length:30},(_,i)=>{
                      const d=new Date(); d.setDate(d.getDate()-(29-i));
                      const rev=orders.filter(o=>new Date(o.createdAt).toDateString()===d.toDateString()).reduce((s,o)=>s+o.totalAmount/100,0);
                      const maxRev=Math.max(...Array.from({length:30},(_,ii)=>{const dd=new Date();dd.setDate(dd.getDate()-(29-ii));return orders.filter(o=>new Date(o.createdAt).toDateString()===dd.toDateString()).reduce((s,o)=>s+o.totalAmount/100,0);}),1);
                      return <div key={i} className="flex-1" title={`${d.toLocaleDateString("tr-TR")}: ${rev.toLocaleString("tr-TR")} ₺`}>
                        <div className={`w-full rounded-t ${rev>0?"bg-orange-400":"bg-gray-100"}`} style={{height:`${(rev/maxRev)*112}px`,minHeight:rev>0?"3px":"0"}}/>
                      </div>;
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-400 font-bold"><span>30 gün önce</span><span>Bugün</span></div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-black text-gray-800 mb-5">🏆 Ürün Performansı</h2>
                  {(() => {
                    const productMap: Record<string, number> = {};
                    orders.forEach(o => {
                      const items = (o.statusNotes ?? "").match(/Ürünler:\s*([^|]+)/)?.[1] ?? "";
                      items.split(",").forEach(item => {
                        const m = item.trim().match(/(\d+)x\s+(.+)/);
                        if (m) { const key = m[2].trim(); productMap[key] = (productMap[key] || 0) + Number(m[1]); }
                      });
                    });
                    const sorted = Object.entries(productMap).sort((a,b) => b[1]-a[1]).slice(0, 8);
                    const maxCount = sorted[0]?.[1] || 1;
                    return (
                      <div className="space-y-3">
                        {sorted.map(([product, count], i) => (
                          <div key={product} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${i===0?"bg-amber-400":i===1?"bg-gray-400":i===2?"bg-orange-700":"bg-gray-300 text-gray-600"}`}>{i+1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 text-sm truncate">{product}</p>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div className="bg-orange-500 h-1.5 rounded-full transition-all" style={{width: `${(count/maxCount)*100}%`}} />
                              </div>
                            </div>
                            <span className="font-black text-orange-600 text-sm shrink-0">{count} adet</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-black text-gray-800 mb-4">💳 Ödeme Dağılımı</h2>
                  <div className="space-y-3">
                    {Object.entries(orders.reduce((acc:any,o)=>{
                      const pay=(o.statusNotes??"").match(/Ödeme:\s*([^|]+)/)?.[1]?.trim()??"Diğer";
                      acc[pay]=(acc[pay]||0)+1; return acc;
                    },{})).sort((a:any,b:any)=>b[1]-a[1]).map(([method,count]:any)=>(
                      <div key={method} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-700 w-32 shrink-0">{method==="cash"?"💵 Kapıda":method==="card"?"💳 Kart":method}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3">
                          <div className="bg-orange-500 h-3 rounded-full" style={{width:`${orders.length>0?(count/orders.length)*100:0}%`}}/>
                        </div>
                        <span className="text-xs font-black text-gray-600 w-16 text-right">{count} sipariş</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── AYARLAR ── */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-black text-gray-800">Ayarlar</h1>

                {/* Çalışma Saatleri */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">⏰ Çalışma Saatleri</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { day: "Pazartesi-Cuma", key: "weekday" },
                      { day: "Cumartesi", key: "saturday" },
                      { day: "Pazar", key: "sunday" },
                    ].map(({ day, key }) => {
                      const val = JSON.parse(localStorage.getItem("artem_hours") || "{}");
                      return (
                        <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <span className="font-bold text-gray-700 w-36 shrink-0 text-sm">{day}</span>
                          <input type="time" defaultValue={val[key+"_open"] || "08:00"}
                            onChange={e => { const h = JSON.parse(localStorage.getItem("artem_hours") || "{}"); h[key+"_open"] = e.target.value; localStorage.setItem("artem_hours", JSON.stringify(h)); }}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none focus:border-orange-500" />
                          <span className="text-gray-400 font-bold">-</span>
                          <input type="time" defaultValue={val[key+"_close"] || "22:00"}
                            onChange={e => { const h = JSON.parse(localStorage.getItem("artem_hours") || "{}"); h[key+"_close"] = e.target.value; localStorage.setItem("artem_hours", JSON.stringify(h)); }}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none focus:border-orange-500" />
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => toast.success("Çalışma saatleri kaydedildi!")}
                    className="mt-4 px-5 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors">
                    Kaydet
                  </button>
                </div>

                {/* Minimum Sipariş */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">💰 Minimum Sipariş Tutarı</h2>
                  <div className="flex items-center gap-3">
                    <input type="number"
                      defaultValue={Number(localStorage.getItem("artem_min_order") || "0")}
                      onChange={e => localStorage.setItem("artem_min_order", e.target.value)}
                      placeholder="0"
                      className="w-48 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-bold text-lg"
                    />
                    <span className="font-black text-gray-600">₺</span>
                    <button onClick={() => toast.success("Minimum sipariş tutarı kaydedildi!")}
                      className="px-5 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors">
                      Kaydet
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">0 girilirse minimum tutar uygulanmaz</p>
                </div>

                {/* QR Menü */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">📱 QR Menü</h2>
                  <p className="text-gray-500 text-sm mb-4">Müşterileriniz QR kodu okutarak menüye ulaşabilir</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
                      <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
                        <span className="text-5xl">📱</span>
                      </div>
                      <p className="text-xs text-gray-500 font-bold">{window.location.origin}/menu</p>
                    </div>
                    <div className="space-y-2">
                      <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/menu`); toast.success("Menü linki kopyalandı!"); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors w-full">
                        📋 Menü Linkini Kopyala
                      </button>
                      <button onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin+"/menu")}`, '_blank')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors w-full">
                        📲 QR Kodu İndir
                      </button>
                      <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Menümüze göz atın: "+window.location.origin+"/menu")}`, '_blank')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors w-full">
                        📲 WhatsApp ile Paylaş
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-gray-800">Şifre Değiştir</h2>
                    <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="px-4 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors">
                      {showPasswordForm ? "İptal" : "Şifre Değiştir"}
                    </button>
                  </div>
                  {showPasswordForm && (
                    <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                      {[
                        { k: "old",     label: "Mevcut Şifre",     field: "oldPassword" },
                        { k: "new",     label: "Yeni Şifre",        field: "newPassword" },
                        { k: "confirm", label: "Yeni Şifre Tekrar", field: "confirmPassword" },
                      ].map(({ k, label, field }) => (
                        <div key={k}>
                          <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
                          <div className="relative">
                            <input
                              type={showPasswords[k as keyof typeof showPasswords] ? "text" : "password"}
                              value={passwordData[field as keyof typeof passwordData]}
                              onChange={e => setPasswordData(p => ({ ...p, [field]: e.target.value }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 pr-10"
                              placeholder="••••••••"
                            />
                            <button type="button" onClick={() => setShowPasswords(p => ({ ...p, [k]: !p[k as keyof typeof p] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                              {showPasswords[k as keyof typeof showPasswords] ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      ))}
                      <button onClick={handlePasswordChange} className="w-full py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                        Şifreyi Kaydet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
