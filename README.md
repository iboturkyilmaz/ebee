# 🐝 eBee - Akıllı Gelir & Gider Takip Sistemi

eBee, kişisel veya kurumsal finansal işlemlerinizi (gelir/gider) tek bir merkezden kolayca yönetmenizi sağlayan, çoklu çalışma alanına (workspace) sahip, modern ve hızlı bir web uygulamasıdır.

![eBee Dashboard](https://via.placeholder.com/800x450?text=eBee+Dashboard)

## 🌟 Öne Çıkan Özellikler

- **Çoklu Tablo / Çalışma Alanı (Workspaces):** Hem kişisel harcamalarınızı hem de şirket bütçenizi birbirine karıştırmadan ayrı ayrı takip edin.
- **Planlanan İşlemler:** Gelecekte gerçekleşecek ödemeleri / gelirleri "Planlanan" olarak girin. Bakiyenizi bozmadan listenizde görün, vakti gelince tek tuşla (✅) hesabınıza işleyin.
- **Toplu Veri Yönetimi:** Hatalı girilen bir ayın tüm verilerini ayarlardan tek tıkla silebilirsiniz.
- **Dinamik Grafik ve Bilanço:** Chart.js destekli, giderlerinizin kategorilerine göre dağılımını ve aylık genel trendi gösteren interaktif dashboard.
- **Döküman & Fatura Ekleme:** Gelir veya giderlerinize makbuz, fiş ve döküman ekleyerek dijital bir arşiv oluşturun.
- **Anlık ve Hızlı Veri İletişimi:** Node.js ve Express.js destekli backend, SQLite ile gömülü ve kalıcı bellek yönetimi sunar.

## 🛠️ Kullanılan Teknolojiler

- **Frontend:** HTML5, Vanilla JavaScript, Vanilla CSS (Modern CSS Değişkenleri, Flexbox, CSS Grid)
- **Backend:** Node.js, Express.js
- **Veritabanı:** SQLite (better-sqlite3)
- **Veri Görselleştirme:** Chart.js

## 🚀 Kurulum ve Çalıştırma

Projeyi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

### Ön Koşullar
- Bilgisayarınızda [Node.js](https://nodejs.org/) kurulu olmalıdır.

### Adımlar

1. **Projeyi indirin ve klasöre girin:**
   ```bash
   git clone https://github.com/KULLANICI_ADINIZ/ebee.git
   cd ebee
   ```

2. **Gerekli kütüphaneleri kurun:**
   ```bash
   npm install
   ```

3. **Sunucuyu başlatın:**
   ```bash
   node server.js
   ```

4. **Kullanmaya başlayın:**
   Tarayıcınızı açın ve `http://localhost:3000` adresine gidin. Verileriniz uygulamanın kök dizininde otomatik olarak `ebee.db` adında bir dosyada güvenle oluşturulacak ve saklanacaktır.

## 🤝 Katkıda Bulunma

Bu proje tamamen açık kaynaklıdır ve geliştirmeye açıktır. Pull Request göndererek projenin büyümesine katkıda bulunabilirsiniz.

## 📜 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
