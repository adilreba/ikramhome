# Vitrin — WhatsApp ile Sipariş Alan Mağaza Sitesi

Dükkanınızdaki ürünlerin fotoğraflarını yüklediğiniz, müşterilerin beğendiği ürünleri sepete ekleyip **tek dokunuşla WhatsApp'tan size gönderdiği** modern bir mağaza sitesi ve gelişmiş yönetim paneli.

**Teknoloji:** Next.js 14 (frontend + backend aynı projede) · Neon PostgreSQL · Tailwind CSS

---

## Neler var?

**Müşteri tarafı**
- Şık ana sayfa: büyük başlık, öne çıkan ürünler kolajı, kategoriler, "nasıl sipariş verilir" bölümü
- Ürün listesi: kategori, arama, fiyat aralığı ve sıralama filtreleri, sayfalama
- Ürün sayfası: çoklu fotoğraf galerisi (kaydırma, büyütme), indirim rozeti, benzer ürünler
- Sepet: adet değiştirme, isim/not ekleme; sepet tarayıcıda saklanır, fiyatlar her açılışta güncellenir
- **WhatsApp butonu:** Sepetteki her ürünün **adı, adedi, fiyatı, ürün linki ve ana fotoğrafının linki** + toplam tutar ve talep numarası hazır mesaj olarak WhatsApp'ta açılır. Müşteri "Gönder"e basar, siz WhatsApp'ta konuşup anlaşırsınız.
- Ürün linki WhatsApp'ta **fotoğraflı önizleme** olarak görünür (Open Graph)
- Sağ altta her sayfada sabit WhatsApp kutusu (sepet doluysa toplam tutarı gösterir)
- Mobil uyumlu

**Yönetim paneli (`/admin`)**
- Güvenli giriş (şifre hash'li, oturum çerezi, hatalı deneme sınırı)
- Genel bakış: yeni talepler, satış tutarı, dönüşüm oranı, 14 günlük talep grafiği, en çok bakılan ve en çok istenen ürünler
- Ürünler: arama, filtre, sıralama, satır içinde stok düzenleme, yayında/gizli anahtarı, öne çıkarma, kopyalama, **toplu işlemler** (yayınla, gizle, kategori taşı, sil)
- Ürün formu: sürükle-bırak çoklu fotoğraf yükleme, sıralama (ilki kapak), otomatik küçültme, eski fiyat/indirim, stok, SKU, etiketler, özel URL
- Kategoriler: ekle/düzenle/sil, görsel, sıra, gizle/göster
- **WhatsApp Talepleri:** müşterilerin gönderdiği her sepet kayıt altında — durum (Yeni → Görüşülüyor → Satıldı / İptal), satıcı notu, müşteriye tek tıkla WhatsApp'tan dönüş
- Ayarlar: WhatsApp numarası, mesaj başlangıcı, mağaza adı, logo, duyuru çubuğu, ana sayfa yazıları ve kapak görseli, iletişim bilgileri, stok gösterimi, şifre değiştirme

---

## Kurulum (adım adım)

### 1) Gerekenler
- [Node.js](https://nodejs.org) 18.18 veya üzeri (LTS sürümü önerilir)
- Ücretsiz bir [Neon](https://neon.tech) hesabı

### 2) Neon veritabanını oluşturun
1. neon.tech → **New Project** → bölge olarak **Europe (Frankfurt)** seçin.
2. Proje açılınca **Connect** butonuna basın, **Connection string**'i kopyalayın.
   - Vercel'e yükleyecekseniz **"Pooled connection"** seçili olsun (adreste `-pooler` geçer).

### 3) Projeyi hazırlayın
Proje klasöründe terminal açın:

```bash
npm install
```

`.env.example` dosyasını kopyalayıp adını **`.env.local`** yapın ve doldurun:

| Değişken | Ne yazılacak |
|---|---|
| `DATABASE_URL` | Neon'dan kopyaladığınız bağlantı adresi |
| `AUTH_SECRET` | En az 32 karakter rastgele metin. Üretmek için: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_EMAIL` | Panele giriş e-postanız |
| `ADMIN_PASSWORD` | Panele giriş şifreniz (en az 8 karakter) |
| `NEXT_PUBLIC_SITE_URL` | Sitenizin adresi, ör. `https://magazam.com` (yerelde `http://localhost:3000`) |

### 4) Tabloları ve yönetici hesabını oluşturun
```bash
npm run db:setup
```
İsterseniz siteyi denemek için örnek ürünler ekleyin (sonra panelden silebilirsiniz):
```bash
npm run db:seed
```

### 5) Çalıştırın
```bash
npm run dev
```
- Site: http://localhost:3000
- Panel: http://localhost:3000/admin

**İlk iş:** Panel → **Ayarlar** → WhatsApp numaranızı girin (ör. `0532 123 45 67`, otomatik `905321234567` yapılır) → "Numarayı test et".

---

## Yayına alma (Vercel — ücretsiz)

1. Projeyi GitHub'a yükleyin (`.env.local` yüklenmez, bu doğru).
2. [vercel.com](https://vercel.com) → **Add New → Project** → depoyu seçin.
3. **Environment Variables** bölümüne `.env.local`'deki değişkenlerin hepsini ekleyin. `NEXT_PUBLIC_SITE_URL`'e Vercel'in verdiği adresi veya kendi alan adınızı yazın.
4. **Deploy**. Bitti.
5. Kendi alan adınızı Vercel → Project → Settings → Domains'den bağlayabilirsiniz; bağladıktan sonra `NEXT_PUBLIC_SITE_URL`'i güncelleyip yeniden deploy edin.

> Tabloları zaten 4. adımda oluşturduğunuz için Vercel'de tekrar `db:setup` çalıştırmanız gerekmez.
> Yönetici şifresini unutursanız: `.env.local`'de `ADMIN_PASSWORD`'ü değiştirip `npm run db:setup` çalıştırın.

---

## Önemli notlar

- **Fotoğraflar Neon veritabanında saklanır** — ek bir depolama servisi gerekmez. Yükleme sırasında fotoğraflar tarayıcıda otomatik olarak 1600 px'e küçültülüp JPEG'e çevrilir (ortalama 200–400 KB). Neon'un ücretsiz 0,5 GB alanı yaklaşık 1.500+ fotoğraf eder. Kullanılmayan fotoğraflar otomatik silinir.
- **iPhone HEIC fotoğrafları** bazı tarayıcılarda okunamayabilir; Safari genelde sorunsuz çevirir. Hata alırsanız fotoğrafı JPG olarak kaydedip yükleyin.
- **WhatsApp önizlemesi** (mesajdaki linkin fotoğraflı görünmesi) sadece site internette yayındayken çalışır; localhost'ta görünmez.
- WhatsApp mesajına fotoğrafın kendisi eklenemez (WhatsApp buna izin vermez); bunun yerine ürün linki fotoğraflı önizleme olarak görünür ve fotoğrafın doğrudan linki de mesajda yer alır.
- Sepetteki fiyatlar sunucuda veritabanından yeniden hesaplanır; müşteri tarayıcıda fiyatı değiştirse bile talep kaydına gerçek fiyat yazılır.

---

## Proje yapısı

```
app/
  (shop)/            → Müşteri sayfaları: ana sayfa, /urunler, /urun/[slug]
  admin/login        → Giriş
  admin/(panel)/     → Panel: genel bakış, urunler, kategoriler, talepler, ayarlar
  api/               → Tüm backend uç noktaları
components/shop      → Sepet, ürün kartı, galeri, WhatsApp kutusu…
components/admin     → Panel arayüzü, fotoğraf yükleyici, ürün formu
lib/
  db.js              → Neon bağlantı havuzu
  queries.js         → Tüm veritabanı sorguları (sayfalar ve API aynı fonksiyonları kullanır)
  validation.js      → Form/API doğrulama kuralları
  whatsapp.js        → WhatsApp mesajının oluşturulması
db/schema.sql        → Veritabanı şeması
scripts/             → db:setup ve db:seed
```

## API

Tüm cevaplar aynı biçimdedir: başarılı `{ ok: true, data }`, hatalı `{ ok: false, error, fields? }`.

| Yöntem | Adres | Açıklama |
|---|---|---|
| GET | `/api/products?q=&category=&sort=&min=&max=&page=&featured=1` | Ürün listesi |
| GET | `/api/products/:slug` | Ürün detayı + benzerleri |
| GET | `/api/products/lookup?ids=1,2` | Sepet için güncel ürün bilgisi |
| POST | `/api/products/:slug/view` | Görüntülenme sayacı |
| GET | `/api/categories` · `/api/settings` | Kategoriler · mağaza ayarları |
| POST | `/api/inquiries` | WhatsApp talebi kaydı |
| GET | `/api/images/:id` | Görsel |
| POST | `/api/auth/login` · `/api/auth/logout` · GET `/api/auth/me` | Oturum |
| GET/POST | `/api/admin/products` | Ürün listele / ekle |
| GET/PUT/PATCH/DELETE | `/api/admin/products/:id` | Ürün oku / güncelle / hızlı güncelle / sil |
| POST | `/api/admin/products/:id/duplicate` · `/api/admin/products/bulk` | Kopyala · toplu işlem |
| GET/POST, PUT/DELETE | `/api/admin/categories`, `/api/admin/categories/:id` | Kategoriler |
| GET, PATCH/DELETE | `/api/admin/inquiries`, `/api/admin/inquiries/:id` | Talepler |
| GET/PUT | `/api/admin/settings` | Ayarlar |
| GET | `/api/admin/stats` | Panel istatistikleri |
| POST | `/api/admin/upload` | Fotoğraf yükleme |
| PUT | `/api/admin/password` | Şifre değiştirme |
