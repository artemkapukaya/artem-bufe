import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
    ShoppingCart, User, ChevronDown, FileText,
    LogOut, LogIn, MapPin, Package, ChevronRight
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import CartDrawer from "./CartDrawer";

export default function Header() {
    const [accountOpen, setAccountOpen] = useState(false);
    const { totalItems, setIsOpen } = useCart();
    const [, navigate] = useLocation();
    const accountRef = useRef<HTMLDivElement>(null);

    const { logout, user, isAuthenticated } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            setAccountOpen(false);
            toast.success("Çıkış yapıldı");
            window.location.href = "/";
        } catch (error) {
            toast.error("Çıkış yapılamadı");
        }
    };

    const navLinks = [
        { href: "/menu", label: "Menü" },
        { href: "/kurumsal", label: "Kurumsal" },
        { href: "/alerjenler", label: "Alerjenler" },
        { href: "/iletisim", label: "İletişim" },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
                setAccountOpen(false);
            }
        };
        if (accountOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [accountOpen]);

    return (
        <>
            <header className="bg-gray-900 text-white fixed top-0 left-0 w-full z-50 shadow-lg font-sans">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-14 md:h-16">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-black text-black">A</div>
                            <div className="hidden sm:block font-black text-sm tracking-wide">
                                <span className="text-yellow-400">ARTEM</span> BÜFE
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link key={link.href} href={link.href} className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Right side */}
                        <div className="flex items-center gap-2 md:gap-3">
                            {/* Cart */}
                            <button onClick={() => setIsOpen(true)} className="relative w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center hover:bg-orange-700 transition-colors">
                                <ShoppingCart size={16} />
                                {totalItems > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-gray-900">{totalItems}</span>}
                            </button>

                            {/* Account Panel (1. Resimdeki Tasarım) */}
                            <div className="relative" ref={accountRef}>
                                <button
                                    onClick={() => setAccountOpen(!accountOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all shadow-inner"
                                >
                                    <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                                        {isAuthenticated ? user?.fullName?.charAt(0).toUpperCase() : <User size={14} />}
                                    </div>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${accountOpen ? "rotate-180" : ""}`} />
                                </button>

                                {accountOpen && (
                                    <div className="absolute right-0 mt-3 w-72 bg-white text-gray-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden z-50 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">

                                        {/* 1. RESİM: GRADIENT HEADER AREA */}
                                        <div className="p-5 bg-gradient-to-r from-red-600 to-orange-500 text-white">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center font-black text-xl border border-white/30 backdrop-blur-sm">
                                                    {isAuthenticated ? user?.fullName?.charAt(0).toUpperCase() : "M"}
                                                </div>
                                                <div>
                                                    <p className="font-black text-base leading-tight uppercase tracking-tight">
                                                        {isAuthenticated ? user?.fullName : "Misafir Kullanıcı"}
                                                    </p>
                                                    <p className="text-xs opacity-90 font-medium mt-0.5">
                                                        {isAuthenticated ? user?.phoneNumber : "Giriş yapınız"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* MENÜ LİSTESİ */}
                                        <div className="p-2 space-y-1">
                                            <MenuLink
                                                icon={<User size={18} className="text-blue-500" />}
                                                label="Hesabım"
                                                subLabel="Profil ve ayarlar"
                                                onClick={() => { navigate("/profile"); setAccountOpen(false); }}
                                            />
                                            <MenuLink
                                                icon={<Package size={18} className="text-green-500" />}
                                                label="Siparişlerim"
                                                subLabel="Geçmiş siparişler"
                                                onClick={() => { navigate("/orders"); setAccountOpen(false); }}
                                            />
                                            <MenuLink
                                                icon={<MapPin size={18} className="text-purple-500" />}
                                                label="Adreslerim"
                                                subLabel="Teslimat adresleri"
                                                onClick={() => { navigate("/addresses"); setAccountOpen(false); }}
                                            />

                                            <div className="border-t border-gray-100 my-2" />

                                            {isAuthenticated ? (
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-4 p-3.5 text-red-600 font-black text-sm hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                                                        <LogOut size={18} />
                                                    </div>
                                                    <span>Çıkış Yap</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => { navigate("/auth"); setAccountOpen(false); }}
                                                    className="w-full flex items-center gap-4 p-3.5 text-orange-600 font-black text-sm hover:bg-orange-50 rounded-xl transition-colors"
                                                >
                                                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                                                        <LogIn size={18} />
                                                    </div>
                                                    <span>Şimdi Giriş Yap</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <CartDrawer />
        </>
    );
}

// Menü Linkleri İçin Yardımcı Bileşen
function MenuLink({ icon, label, subLabel, onClick }: any) {
    return (
        <button onClick={onClick} className="w-full flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-xl transition-all group">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-white shadow-sm transition-colors border border-transparent group-hover:border-gray-100">
                    {icon}
                </div>
                <div className="text-left">
                    <p className="font-black text-gray-800 text-[13px] leading-tight uppercase tracking-tight">{label}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{subLabel}</p>
                </div>
            </div>
            <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
        </button>
    );
}