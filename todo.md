# ARTEM BÜFE - Geliştirme TODO

## Müşteri Paneli
- [x] Müşteri paneli çıkış butonu kırmızı renkte ve dinamik yap
- [x] Çıkış işlemi sonrası ana sayfaya yönlendirme ekle

## Admin Paneli
- [x] Admin paneli şifreli giriş sistemi oluştur (AdminLogin.tsx)
- [x] Admin panelinde şifre değiştirme özelliği ekle (AdminDashboard.tsx)
- [x] Admin panelinde ürün ekleme/düzenleme/silme işlemleri (AdminProducts.tsx)
- [x] Admin panelinde kategori ekleme/düzenleme/silme işlemleri (AdminProducts.tsx)
- [x] Admin panelinde tüm sayfa yönetim özellikleri (AdminDashboard.tsx)
- [x] Admin paneli çıkış butonu dinamik ve kırmızı yapıldı
- [x] Admin panelinden çıkış sonrası ana sayfaya yönlendirme
- [x] Ödeme yöntemleri yönetim paneli oluşturuldu (AdminPaymentMethods.tsx)

## Ana Sayfa Geliştirmeleri
- [x] Ürünlere tıklandığında detay sayfasına yönlendirme
- [x] Ürün kartlarına '+Detaylar' butonu ekle
- [x] Ürün kartlarına 'Sepete Ekle' butonu ekle
- [x] Ürün detay sayfasında tam ürün bilgisi göster
- [x] Ürün detay sayfasında sepete ekleme özelliği

## Sepet Yönetimi
- [x] Sepet yönetimi sistemi oluştur (CartContext.tsx)
- [x] Ürün miktarı güncelleme özelliği
- [x] Sepet görüntüleme sayfası (CartDrawer.tsx)

## Veritabanı
- [x] Admin şifresi için tablo oluştur (admin_credentials)
- [x] Ürün tablosu oluştur (products)
- [x] Kategori tablosu oluştur (categories)
- [x] Sadakat profili tablosu (loyalty_profiles)
- [x] Siparişler tablosu (orders)
- [x] Ödeme yöntemleri tablosu (payment_methods)
- [x] SMS doğrulama tablosu (sms_verifications)
- [x] Müşteri adresleri tablosu (customer_addresses)
- [x] Ödeme tablosu (payments)


## Hata Düzeltmeleri (Acil)
- [x] Ürün detay sayfası 404 hatası düzelt
- [x] Ödeme sayfası 404 hatası düzelt
- [x] Admin paneli giriş yolu düzelt
- [x] App.tsx dosyasında tüm route'ları ekle
- [x] Admin paneli navigasyonunu düzelt
- [x] Tüm sayfaların çalışmasını test et


## Ödeme Sistemi Geliştirilmeleri
- [x] Ödeme yöntemlerini aktif et ve yükle (mock verilerle)
- [x] Kredi kartı ödeme sistemini ekle
- [x] Ödeme Yap butonu ekle
- [x] Ödeme işlemi tamamla

## UI/UX İyileştirilmeleri
- [x] Sepete ekleme bildirimi düzelt (toast mesajı)
- [x] Footer'ı menü, destek, iletişim şeklinde yeniden düzenle

## Sipariş Onayı Tasarımı (Yeni)
- [x] Checkout sayfasını 3 adımlı flow'a göre yeniden düzenle (Adres, Ödeme, Onay)
- [x] Sol tarafta teslimat adresi, teslimat zamanı, fatura bilgileri göster
- [x] Sağ tarafta sipariş özeti, ürünler listesi, toplam tutar göster
- [x] Adres seçme ve teslimat zamanı seçimi ekle
- [x] Fatura bilgileri checkbox'ı ekle
- [x] Sipariş Onayla butonu ekle


## Ödeme Sayfası Geliştirilmeleri
- [x] Ödeme sayfasını sipariş onayı tasarımına göre düzenle (sol taraf ödeme yöntemleri, sağ taraf sipariş özeti)
- [x] Yemek kartı ödeme yöntemlerini ekle (Sodexo, Multinet, Edenred, Metropol)
- [x] Kredi kartı ödeme sistemini test et
- [x] Kapıda ödeme sistemini test et
- [x] Yemek kartı sistemlerini test et
- [x] Tüm ödeme yöntemlerinin çalışmasını doğrula

## Sipariş Tamamlandı Sayfası Tasarımı (Yeni)
- [x] Sipariş tamamlandı sayfasını yeni tasarıma göre düzenle (yeşil check, sipariş no, ödeme yöntemi, durum)
- [x] Yemek kartılarına tıklandığında form alanları açılması özelliğini ekle (Sodexo, Multinet, Edenred, Metropol)
- [x] Footer'ı menü, destek, iletişim şeklinde yanyana düzenle


## Sipariş Durumu ve Bildirim Sistemi (Yeni)
- [x] Sipariş durumu tablosu oluştur (pending, preparing, on_the_way, delivered, cancelled)
- [x] Bildirim tablosu oluştur (order_id, notification_type, status, sent_at)
- [x] Backend'de sipariş durumu güncelleme fonksiyonu ekle
- [x] SMS ve e-posta bildirim gönderme fonksiyonları oluştur
- [x] Admin panelinde sipariş durumu güncelleme arayüzü ekle
- [x] Müşteri panelinde sipariş takibi sayfası oluştur
- [x] Bildirim şablonları ekle (hazırlanıyor, yolda, teslim edildi, iptal)


## Tam Entegrasyon Görevleri (Acil)
- [ ] Admin panelinde sipariş durumu güncelleme arayüzünü backend'e bağla
- [ ] OrderTracking sayfasını backend'e bağla ve dinamikleştir
- [ ] Bildirim şablonlarını oluştur ve merkezi map'e ekle
- [ ] Vitest testleri yaz ve çalıştır
- [ ] Tüm özellikleri test et ve doğrula
