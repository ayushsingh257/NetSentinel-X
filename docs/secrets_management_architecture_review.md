# Era 22 — Enterprise Secrets Management & Cryptographic Security Architecture Review
# NetSentinel-X V2 Enterprise Production Security

## Overview

Era 22 establishes the **Enterprise Secrets Management & Cryptographic Security Layer** for NetSentinel-X V2. In modern enterprise SOC platforms, handling secrets in plain `.env` files or committing credentials into source control represents a critical vulnerability. This era introduces vault-backed secrets lifecycle management, cryptographic standard enforcement, real-time secret leak detection, and Gitleaks CI scanning gates.

---

## 1. Current vs. Enterprise Secrets Architecture

### Current (.env Plaintext Vulnerability Model)

```
Application (NetSentinel-X)
      │
  .env File (Local Filesystem)
      │
 ┌────┴──────────────────────────┐
 │ JWT_SECRET=supersecret123    │  <-- Plaintext in process memory & filesystem
 │ DATABASE_PASSWORD=adminpass   │  <-- Hardcoded credential risk
 │ AWS_ACCESS_KEY=AKIAIOSFODNN7 │  <-- High risk of accidental commit
 └───────────────────────────────┘
```

### Enterprise Vault & Secrets Lifecycle Architecture

```
                      Application Services (Go + Next.js)
                                     │
                        (Secret Injection Gateway)
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
  HashiCorp Vault           AWS Secrets Manager          Azure Key Vault
  (On-Premises / K8s)           (Cloud Native)               (Enterprise)
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     │
                      Encrypted Secrets Engine
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           │                         │                         │
  Automated Rotation       Leaked Credential Revocation    Cryptographic Audit
  (30-day JWT / Keys)      (Real-time Gitleaks Scan)       (AES-256 / RSA-4096)
```

---

## 2. Secrets Risk Analysis & Mitigation

| Secret Category | Potential Attack Scenario | Era 22 Mitigation Control |
|-----------------|---------------------------|---------------------------|
| **JWT Signing Key** | Forged authentication tokens via weak key or key leak | SHA-256 HMAC / RSA-4096 signing + 30-day automated rotation |
| **Database Credentials** | Database compromise via hardcoded password | HashiCorp Vault dynamic database secret injection (short-lived) |
| **API Keys (`nsx_live_*`)** | Exposed key used for unauthorized API calls | SHA-256 hashed storage + automated revocation + Gitleaks CI scan |
| **OAuth Client Secrets** | Impersonation of trusted third-party integrations | Scoped permissions + rotation history tracking + bcrypt hashing |
| **Webhook Signatures** | Webhook payload tampering & forgery | HMAC-SHA256 payload signing keys managed via Secret Engine |

---

## 3. Storage & Encryption Model

All internal secrets registered within `SecretsManagementService` adhere to the following cryptographic controls:

1. **Zero Plaintext Storage**: Plaintext secrets are never stored in memory maps or databases. All stored values are hashed (SHA-256 / bcrypt) or encrypted using **AES-256-GCM**.
2. **Provider Abstraction**: Supports local encrypted store, HashiCorp Vault, AWS Secrets Manager, and GitHub Secrets.
3. **Key Ownership & Metadata**: Every secret is bound to an owner ID, environment tag (`production`, `staging`, `development`), creation timestamp, expiration timestamp, and rotation state.

---

## 4. Secret Lifecycle & Rotation Strategy

```
[REGISTERED] ──► [ACTIVE] ──(TTL Expiry / Policy)──► [EXPIRING_SOON]
                    │                                      │
                    ├──► (Manual/Auto Rotate) ─────────────┤
                    │                                      ▼
                    └──► (Compromise Signal) ──► [ROTATION_REQUIRED] ──► [ROTATED / NEW ACTIVE]
                                                        │
                                                        └──► [REVOKED / EXPIRED]
```

### Rotation Lifecycles

- **JWT Secrets**: Rotated every 30 days (sliding window supports grace period for old tokens).
- **API Keys**: Rotated every 90 days or immediately upon compromise signal.
- **Database Passwords**: Rotated dynamically via Vault database secret engine.
- **TLS Certificates**: Auto-renewed via ACME/Let's Encrypt every 60 days.

---

## 5. Cryptographic Standards Matrix

| Cryptographic Task | Approved Standard | Prohibited Weak Algorithm |
|--------------------|-------------------|----------------------------|
| **Symmetric Encryption** | AES-256-GCM, ChaCha20-Poly1305 | DES, 3DES, RC4, AES-ECB |
| **Asymmetric Keys** | RSA-4096, ECDSA (P-384, Ed25519) | RSA-1024, RSA-2048 |
| **Password Hashing** | Argon2id, bcrypt (Cost ≥ 12) | MD5, SHA1, Plaintext SHA256 |
| **Cryptographic Hashing** | SHA-256, SHA-512 | MD5, SHA-1 |
