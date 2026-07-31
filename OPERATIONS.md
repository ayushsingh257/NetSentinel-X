# Enterprise Production Operations & Runbook Manual
# NetSentinel-X V2 — Era 32 Continuous Operations

**Document Version**: 1.0.0  
**Date**: July 31, 2026  
**Target Audience**: Systems Administrators, SOC Managers, SREs, DevSecOps Engineers  

---

## 1. Executive Summary

This runbook documents operational procedures, health monitoring, secret management, backup validation, log maintenance, and incident recovery workflows for **NetSentinel-X V2** in a production environment.

---

## 2. Production Health & Monitoring Probes

### 2.1 Automated Health Checks
NetSentinel-X exposes three production HTTP probes for container orchestrators (Kubernetes, Docker Swarm, AWS ECS):

1. **Liveness Probe (`/liveness` / `/healthz`)**:
   - **Usage**: Verifies if the backend web server process is responsive.
   - **Command**: `curl -f http://localhost:8080/liveness || exit 1`
   - **Failure Action**: Restart container instance automatically.

2. **Readiness Probe (`/readiness`)**:
   - **Usage**: Verifies if the backend can connect to PostgreSQL, Redis, and internal SIEM engines.
   - **Command**: `curl -f http://localhost:8080/readiness || exit 1`
   - **Failure Action**: Remove container instance from Nginx load balancer pool until ready.

3. **General Health (`/health`)**:
   - **Usage**: Operational metric endpoint for external uptime monitors (Datadog, Prometheus, UptimeRobot).

---

## 3. Secret Management & Key Rotation Runbook

### 3.1 JWT Key Rotation Protocol
1. Generate new 64-character hex secret:
   ```bash
   openssl rand -hex 32
   ```
2. Update `JWT_SECRET` in `.env.production` on the VPS.
3. Perform zero-downtime rolling restart:
   ```bash
   docker compose -f docker-compose.production.yml up -d --no-deps backend
   ```

### 3.2 Vault KMS Synchronization
In enterprise environments using HashiCorp Vault:
```bash
# Verify Vault token status
vault token lookup

# Read production encryption secrets
vault kv get secret/netsentinel/prod
```

---

## 4. Backup & Disaster Recovery Operations

### 4.1 Daily Automated Backup Execution
Database backups execute automatically via `services/backup_service.go` using AES-256-GCM encryption:
```bash
# Manual execution of backup procedure
docker exec -it netsentinel-backend /app/backend-bin --backup
```

### 4.2 Backup Verification & Checksum Audit
Verify backup file non-repudiation using SHA-256 hash validation:
```bash
# Calculate SHA-256 checksum of backup archive
sha256sum /var/backups/netsentinel/backup_latest.enc
```

### 4.3 Sandbox Restore Procedure
Test disaster recovery restore in sandbox:
```bash
# Trigger sandbox restore simulation
curl -X POST -H "Authorization: Bearer $ADMIN_JWT" http://localhost:8080/api/v2/backup/restore-verify
```

---

## 5. Log Maintenance & SIEM Audit Retention

### 5.1 SIEM Tamper-Evident Chain Audit
Verify SIEM hash chain non-repudiation:
```bash
# Run automated hash chain integrity check
curl -H "Authorization: Bearer $ADMIN_JWT" http://localhost:8080/api/v2/siem/audit/verify
```

### 5.2 Log Rotation Configuration
Ensure Docker daemon log rotation is enabled in `/etc/docker/daemon.json`:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "10"
  }
}
```

---

## 6. Incident Response & Troubleshooting Runbook

| Incident Type | Diagnostic Command | Remediation Action |
|---------------|--------------------|--------------------|
| **Database Connection Failure** | `docker logs netsentinel-backend \| grep "DB Connection Error"` | Verify Managed PostgreSQL network firewall rules & credentials |
| **High API Latency** | `docker stats netsentinel-backend` | Scale container instances or adjust Redis connection pool limits |
| **WebSocket Stream Disconnect** | `docker logs netsentinel-proxy \| grep "/ws"` | Verify Nginx `proxy_read_timeout 86400s` WebSocket upgrade rules |
| **CORS Access Denied** | `curl -I -H "Origin: https://netsentinel-x.vercel.app" http://localhost/health` | Verify `CORS_ALLOWED_ORIGINS` in `.env.production` |
