#!/bin/bash

# ConstructPro Server Setup Verification Script
# Verifies that all components from Task 1 are properly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_check() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

success_count=0
total_checks=0

check_result() {
    total_checks=$((total_checks + 1))
    if [ $1 -eq 0 ]; then
        echo -e "  ✅ ${GREEN}PASS${NC}"
        success_count=$((success_count + 1))
    else
        echo -e "  ❌ ${RED}FAIL${NC}"
    fi
}

echo "=== ConstructPro Server Setup Verification ==="
echo "Date: $(date)"
echo "System: $(lsb_release -d 2>/dev/null || echo 'Unknown')"
echo

# Check 1: System Updates
log_check "Checking system package updates..."
apt list --upgradable 2>/dev/null | grep -q "Listing..." && upgradable_count=0 || upgradable_count=$(apt list --upgradable 2>/dev/null | wc -l)
if [ $upgradable_count -le 1 ]; then
    check_result 0
else
    echo "  📦 $upgradable_count packages can be upgraded"
    check_result 1
fi

# Check 2: Essential packages installation
log_check "Checking essential packages installation..."
essential_packages=("curl" "wget" "git" "unzip" "htop" "nano" "vim" "net-tools" "ufw" "fail2ban" "openssh-server")
missing_packages=()

for package in "${essential_packages[@]}"; do
    if ! dpkg -l | grep -q "^ii  $package "; then
        missing_packages+=("$package")
    fi
done

if [ ${#missing_packages[@]} -eq 0 ]; then
    check_result 0
else
    echo "  📦 Missing packages: ${missing_packages[*]}"
    check_result 1
fi

# Check 3: UFW Firewall Status
log_check "Checking UFW firewall configuration..."
if ufw status | grep -q "Status: active"; then
    check_result 0
    
    # Check specific ports
    log_check "Checking firewall port rules..."
    required_ports=("22/tcp" "80/tcp" "443/tcp" "8000/tcp")
    missing_ports=()
    
    for port in "${required_ports[@]}"; do
        if ! ufw status | grep -q "$port.*ALLOW"; then
            missing_ports+=("$port")
        fi
    done
    
    if [ ${#missing_ports[@]} -eq 0 ]; then
        check_result 0
    else
        echo "  🔒 Missing port rules: ${missing_ports[*]}"
        check_result 1
    fi
else
    check_result 1
fi

# Check 4: SSH Service Status
log_check "Checking SSH service status..."
if systemctl is-active --quiet sshd; then
    check_result 0
else
    check_result 1
fi

# Check 5: SSH Security Configuration
log_check "Checking SSH security configuration..."
ssh_config="/etc/ssh/sshd_config"
ssh_issues=()

if grep -q "^PermitRootLogin no" "$ssh_config"; then
    true
else
    ssh_issues+=("Root login not disabled")
fi

if grep -q "^MaxAuthTries [1-3]" "$ssh_config"; then
    true
else
    ssh_issues+=("MaxAuthTries not set to secure value")
fi

if [ ${#ssh_issues[@]} -eq 0 ]; then
    check_result 0
else
    echo "  🔐 SSH issues: ${ssh_issues[*]}"
    check_result 1
fi

# Check 6: Fail2Ban Status
log_check "Checking Fail2Ban status..."
if systemctl is-active --quiet fail2ban; then
    check_result 0
    
    # Check if SSH jail is enabled
    log_check "Checking Fail2Ban SSH protection..."
    if fail2ban-client status sshd &>/dev/null; then
        check_result 0
    else
        check_result 1
    fi
else
    check_result 1
fi

# Check 7: Automatic Updates Configuration
log_check "Checking automatic updates configuration..."
if systemctl is-active --quiet unattended-upgrades; then
    check_result 0
else
    check_result 1
fi

# Check 8: System Limits Configuration
log_check "Checking system limits configuration..."
if grep -q "constructpro" /etc/security/limits.conf || grep -q "nofile 65536" /etc/security/limits.conf; then
    check_result 0
else
    check_result 1
fi

# Check 9: Kernel Parameters
log_check "Checking kernel parameter optimizations..."
if [ -f "/etc/sysctl.d/99-constructpro.conf" ]; then
    check_result 0
else
    check_result 1
fi

# Check 10: Deployment User
log_check "Checking deployment user creation..."
if id "constructpro" &>/dev/null; then
    check_result 0
    
    # Check if user has sudo privileges
    log_check "Checking deployment user sudo privileges..."
    if groups constructpro | grep -q sudo; then
        check_result 0
    else
        check_result 1
    fi
else
    check_result 1
fi

# Check 11: Network Connectivity
log_check "Checking internet connectivity..."
if ping -c 1 google.com &>/dev/null; then
    check_result 0
else
    check_result 1
fi

# Check 12: System Resources
log_check "Checking system resources..."
memory_gb=$(free -g | awk '/^Mem:/{print $2}')
disk_space_gb=$(df / | awk 'NR==2{print int($4/1024/1024)}')

resource_issues=()
if [ "$memory_gb" -lt 2 ]; then
    resource_issues+=("Memory: ${memory_gb}GB (minimum 2GB recommended)")
fi

if [ "$disk_space_gb" -lt 20 ]; then
    resource_issues+=("Disk space: ${disk_space_gb}GB (minimum 20GB recommended)")
fi

if [ ${#resource_issues[@]} -eq 0 ]; then
    check_result 0
else
    echo "  💾 Resource warnings: ${resource_issues[*]}"
    check_result 1
fi

# Summary
echo
echo "=== Verification Summary ==="
echo "Total checks: $total_checks"
echo "Passed: $success_count"
echo "Failed: $((total_checks - success_count))"

if [ $success_count -eq $total_checks ]; then
    log_info "🎉 All checks passed! Server is ready for Docker and Coolify installation."
    echo
    log_info "Next steps:"
    echo "  1. Proceed with Task 2: SSH connection troubleshooting"
    echo "  2. Install Docker Engine (Task 3)"
    echo "  3. Install Coolify platform (Task 4)"
    exit 0
else
    log_warn "⚠️  Some checks failed. Please review and fix the issues before proceeding."
    echo
    log_warn "Common fixes:"
    echo "  - Run the server-setup.sh script again if packages are missing"
    echo "  - Check service logs: sudo journalctl -u service-name"
    echo "  - Verify firewall rules: sudo ufw status verbose"
    echo "  - Test SSH configuration: sudo sshd -t"
    exit 1
fi