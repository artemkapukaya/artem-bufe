import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  LayoutDashboard, Package, CreditCard, LogOut, Menu, X,
  Eye, EyeOff, Trash2, ChevronDown, AlertCircle, CheckCircle2,
  Truck, Clock, RefreshCw, ShoppingBag, TrendingUp, Bell, Volume2, VolumeX,
  BarChart3, Award, Zap,
  Phone, MapPin, User, Wallet, UtensilsCrossed, StickyNote,
  Hash, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminChefNotes from "@/components/admin/AdminChefNotes";
import AdminPaymentMethods from "@/components/admin/AdminPaymentMethods";

type AdminTab = "dashboard" | "products" | "payments" | "orders" | "chefnotes" | "settings";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    const token = sessionStorage.getItem("adminToken");
    const exp = Number(sessionStorage.getItem("adminTokenExp") ?? "0");
    if (!token || Date.now() >= exp) {
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminTokenExp");
      navigate("/admin/login");
      return;
    }
    setAdminUser({ username: localStorage.getItem("adminUsername") ?? "Admin" });
  }, [navigate]);

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
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminTokenExp");
    toast.success("Çıkış yapıldı!");
    setTimeout(() => navigate("/admin/login"), 400);
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
          <AlertCircle className="w-5 h-5 text-blue-500 relative z-10" />
          <span className="absolute w-5 h-5 rounded-full bg-blue-300 animate-ping opacity-50" />
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
    { id: "dashboard" as AdminTab, label: "Dashboard",       icon: LayoutDashboard, badge: 0 },
    { id: "orders"    as AdminTab, label: "Siparişler",       icon: ShoppingBag,     badge: pendingCount },
    { id: "products"  as AdminTab, label: "Yemek Kartları",   icon: Package,         badge: 0 },
    { id: "payments"  as AdminTab, label: "Ödeme Yöntemleri", icon: CreditCard,      badge: 0 },
    { id: "chefnotes" as AdminTab, label: "Şef Notları",       icon: LayoutDashboard, badge: 0 },
    { id: "settings"  as AdminTab, label: "Ayarlar",          icon: LayoutDashboard, badge: 0 },
  ];

  return (
    <>
      <Header />
      <div className="flex h-[calc(100vh-64px)] bg-gray-100">

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div className={`${sidebarOpen ? "w-64" : "w-0"} bg-gray-900 text-white transition-all duration-300 overflow-hidden relative flex flex-col`}>
          <nav className="flex-1 p-4 space-y-1 pt-4">
            {/* Ana sayfaya geri dön */}
            <a href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all mb-2 text-sm font-bold border border-gray-700">
              <span>←</span> Ana Sayfaya Dön
            </a>
            <div className="border-t border-gray-700 mb-2" />
            {navItems.map(({ id, label, icon: Icon, badge }) => (
              <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
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
        <div className="flex-1 overflow-auto">
          <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <a href="/" className="text-orange-600 font-bold text-sm flex items-center gap-1">← Geri</a>
              <h1 className="font-black text-gray-800">Admin Paneli</h1>
            </div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="p-4 md:p-8">

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
                          st === "preparing" ? "border-2 border-blue-400 shadow-blue-100 shadow-md" :
                          st === "pending"   ? "border-2 border-yellow-300 shadow-yellow-50" :
                          st === "on_the_way"? "border-2 border-orange-300" :
                          "border border-gray-200"}`}>
          {/* Preparing nabız şeridi */}
          {st === "preparing" && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl animate-pulse" />
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
            {activeTab === "chefnotes" && <AdminChefNotes />}

            {/* ── AYARLAR ── */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-black text-gray-800">Ayarlar</h1>
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
