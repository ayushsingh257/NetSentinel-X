# Era 21 — Infrastructure & Platform Security Architecture Review
# NetSentinel-X V2 Enterprise Production Security

## Overview

Era 21 establishes the **Infrastructure & Platform Security Layer** — hardening the physical, virtual, and container-level environment that NetSentinel-X V2 runs on. This is the deployment foundation that all other security controls depend on.

**Core Threat Model**:
- Attacker gains access to server SSH port → Server Hardening prevents lateral movement
- Container escapes via privileged Docker container → Non-root + capability drops prevent escalation
- Database exposed on public interface → Network segmentation restricts access
- Sensitive environment variables leaked → Infrastructure posture scanning detects exposure

---

## 1. Network Architecture — Before vs After

### Before (Exposed Attack Surface)

```
Internet
  │
  ├── :22  SSH  (open to all IPs)
  ├── :80  HTTP
  ├── :443 HTTPS
  ├── :8080 Backend API (EXPOSED)
  ├── :5432 PostgreSQL (EXPOSED)
  └── :6379 Redis (EXPOSED)
```

### After (Minimal Surface Model)

```
Internet
  │
  └── :443 HTTPS only
         │
    Reverse Proxy (Nginx/Caddy)
    + TLS 1.3 termination
    + Rate limiting
         │
    Internal Network (172.20.0.0/24)
    ┌────┴──────────────────────┐
    │                          │
Backend (:8080)         Workers (:8081)
    │                          │
    └──────── Database (:5432) ─┘
              Redis (:6379)
              (NOT exposed externally)

SSH:
  Port 2222 (non-default)
  Key-based auth only
  Fail2Ban active (5 failures → 1hr ban)
  AllowUsers: netsentinel-deploy only
```

---

## 2. Server Hardening Controls

| Control | Configuration | Risk Mitigated |
|---------|--------------|----------------|
| SSH port | Change 22 → 2222 | Port-scan enumeration |
| Password auth | `PasswordAuthentication no` | Brute-force SSH |
| Root login | `PermitRootLogin no` | Direct root compromise |
| Fail2Ban | 5 failures / 10min → 1hr ban | SSH brute-force |
| UFW Firewall | Allow 443, 2222 only | Exposed service attack |
| Automatic updates | `unattended-upgrades` | Known CVE exploitation |
| Minimal packages | Remove: telnet, rsh, ftp | Service enumeration |
| Process isolation | Separate OS user per service | Privilege escalation |

---

## 3. Docker Security Controls

| Control | Implementation | Risk Mitigated |
|---------|---------------|----------------|
| Non-root user | `USER netsentinel:netsentinel` | Container escape privilege |
| Read-only filesystem | `--read-only` | Malware persistence |
| No privileged mode | Remove `privileged: true` | Full host access |
| Drop capabilities | `--cap-drop ALL --cap-add NET_BIND_SERVICE` | Kernel exploit surface |
| Resource limits | `--memory 512m --cpus 1.0` | DoS via resource exhaustion |
| No new privileges | `--security-opt no-new-privileges` | SUID/SGID escalation |
| Minimal base image | `gcr.io/distroless/static` (Go), `node:alpine` | Vulnerability surface |
| Image scanning | Trivy on every build | Known CVE containers |
| Secrets: no ENV | Mount secrets via volume | `docker inspect` secret leakage |

---

## 4. TLS & Cryptographic Controls

| Control | Standard | Risk Mitigated |
|---------|----------|----------------|
| TLS version | TLS 1.3 minimum (disable 1.0/1.1/1.2) | BEAST, POODLE, downgrade attacks |
| Cipher suites | ECDHE-ECDSA-AES256-GCM-SHA384 only | Weak cipher negotiation |
| HSTS | `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` | SSL stripping |
| Certificate | Let's Encrypt (auto-renewed) | Expired cert / MITM |
| mTLS | Internal services use mutual TLS | Internal MITM |

---

## 5. Infrastructure Security Posture Scoring

The `InfrastructureSecurityService` computes a real-time posture score across 5 domains:

| Domain | Weight | Checks |
|--------|--------|--------|
| Container Security | 25% | Non-root, read-only FS, no privileged, cap-drop |
| Network Exposure | 20% | Minimal ports, internal-only services |
| TLS Configuration | 20% | TLS 1.3, HSTS, strong ciphers |
| Server Hardening | 20% | SSH config, Fail2Ban, firewall rules |
| Environment Security | 15% | No debug mode, no default credentials, no test accounts |

**Target Score**: ≥ 90/100

---

## 6. OWASP Infrastructure Top 5 Mapping

| OWASP Category | NetSentinel-X Control |
|----------------|----------------------|
| Security Misconfiguration | Production readiness scanner (debug off, defaults removed) |
| Vulnerable & Outdated Components | Trivy image scanning, Dependabot |
| Insufficient Logging & Monitoring | Infrastructure event pipeline → Era 14 AuditService |
| Broken Access Control | Network segmentation (DB/Redis not externally accessible) |
| Cryptographic Failures | TLS 1.3, HSTS, no HTTP, encrypted internal comms |

---

## 7. Files Delivered

| File | Purpose |
|------|---------|
| `backend/services/infrastructure_security_service.go` | Posture scoring, hardening check engine, Docker security scanner |
| `backend/handlers/v2_infrastructure_handler.go` | REST API: posture, checks, docker, network, TLS endpoints |
| `backend/services/infrastructure_security_test.go` | Unit tests for all scanner functions |
| `frontend/components/InfrastructureSecurityDashboard.tsx` | 4-tab UI: Posture, Hardening, Docker, Network |
| `frontend/components/InfrastructureSecurityDashboard.test.tsx` | React unit tests |
| `docs/server_hardening_guide.md` | Production Linux hardening runbook |
| `docs/docker_security_guide.md` | Container security configuration guide |
| `docker/hardened.Dockerfile.backend` | Hardened production Go Dockerfile |
| `docker/hardened.Dockerfile.frontend` | Hardened production Next.js Dockerfile |
