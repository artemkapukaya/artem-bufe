import Header from "@/components/Header";
import Footer from "@/components/Footer";

const allergens = [
  { code: "A", name: "Gluten", icon: "🌾", description: "Buğday, çavdar, arpa, yulaf içeren tahıllar" },
  { code: "B", name: "Kabuklu Deniz Ürünleri", icon: "🦐", description: "Karides, ıstakoz, yengeç vb." },
  { code: "C", name: "Yumurta", icon: "🥚", description: "Yumurta ve yumurta ürünleri" },
  { code: "D", name: "Balık", icon: "🐟", description: "Balık ve balık ürünleri" },
  { code: "E", name: "Yer Fıstığı", icon: "🥜", description: "Yer fıstığı ve yer fıstığı ürünleri" },
  { code: "F", name: "Soya", icon: "🫘", description: "Soya fasulyesi ve soya ürünleri" },
  { code: "G", name: "Süt", icon: "🥛", description: "Süt ve süt ürünleri (laktoz dahil)" },
  { code: "H", name: "Kabuklu Yemişler", icon: "🌰", description: "Badem, fındık, ceviz, kaju, antep fıstığı vb." },
  { code: "L", name: "Kereviz", icon: "🥬", description: "Kereviz ve kereviz ürünleri" },
  { code: "M", name: "Hardal", icon: "🌿", description: "Hardal ve hardal ürünleri" },
  { code: "N", name: "Susam", icon: "⚪", description: "Susam tohumu ve susam ürünleri" },
  { code: "O", name: "Kükürt Dioksit", icon: "💨", description: "Kükürt dioksit ve sülfitler" },
  { code: "P", name: "Acı Bakla", icon: "🫘", description: "Acı bakla ve acı bakla ürünleri" },
  { code: "R", name: "Yumuşakçalar", icon: "🐚", description: "Midye, istiridye, ahtapot vb." },
];

const productAllergens: { name: string; allergens: string[] }[] = [
  { name: "Artem Köfte", allergens: ["A", "C", "G"] },
  { name: "Kebap", allergens: ["A", "G"] },
  { name: "Dana Kavurma", allergens: ["G"] },
  { name: "Mercimek Çorba", allergens: ["A", "G"] },
  { name: "1 Porsiyon Köfte", allergens: ["A", "C", "G"] },
  { name: "Tek Köfte Burger Menü", allergens: ["A", "C", "G", "E"] },
  { name: "Çift Köfte Burger Menü", allergens: ["A", "C", "G", "E"] },
  { name: "Porsiyon Et Döner", allergens: ["A", "G"] },
  { name: "Porsiyon Çıtır 3'lü", allergens: ["A", "C", "G"] },
  { name: "Ekmek Kadayıfı", allergens: ["A", "C", "G", "H"] },
];

export default function Alerjenler() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="h-14 md:h-16" />

      {/* Page header */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-black">ALERJENLER</h1>
          <p className="text-gray-400 mt-1">Ürünlerimizde bulunan alerjen bilgileri</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold text-yellow-800 mb-1">Önemli Uyarı</p>
            <p className="text-sm text-yellow-700">
              Ürünlerimiz alerjen içeren maddelerle aynı ortamda üretilmektedir. 
              Ciddi alerjisi olan müşterilerimizin dikkatli olmasını öneririz. 
              Detaylı bilgi için lütfen personelimizle iletişime geçiniz.
            </p>
          </div>
        </div>

        {/* Allergen legend */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="text-xl font-black text-gray-800 mb-4">Alerjen Kodları</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {allergens.map((allergen) => (
              <div key={allergen.code} className="flex flex-col items-center p-3 bg-gray-50 rounded-xl text-center">
                <span className="text-2xl mb-1">{allergen.icon}</span>
                <span className="w-7 h-7 bg-red-600 text-white text-xs font-black rounded-full flex items-center justify-center mb-1">
                  {allergen.code}
                </span>
                <span className="text-xs font-bold text-gray-700">{allergen.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product allergen table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-900 text-white">
            <h2 className="font-black">Ürün Alerjen Tablosu</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">Ürün Adı</th>
                  {allergens.map((a) => (
                    <th key={a.code} className="px-2 py-3 text-center text-xs font-bold text-gray-600">
                      {a.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productAllergens.map((product, index) => (
                  <tr key={product.name} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{product.name}</td>
                    {allergens.map((a) => (
                      <td key={a.code} className="px-2 py-3 text-center">
                        {product.allergens.includes(a.code) ? (
                          <span className="w-5 h-5 bg-red-600 text-white text-xs font-black rounded-full inline-flex items-center justify-center">
                            ✓
                          </span>
                        ) : (
                          <span className="text-gray-200">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
