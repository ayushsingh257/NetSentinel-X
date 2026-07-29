# Server Hardening Guide — NetSentinel-X V2 Production
# Era 21: Infrastructure & Platform Security

This guide documents the production Linux server hardening steps required before deploying NetSentinel-X V2 to a live environment.

---

## 1. Create a Dedicated Service User

```bash
# Create non-root user for running services
sudo adduser --system --no-create-home --group netsentinel

# Lock password login for service account
sudo passwd -l netsentinel
```

---

## 2. SSH Hardening

Edit `/etc/ssh/sshd_config`:

```bash
# Non-default port to reduce automated scan noise
Port 2222

# Disable root SSH login
PermitRootLogin no

# Disable password authentication (key-based only)
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM yes

# Allow only specific users
AllowUsers netsentinel-deploy

# Reduce attack window
LoginGraceTime 30
MaxAuthTries 3
MaxSessions 5

# Disable unused features
X11Forwarding no
AllowAgentForwarding no
AllowTcpForwarding no
PrintMotd no
```

```bash
# Restart SSH (ensure you have key-based access before doing this)
sudo systemctl restart sshd
```

---

## 3. Fail2Ban Installation & Configuration

```bash
sudo apt-get install -y fail2ban

# /etc/fail2ban/jail.local
[DEFAULT]
bantime  = 3600       # 1 hour ban
findtime = 600        # 10 minute window
maxretry = 5          # 5 failures = ban

[sshd]
enabled = true
port    = 2222
filter  = sshd
logpath = /var/log/auth.log
maxretry = 3

sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 4. UFW Firewall Rules

```bash
# Reset to defaults
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow only HTTPS and non-default SSH
sudo ufw allow 443/tcp
sudo ufw allow 2222/tcp

# Enable firewall
sudo ufw enable
sudo ufw status verbose
```

Expected output:
```
Status: active
To          Action  From
--          ------  ----
443/tcp     ALLOW   Anywhere
2222/tcp    ALLOW   Anywhere
```

---

## 5. Remove Unnecessary Packages

```bash
sudo apt-get remove --purge -y telnet rsh-client ftp
sudo apt-get autoremove -y
sudo apt-get autoclean
```

---

## 6. Automatic Security Updates

```bash
sudo apt-get install -y unattended-upgrades

# /etc/apt/apt.conf.d/50unattended-upgrades
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";

sudo systemctl enable unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 7. System Resource Limits

```bash
# /etc/security/limits.conf
*    soft    nofile    65536
*    hard    nofile    65536
*    soft    nproc     4096
*    hard    nproc     4096
```

---

## 8. Kernel Security Parameters

```bash
# /etc/sysctl.d/99-netsentinel-hardening.conf

# Prevent IP spoofing
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Disable IP source routing
net.ipv4.conf.all.accept_source_route = 0

# Disable ICMP redirect acceptance
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0

# Log suspicious packets
net.ipv4.conf.all.log_martians = 1

# Disable IPv6 if not used
net.ipv6.conf.all.disable_ipv6 = 1

sudo sysctl --system
```

---

## 9. Nginx Reverse Proxy (TLS Termination)

```nginx
# /etc/nginx/sites-available/netsentinel
server {
    listen 80;
    server_name netsentinel.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name netsentinel.yourdomain.com;

    # TLS 1.3 only
    ssl_protocols TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256;

    # Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/netsentinel.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/netsentinel.yourdomain.com/privkey.pem;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Proxy to internal services
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 10. Pre-Deployment Checklist

Run the following verification checklist before going live:

```bash
# SSH hardening
sudo sshd -T | grep -E "permitrootlogin|passwordauthentication|port"

# Firewall status
sudo ufw status verbose

# Fail2Ban status
sudo fail2ban-client status sshd

# Listening ports (confirm only 443 and 2222)
sudo ss -tlnp | grep LISTEN

# TLS check
openssl s_client -connect netsentinel.yourdomain.com:443 -tls1_2
# Should fail — only TLS 1.3 allowed
openssl s_client -connect netsentinel.yourdomain.com:443 -tls1_3
# Should succeed
```
