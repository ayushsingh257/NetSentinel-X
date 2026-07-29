# Era 25 — SIEM-Grade Logging, Audit & Security Monitoring Architecture Review
# NetSentinel-X V2 Enterprise Production Security

## Overview

Era 25 establishes the **Enterprise SIEM-Grade Logging, Audit & Security Monitoring Layer** for NetSentinel-X V2. When a security breach or insider threat occurs, incident responders must be able to reconstruct an accurate, tamper-proof timeline of all malicious actions. Legacy logs stored in basic files or standard database tables can be altered, truncated, or erased by a compromised account. Era 25 introduces an immutable audit log engine backed by SHA-256 cryptographic hash chaining (where every record incorporates the hash of the preceding record), multi-domain event normalization, automated threat correlation engines, and real-time incident timeline generation.

---

## 1. Security Event & SIEM Architecture Transformation

### Before Era 25 (Standard Local Logging)

```
Application Operations
        │
        ▼
 Standard Console / DB Log Table
        │ (Vulnerable to DB Modification / Log Deletion)
        ▼
 basic Uncorrelated Views
```

### After Era 25 (Immutable SIEM Audit Fabric)

```
 Event Sources Across Platform Eras:
 ┌──────────────────────┬──────────────────────┬──────────────────────┐
 │ Auth & Sessions      │ RBAC & Authz         │ API Security         │
 │ (Era 24: Logins,     │ (Era 18: Escalation, │ (Era 20: HMAC Keys,   │
 │  MFA, Revocations)   │  Role Changes)       │  Rate Limits)        │
 ├──────────────────────┼──────────────────────┼──────────────────────┤
 │ Database Security    │ Infrastructure       │ Web Application      │
 │ (Era 23: DML/DDL,    │ (Era 21: Containers, │ (Era 19: OWASP, XSS, │
 │  Backup Restores)    │  Trivy Scans)        │  CSRF, File Uploads) │
 └──────────────────────┴──────────────────────┴──────────────────────┘
                               │
                               ▼
                   Security Event Collector
                               │
                               ▼
                   Event Normalization & Severity Engine
                   (INFO ➔ LOW ➔ MEDIUM ➔ HIGH ➔ CRITICAL)
                               │
                               ▼
                Cryptographic Hash Chaining Service
             CurrentHash = SHA256(PrevHash + Data + Time)
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
 Real-Time Threat Correlation            Immutable SIEM Storage
   (Brute Force, Exfiltration,               (Tamper-Evident)
    Privilege Abuse Engine)                       │
            │                                     ▼
            ▼                            SIEM Security Dashboard
 Security Alerts & Timeline             (Log Integrity Verifier)
```

---

## 2. Cryptographic Hash Chaining Integrity Mechanism

Every security audit entry calculates its `CurrentHash` using SHA-256 over its predecessor's `PreviousHash` and its own payload:

```
[ Log Entry #1 ]
PreviousHash: "GENESIS_ROOT_HASH_00000000000000000000000000000000"
Data: { Event: "LOGIN_SUCCESS", User: "Ayush", Timestamp: "2026-07-29T23:00:00Z" }
CurrentHash:  "A7F92B3C..."
      │
      ▼ (Links to Next Record)
[ Log Entry #2 ]
PreviousHash: "A7F92B3C..."
Data: { Event: "PRIVILEGE_ESCALATION", User: "Analyst_Bob", Timestamp: "2026-07-29T23:01:00Z" }
CurrentHash:  "E4D8112A..."
```

**Tamper Detection Result**: If an attacker alters Log Entry #1, its calculated SHA-256 hash changes. Log Entry #2's `PreviousHash` mismatch causes `AuditChainService.VerifyChainIntegrity()` to IMMEDIATELY flag a `TAMPERING_DETECTED` critical alert.

---

## 3. Multi-Domain Event Classification & Severity Matrix

| Platform Layer | Event Type | Severity Level | Security Correlation Rule |
|----------------|------------|----------------|---------------------------|
| **Auth (Era 24)** | `LOGIN_FAILURE` (10x in 5m) | **HIGH** | Brute Force Attack ➔ Trigger Account Lockout & Alert |
| **Authz (Era 18)** | `PRIVILEGE_ESCALATION` | **CRITICAL** | Regular user requesting Admin endpoints ➔ BLOCK & Escalation Alert |
| **API Sec (Era 20)** | `RATE_LIMIT_TRIGGERED` + `API_ABUSE` | **HIGH** | Endpoint enumeration + brute force ➔ IP Blacklist |
| **Database (Era 23)** | `SCHEMA_CHANGE` / `DROP_TABLE` | **CRITICAL** | DDL action by application user ➔ Alert & DB Audit |
| **Infrastructure (Era 21)** | `CONTAINER_FAILED` / `SCAN_FAILED` | **MEDIUM** | Container crash or Trivy vulnerability detection |

---

## 4. Threat Detection Rules & Alert Lifecycle

1. **Rule 1: Brute Force Engine**: 10 failed logins from same IP/User within 5 minutes ➔ Generates `HIGH` alert.
2. **Rule 2: Privilege Escalation Engine**: Attempted access to privileged routes (`/api/v2/admin/*`) without required permissions ➔ Generates `CRITICAL` alert.
3. **Rule 3: Bulk Data Exfiltration**: Large database export outside business hours ➔ Generates `HIGH` alert.
4. **Alert Lifecycle**: `OPEN` ➔ `INVESTIGATING` ➔ `RESOLVED`.
