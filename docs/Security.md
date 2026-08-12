# NetSentinel-X V2 — Enterprise Security Model & Hardening Guide 🛡️

## Security Architecture

NetSentinel-X V2 implements a Defense-in-Depth, Zero-Trust security architecture.

---

## 1. Authentication & Session Management
- **Stateless HMAC-SHA256 JWTs**: 24-hour expiration with sliding window refresh (`/api/auth/refresh`).
- **Secure Cookie Storage**: Set with `HttpOnly`, `SameSite=Lax`, and `Secure` attributes in production.
- **Double-Submit CSRF Protection**: Cryptographic CSRF tokens paired with every state-mutating request.
- **Password Policies**: Enforces minimum 8 characters, uppercase, lowercase, numeric, and special character requirements.
- **Anti-Enumeration**: Consistent timing and generic error responses for failed authentication attempts.

---

## 2. Role-Based Access Control (RBAC)

| Role | Access Scope | Allowed Dashboards & APIs |
| :--- | :--- | :--- |
| **Security Analyst** | Threat triage, investigation, log analysis | SOC Dashboard, Incidents, MITRE, Investigation |
| **Security Engineer** | Detection rules, SOAR playbooks, sensors | Detection Studio, Optimizer, SOAR, Threat Intel |
| **GRC Analyst** | Compliance audits, posture evaluation | Compliance, Executive Reporting, Certification |
| **SOC Administrator** | Full platform control, user management, secrets | All 18 Dashboards, Infrastructure, Observability |

> **Note**: Public user registration (`/signup`) restricts role selection to Analyst, Engineer, and GRC roles. The Administrator role cannot be registered publicly and must be assigned internally.

---

## 3. Network & Transport Security
- **Strict TLS 1.3 / HTTPS**: Enforced across ingress load balancers.
- **Security Headers**:
  - `Content-Security-Policy: default-src 'self'`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`

---

## 4. Cryptographic Audit Trails
- **SOAR Actions**: All automated and manual response executions are signed with HMAC-SHA256 hashes and timestamped in an append-only audit ledger.
- **Secrets Management**: Secrets encrypted at rest using AES-256-GCM.
