# WSL2 Setup for Local Coolify Testing

## Install WSL2 with Ubuntu

### Step 1: Enable WSL2
```powershell
# Run as Administrator
wsl --install
# Restart your computer
```

### Step 2: Install Ubuntu 22.04
```powershell
wsl --install -d Ubuntu-22.04
```

### Step 3: Set up Ubuntu user
- Create username and password when prompted
- Update system: `sudo apt update && sudo apt upgrade -y`

### Step 4: Transfer and run setup scripts
```bash
# Inside WSL2 Ubuntu
cd ~
# Copy the scripts from Windows to WSL2
cp /mnt/c/Users/mrbcr/OneDrive/Desktop/ConstructPro/server-setup.sh .
cp /mnt/c/Users/mrbcr/OneDrive/Desktop/ConstructPro/verify-setup.sh .

# Make executable and run
chmod +x server-setup.sh verify-setup.sh
sudo ./server-setup.sh
./verify-setup.sh
```

## Accessing from Windows
- WSL2 IP: `wsl hostname -I`
- Access Coolify: `http://localhost:8000` (after full setup)

## Note
WSL2 is great for development/testing but not recommended for production deployment.