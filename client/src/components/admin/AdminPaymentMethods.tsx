import { useState } from "react";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface PaymentMethod {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
  isActive: number;
  displayOrder: number;
  commissionRate: string;
  minAmount: number;
  maxAmount: number;
}

export default function AdminPaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 1,
      name: "Kapıda Ödeme",
      slug: "cash",
      icon: "🚚",
      color: "#10B981",
      description: "Teslimat sırasında nakit ödeme",
      isActive: 1,
      displayOrder: 1,
      commissionRate: "0.00",
      minAmount: 0,
      maxAmount: 999999999,
    },
    {
      id: 2,
      name: "Kredi Kartı",
      slug: "card",
      icon: "💳",
      color: "#3B82F6",
      description: "Güvenli kredi kartı ödemesi",
      isActive: 1,
      displayOrder: 2,
      commissionRate: "2.00",
      minAmount: 0,
      maxAmount: 999999999,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    name: "",
    slug: "",
    icon: "",
    color: "#000000",
    description: "",
    isActive: 1,
    displayOrder: 0,
    commissionRate: "0.00",
    minAmount: 0,
    maxAmount: 999999999,
  });

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      slug: "",
      icon: "",
      color: "#000000",
      description: "",
      isActive: 1,
      displayOrder: 0,
      commissionRate: "0.00",
      minAmount: 0,
      maxAmount: 999999999,
    });
    setShowForm(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingId(method.id);
    setFormData(method);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.slug) {
      toast.error("Lütfen tüm gerekli alanları doldurunuz");
      return;
    }

    if (editingId) {
      setPaymentMethods(
        paymentMethods.map((m) =>
          m.id === editingId ? { ...m, ...formData } : m
        )
      );
      toast.success("Ödeme yöntemi güncellendi");
    } else {
      const newMethod: PaymentMethod = {
        id: Math.max(...paymentMethods.map((m) => m.id), 0) + 1,
        name: formData.name || "",
        slug: formData.slug || "",
        icon: formData.icon,
        color: formData.color,
        description: formData.description,
        isActive: formData.isActive || 1,
        displayOrder: formData.displayOrder || 0,
        commissionRate: formData.commissionRate || "0.00",
        minAmount: formData.minAmount || 0,
        maxAmount: formData.maxAmount || 999999999,
      };
      setPaymentMethods([...paymentMethods, newMethod]);
      toast.success("Ödeme yöntemi eklendi");
    }

    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bu ödeme yöntemini silmek istediğinize emin misiniz?")) {
      setPaymentMethods(paymentMethods.filter((m) => m.id !== id));
      toast.success("Ödeme yöntemi silindi");
    }
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-16 z-20 bg-white border-b border-gray-200 pb-4 pt-4 mb-2 -mx-4 px-4 md:-mx-6 md:px-6 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-800">Ödeme Yöntemleri</h1>
          <p className="text-gray-500 text-sm mt-0.5">Ödeme yöntemlerini ekle ve yönet</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg">
          <Plus size={16} /> Yeni Yöntem Ekle
        </button>
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Adı" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold" />
            <input placeholder="Slug (örn: sodexo)" value={formData.slug || ""} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold" />
            <input placeholder="İkon emoji (örn: 💳)" value={formData.icon || ""} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold text-2xl" />
            <input type="color" value={formData.color || "#000000"} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full h-11 px-2 border-2 border-gray-200 rounded-xl cursor-pointer" />
            <input placeholder="Açıklama" value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} className="col-span-2 w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold" />
            <input type="number" placeholder="Komisyon Oranı (%)" value={formData.commissionRate || "0.00"} onChange={e => setFormData({...formData, commissionRate: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold" />
            <input type="number" placeholder="Sıra" value={formData.displayOrder || 0} onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value)})} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold" />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors">
              <Save size={16} /> Kaydet
            </button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
              <X size={16} /> İptal
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Adı</th>
              <th className="px-4 py-2 text-left">Slug</th>
              <th className="px-4 py-2 text-left">Komisyon</th>
              <th className="px-4 py-2 text-left">Durum</th>
              <th className="px-4 py-2 text-left">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {paymentMethods.map((method) => (
              <tr key={method.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{method.name}</td>
                <td className="px-4 py-2">{method.slug}</td>
                <td className="px-4 py-2">{method.commissionRate}%</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      method.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {method.isActive ? "Aktif" : "İnaktif"}
                  </span>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(method)}
                    className="p-1 hover:bg-blue-100 rounded"
                  >
                    <Edit2 size={16} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
