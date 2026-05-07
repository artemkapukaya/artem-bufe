import { useState, useRef, useEffect } from "react";
import { X, Sparkles, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { products as staticProducts } from "@/lib/data";
import { toast } from "sonner";

interface WheelItem {
  id: string;
  name: string;
  price: number;
  image: string;
  color: string;
}

const COLORS = [
  "#ea580c", "#dc2626", "#d97706", "#16a34a",
  "#2563eb", "#9333ea", "#db2777", "#0891b2",
];

function getWheelItems(): WheelItem[] {
  const customRaw = localStorage.getItem("artem_custom_products");
  const custom = customRaw ? JSON.parse(customRaw) : [];
  const all = [...staticProducts, ...custom];
  // Sadece 8 ürün — fiyatı makul olanlar
  const filtered = all.filter(p => p.price > 50 && p.price < 1000);
  const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 8);
  return shuffled.map((p, i) => ({
    id: p.id,
    name: p.name.length > 14 ? p.name.slice(0, 12) + "…" : p.name,
    price: p.price,
    image: p.image,
    color: COLORS[i % COLORS.length],
  }));
}

interface LuckyWheelProps {
  onClose: () => void;
}

export default function LuckyWheel({ onClose }: LuckyWheelProps) {
  const { addItem } = useCart();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [items] = useState<WheelItem[]>(getWheelItems);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<WheelItem | null>(null);
  const [rotation, setRotation] = useState(0);
  const [discountCode] = useState(`SANS${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
  const rotationRef = useRef(0);
  const animRef = useRef<number>(0);

  // Çarkı canvas'a çiz
  const drawWheel = (rot: number) => {
    const canvas = canvasRef.current;
    if (!canvas || items.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r  = cx - 12;
    const arc = (2 * Math.PI) / items.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    items.forEach((item, i) => {
      const startAngle = rot + i * arc;
      const endAngle   = startAngle + arc;

      // Dilim
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Yazı
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px sans-serif";
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 3;
      ctx.fillText(item.name, r - 10, 4);
      ctx.restore();
    });

    // Merkez daire
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Merkez emoji
    ctx.font = "22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎰", cx, cy);
  };

  useEffect(() => {
    // Canvas hazır olunca çiz
    const timer = setTimeout(() => drawWheel(rotationRef.current), 50);
    return () => clearTimeout(timer);
  }, [items]);

  useEffect(() => {
    drawWheel(rotation);
  }, [rotation]);

  const spin = () => {
    if (spinning || items.length === 0) return;
    setSpinning(true);
    setWinner(null);

    const extraSpins = 5 + Math.random() * 5; // 5-10 tur
    const winnerIdx  = Math.floor(Math.random() * items.length);
    const arc        = (2 * Math.PI) / items.length;
    // Kazananın tam ortasına gel — ok yukarıda (−π/2)
    const targetAngle = extraSpins * 2 * Math.PI
      + (2 * Math.PI - winnerIdx * arc - arc / 2)
      - Math.PI / 2;

    const startRot  = rotationRef.current;
    const totalDiff = targetAngle - (startRot % (2 * Math.PI));
    const duration  = 4500;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = startRot + totalDiff * eased;

      rotationRef.current = current;
      drawWheel(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setRotation(current);
        setSpinning(false);
        setWinner(items[winnerIdx]);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const handleAddToCart = () => {
    if (!winner) return;
    const discountedPrice = Math.round(winner.price * 0.95);
    addItem({
      id: `${winner.id}-lucky`,
      name: `${winner.name} 🎰 (%5 İndirimli)`,
      price: discountedPrice,
      image: winner.image,
    });
    toast.success(`${winner.name} sepete eklendi!`, {
      description: `%5 kararsızlık indirimi uygulandı — ${discountedPrice} TL`,
      duration: 3000,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-red-600 px-6 py-5 text-white text-center">
          <button onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <X size={16} />
          </button>
          <div className="text-3xl mb-1">🎰</div>
          <h2 className="text-xl font-black">Şanslı Menü Çarkı</h2>
          <p className="text-orange-100 text-sm mt-1">Karar veremiyorsan bırak kader seçsin!</p>
          <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 mt-2 text-xs font-black">
            <Sparkles size={12} /> Kazanana %5 kararsızlık indirimi!
          </div>
        </div>

        {/* Çark */}
        <div className="px-6 pt-5 pb-3 flex flex-col items-center">
          <div className="relative">
            {/* Ok işareti */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
              <div className="w-0 h-0"
                style={{ borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "20px solid #dc2626" }} />
            </div>
            <canvas ref={canvasRef} width={300} height={300} className="rounded-full shadow-xl" />
          </div>

          {/* Spin butonu */}
          {!winner && (
            <button
              onClick={spin}
              disabled={spinning}
              className="mt-5 px-10 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black rounded-2xl text-lg
                         shadow-lg hover:shadow-orange-400/40 hover:scale-105 active:scale-95 transition-all
                         disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              {spinning ? "🎰 Dönüyor…" : "🎲 Çevir!"}
            </button>
          )}

          {/* Kazanan */}
          {winner && (
            <div className="mt-4 w-full animate-in slide-in-from-bottom-3 duration-300">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 text-center mb-3">
                <p className="text-2xl mb-1">🎉</p>
                <p className="font-black text-gray-800 text-lg">{winner.name}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-gray-400 line-through text-sm">{winner.price.toLocaleString("tr-TR")} ₺</span>
                  <span className="font-black text-green-600 text-xl">
                    {Math.round(winner.price * 0.95).toLocaleString("tr-TR")} ₺
                  </span>
                  <span className="bg-green-100 text-green-700 text-xs font-black px-2 py-0.5 rounded-full">%5 İNDİRİM</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-red-600
                             text-white font-black rounded-xl hover:opacity-90 transition-opacity shadow-md">
                  <ShoppingCart size={18} /> Sepete Ekle
                </button>
                <button onClick={() => { setWinner(null); spin(); }}
                  className="px-4 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm">
                  🔄 Tekrar
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-gray-300 text-xs pb-4">İndirim yalnızca bu sipariş için geçerlidir</p>
      </div>
    </div>
  );
}
