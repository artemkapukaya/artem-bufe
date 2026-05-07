# 🔒 ARTEM BÜFE — Güvenlik Rehberi

## Yapılan Güvenlik İyileştirmeleri

### Kritik Düzeltmeler
- ✅ Admin şifresi frontend kodundan kaldırıldı (artık veritabanında hashli)
- ✅ `localStorage` admin session kaldırıldı → HTTP-only cookie kullanılıyor
- ✅ Kullanıcı bilgileri artık `localStorage`'a yazılmıyor
- ✅ Admin login backend'de doğrulanıyor (PBKDF2 + SHA-256 hashing)
- ✅ Rate limiting eklendi (5 başarısız deneme → 15 dk bekleme)
- ✅ Body size limiti 50MB'dan 10MB'a düşürüldü
- ✅ Security HTTP headers eklendi (XSS, clickjacking, MIME sniffing)
- ✅ Input sanitization middleware eklendi
- ✅ Demo şifre (`admin123`) kodu tamamen kaldırıldı

### Güvenlik Başlıkları
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self' ...
```

## İlk Kurulum

1. `.env.example` dosyasını `.env` olarak kopyalayın
2. `JWT_SECRET` için güçlü bir değer üretin: `openssl rand -hex 32`
3. `ADMIN_INITIAL_PASSWORD` için güçlü şifre belirleyin
4. Sunucu başladığında otomatik admin hesabı oluşturulur
5. **İlk giriş sonrası admin şifresini değiştirin!**

## Şifre Gereksinimleri
- Min 8 karakter
- En az 1 büyük harf
- En az 1 rakam
- En az 1 özel karakter (!@#$%...)

## Rate Limiting
| Endpoint | Limit | Pencere |
|----------|-------|---------|
| Admin Login | 5 istek | 15 dakika |
| Genel API | 100 istek | 1 dakika |

## Üretim Kontrol Listesi
- [ ] `NODE_ENV=production` ayarlandı mı?
- [ ] `JWT_SECRET` güçlü ve benzersiz mi?
- [ ] HTTPS aktif mi? (SSL sertifikası)
- [ ] Admin şifresi değiştirildi mi?
- [ ] Veritabanı şifresi güçlü mü?
- [ ] `.env` dosyası `.gitignore`'da mı?

## Bilinen Limitasyonlar
- Rate limiting in-memory (restart sonrası sıfırlanır) → üretimde Redis kullanın
- SMS doğrulama mock — gerçek SMS sağlayıcısı entegre edilmeli (Twilio, Netgsm)
