# ConstructPro Coolify Deployment - Durum Kontrol Rehberi

## 🎯 Amaç
Şu ana kadar yaptığımız tüm adımları sırayla kontrol etmek ve hangi aşamada olduğumuzu belirlemek.

---

## ✅ ADIM 1: Temel Sistem Kontrolü

### 1.1 Bulut Sunucu Durumu Kontrolü
```powershell
# Windows PowerShell'de:
ssh root@SUNUCU-IP-ADRESİNİZ
```

**Beklenen Sonuç:** Sunucuya sorunsuz bağlanabilmelisin.

**Eğer bağlanamıyorsan:**
- DigitalOcean panelinden sunucunun çalışır durumda olduğunu kontrol et
- IP adresini doğru yazdığından emin ol
- Şifreyi doğru girdiğinden emin ol

### 1.2 Sistem Bilgileri Kontrolü
```bash
# Sunucuda çalıştır:
whoami                    # root olmalı
hostname                  # constructpro-server olmalı
cat /etc/os-release       # Ubuntu 22.04 olmalı
uptime                    # Sunucu ne kadar süredir açık
```

### 1.3 Temel Servisler Kontrolü
```bash
# Bu komutları sırayla çalıştır:
systemctl status ssh      # SSH servisi aktif olmalı
ufw status               # Firewall aktif olmalı
fail2ban-client status   # Fail2ban çalışıyor olmalı
```

**✅ ADIM 1 BAŞARILI:** Tüm komutlar çalışıyor ve servisler aktifse geç.

---

## ✅ ADIM 2: Docker Kurulum Kontrolü

### 2.1 Docker Kurulu mu?
```bash
docker --version         # Docker version göstermeli
docker-compose --version # Docker Compose version göstermeli
```

**Eğer Docker kurulu değilse:**
```bash
# Docker kurulumu:
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl start docker
systemctl enable docker
```

### 2.2 Docker Test
```bash
docker run hello-world   # "Hello from Docker!" mesajı görmeli
docker ps -a             # Çalışan container'ları göster
```

**✅ ADIM 2 BAŞARILI:** Docker çalışıyor ve test başarılıysa geç.

---

## ✅ ADIM 3: Coolify Kurulum Kontrolü

### 3.1 Coolify Kurulu mu?
```bash
# Coolify container'larını kontrol et:
docker ps | grep coolify
```

**Eğer Coolify kurulu değilse:**
```bash
# Coolify kurulumu:
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### 3.2 Coolify Erişim Testi
```bash
# Coolify portunu kontrol et:
netstat -tlnp | grep :8000
```

**Web tarayıcısında test:**
```
http://SUNUCU-IP-ADRESİNİZ:8000
```

**✅ ADIM 3 BAŞARILI:** Coolify dashboard'una erişebiliyorsan geç.

---

## ✅ ADIM 4: ConstructPro Proje Durumu

### 4.1 Yerel Proje Kontrolü
```powershell
# Windows'ta ConstructPro klasöründe:
cd "C:\Users\mrbcr\OneDrive\Desktop\ConstructPro"
dir                      # Dosyaları listele
```

**Olması gerekenler:**
- `package.json`
- `next.config.ts`
- `src/` klasörü
- `prisma/` klasörü

### 4.2 GitHub Repository Durumu
**Tarayıcıda kontrol et:**
```
https://github.com/ozcanbicerov/ConstructPro
```

**Kontrol edilecekler:**
- Repository mevcut mu?
- Son commit ne zaman?
- Tüm dosyalar yüklenmiş mi?

**✅ ADIM 4 BAŞARILI:** Proje dosyaları tamam ve GitHub'da güncel.

---

## ✅ ADIM 5: Network ve Port Kontrolü

### 5.1 Firewall Port Kontrolü
```bash
# Sunucuda:
ufw status numbered      # Açık portları göster
```

**Açık olması gereken portlar:**
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)
- 8000 (Coolify)

### 5.2 Port Erişilebilirlik Testi
```powershell
# Windows'ta:
telnet SUNUCU-IP-ADRESİNİZ 8000
```

**✅ ADIM 5 BAŞARILI:** Gerekli portlar açık ve erişilebilir.

---

## 🔍 MEVCUT DURUM DEĞERLENDİRMESİ

### Senaryo A: Her şey tamam
**Eğer tüm adımlar başarılı:**
➡️ **Sıradaki:** GitHub-Coolify entegrasyonu

### Senaryo B: Docker eksik
**Eğer Docker kurulu değil:**
➡️ **Yapılacak:** Docker kurulumu

### Senaryo C: Coolify eksik
**Eğer Coolify kurulu değil:**
➡️ **Yapılacak:** Coolify kurulumu

### Senaryo D: Sunucu problemi
**Eğer sunucuya bağlanamıyorsan:**
➡️ **Yapılacak:** SSH ve network troubleshooting

---

## 🚀 SONRAKİ ADIMLAR

### Durum 1: Her şey hazır
1. Coolify dashboard'una giriş yap
2. GitHub repository'yi bağla
3. ConstructPro'yu deploy et

### Durum 2: Eksikler var
1. Eksik olan bileşenleri kur
2. Testleri tekrar çalıştır
3. Hazır olunca deployment'a geç

---

## 📞 YARDIM GEREKİRSE

**Her adımda takılırsan:**
1. Hata mesajını tam olarak kopyala
2. Hangi komutta hata aldığını belirt
3. Ekran görüntüsü al (gerekirse)

**Bana şunu söyle:**
- Hangi adımda takıldın?
- Ne gibi bir hata aldın?
- Komut çıktısı neydi?

---

Bu kontrol listesini sırayla takip et ve her adımın sonucunu bana bildir!