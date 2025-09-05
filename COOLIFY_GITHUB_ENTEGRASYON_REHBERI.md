# Coolify - GitHub Entegrasyonu Rehberi

## 🎯 Hedef
ConstructPro projesini GitHub'dan Coolify'a bağlayıp otomatik deployment kurmak.

---

## ADIM 1: Coolify Dashboard'a Giriş

### 1.1 Tarayıcıda Coolify'ı Aç
```
http://68.183.216.65:8000
```

### 1.2 İlk Kurulum (Eğer ilk kez açıyorsan)
- **Admin kullanıcısı oluştur**
- **Email:** admin@constructpro.com (veya istediğin)
- **Şifre:** Güçlü bir şifre belirle
- **Kaydet ve giriş yap**

---

## ADIM 2: GitHub Repository Bağlantısı

### 2.1 Source Ekleme
1. **Dashboard'da "Sources" sekmesine git**
2. **"+ Add" butonuna tıkla**
3. **"GitHub" seçeneğini seç**

### 2.2 GitHub Token Oluşturma
**GitHub'da (yeni sekmede):**
1. https://github.com/settings/tokens adresine git
2. **"Generate new token" → "Generate new token (classic)"**
3. **Token ayarları:**
   - **Note:** `Coolify ConstructPro`
   - **Expiration:** `90 days` (veya istediğin)
   - **Scopes:** Şunları seç:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `admin:repo_hook` (Full control of repository hooks)
     - ✅ `read:org` (Read org and team membership)

4. **"Generate token" butonuna tıkla**
5. **Token'ı kopyala** (bir daha göremezsin!)

### 2.3 Coolify'da Token Girişi
1. **Coolify'a geri dön**
2. **GitHub Token'ı yapıştır**
3. **"Test Connection" butonuna tıkla**
4. **Başarılı olursa "Save" butonuna tıkla**

---

## ADIM 3: ConstructPro Projesi Ekleme

### 3.1 Yeni Proje Oluşturma
1. **Dashboard'da "Projects" sekmesine git**
2. **"+ New Project" butonuna tıkla**
3. **Proje bilgileri:**
   - **Name:** `ConstructPro`
   - **Description:** `Construction Project Management Platform`

### 3.2 Repository Seçimi
1. **"+ New Resource" butonuna tıkla**
2. **"Application" seçeneğini seç**
3. **Source olarak GitHub'ı seç**
4. **Repository:** `ozcanbicervv-create/ConstructPro-` seç
5. **Branch:** `main` (veya master)

---

## ADIM 4: Build Konfigürasyonu

### 4.1 Temel Ayarlar
- **Build Pack:** `nixpacks` (otomatik algılanacak)
- **Port:** `3000` (Next.js default)
- **Domain:** Coolify otomatik oluşturacak

### 4.2 Environment Variables
**Şu environment variable'ları ekle:**
```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 4.3 Build Command (Eğer gerekirse)
```bash
npm run build
```

### 4.4 Start Command (Eğer gerekirse)
```bash
npm start
```

---

## ADIM 5: İlk Deployment

### 5.1 Deploy Başlatma
1. **"Deploy" butonuna tıkla**
2. **Build loglarını izle**
3. **Hataları not al (varsa)**

### 5.2 Beklenen Süreç
- **Git clone:** Repository indirilecek
- **Dependencies:** npm install çalışacak
- **Build:** npm run build çalışacak
- **Container:** Docker image oluşturulacak
- **Start:** Uygulama başlatılacak

---

## ADIM 6: Test ve Doğrulama

### 6.1 Uygulama Erişimi
- **Coolify otomatik bir domain verecek**
- **Örnek:** `https://constructpro-xyz.68.183.216.65.sslip.io`
- **Bu domain'e tarayıcıdan eriş**

### 6.2 Başarı Kontrolleri
- ✅ Uygulama açılıyor mu?
- ✅ Ana sayfa yükleniyor mu?
- ✅ CSS/JS dosyaları yükleniyor mu?

---

## 🆘 SORUN GİDERME

### Build Hatası Alırsan:
1. **Build loglarını oku**
2. **Hata mesajını kopyala**
3. **Bana hata detaylarını gönder**

### Yaygın Hatalar:
- **Node.js version uyumsuzluğu**
- **Missing dependencies**
- **Environment variables eksik**
- **Port konfigürasyonu**

### Debug Komutları:
```bash
# Sunucuda container'ları kontrol et:
docker ps | grep constructpro

# Logları kontrol et:
docker logs CONTAINER_ID
```

---

## 📝 NOTLAR

- **İlk deployment 5-10 dakika sürebilir**
- **Build loglarını takip et**
- **Hata alırsan panik yapma, çözeriz**
- **Her adımda bana bilgi ver**

---

Şimdi bu adımları takip et ve hangi aşamada olduğunu bana bildir!