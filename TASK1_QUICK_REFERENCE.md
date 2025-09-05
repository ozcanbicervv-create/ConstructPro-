# Task 1 Quick Reference - Server Setup

## 🚀 Quick Start Commands

```bash
# 1. Make script executable
chmod +x server-setup.sh

# 2. Run server setup
sudo ./server-setup.sh

# 3. Verify installation
chmod +x verify-setup.sh
./verify-setup.sh
```

## 📋 What Gets Installed

### Essential Packages
- `curl`, `wget`, `git`, `unzip` - Download tools
- `htop`, `nano`, `vim` - System utilities
- `net-tools` - Network diagnostics
- `build-essential` - Development tools

### Security Tools
- `ufw` - Uncomplicated Firewall
- `fail2ban` - Intrusion prevention
- `openssh-server` - SSH daemon
- `unattended-upgrades` - Automatic security updates

### Monitoring Tools
- `logwatch` - Log analysis
- `rkhunter` - Rootkit detection
- `chkrootkit` - Security scanning
- `aide` - File integrity monitoring

## 🔒 Security Configuration

### Firewall Rules (UFW)
```
Port 22   (SSH)             - ALLOW
Port 80   (HTTP)            - ALLOW  
Port 443  (HTTPS)           - ALLOW
Port 8000 (Coolify)         - ALLOW
All other ports             - DENY
```

### SSH Hardening
- ❌ Root login disabled
- ✅ Key-based authentication enabled
- ✅ Connection limits set (3 max attempts)
- ✅ Idle timeout configured (5 minutes)

### Fail2Ban Protection
- 🛡️ SSH brute force protection
- ⏱️ 1-hour ban duration
- 🔢 3 failed attempts trigger ban

## 👤 User Accounts

### Deployment User
- **Username**: `constructpro`
- **Privileges**: sudo access
- **SSH**: Key-based authentication ready
- **Home**: `/home/constructpro`

## 🔧 System Optimizations

### Performance Tuning
- File descriptor limits: 65,536
- Process limits: 32,768
- Network connection optimizations
- Memory swappiness: 10

### Automatic Updates
- ✅ Security updates: Automatic
- ✅ Package cleanup: Weekly
- ❌ Automatic reboot: Disabled

## 📊 Verification Checklist

Run `./verify-setup.sh` to check:

- [ ] System packages updated
- [ ] Essential packages installed
- [ ] UFW firewall active with correct rules
- [ ] SSH service running and secured
- [ ] Fail2Ban protecting SSH
- [ ] Automatic updates configured
- [ ] System limits optimized
- [ ] Deployment user created
- [ ] Internet connectivity working
- [ ] Adequate system resources

## 🚨 Troubleshooting

### SSH Connection Lost
```bash
# Via server console:
sudo systemctl restart sshd
sudo ufw allow 22/tcp
sudo ufw reload
```

### Service Not Starting
```bash
# Check service status
sudo systemctl status service-name

# View logs
sudo journalctl -u service-name -f

# Restart service
sudo systemctl restart service-name
```

### Firewall Issues
```bash
# Check current rules
sudo ufw status verbose

# Reset if needed
sudo ufw --force reset
sudo ufw allow 22/tcp
sudo ufw enable
```

## ✅ Success Indicators

After running the setup script, you should see:
- ✅ All services running (SSH, UFW, Fail2Ban)
- ✅ Internet connectivity working
- ✅ Firewall active with correct rules
- ✅ No critical security warnings

## ➡️ Next Steps

1. **Verify SSH access** from your local machine
2. **Run verification script** to confirm setup
3. **Proceed to Task 2.1**: SSH connection troubleshooting
4. **Continue with Docker installation** (Task 3.1)

## 📞 Emergency Access

If you lose SSH access:
1. Use server console/KVM access
2. Check SSH service: `sudo systemctl status sshd`
3. Verify firewall: `sudo ufw status`
4. Review SSH config: `sudo nano /etc/ssh/sshd_config`
5. Test config: `sudo sshd -t`

---

**⚠️ Important**: Always test SSH connectivity after running the setup script before proceeding to the next task!