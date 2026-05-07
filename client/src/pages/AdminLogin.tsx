import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 350));

    try {
      const storedPass = localStorage.getItem("adminPasswordHash") ?? "ChangeMe123!";
      const storedUser = localStorage.getItem("adminUsername") ?? "admin";

      if (username === storedUser && password === storedPass) {
        const token = crypto.randomUUID();
        const exp = String(Date.now() + 8 * 60 * 60 * 1000); // 8 saat

        // Hem localStorage hem sessionStorage'a yaz
        // localStorage → tarayıcı kapansa da kalır
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminTokenExp", exp);
        sessionStorage.setItem("adminToken", token);
        sessionStorage.setItem("adminTokenExp", exp);

        toast.success("Başarıyla giriş yaptınız!", { duration: 2000 });
        setTimeout(() => { window.location.href = "/admin"; }, 500);
      } else {
        toast.error("Kullanıcı adı veya şifre yanlış!", { duration: 3000 });
        setPassword("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
      <Header />
      <div className="h-14 md:h-16" />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
                <span className="text-2xl font-black text-orange-600">A</span>
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Admin Paneli</h1>
              <p className="text-orange-100">ARTEM BÜFE Fast Food</p>
            </div>
            <form onSubmit={handleLogin} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Kullanıcı Adı</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="admin" autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600 transition-colors"
                    disabled={isLoading} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" autoComplete="current-password"
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600 transition-colors"
                    disabled={isLoading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading || !username || !password}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
              </button>
              <a href="/" className="block w-full py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-all text-center">
                Ana Sayfaya Dön
              </a>
            </form>
          </div>
          <div className="mt-6 text-center text-gray-400 text-sm">
            <p>🔒 Bu sayfa sadece yöneticiler için tasarlanmıştır.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
