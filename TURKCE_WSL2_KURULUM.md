# Yerel Coolify Testi için WSL2 Kurulumu

## WSL2 ile Ubuntu Kurulumu

### Adım 1: WSL2'yi Etkinleştir
```powershell
# Yönetici olarak çalıştır
wsl --install
# Bilgisayarınızı yeniden başlatın
```

### Adım 2: Ubuntu 22.04 Kur
```powershell
wsl --install -d Ubuntu-22.04
```

### Adım 3: Ubuntu kullanıcısı oluştur
- İstendiğinde kullanıcı adı ve şifre oluşturun
- Sistemi güncelleyin: `sudo apt update && sudo apt upgrade -y`

### Adım 4: Setup scriptlerini transfer et ve çalıştır
```bash
# WSL2 Ubuntu içinde
cd ~
# Scriptleri Windows'tan WSL2'ye kopyala
cp /mnt/c/Users/mrbcr/OneDrive/Desktop/ConstructPro/server-setup.sh .
cp /mnt/c/Users/mrbcr/OneDrive/Desktop/ConstructPro/verify-setup.sh .

# Çalıştırılabilir yap ve çalıştır
chmod +x server-setup.sh verify-setup.sh
sudo ./server-setup.sh
./verify-setup.sh
```

## Windows'tan Erişim
- WSL2 IP: `wsl hostname -I`
- Coolify'a erişim: `http://localhost:8000` (tam kurulum sonrası)

## Not
WSL2 geliştirme/test için harika ama prodüksiyon deployment için önerilmez.

## Avantajlar
- ✅ Ücretsiz
- ✅ Hızlı kurulum
- ✅ Windows ile entegre
- ✅ Test için ideal

## Dezavantajlar
- ❌ Prodüksiyon için uygun değil
- ❌ Performans sınırlamaları
- ❌ Ağ yapılandırması karmaşık olabilir