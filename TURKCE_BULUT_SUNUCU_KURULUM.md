# Coolify Deployment için Bulut Sunucu Kurulumu

## Hızlı Bulut Sunucu Seçenekleri

### DigitalOcean (Yeni başlayanlar için önerilen)
1. **Droplet Oluştur**:
   - İşletim Sistemi: Ubuntu 22.04 LTS
   - Boyut: Basic (aylık $6 minimum, $12 önerilen)
   - Bölge: Size en yakın olanı seçin
   - Kimlik doğrulama: SSH anahtarları (önerilen) veya şifre

2. **SSH ile bağlan**:
   ```powershell
   ssh root@sunucu-ip-adresiniz
   ```

### AWS EC2
1. **Instance Başlat**:
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Tipi: t3.micro (ücretsiz katman) veya t3.small
   - Güvenlik Grubu: SSH (22), HTTP (80), HTTPS (443), Özel (8000) portlarına izin ver

2. **SSH ile bağlan**:
   ```powershell
   ssh -i anahtariniz.pem ubuntu@instance-ip-adresiniz
   ```

### Vultr
1. **Sunucu Deploy Et**:
   - İS: Ubuntu 22.04 x64
   - Plan: Regular Performance (aylık $6 minimum)
   - Konum: Size en yakın olanı seçin

2. **SSH ile bağlan**:
   ```powershell
   ssh root@sunucu-ip-adresiniz
   ```

## Sunucu Oluşturduktan Sonra

1. **Setup scriptlerini transfer et**:
   ```powershell
   scp server-setup.sh root@sunucu-ip-adresiniz:/root/
   scp verify-setup.sh root@sunucu-ip-adresiniz:/root/
   ```

2. **Sunucuya SSH ile bağlan ve kurulumu çalıştır**:
   ```bash
   ssh root@sunucu-ip-adresiniz
   chmod +x server-setup.sh verify-setup.sh
   ./server-setup.sh
   ./verify-setup.sh
   ```

## Güvenlik Notu
Daha iyi güvenlik için her zaman şifre yerine SSH anahtarları kullanın!

## Maliyet Tahmini
- **DigitalOcean**: Aylık $6-12
- **AWS**: Aylık $5-15 (ücretsiz katman ile ilk yıl daha ucuz)
- **Vultr**: Aylık $6-12