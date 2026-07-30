# NetSentinel-X V2 — Disaster Recovery Operational Runbook
## Operational Guide for Incident Commanders & Site Reliability Engineers

---

## 🚨 Emergency Recovery Contacts & Roles

- **Incident Commander**: Lead Security Engineer / SRE Lead
- **Database Administrator**: Database Security & Storage Lead
- **Platform Infrastructure**: DevOps / Kubernetes Administrator
- **Escalation SLA**: Incident response initiated within **3 minutes** of alert.

---

## 📋 Emergency Recovery Workflows

### Workflow 1: Primary Database Failure & Corruption Recovery

#### Step 1: Declare Incident & Isolate Primary Engine
1. Freeze external ingress traffic to prevent further database writes:
   ```bash
   kubectl scale deployment/netsentinel-frontend --replicas=0
   ```
2. Check database status and identify exact corruption timestamp.

#### Step 2: Verify Backup Integrity
1. Query the latest backup record via API or CLI:
   ```bash
   curl -H "Authorization: Bearer <TOKEN>" https://api.netsentinel.internal/api/v2/backup/status
   ```
2. Ensure `integrity_hash` matches and `encryption_status` is `ENCRYPTED_AES256`.

#### Step 3: Trigger Automated Restore Operation
1. Initiate restore simulation or production restore:
   ```bash
   curl -X POST -H "Authorization: Bearer <TOKEN>" https://api.netsentinel.internal/api/v2/backup/restore-test
   ```
2. If restore validation returns `RESTORE_READY`, apply target snapshot to primary database.

#### Step 4: Validate Data & Restore Ingress
1. Execute database health query and table record count verification.
2. Unfreeze frontend deployment:
   ```bash
   kubectl scale deployment/netsentinel-frontend --replicas=3
   ```

---

### Workflow 2: Redis Cache & Session Store Recovery

1. Restart Redis Sentinel cluster nodes.
2. Flush degraded keys and initialize fresh session state:
   ```bash
   redis-cli -h redis.netsentinel.internal FLUSHALL
   ```
3. Active JWT tokens will re-populate session caches upon analyst re-authentication without loss of incident data.

---

## ⚡ Service Restoration Order

During full infrastructure recovery, services MUST be brought online in strict sequential order:

1. **Step 1 — Secrets & Core Infrastructure**: HashiCorp Vault, PKI Certificates, Local Storage.
2. **Step 2 — Database Layer**: PostgreSQL Primary (PITR restored & validated).
3. **Step 3 — Cache & Session Layer**: Redis Sentinel Cluster.
4. **Step 4 — Core DPI Engine & Backend**: Go Backend Services (`netsentinel-x-backend`).
5. **Step 5 — Security & Observability**: SIEM Logging Engine, Audit Hash Verification.
6. **Step 6 — User Interface**: Next.js 16 Frontend Dashboard.

---

## ✅ Post-Recovery Verification Checklist

- [ ] All database relations intact (Users, Incidents, Audit Logs, SIEM Events).
- [ ] SHA-256 Hash Chain audit log verification passes with 0 chain breaks.
- [ ] TLS 1.3 endpoints active and presenting valid certificates.
- [ ] Redis Sentinel latency `< 2ms`.
- [ ] RPO verified ≤ 5 minutes of data gap.
- [ ] Total recovery time logged and verified ≤ 30 minutes.
- [ ] Incident closure report generated in SIEM platform.
