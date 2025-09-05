# ConstructPro Coolify Deployment - Adım Adım Bulut Sunucu Rehberi

## 🎯 Hedef
ConstructPro projenizi gerçek bir bulut sunucusunda Coolify ile deploy etmek

## 📋 İhtiyaçlarımız
- Bulut sunucu sağlayıcısı hesabı
- SSH bağlantısı için terminal
- Kredi kartı (aylık $6-15 maliyet)

---

## ADIM 1: Bulut Sunucu Sağlayıcısı Seçimi ve Hesap Oluşturma

### En İyi Seçenekler (Kolay → Zor sırasında):

#### 🥇 DigitalOcean (EN ÖNERİLEN - Yeni başlayanlar için)
**Neden DigitalOcean?**
- ✅ En basit arayüz
- ✅ Türkçe destek
- ✅ Sabit fiyatlandırma
- ✅ 1-click Ubuntu kurulumu
- ✅ $200 ücretsiz kredi (yeni kullanıcılar için)

**Hesap Oluşturma:**
1. https://www.digitalocean.com adresine git
2. "Sign Up" butonuna tıkla
3. Email ve şifre ile kayıt ol
4. Email doğrulaması yap
5. Kredi kartı bilgilerini ekle (ilk ay ücretsiz kredi var)

#### 🥈 Vultr (İkinci seçenek)
- Biraz daha ucuz olabilir
- Daha fazla lokasyon seçeneği
- Arayüz biraz daha karmaşık

#### 🥉 AWS EC2 (İleri seviye)
- En güçlü ama en karmaşık
- Ücretsiz katman var ama sınırlı
- Faturalama karmaşık olabilir

### 🎯 Önerim: DigitalOcean ile devam edelim

---

## ADIM 2: DigitalOcean'da Ubuntu Sunucu Oluşturma

### 2.1 Droplet Oluşturma
1. **DigitalOcean'a giriş yap**
2. **"Create" → "Droplets" tıkla**
3. **Ayarları şöyle yap:**

#### İşletim Sistemi Seçimi:
```
Choose an image: Ubuntu
Version: 22.04 (LTS) x64
```

#### Sunucu Boyutu:
```
Choose Size: Basic
CPU options: Regular Intel
$6/mo - 1 GB / 1 CPU / 25 GB SSD / 1000 GB transfer
```
**Not:** İlk başta $6'lık yeterli, sonra büyütebiliriz.

#### Veri Merkezi Bölgesi:
```
Choose a datacenter region: 
- Frankfurt (Avrupa için en yakın)
- Amsterdam (alternatif)
```

#### Kimlik Doğrulama:
```
Authentication Method: Password (şimdilik kolay olsun)
Root password: Güçlü bir şifre oluştur (kaydet!)
```

#### Hostname:
```
Choose a hostname: constructpro-server
```

### 2.2 Droplet'i Oluştur
- **"Create Droplet" butonuna tıkla**
- **2-3 dakika bekle** (sunucu hazırlanıyor)
- **IP adresini not al** (örnek: 164.90.123.45)

---

## ADIM 3: Windows'tan Sunucuya Bağlanma

### 3.1 PowerShell'i Aç
```powershell
# Windows tuşu + R → "powershell" yaz → Enter
```

### 3.2 SSH ile Bağlan
```powershell
ssh root@SUNUCU-IP-ADRESİNİZ
```
**Örnek:**
```powershell
ssh root@164.90.123.45
```

### 3.3 İlk Bağlantı
- **"Are you sure you want to continue connecting?"** → `yes` yaz
- **Şifreyi gir** (yazdığın görünmez, normal)
- **Başarılı bağlantı:** `root@constructpro-server:~#` görmelisin

---

## ADIM 4: Sunucuya Setup Scriptlerini Yükleme

### 4.1 Yeni Terminal Penceresi Aç (Windows'ta)
SSH bağlantısını açık bırak, yeni PowerShell penceresi aç.

### 4.2 Scriptleri Sunucuya Gönder
```powershell
# ConstructPro klasörüne git
cd "C:\Users\mrbcr\OneDrive\Desktop\ConstructPro"

# Scriptleri sunucuya gönder (IP adresini değiştir!)
scp server-setup.sh root@164.90.123.45:/root/
scp verify-setup.sh root@164.90.123.45:/root/
```

**Şifre isteyecek** - aynı root şifresini gir.

---

## ADIM 5: Sunucu Kurulumunu Çalıştırma

### 5.1 SSH Penceresine Dön
İlk açtığın SSH bağlantısına geri dön.

### 5.2 Scriptleri Çalıştırılabilir Yap
```bash
chmod +x server-setup.sh
chmod +x verify-setup.sh
```

### 5.3 Ana Kurulumu Başlat
```bash
./server-setup.sh
```

**Bu işlem 5-10 dakika sürer. Şunları göreceksin:**
- Yeşil [INFO] mesajları
- Paket güncellemeleri
- Güvenlik yapılandırmaları
- Sistem optimizasyonları

### 5.4 Kurulumu Doğrula
```bash
./verify-setup.sh
```

**Başarılı olursa:**
- ✅ Tüm kontroller PASS olacak
- "All checks passed!" mesajı göreceksin

---

## ADIM 6: Sonuç ve Doğrulama

### 6.1 Başarı Göstergeleri
```bash
# Bu komutlar çalışmalı:
ufw status          # Firewall aktif olmalı
systemctl status sshd    # SSH çalışıyor olmalı
fail2ban-client status   # Fail2ban aktif olmalı
```

### 6.2 Sunucu Bilgileri
```bash
# Sunucu bilgilerini gör:
htop                # Sistem kaynaklarını göster (q ile çık)
df -h               # Disk alanını göster
free -h             # RAM kullanımını göster
```

---

## ADIM 7: Güvenlik Testi

### 7.1 SSH Bağlantısını Test Et
```powershell
# Yeni PowerShell penceresinde:
ssh root@SUNUCU-IP-ADRESİNİZ
```
Sorunsuz bağlanabilmelisin.

### 7.2 Firewall Testi
```bash
# Sunucuda:
curl -I http://google.com    # İnternet bağlantısı test
```

---

## 🎉 ADIM 1 TAMAMLANDI!

### ✅ Şu ana kadar yaptıklarımız:
- DigitalOcean bulut sunucusu oluşturduk
- Ubuntu 22.04 LTS kuruldu
- Sistem güvenliği yapılandırıldı
- Firewall, SSH, Fail2ban aktif
- Sistem güncellemeleri tamamlandı

### ➡️ Sıradaki Adımlar:
1. **Görev 2**: SSH bağlantı sorunlarını giderme
2. **Görev 3**: Docker kurulumu
3. **Görev 4**: Coolify kurulumu
4. **Görev 5**: ConstructPro deployment

---

## 🆘 Sorun Giderme

### SSH Bağlanamıyorum
```powershell
# IP adresini kontrol et:
ping SUNUCU-IP-ADRESİNİZ

# Farklı port dene:
ssh -p 22 root@SUNUCU-IP-ADRESİNİZ
```

### Script Çalışmıyor
```bash
# Dosya var mı kontrol et:
ls -la server-setup.sh

# İzinleri kontrol et:
chmod +x server-setup.sh

# Manuel çalıştır:
bash server-setup.sh
```

### Sunucu Yavaş
- DigitalOcean panelinden sunucu boyutunu artırabilirsin
- $12/ay plan daha hızlı olacaktır

---

## 💰 Maliyet Takibi
- **İlk ay**: Ücretsiz kredi ile $0
- **Sonraki aylar**: $6/ay (temel plan)
- **Upgrade gerekirse**: $12/ay (önerilen)

**Sunucuyu durdurmak istersen:** DigitalOcean panelinden "Destroy" yapabilirsin.

---

Bu adımları tamamladıktan sonra bana haber ver, Görev 2'ye geçelim!