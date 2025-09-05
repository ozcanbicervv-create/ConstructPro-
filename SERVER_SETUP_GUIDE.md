# ConstructPro Server Setup Guide

## Overview

This guide covers the first task of the Coolify deployment setup: **Server hazırlığı ve sistem güncellemeleri** (Server preparation and system updates).

## Prerequisites

- Ubuntu 22.04 LTS server with root or sudo access
- Stable internet connection
- At least 2GB RAM and 20GB free disk space

## What the Setup Script Does

The `server-setup.sh` script performs the following operations:

### 1. System Updates
- Updates package lists (`apt update`)
- Upgrades all installed packages (`apt upgrade -y`)
- Installs essential packages and tools

### 2. Essential Package Installation
- **Development tools**: curl, wget, git, unzip, build-essential
- **System utilities**: htop, nano, vim, net-tools
- **Security tools**: ufw, fail2ban, openssh-server
- **Monitoring tools**: logwatch, rkhunter, chkrootkit, aide

### 3. Security Configuration

#### Firewall (UFW) Setup
- Resets and configures UFW with secure defaults
- **Allowed ports**:
  - Port 22 (SSH)
  - Port 80 (HTTP)
  - Port 443 (HTTPS)
  - Port 8000 (Coolify Dashboard)
- Enables firewall protection

#### SSH Security Hardening
- Disables root login
- Configures key-based authentication
- Sets connection limits and timeouts
- Enables protocol security features

#### Fail2Ban Configuration
- Protects against brute force attacks
- Monitors SSH login attempts
- Automatically bans suspicious IPs

### 4. System Optimization
- Configures automatic security updates
- Sets system limits for better performance
- Optimizes kernel parameters for web applications
- Creates deployment user account

## Usage Instructions

### Step 1: Upload and Execute Script

1. **Copy the script to your Ubuntu server**:
   ```bash
   # Option 1: Using SCP (from your local machine)
   scp server-setup.sh user@your-server-ip:/tmp/
   
   # Option 2: Create directly on server
   nano server-setup.sh
   # Copy and paste the script content
   ```

2. **Make the script executable**:
   ```bash
   chmod +x server-setup.sh
   ```

3. **Run the script with sudo**:
   ```bash
   sudo ./server-setup.sh
   ```

### Step 2: Monitor Execution

The script provides colored output:
- 🟢 **GREEN [INFO]**: Normal operations
- 🟡 **YELLOW [WARN]**: Warnings and important notes
- 🔴 **RED [ERROR]**: Errors that need attention

### Step 3: Verify Installation

After completion, the script will show:
- System information summary
- Service status checks
- Network connectivity test
- Security configuration verification

## Expected Output

```
=== ConstructPro Server Setup Started ===
Date: [Current Date]
System: Ubuntu 22.04.x LTS

[INFO] Starting Ubuntu 22.04 LTS system updates...
[INFO] Updating package lists...
[INFO] Upgrading system packages...
[INFO] Installing essential packages...
[INFO] Installing security and monitoring tools...
[INFO] Configuring UFW firewall...
[INFO] UFW firewall configured and enabled
[INFO] Configuring SSH security settings...
[INFO] SSH security configured and service restarted
[INFO] Configuring Fail2Ban...
[INFO] Fail2Ban configured and enabled
[INFO] Configuring automatic security updates...
[INFO] Automatic security updates configured
[INFO] Configuring system limits...
[INFO] Configuring kernel parameters...
[INFO] Cleaning up package cache...
[INFO] Creating deployment user: constructpro

=== System Setup Summary ===
Hostname: [your-hostname]
OS: Ubuntu 22.04.x LTS
Kernel: [kernel-version]
Memory: [available-memory]
Disk Space: [available-space]
CPU Cores: [core-count]

=== Service Status Check ===
✓ SSH service is running
✓ UFW firewall is running
✓ Fail2Ban is running
✓ Unattended upgrades is running

=== Network Connectivity Test ===
✓ Internet connectivity is working

=== Security Configuration Check ===
✓ UFW firewall is active
✓ Fail2Ban is protecting SSH

=== ConstructPro Server Setup Completed Successfully ===
[INFO] Next steps:
[INFO] 1. Verify SSH connectivity from your local machine
[INFO] 2. Proceed with Docker installation
[INFO] 3. Install Coolify platform

[WARN] IMPORTANT: Please test SSH connectivity before proceeding!
[WARN] If you lose connection, use the server console to troubleshoot.
```

## Post-Setup Verification

### 1. Test SSH Connection
```bash
# From your local machine
ssh your-username@your-server-ip
```

### 2. Check Firewall Status
```bash
sudo ufw status verbose
```

### 3. Verify Services
```bash
sudo systemctl status sshd
sudo systemctl status fail2ban
sudo systemctl status unattended-upgrades
```

### 4. Check System Resources
```bash
htop
df -h
free -h
```

## Troubleshooting

### SSH Connection Issues
If you lose SSH access after running the script:

1. **Use server console** (if available) to check SSH service:
   ```bash
   sudo systemctl status sshd
   sudo systemctl restart sshd
   ```

2. **Check firewall rules**:
   ```bash
   sudo ufw status
   sudo ufw allow 22/tcp
   ```

3. **Review SSH configuration**:
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Check for any syntax errors
   sudo sshd -t  # Test configuration
   ```

### Service Failures
If any service fails to start:

1. **Check service logs**:
   ```bash
   sudo journalctl -u service-name -f
   ```

2. **Restart the service**:
   ```bash
   sudo systemctl restart service-name
   ```

### Firewall Issues
If you're locked out by firewall:

1. **Disable UFW temporarily** (via console):
   ```bash
   sudo ufw disable
   ```

2. **Reconfigure and re-enable**:
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

## Security Notes

- The script creates a deployment user `constructpro` with sudo privileges
- Root login via SSH is disabled for security
- Automatic security updates are enabled
- Fail2Ban protects against brute force attacks
- System limits are optimized for Docker workloads

## Next Steps

After successful completion of this task:

1. ✅ **Task 1 Complete**: Server preparation and system updates
2. ➡️ **Next Task**: SSH connection troubleshooting (Task 2.1)
3. ➡️ **Following Tasks**: Docker installation and Coolify setup

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 1.1**: ✅ System successfully installs Docker prerequisites and security tools
- **Requirement 1.4**: ✅ System security settings are configured with firewall, SSH hardening, and monitoring tools

The server is now prepared for the next phase of the Coolify deployment setup.