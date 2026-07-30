# Enterprise Production Deployment Security Guide — NetSentinel-X V2
# Era 27: Enterprise Production Security Hardening

This guide provides operational procedures for deploying NetSentinel-X V2 to live enterprise infrastructure.

---

## 1. Pre-Deployment Security Checklist

Before approving any deployment to live production:

- [ ] **Environment Audit**: Verify `ENV=production` and `DEBUG=false` in environment variables.
- [ ] **Secret Clearance**: Ensure zero hardcoded keys exist in source code or docker images. Secrets must be mounted via Vault / AWS Secrets Manager.
- [ ] **TLS 1.3 & HSTS**: Verify HTTPS certificate is active and HSTS header (`Strict-Transport-Security: max-age=31536000; includeSubDomains`) is present.
- [ ] **Secure Cookies**: Ensure session cookies set `HttpOnly`, `Secure`, and `SameSite=Strict`.
- [ ] **Container Hardening**: Verify containers run as non-root user (`USER netsentinel`) with memory limits.
- [ ] **Database & Cache Health**: Confirm PostgreSQL and Redis pass ping latency checks (< 5ms).

---

## 2. Emergency Rollback Procedure

If production health degrades post-deployment:

1. Trigger automated rollback via REST API:
   ```bash
   POST /api/v2/deployment/rollback
   ```
2. The load balancer immediately switches 100% traffic back to the previous stable release.
3. The failed deployment instance is drained and isolated for root cause forensic investigation.

---

## 3. Production Deployment REST APIs

All `/api/v2/deployment/*` endpoints require valid JWT authentication and `PermViewAuditLogs` or `PermSystemConfiguration`:

- `GET /api/v2/deployment/posture` — aggregate production readiness score (target: 96+/100)
- `GET /api/v2/deployment/config` — environment variables and debug mode validation
- `GET /api/v2/deployment/tls` — TLS version, HSTS status, and cookie security flags
- `GET /api/v2/deployment/health` — live availability of backend, database, and Redis
- `GET /api/v2/deployment/rollback` — rollback readiness status and previous version state
