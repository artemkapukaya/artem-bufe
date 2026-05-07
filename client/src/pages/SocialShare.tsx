import { useState, useEffect } from "react";
import { Instagram, X, Copy, CheckCircle, Gift, Camera } from "lucide-react";
import { toast } from "sonner";

const SOCIAL_KEY = "artem_social_rewards";
const DISCOUNT_KEY = "artem_social_discount";

interface SocialReward {
  username: string;
  sharedAt: string;
  discountCode: string;
  used: boolean;
}

interface SocialShareProps {
  onClose: () => void;
  orderNumber?: string;
}

export default function SocialShare({ onClose, orderNumber }: SocialShareProps) {
  const [step, setStep]             = useState<"info" | "claim" | "done">("info");
  const [username, setUsername]     = useState("");
  const [copied, setCopied]         = useState(false);
  const [existingDiscount, setExistingDiscount] = useState<string | null>(null);

  useEffect(() => {
    // Daha önce kazanılmış indirim var mı?
    const saved = localStorage.getItem(DISCOUNT_KEY);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (!d.used) setExistingDiscount(d.code);
      } catch {}
    }
  }, []);

  const hashtag = "#ArtemBüfe";
  const instagramUrl = "https://instagram.com";

  const generateDiscountCode = () => {
    return `ARTEM${Math.random().toString(36).slice(2, 6).toUpperCase()}10`;
  };

  const handleClaim = () => {
    if (!username.trim()) { toast.error("Instagram kullanıcı adınızı girin!"); return; }

    const code = generateDiscountCode();
    const reward: SocialReward = {
      username: username.trim().replace("@", ""),
      sharedAt: new Date().toISOString(),
      discountCode: code,
      used: false,
    };

    // Kaydet
    const existing = JSON.parse(localStorage.getItem(SOCIAL_KEY) || "[]");
    localStorage.setItem(SOCIAL_KEY, JSON.stringify([...existing, reward]));
    localStorage.setItem(DISCOUNT_KEY, JSON.stringify({ code, used: false }));

    setStep("done");
    toast.success("Tebrikler! %10 indirim kodunuz hazır!", { duration: 4000 });
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast.success("Kod kopyalandı!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500 px-6 py-6 text-white text-center">
          <button onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <X size={16} />
          </button>
          <div className="text-4xl mb-2">📸</div>
          <h2 className="text-xl font-black mb-1">Paylaş & Kazan!</h2>
          <p className="text-white/80 text-sm">Yemeğini Instagram'da paylaş, bir sonraki siparişinde %10 indirim kazan</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Daha önce kazanılmış indirim */}
          {existingDiscount && step === "info" && (
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4 text-center">
              <p className="text-green-700 font-black mb-2">🎉 Kazanılmış İndirimini Kullan!</p>
              <div className="flex items-center justify-center gap-2">
                <code className="bg-green-100 text-green-800 font-black text-lg px-4 py-2 rounded-xl tracking-widest">
                  {existingDiscount}
                </code>
                <button onClick={() => handleCopy(existingDiscount)}
                  className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs text-green-600 mt-2 font-bold">Checkout'ta bu kodu kullan → %10 indirim!</p>
            </div>
          )}

          {step === "info" && (
            <>
              {/* Adımlar */}
              <div className="space-y-3">
                {[
                  { step: "1", icon: Camera, text: `Yemeğinin fotoğrafını çek`, color: "bg-pink-100 text-pink-600" },
                  { step: "2", icon: Instagram, text: `Instagram'da ${hashtag} etiketiyle paylaş`, color: "bg-purple-100 text-purple-600" },
                  { step: "3", icon: Gift, text: "Kullanıcı adını gir ve %10 indirimini al!", color: "bg-blue-100 text-blue-600" },
                ].map(({ step, icon: Icon, text, color }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                      <Icon size={16} />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3
                             bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black rounded-xl
                             hover:opacity-90 transition-opacity text-sm shadow-md">
                  <Instagram size={16} /> Instagram'ı Aç
                </a>
                <button onClick={() => setStep("claim")}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm">
                  Zaten Paylaştım →
                </button>
              </div>
            </>
          )}

          {step === "claim" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className="text-sm font-bold text-gray-600 text-center">
                Instagram kullanıcı adınızı girin, indirim kodunuzu alalım:
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="kullanici_adiniz"
                  autoFocus
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 font-semibold"
                />
              </div>
              <p className="text-xs text-gray-400 text-center">
                Paylaşımınızı manuel olarak doğrulayacağız. Sahte paylaşımlar geçersizdir.
              </p>
              <button onClick={handleClaim}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black rounded-xl
                           hover:opacity-90 transition-opacity shadow-md">
                🎁 İndirim Kodumu Al!
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="text-5xl">🎉</div>
              <p className="font-black text-gray-800 text-lg">Tebrikler @{username}!</p>
              <p className="text-gray-500 text-sm">İşte %10 indirim kodunuz:</p>
              <div className="flex items-center justify-center gap-2">
                <code className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200
                                 text-purple-800 font-black text-xl px-5 py-3 rounded-xl tracking-widest">
                  {JSON.parse(localStorage.getItem(DISCOUNT_KEY) || "{}").code}
                </code>
                <button onClick={() => handleCopy(JSON.parse(localStorage.getItem(DISCOUNT_KEY) || "{}").code)}
                  className="p-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors">
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 font-bold">
                Bu kodu bir sonraki siparişte ödeme adımında kullan!
              </p>
              <button onClick={onClose}
                className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Harika, Teşekkürler! 🙌
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
