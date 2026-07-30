# NetSentinel-X V2 — Disaster Recovery Architecture Review
## Era 28 Enterprise Backup, Disaster Recovery & Business Continuity Layer

### Executive Summary

NetSentinel-X V2 implements an enterprise-grade Disaster Recovery (DR) and Business Continuity architecture designed to survive catastrophic infrastructure failures, primary database corruptions, regional cloud outages, and ransomware attacks.

The system guarantees strict adherence to enterprise Recovery Objectives:
- **Recovery Point Objective (RPO)**: **≤ 5 minutes** (Maximum acceptable data loss window)
- **Recovery Time Objective (RTO)**: **≤ 30 minutes** (Maximum acceptable system downtime window)

---

### Threat Model & Disaster Scenarios

| Scenario ID | Threat / Disaster Description | Impact Level | Mitigation Strategy | Target RPO | Target RTO |
|-------------|-------------------------------|--------------|---------------------|------------|------------|
| **DR-01** | Primary Database Storage Corruption / Disk Failure | High | Continuous WAL Archiving + Automated Automated Point-In-Time (PITR) Backups | 5 min | 15 min |
| **DR-02** | Regional Datacenter Outage | Critical | Multi-Region Encrypted Backup Replication & DNS Failover | 5 min | 25 min |
| **DR-03** | Ransomware / Malicious Backup Tampering | Critical | Immutability Locks + AES-256 GCM Encryption + SHA-256 Hash Verification | 0 min | 30 min |
| **DR-04** | Redis Cache & Session Store Failure | Medium | In-Memory Redis Sentinel Replication & Stateful Token Recovery | 0 min | 5 min |
| **DR-05** | Rogue Administrator / Accidental Table Deletion | High | Automated Restore Simulation Sandbox & Incremental Snapshot Reconstruct | 5 min | 20 min |

---

### Backup Architecture & Encryption Design

```
+-----------------------------------------------------------------------------------+
|                            Primary Production Zone                                |
|                                                                                   |
|  +--------------------+     +---------------------+     +----------------------+  |
|  | PostgreSQL DB      |     | Go Backend Engine   |     | Vault Secret Engine  |  |
|  | WAL Log Streaming  |     | BackupService       |     | Master Encryption Key|  |
|  +---------+----------+     +----------+----------+     +----------+-----------+  |
+------------|---------------------------|---------------------------|--------------+
             |                           |                           |
             v                           v                           |
+--------------------------------------------------------------------|--------------+
|                            Encrypted Backup Pipeline               v              |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | 1. SHA-256 Integrity Checksum Generation: Hash = SHA256(RawBackupData)      |  |
|  | 2. AES-256-GCM Encryption with Dynamic Key from HashiCorp Vault            |  |
|  | 3. Immutability Metadata Signature & Retention Policy Enforcement (90 Days)  |  |
|  +-------------------------------------+---------------------------------------+  |
+----------------------------------------|------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        Secure Disaster Recovery Storage Zone                      |
|                                                                                   |
|  +----------------------------------+    +-------------------------------------+  |
|  | Local Encrypted Vault Storage    |    | Cross-Region Immutable S3 Bucket    |  |
|  | /var/backups/netsentinel/        |    | Object Lock Enabled (Compliance)    |  |
|  +----------------------------------+    +-------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

#### Encryption & Integrity Rules:
1. **Algorithm**: AES-256-GCM (Authenticated Encryption with Associated Data).
2. **Integrity Hash**: `BackupHash = SHA-256(BackupArchiveData)`. Every backup record stores its cryptographic SHA-256 hash. Prior to any restore, the hash is re-computed. If a single byte differs, status shifts to `BACKUP_CORRUPTED` and recovery halts immediately.
3. **Key Management**: Encryption keys are fetched dynamically from HashiCorp Vault (`secret/data/dr/backup-key`) with mandatory 90-day key rotation schedules.

---

### Database Recovery Strategy & WAL Archiving

1. **Full Backups**: Nightly full PostgreSQL database snapshot exported using `pg_dump` with custom compressed format (`.dump.enc`).
2. **Incremental Backups**: Hourly delta backups capturing modified tables and indexes.
3. **WAL (Write-Ahead Logging)**: Continuous WAL log shipping to backup storage every 60 seconds, enabling Point-In-Time Recovery (PITR) down to exact timestamps.

---

### Failover & Recovery Decision Tree

```
                          +-------------------------------+
                          | Incident Detected / Health Check |
                          +---------------+---------------+
                                          |
                                          v
                         /---------------------------------\
                        /   Is Primary DB Recoverable?      \
                        \        (within 5 minutes)         /
                         \----------------+----------------/
                                          |
                                 +--------+--------+
                                 |                 |
                                YES                NO
                                 |                 |
                                 v                 v
                    +--------------------+   +-----------------------------------+
                    | In-Place Database  |   | Initiate Failover to Standby DR   |
                    | Point-in-Time      |   | Replica or Restore from Vault     |
                    | Recovery (PITR)    |   +-----------------+-----------------+
                    +--------------------+                     |
                                                               v
                                                     +-------------------+
                                                     | Verify SHA-256    |
                                                     | Backup Hash       |
                                                     +---------+---------+
                                                               |
                                                     +---------+---------+
                                                     | Apply AES-256     |
                                                     | Decryption        |
                                                     +---------+---------+
                                                               |
                                                     +---------+---------+
                                                     | Execute Restore   |
                                                     | & Verify Routes   |
                                                     +-------------------+
```

---

### Recovery Objectives Matrix

- **RPO Target**: ≤ 5 Minutes
  - *Current Metric*: **2 Minutes** (WAL log shipping interval)
- **RTO Target**: ≤ 30 Minutes
  - *Current Metric*: **12 Minutes** (Automated restore simulation benchmark)
- **Backup Retention**: 90 days local, 365 days immutable cross-region archive.
