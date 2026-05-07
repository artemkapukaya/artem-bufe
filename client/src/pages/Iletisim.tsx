import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

const branches = [
  { name: "ARTEM BÜFE İSTANBUL/TOPÇULAR", address: "TOPÇULAR MAH. DEMİRKAPI CAD. PAŞMAKÇI SANAYİ SİTESİ NO 20 GİRİŞ DÜKKAN 450 EYÜPSULTAN/İSTANBUL", phone: "05319588088", hours: "09:00 - 19:00" },
];

export default function Iletisim() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Mesajınız alındı! En kısa sürede size dönüş yapacağız.");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="h-14 md:h-16" />

      {/* Page header */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-black">İLETİŞİM</h1>
          <p className="text-gray-400 mt-1">Bizimle iletişime geçin</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact info */}
          <div>
            <h2 className="text-xl font-black text-gray-800 mb-6">İletişim Bilgileri</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Telefon</p>
                  <a href="tel:0531 958 8 088" className="font-black text-gray-800 hover:text-orange-600 transition-colors">
                    0531 958 8 088
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">E-posta</p>
                  <a href="mailto:info@artemkapukaya@gmail.com" className="font-black text-gray-800 hover:text-orange-600 transition-colors">
                    info@artemkapukaya@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Çalışma Saatleri</p>
                  <p className="font-black text-gray-800">Hafta içi: 09:00 - 23:00</p>
                  <p className="text-sm text-gray-600">Hafta sonu: 09:00 - 00:00</p>
                </div>
              </div>
            </div>

            {/* Branches */}
            <h2 className="text-xl font-black text-gray-800 mb-4">Şubemiz</h2>
            <div className="space-y-3">
              {branches.map((branch) => (
                <div key={branch.name} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-1">{branch.name}</h3>
                  <div className="flex items-start gap-1.5 text-sm text-gray-500 mb-1">
                    <MapPin size={13} className="text-orange-500 mt-0.5 shrink-0" />
                    {branch.address}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Phone size={13} className="text-orange-500 shrink-0" />
                    {branch.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                    <Clock size={13} className="text-orange-500 shrink-0" />
                    {branch.hours}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="text-xl font-black text-gray-800 mb-6">Bize Yazın</h2>
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                  placeholder="Adınız Soyadınız"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">E-posta *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                  placeholder="ornek@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                  placeholder="0555 000 00 00"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mesajınız *</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors resize-none"
                  placeholder="Mesajınızı buraya yazın..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-base rounded-xl hover:from-red-500 hover:to-orange-400 transition-all duration-200 shadow-md"
              >
                Gönder
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
