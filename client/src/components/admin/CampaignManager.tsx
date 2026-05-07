import { useState, useEffect } from "react";
import { Plus, Trash2, Copy, Check, Tag, Gift, Percent, Clock } from "lucide-react";
import { toast } from "sonner";

interface Campaign {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  description: string;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
  createdAt: string;
}

const CAMPAIGNS_KEY = "artem_campaigns";

function generateCode(prefix = "ARTEM") {
  return `${prefix}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const emptyForm = {
  code: generateCode(),
  type: "percent" as const,
  value: 10,
  description: "",
  usageLimit: 100,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
};

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(CAMPAIGNS_KEY);
    if (saved) try { setCampaigns(JSON.parse(saved)); } catch {}
  }, []);

  const save = (updated: Campaign[]) => {
    setCampaigns(updated);
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updated));
  };

  const handleCreate = () => {
    if (!form.code.trim()) { toast.error("Kod zorunlu!"); return; }
    if (form.value <= 0) { toast.error("Değer 0'dan büyük olmalı!"); return; }
    if (campaigns.find(c => c.code === form.code.toUpperCase())) {
      toast.error("Bu kod zaten var!"); return;
    }

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      code: form.code.toUpperCase(),
      type: form.type,
      value: form.value,
      description: form.description,
      usageLimit: form.usageLimit,
      usedCount: 0,
      expiresAt: form.expiresAt,
      active: true,
      createdAt: new Date().toISOString(),
    };

    save([...campaigns, newCampaign]);
    toast.success(`Kampanya kodu oluşturuldu: ${newCampaign.code}`);
    setShowForm(false);
    setForm({ ...emptyForm, code: generateCode() });
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    toast.success("Kod kopyalandı!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggle = (id: string) => {
    save(campaigns.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Bu kampanyayı silmek istediğinize emin misiniz?")) return;
    save(campaigns.filter(c => c.id !== id));
    toast.success("Kampanya silindi!");
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div className="space-y-6 pt-20">
      <div className="sticky top-16 z-20 bg-white border-b border-gray-200 pb-4 pt-4 mb-2 -mx-4 px-4 md:-mx-6 md:px-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Kampanya Yönetimi</h1>
            <p className="text-gray-500 text-sm mt-0.5">İndirim kodları oluştur ve yönet</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg">
            <Plus size={18} /> Yeni Kampanya
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-orange-200 shadow-lg p-6 space-y-4">
          <h2 className="font-black text-gray-800 text-lg">➕ Yeni İndirim Kodu</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">Kod *</label>
              <div className="flex gap-2">
                <input type="text" value={form.code}
                  onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-mono font-black tracking-widest"
                  placeholder="ARTEM10" />
                <button type="button" onClick={() => setForm(p => ({ ...p, code: generateCode() }))}
                  className="px-3 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-xs font-bold">
                  Yeni
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">İndirim Tipi</label>
              <div className="flex gap-2">
                {[
                  { val: "percent", label: "% Yüzde", icon: "%" },
                  { val: "fixed", label: "₺ Sabit", icon: "₺" },
                ].map(({ val, label, icon }) => (
                  <button key={val} type="button"
                    onClick={() => setForm(p => ({ ...p, type: val as any }))}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${
                      form.type === val ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600"
                    }`}>
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">
                İndirim Değeri ({form.type === "percent" ? "%" : "₺"})
              </label>
              <input type="number" value={form.value}
                onChange={e => setForm(p => ({ ...p, value: Number(e.target.value) }))}
                min="1" max={form.type === "percent" ? "100" : "10000"}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold" />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">Kullanım Limiti</label>
              <input type="number" value={form.usageLimit}
                onChange={e => setForm(p => ({ ...p, usageLimit: Number(e.target.value) }))}
                min="1"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold" />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">Son Kullanım Tarihi</label>
              <input type="date" value={form.expiresAt}
                onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold" />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">Açıklama</label>
              <input type="text" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="örn: Yeni üye indirimi"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold" />
            </div>
          </div>

          {/* Önizleme */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-4 text-white flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs font-bold uppercase">Kampanya Önizleme</p>
              <p className="font-black text-2xl tracking-widest mt-1">{form.code || "KOD"}</p>
              <p className="text-orange-100 text-sm">
                {form.type === "percent" ? `%${form.value} indirim` : `${form.value} ₺ indirim`}
                {form.description && ` · ${form.description}`}
              </p>
            </div>
            <Gift size={40} className="opacity-30" />
          </div>

          <div className="flex gap-3">
            <button onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-colors shadow-md">
              <Tag size={18} /> Oluştur
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Kampanya listesi */}
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
          <Percent size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold text-lg">Henüz kampanya yok</p>
          <p className="text-gray-300 text-sm mt-1">İlk kampanyanızı oluşturun</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map(camp => {
            const expired = isExpired(camp.expiresAt);
            const usedPercent = Math.min((camp.usedCount / camp.usageLimit) * 100, 100);

            return (
              <div key={camp.id} className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${
                !camp.active || expired ? "border-gray-200 opacity-60" : "border-orange-200 hover:border-orange-400 hover:shadow-md"
              }`}>
                {/* Üst banner */}
                <div className={`px-4 py-3 flex items-center justify-between ${
                  camp.active && !expired ? "bg-gradient-to-r from-orange-500 to-red-600" : "bg-gray-400"
                }`}>
                  <div>
                    <p className="text-white font-black text-lg tracking-widest">{camp.code}</p>
                    <p className="text-white/70 text-xs">
                      {camp.type === "percent" ? `%${camp.value} indirim` : `${camp.value} ₺ indirim`}
                    </p>
                  </div>
                  <button onClick={() => handleCopy(camp.code)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                    {copiedId === camp.code ? <Check size={16} className="text-white" /> : <Copy size={16} className="text-white" />}
                  </button>
                </div>

                {/* İçerik */}
                <div className="p-4 space-y-3">
                  {camp.description && (
                    <p className="text-sm text-gray-600 font-semibold">{camp.description}</p>
                  )}

                  {/* Kullanım */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 font-bold mb-1">
                      <span>Kullanım</span>
                      <span>{camp.usedCount}/{camp.usageLimit}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${usedPercent >= 100 ? "bg-red-500" : "bg-orange-500"}`}
                        style={{ width: `${usedPercent}%` }} />
                    </div>
                  </div>

                  {/* Son kullanım */}
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Clock size={12} className={expired ? "text-red-500" : "text-gray-400"} />
                    <span className={expired ? "text-red-500" : "text-gray-400"}>
                      {expired ? "Süresi doldu" : `${new Date(camp.expiresAt).toLocaleDateString("tr-TR")} tarihine kadar`}
                    </span>
                  </div>

                  {/* Butonlar */}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleToggle(camp.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                        camp.active ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}>
                      {camp.active ? "Durdur" : "Aktifleştir"}
                    </button>
                    <button onClick={() => handleDelete(camp.id)}
                      className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* İstatistik */}
      {campaigns.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <h3 className="font-black text-gray-700 mb-3">📊 Kampanya Özeti</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-orange-600">{campaigns.filter(c => c.active).length}</p>
              <p className="text-xs text-gray-500 font-bold">Aktif</p>
            </div>
            <div>
              <p className="text-2xl font-black text-gray-600">{campaigns.reduce((s,c) => s + c.usedCount, 0)}</p>
              <p className="text-xs text-gray-500 font-bold">Toplam Kullanım</p>
            </div>
            <div>
              <p className="text-2xl font-black text-red-500">{campaigns.filter(c => isExpired(c.expiresAt)).length}</p>
              <p className="text-xs text-gray-500 font-bold">Süresi Dolmuş</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
