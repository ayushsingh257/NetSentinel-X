# NetSentinel-X V2 — Enterprise Administrator Guide

## Deployment & Configuration

### Environment Variables
Configure `.env` prior to running `docker-compose.production.yml`:

```env
PORT=8080
GIN_MODE=release
JWT_SECRET=your_secure_jwt_secret_here
POSTGRES_PASSWORD=your_postgres_password_here
REDIS_HOST=redis:6379
```

---

## User Management & RBAC Administration

1. **Assigned Roles**: NetSentinel-X supports 7 default roles:
   - `SUPER_ADMIN`: Full system access including RBAC configuration and session revocation.
   - `SOC_ADMIN`: Incident lifecycle management, workflow approval, and report generation.
   - `SECURITY_ANALYST`: Alert triage, evidence collection, and threat hunting.
   - `THREAT_HUNTER`: Historical event search and hunt hypothesis execution.
   - `DETECTION_ENGINEER`: Sigma/YARA rule authoring and sandbox testing.
   - `AUDITOR`: View-only access to audit logs and compliance reports.
   - `VIEW_ONLY`: Read-only access to basic dashboards.

2. **Session Monitoring**:
   - Access the **Security Hardening Dashboard** -> **Sessions** tab.
   - Click **Revoke Session** to instantly invalidate active user tokens across the platform.

---

## System Health & Observability

- Monitor health status via `/api/v2/health`.
- If platform health score drops below `80`, inspect service cards on the **Observability Dashboard**.
