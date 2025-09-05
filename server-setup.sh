#!/bin/bash

# ConstructPro Coolify Deployment - Server Setup Script
# Ubuntu 22.04 LTS Server Preparation and System Updates

set -e  # Exit on any error

echo "=== ConstructPro Server Setup Started ==="
echo "Date: $(date)"
echo "System: $(lsb_release -d)"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root or with sudo"
   exit 1
fi

log_info "Starting Ubuntu 22.04 LTS system updates..."

# Update package lists
log_info "Updating package lists..."
apt update

# Upgrade all packages
log_info "Upgrading system packages..."
apt upgrade -y

# Install essential packages
log_info "Installing essential packages..."
apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    htop \
    nano \
    vim \
    net-tools \
    ufw \
    fail2ban \
    openssh-server \
    build-essential

# Install additional security and monitoring tools
log_info "Installing security and monitoring tools..."
apt install -y \
    ufw \
    fail2ban \
    logwatch \
    rkhunter \
    chkrootkit \
    aide

# Configure UFW (Uncomplicated Firewall)
log_info "Configuring UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (port 22)
ufw allow 22/tcp comment 'SSH'

# Allow HTTP and HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Allow Coolify dashboard (port 8000)
ufw allow 8000/tcp comment 'Coolify Dashboard'

# Enable UFW
ufw --force enable

log_info "UFW firewall configured and enabled"

# Configure SSH security
log_info "Configuring SSH security settings..."
SSH_CONFIG="/etc/ssh/sshd_config"

# Backup original SSH config
cp $SSH_CONFIG ${SSH_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)

# Configure SSH security settings
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' $SSH_CONFIG
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' $SSH_CONFIG
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' $SSH_CONFIG
sed -i 's/#AuthorizedKeysFile/AuthorizedKeysFile/' $SSH_CONFIG
sed -i 's/#MaxAuthTries 6/MaxAuthTries 3/' $SSH_CONFIG
sed -i 's/#ClientAliveInterval 0/ClientAliveInterval 300/' $SSH_CONFIG
sed -i 's/#ClientAliveCountMax 3/ClientAliveCountMax 2/' $SSH_CONFIG

# Add security settings if not present
grep -q "Protocol 2" $SSH_CONFIG || echo "Protocol 2" >> $SSH_CONFIG
grep -q "X11Forwarding no" $SSH_CONFIG || echo "X11Forwarding no" >> $SSH_CONFIG
grep -q "UseDNS no" $SSH_CONFIG || echo "UseDNS no" >> $SSH_CONFIG

# Restart SSH service
systemctl restart sshd
systemctl enable sshd

log_info "SSH security configured and service restarted"

# Configure Fail2Ban
log_info "Configuring Fail2Ban..."
FAIL2BAN_CONFIG="/etc/fail2ban/jail.local"

cat > $FAIL2BAN_CONFIG << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

systemctl restart fail2ban
systemctl enable fail2ban

log_info "Fail2Ban configured and enabled"

# Set up automatic security updates
log_info "Configuring automatic security updates..."
apt install -y unattended-upgrades

cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}";
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}ESMApps:\${distro_codename}-apps-security";
    "\${distro_id}ESM:\${distro_codename}-infra-security";
};

Unattended-Upgrade::Package-Blacklist {
};

Unattended-Upgrade::DevRelease "false";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

cat > /etc/apt/apt.conf.d/20auto-upgrades << EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

systemctl restart unattended-upgrades
systemctl enable unattended-upgrades

log_info "Automatic security updates configured"

# Configure system limits
log_info "Configuring system limits..."
cat >> /etc/security/limits.conf << EOF

# ConstructPro Coolify deployment limits
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF

# Configure sysctl for better performance
log_info "Configuring kernel parameters..."
cat > /etc/sysctl.d/99-constructpro.conf << EOF
# ConstructPro Coolify deployment optimizations
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 60
net.ipv4.tcp_keepalive_probes = 10
vm.swappiness = 10
fs.file-max = 2097152
EOF

sysctl -p /etc/sysctl.d/99-constructpro.conf

# Clean up package cache
log_info "Cleaning up package cache..."
apt autoremove -y
apt autoclean

# Create deployment user (if not exists)
DEPLOY_USER="constructpro"
if ! id "$DEPLOY_USER" &>/dev/null; then
    log_info "Creating deployment user: $DEPLOY_USER"
    useradd -m -s /bin/bash $DEPLOY_USER
    usermod -aG sudo $DEPLOY_USER
    
    # Create .ssh directory for the user
    mkdir -p /home/$DEPLOY_USER/.ssh
    chmod 700 /home/$DEPLOY_USER/.ssh
    chown $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
    
    log_info "Deployment user created: $DEPLOY_USER"
else
    log_info "Deployment user already exists: $DEPLOY_USER"
fi

# System information summary
log_info "=== System Setup Summary ==="
echo "Hostname: $(hostname)"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "Memory: $(free -h | grep '^Mem:' | awk '{print $2}')"
echo "Disk Space: $(df -h / | tail -1 | awk '{print $4}' | sed 's/G/ GB/')"
echo "CPU Cores: $(nproc)"
echo

# Service status check
log_info "=== Service Status Check ==="
systemctl is-active --quiet sshd && echo "✓ SSH service is running" || echo "✗ SSH service is not running"
systemctl is-active --quiet ufw && echo "✓ UFW firewall is running" || echo "✗ UFW firewall is not running"
systemctl is-active --quiet fail2ban && echo "✓ Fail2Ban is running" || echo "✗ Fail2Ban is not running"
systemctl is-active --quiet unattended-upgrades && echo "✓ Unattended upgrades is running" || echo "✗ Unattended upgrades is not running"

# Network connectivity test
log_info "=== Network Connectivity Test ==="
if ping -c 1 google.com &> /dev/null; then
    echo "✓ Internet connectivity is working"
else
    echo "✗ Internet connectivity issue detected"
fi

# Security check
log_info "=== Security Configuration Check ==="
ufw status | grep -q "Status: active" && echo "✓ UFW firewall is active" || echo "✗ UFW firewall is not active"
fail2ban-client status | grep -q "Number of jail:" && echo "✓ Fail2Ban is protecting SSH" || echo "✗ Fail2Ban is not configured"

log_info "=== ConstructPro Server Setup Completed Successfully ==="
log_info "Next steps:"
log_info "1. Verify SSH connectivity from your local machine"
log_info "2. Proceed with Docker installation"
log_info "3. Install Coolify platform"

echo
log_warn "IMPORTANT: Please test SSH connectivity before proceeding!"
log_warn "If you lose connection, use the server console to troubleshoot."

exit 0