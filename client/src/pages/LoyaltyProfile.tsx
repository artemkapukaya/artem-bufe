import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2, Gift, TrendingUp, Award, History } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const levelColors = {
  bronze: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "🥉" },
  silver: { bg: "bg-slate-50", border: "border-slate-300", text: "text-slate-700", icon: "🥈" },
  gold: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", icon: "🥇" },
  platinum: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700", icon: "💎" },
};

const levelThresholds = {
  bronze: { min: 0, max: 499 },
  silver: { min: 500, max: 1999 },
  gold: { min: 2000, max: 4999 },
  platinum: { min: 5000, max: Infinity },
};

export default function LoyaltyProfile() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "rewards">("overview");

  const profileQuery = trpc.loyalty.profile.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const historyQuery = trpc.loyalty.history.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const rewardsQuery = trpc.loyalty.rewards.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="h-14 md:h-16" />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-600 mb-4">Sadakat programına erişmek için giriş yapınız.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const profile = profileQuery.data;
  const history = historyQuery.data || [];
  const rewards = rewardsQuery.data || [];

  if (profileQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
      </div>
    );
  }

  const levelInfo = profile ? levelColors[profile.level as keyof typeof levelColors] : levelColors.bronze;
  const nextLevelThreshold = profile
    ? Object.entries(levelThresholds).find(([_, range]) => profile.totalPoints >= range.min && profile.totalPoints < range.max)?.[1].max
    : 500;
  const progressPercent = profile
    ? Math.min(100, (profile.totalPoints / (nextLevelThreshold || 500)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="h-14 md:h-16" />

      {/* Profile Header */}
      <div className={`${levelInfo.bg} border-b-2 ${levelInfo.border} py-8`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-gray-800 mb-1">Sadakat Programı</h1>
              <p className={`text-sm font-bold ${levelInfo.text}`}>
                {levelInfo.icon} {profile?.level.toUpperCase()} ÜYESİ
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-orange-600">{profile?.totalPoints || 0}</p>
              <p className="text-sm text-gray-600">Toplam Puan</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-700">Sonraki Seviyeye:</span>
              <span className="text-xs font-bold text-orange-600">
                {Math.max(0, (nextLevelThreshold || 500) - (profile?.totalPoints || 0))} puan kaldı
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-400 to-red-500 h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-black text-orange-600">{profile?.totalSpent ? (profile.totalSpent / 100).toFixed(2) : "0"}</p>
              <p className="text-xs text-gray-600">Toplam Harcama (₺)</p>
            </div>
            <div className="bg-white/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-black text-green-600">{history.filter((t) => t.type === "earned").length}</p>
              <p className="text-xs text-gray-600">Kazanılan Puan</p>
            </div>
            <div className="bg-white/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-black text-red-600">{history.filter((t) => t.type === "spent").length}</p>
              <p className="text-xs text-gray-600">Kullanılan Puan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 border-b">
          {(["overview", "history", "rewards"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-bold text-sm transition-colors border-b-2 ${
                activeTab === tab
                  ? "text-orange-600 border-orange-600"
                  : "text-gray-600 border-transparent hover:text-gray-800"
              }`}
            >
              {tab === "overview" && "Özet"}
              {tab === "history" && "Geçmiş"}
              {tab === "rewards" && "Ödüller"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Level Info */}
            <div className={`${levelInfo.bg} border-2 ${levelInfo.border} rounded-xl p-6`}>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">{levelInfo.icon}</span>
                <div>
                  <h3 className={`text-2xl font-black ${levelInfo.text}`}>
                    {profile?.level.charAt(0).toUpperCase()}
                    {profile?.level.slice(1)} Seviyesi
                  </h3>
                  <p className="text-sm text-gray-600">
                    {profile?.level === "bronze" && "Başlangıç seviyesi - Her siparişten puan kazanın!"}
                    {profile?.level === "silver" && "500+ puan ile özel indirimler açılıyor"}
                    {profile?.level === "gold" && "2000+ puan ile ekstra avantajlar"}
                    {profile?.level === "platinum" && "5000+ puan ile VIP hizmetler"}
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
                <Award size={20} className="text-orange-500" />
                Avantajlar
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <span className="text-xl">🎁</span>
                  <div>
                    <p className="font-bold text-sm text-gray-800">Her Siparişten Puan Kazanın</p>
                    <p className="text-xs text-gray-600">Harcadığınız her 10 TL için 1 puan</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-xl">💰</span>
                  <div>
                    <p className="font-bold text-sm text-gray-800">Puanlarınızı Kullanın</p>
                    <p className="text-xs text-gray-600">Puanları indirim ve ödüllere çevirin</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-xl">🎉</span>
                  <div>
                    <p className="font-bold text-sm text-gray-800">Seviye Yükseltme Bonusu</p>
                    <p className="text-xs text-gray-600">Yeni seviyeye ulaştığınızda bonus puan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {history.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <History size={32} className="mx-auto mb-2 opacity-50" />
                <p>Henüz puan işlemi yok</p>
              </div>
            ) : (
              <div className="divide-y">
                {history.map((transaction) => (
                  <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-bold text-sm text-gray-800">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <span
                      className={`font-black text-lg ${
                        transaction.type === "earned" || transaction.type === "bonus"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "earned" || transaction.type === "bonus" ? "+" : "-"}
                      {transaction.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === "rewards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.length === 0 ? (
              <div className="col-span-full p-8 text-center text-gray-500">
                <Gift size={32} className="mx-auto mb-2 opacity-50" />
                <p>Henüz ödül yok</p>
              </div>
            ) : (
              rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-sm text-gray-800 flex-1">{reward.name}</h4>
                    <span className="bg-orange-100 text-orange-700 text-xs font-black px-2 py-1 rounded-full">
                      {reward.pointsCost} puan
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{reward.description}</p>
                  <button
                    disabled={!profile || profile.totalPoints < reward.pointsCost}
                    className={`w-full py-2 rounded-lg font-bold text-sm transition-colors ${
                      profile && profile.totalPoints >= reward.pointsCost
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {profile && profile.totalPoints >= reward.pointsCost ? "Kullan" : "Yetersiz Puan"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
