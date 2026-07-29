# Era 23 — Database Security & Data Protection Architecture Review
# NetSentinel-X V2 Enterprise Production Security

## Overview

Era 23 establishes the **Enterprise Database Security & Data Protection Layer** for NetSentinel-X V2. Database breaches represent one of the most catastrophic risk vectors in enterprise cybersecurity. This era implements PostgreSQL configuration hardening, least-privilege role separation, field-level data classification, AES-256-GCM data-at-rest encryption, TLS 1.3 in-transit encryption, SQL injection analysis, query audit logging, and encrypted backup verification.

---

## 1. Current vs. Enterprise Database Security Model

### Current (Direct Unrestricted Access Model)

```
Application (Go Backend)
      │
  PostgreSQL (Port 5432)
      │
 ┌────┴──────────────────────────────────────────┐
 │ All Tables Accessible under Single Superuser  │  <-- Excessive Privilege Risk
 │ Plaintext Database Transports (sslmode=disable)│  <-- Man-in-the-Middle Risk
 │ Unencrypted Field Storage                     │  <-- Data Leak Risk
 └───────────────────────────────────────────────┘
```

### Enterprise Hardened Data Protection Architecture

```
                                  Frontend Application
                                           │
                                    API Router Layer
                                           │
                        (RBAC Permission & Audit Layer)
                                           │
                         Database Service Account (Least Privilege)
                                           │
                       TLS 1.3 Encrypted Connection (sslmode=require)
                                           │
            ┌──────────────────────────────┼──────────────────────────────┐
            │                              │                              │
   PostgreSQL 16 Engine            Field Classification Engine     Data Encryption Layer
   (Port 5432 Internal Bridge)     (Public, Confidential,          (AES-256-GCM At Rest)
            │                       Restricted Masks)                     │
            └──────────────────────────────┼──────────────────────────────┘
                                           │
                       Query Audit & Backup Security Engine
                       (Tamper-evident logs & AES-256 Backups)
```

---

## 2. Threat Matrix & Mitigation Controls

| Threat Scenario | Vulnerability Mechanism | Era 23 Mitigation Control |
|-----------------|------------------------|---------------------------|
| **SQL Injection (SQLi)** | String concatenation in raw SQL queries | Parameterized SQL queries + ORM + `SQLSecurityService` scanner |
| **Database Compromise** | Exposure of port 5432 to external internet | UFW firewall rules + Docker bridge network isolation (internal only) |
| **Privilege Escalation** | App service connecting as `postgres` superuser | Role separation (`application_user`, `readonly_audit_user`, `migration_user`) |
| **Data Leakage at Rest** | Physical disk theft or unencrypted snapshot leak | AES-256-GCM column encryption for credentials, tokens, and PII |
| **Eavesdropping in Transit** | Plaintext TCP connection between App & DB | TLS 1.3 enforced connection (`sslmode=require`, `sslrootcert`) |
| **Unnoticed Data Exfiltration** | Unmonitored SELECT / COPY bulk queries | `DatabaseAuditService` recording user, query, table, IP, and result |

---

## 3. Sensitive Data Classification Hierarchy

| Level | Description | Example Data Types | Protection Requirements |
|-------|-------------|--------------------|-------------------------|
| **PUBLIC** | Freely accessible application metadata | Usernames, public alert counts | No encryption required |
| **INTERNAL** | System operational metrics | Health scores, system logs | Internal network access only |
| **CONFIDENTIAL** | PII and analyst details | Email addresses, analyst IP addresses | Hashed or masked in UI logs |
| **RESTRICTED** | Cryptographic & credential payloads | Passwords, API keys, JWT secrets | Mandatory AES-256-GCM encryption |

---

## 4. Database Role Access Policy

```sql
-- Role Separation Architecture
CREATE ROLE postgres_admin WITH SUPERUSER;          -- Emergency admin only
CREATE ROLE migration_user WITH CREATEDB;           -- DDL migrations during CI/CD
CREATE ROLE application_user WITH LOGIN;            -- DML (SELECT, INSERT, UPDATE, DELETE)
CREATE ROLE readonly_audit_user WITH LOGIN;         -- Read-only (SELECT on audit/security tables)

-- Grant Minimal Table Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO application_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_audit_user;
REVOKE CREATE, DROP, ALTER ON ALL TABLES IN SCHEMA public FROM application_user;
```

---

## 5. Backup & Disaster Recovery Strategy

1. **Encrypted Automated Backups**: Daily `pg_dump` snapshots encrypted via AES-256-GCM.
2. **Offsite Immutable Storage**: Encrypted backups stored in S3 object store with object lock (WORM policy).
3. **Automated Restore Testing**: Weekly automated containerized restore tests verifying checksum integrity.
