import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Truck, MapPin, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function OrderTracking() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Giriş Gerekli</CardTitle>
            <CardDescription>Siparişlerinizi görmek için lütfen giriş yapın.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Ana Sayfaya Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock sipariş verileri
  const orders = [
    {
      id: 1,
      orderNumber: "#14363510",
      date: "2026-04-03",
      total: 651.0,
      status: "on_the_way",
      items: [
        { name: "Yusuf Köfte", quantity: 1, price: 650.0 },
        { name: "POŞET", quantity: 1, price: 1.0 },
      ],
      timeline: [
        { status: "pending", label: "Sipariş Alındı", date: "2026-04-03 10:00", completed: true },
        { status: "preparing", label: "Hazırlanıyor", date: "2026-04-03 10:15", completed: true },
        { status: "on_the_way", label: "Yolda", date: "2026-04-03 10:45", completed: true },
        { status: "delivered", label: "Teslim Edilecek", date: "Yakında", completed: false },
      ],
      deliveryAddress: "İstanbul, Eyüpsultan, Topçular",
      paymentMethod: "Kapıda Ödeme (Nakit)",
    },
    {
      id: 2,
      orderNumber: "#14363509",
      date: "2026-04-02",
      total: 450.0,
      status: "delivered",
      items: [
        { name: "Tam Porsiyon", quantity: 2, price: 480.0 },
      ],
      timeline: [
        { status: "pending", label: "Sipariş Alındı", date: "2026-04-02 19:00", completed: true },
        { status: "preparing", label: "Hazırlanıyor", date: "2026-04-02 19:15", completed: true },
        { status: "on_the_way", label: "Yolda", date: "2026-04-02 19:45", completed: true },
        { status: "delivered", label: "Teslim Edildi", date: "2026-04-02 20:15", completed: true },
      ],
      deliveryAddress: "İstanbul, Eyüpsultan, Topçular",
      paymentMethod: "Kredi Kartı",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "preparing":
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case "on_the_way":
        return <Truck className="w-5 h-5 text-orange-500" />;
      case "delivered":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Bekleniyor";
      case "preparing":
        return "Hazırlanıyor";
      case "on_the_way":
        return "Yolda";
      case "delivered":
        return "Teslim Edildi";
      case "cancelled":
        return "İptal Edildi";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "on_the_way":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Siparişlerim</h1>
          <p className="text-gray-600">Tüm siparişlerinizi ve durumlarını takip edin</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Henüz sipariş vermemişsiniz</p>
              <Button onClick={() => navigate("/")} variant="outline">
                Menüyü Görüntüle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                      <CardDescription>{order.date}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Sipariş Özeti */}
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="font-semibold text-gray-900 mb-3">Sipariş Detayları</h3>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.name} x {item.quantity}</span>
                          <span className="font-medium">{item.price.toFixed(2)} TL</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-between font-semibold">
                      <span>Toplam:</span>
                      <span className="text-orange-600">{order.total.toFixed(2)} TL</span>
                    </div>
                  </div>

                  {/* Teslimat Bilgileri */}
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="font-semibold text-gray-900 mb-3">Teslimat Bilgileri</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{order.deliveryAddress}</span>
                      </div>
                      <div className="text-gray-600">
                        <strong>Ödeme Yöntemi:</strong> {order.paymentMethod}
                      </div>
                    </div>
                  </div>

                  {/* Sipariş Durumu Timeline */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Sipariş Durumu</h3>
                    <div className="space-y-4">
                      {order.timeline.map((step, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`p-2 rounded-full ${step.completed ? "bg-green-100" : "bg-gray-100"}`}>
                              {getStatusIcon(step.status)}
                            </div>
                            {idx < order.timeline.length - 1 && (
                              <div className={`w-0.5 h-12 ${step.completed ? "bg-green-300" : "bg-gray-200"}`}></div>
                            )}
                          </div>
                          <div className="pt-1">
                            <p className={`font-medium ${step.completed ? "text-gray-900" : "text-gray-600"}`}>
                              {step.label}
                            </p>
                            <p className="text-sm text-gray-500">{step.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
