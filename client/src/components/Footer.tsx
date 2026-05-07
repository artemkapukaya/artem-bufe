import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Top Section - Logo and Social Media */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-white/10">
          {/* Brand & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-black font-black text-2xl leading-none">A</span>
              </div>
              <div>
                <div className="text-white font-black text-lg leading-tight">
                  <span className="text-yellow-400">ARTEM</span>
                  <br />
                  <span className="text-white">BÜFE</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              En lezzetli fast food ürünleri, en hızlı teslimat.
            </p>

            {/* Social Media Icons */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white hover:shadow-lg hover:scale-110 transition-all"
                  title="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:shadow-lg hover:scale-110 transition-all"
                  title="Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center text-white hover:shadow-lg hover:scale-110 transition-all"
                  title="X (Twitter)"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white hover:shadow-lg hover:scale-110 transition-all"
                  title="YouTube"
                >
                  <Youtube size={18} />
                </a>
              </div>

              {/* App Store Links */}
              <div className="flex gap-2">
                <a
                  href="#"
                  className="px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white font-bold hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <span>🍎</span> App Store
                </a>
                <a
                  href="#"
                  className="px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white font-bold hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <span>▶</span> Google Play
                </a>
              </div>
            </div>
          </div>

          {/* Menü */}
          <div>
            <h3 className="text-white font-black text-sm mb-6 uppercase tracking-wider">Menü</h3>
            <ul className="space-y-3">
              {["Menümüz", "Sıkça Sorulan Sorular", "Şubelerimiz", "Alerjen", "Sipariş Ver"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-gray-400 hover:text-orange-400 transition-colors font-medium">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destek */}
          <div>
            <h3 className="text-white font-black text-sm mb-6 uppercase tracking-wider">Destek</h3>
            <ul className="space-y-3">
              {[
                "Site Haritası",
                "KVKK Aydınlatma",
                "Çerez Politikası",
                "Öneri ve Şikayet",
                "Kullanım Koşulları",
              ].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-gray-400 hover:text-orange-400 transition-colors font-medium">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="text-white font-black text-sm mb-6 uppercase tracking-wider">İletişim</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:05319588088"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition-colors font-medium"
                >
                  <Phone size={16} className="text-orange-400 shrink-0" />
                  05319588088
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@artembufe.com"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition-colors font-medium"
                >
                  <Mail size={16} className="text-orange-400 shrink-0" />
                  info@artembufe.com
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-sm text-gray-400">
                  <MapPin size={16} className="text-orange-400 shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">
                    Kurtuluş Mah. Lezzet Sk.<br />
                    No:1 İstanbul
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>


      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              © 2026 ARTEM BÜFE FAST FOOD. Tüm hakları saklıdır.
            </p>
            <div className="flex gap-6 flex-wrap justify-center">
              <Link href="#" className="text-xs text-gray-500 hover:text-orange-400 transition-colors font-medium">
                Gizlilik Politikası
              </Link>
              <Link href="#" className="text-xs text-gray-500 hover:text-orange-400 transition-colors font-medium">
                Kullanım Koşulları
              </Link>
              <Link href="#" className="text-xs text-gray-500 hover:text-orange-400 transition-colors font-medium">
                İletişim
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
