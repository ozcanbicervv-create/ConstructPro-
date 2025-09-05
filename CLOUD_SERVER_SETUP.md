# Cloud Server Setup for Coolify Deployment

## Quick Cloud Server Options

### DigitalOcean (Recommended for beginners)
1. **Create Droplet**:
   - OS: Ubuntu 22.04 LTS
   - Size: Basic ($6/month minimum, $12/month recommended)
   - Region: Choose closest to you
   - Authentication: SSH keys (recommended) or password

2. **Access via SSH**:
   ```powershell
   ssh root@your-droplet-ip
   ```

### AWS EC2
1. **Launch Instance**:
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: t3.micro (free tier) or t3.small
   - Security Group: Allow SSH (22), HTTP (80), HTTPS (443), Custom (8000)

2. **Access via SSH**:
   ```powershell
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

### Vultr
1. **Deploy Server**:
   - OS: Ubuntu 22.04 x64
   - Plan: Regular Performance ($6/month minimum)
   - Location: Choose closest

2. **Access via SSH**:
   ```powershell
   ssh root@your-server-ip
   ```

## After Server Creation

1. **Transfer setup scripts**:
   ```powershell
   scp server-setup.sh root@your-server-ip:/root/
   scp verify-setup.sh root@your-server-ip:/root/
   ```

2. **SSH into server and run setup**:
   ```bash
   ssh root@your-server-ip
   chmod +x server-setup.sh verify-setup.sh
   ./server-setup.sh
   ./verify-setup.sh
   ```

## Security Note
Always use SSH keys instead of passwords for better security!