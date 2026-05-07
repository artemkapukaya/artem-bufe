import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";

const sidebarLinks = [
  { label: "Hakkımızda", id: "hakkimizda" },
  { label: "Vizyonumuz & Misyonumuz & Değerlerimiz", id: "vizyon" },
  { label: "Ortaklık Yapısı", id: "ortaklik" },
  { label: "Üretim Tesisimiz", id: "uretim" },
  { label: "Kalite", id: "kalite" },
  { label: "Belgelerimiz", id: "belgeler" },
  { label: "İnsan Kaynakları", id: "ik" },
  { label: "Kariyer Fırsatları", id: "kariyer" },
  { label: "Franchise Başvuru", id: "franchise" },
];

export default function Kurumsal() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="h-14 md:h-16" />

      {/* Page header */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-black">KURUMSAL</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm sticky top-20">
              <div className="p-3 bg-gray-900 text-white">
                <h3 className="font-bold text-sm">KURUMSAL SAYFALAR</h3>
              </div>
              <div className="p-2">
                {sidebarLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div id="hakkimizda" className="mb-10">
              <h2 className="text-2xl font-black text-gray-800 mb-2">Hakkımızda</h2>
              <div className="w-12 h-1 bg-orange-500 mb-4 rounded-full" />
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop"
                alt="ARTEM BÜFE Fast Food Restoran"
                className="w-full rounded-xl mb-4 object-cover"
                style={{ maxHeight: "300px" }}
              />
              <p className="text-gray-600 leading-relaxed mb-3">
                Gıda ve restoran sektöründe hizmet veren ARTEM BÜFE Fast Food A.Ş. 2010 yılında İstanbul'da kuruldu. 
                14 yıldır Türkiye'de faaliyet gösteren ARTEM BÜFE, Avrupa standartlarında üretim kalitesiyle 
                müşterilerine en lezzetli fast food deneyimini sunmaktadır.
              </p>
              <p className="text-gray-600 leading-relaxed mb-3">
                İstanbul, Ankara, İzmir ve diğer büyük şehirlerde 12'den fazla şubesiyle hizmet veren ARTEM BÜFE, 
                her geçen gün büyümeye devam etmektedir.
              </p>
              <p className="text-gray-600 leading-relaxed">
                ARTEM BÜFE markası ve restoranları, müşteri memnuniyetini ön planda tutarak Türkiye'nin 
                en güvenilir fast food markalarından biri olmayı hedeflemektedir.
              </p>
            </div>

            <div id="vizyon" className="mb-10">
              <h2 className="text-2xl font-black text-gray-800 mb-2">Vizyonumuz & Misyonumuz & Değerlerimiz</h2>
              <div className="w-12 h-1 bg-orange-500 mb-4 rounded-full" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <h3 className="font-black text-orange-600 mb-2">Vizyonumuz</h3>
                  <p className="text-sm text-gray-600">Türkiye'nin en sevilen ve en yaygın fast food markası olmak.</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <h3 className="font-black text-red-600 mb-2">Misyonumuz</h3>
                  <p className="text-sm text-gray-600">Müşterilerimize en taze, en lezzetli ve en hijyenik ürünleri sunmak.</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <h3 className="font-black text-yellow-700 mb-2">Değerlerimiz</h3>
                  <p className="text-sm text-gray-600">Kalite, hijyen, hız ve müşteri memnuniyeti önceliğimizdir.</p>
                </div>
              </div>
            </div>

            <div id="kalite" className="mb-10">
              <h2 className="text-2xl font-black text-gray-800 mb-2">Kalite</h2>
              <div className="w-12 h-1 bg-orange-500 mb-4 rounded-full" />
              <p className="text-gray-600 leading-relaxed">
                ARTEM BÜFE olarak kalite standartlarımız konusunda taviz vermiyoruz. 
                Tüm ürünlerimiz, sertifikalı tedarikçilerden temin edilen taze malzemelerle hazırlanmaktadır. 
                Üretim süreçlerimiz uluslararası gıda güvenliği standartlarına uygun olarak yürütülmektedir.
              </p>
            </div>

            <div id="franchise" className="mb-4">
              <h2 className="text-2xl font-black text-gray-800 mb-2">Franchise Başvuru</h2>
              <div className="w-12 h-1 bg-orange-500 mb-4 rounded-full" />
              <p className="text-gray-600 leading-relaxed mb-4">
                ARTEM BÜFE franchise ağına katılmak ve kendi işinizin patronu olmak ister misiniz? 
                Bizimle iletişime geçin, detaylı bilgi alalım.
              </p>
              <Link
                href="/iletisim"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
              >
                Başvuru Formu
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
