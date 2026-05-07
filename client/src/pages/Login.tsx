import { useState } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Login() {
    const [, navigate] = useLocation();
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = () => {
        const loginUrl = getLoginUrl();
        if (loginUrl === "/login-error") {
            toast.error("Google giriş şu an kullanılamıyor. Misafir olarak devam edebilirsiniz.");
            return;
        }
        window.location.href = loginUrl;
    };

    const handleGuestLogin = () => {
        // Misafir kullanıcı — localStorage'a kaydet
        localStorage.setItem("artem_guest", "true");
        toast.success("Misafir olarak devam ediyorsunuz!");
        navigate("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">

                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-8 text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg backdrop-blur-sm">
                        <span className="text-white font-black text-2xl">A</span>
                    </div>
                    <h2 className="text-2xl font-black">Hoş Geldiniz</h2>
                    <p className="text-orange-100 mt-1 text-sm">ARTEM BÜFE Fast Food</p>
                </div>

                <div className="p-8 space-y-4">

                    {/* Misafir olarak devam */}
                    <button
                        onClick={handleGuestLogin}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-red-600
                                   text-white py-4 rounded-xl font-black hover:opacity-90 transition-all shadow-lg active:scale-95 text-lg"
                    >
                        🛒 Misafir Olarak Sipariş Ver
                    </button>

                    <p className="text-center text-xs text-gray-400 font-bold">
                        Hesap açmadan hızlıca sipariş ver
                    </p>

                    <div className="relative my-2 text-center">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
                        <span className="relative bg-white px-4 text-xs text-gray-400 uppercase font-black">Veya Hesapla Giriş Yap</span>
                    </div>

                    {/* Google Giriş */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 border-2 border-gray-100 py-3.5 rounded-xl
                                   hover:bg-gray-50 transition-all font-bold text-gray-700 shadow-sm active:scale-95"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                        Google ile Devam Et
                    </button>

                    {/* Avantajlar */}
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mt-4">
                        <p className="text-xs font-black text-orange-700 mb-2">✨ Hesap Açmanın Avantajları</p>
                        <ul className="space-y-1">
                            {[
                                "💎 Her siparişte Artem Gem kazan",
                                "📋 Sipariş geçmişini takip et",
                                "📍 Adreslerini kaydet",
                                "🎁 Özel kampanyalardan yararlan",
                            ].map(item => (
                                <li key={item} className="text-xs text-orange-600 font-semibold">{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Admin girişi linki */}
                    <div className="text-center pt-2">
                        <a href="/admin-login" className="text-xs text-gray-300 hover:text-gray-500 font-bold transition-colors">
                            Yönetici Girişi →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
