# NetSentinel-X Enterprise Deployment & Architecture Guide

## Production Architecture Overview

```
                          [ Internet / Enterprise Clients ]
                                          |
                                   ( HTTPS / WSS )
                                          v
                               [ NGINX Reverse Proxy ]
                                   (TLS Termination)
                                          |
                 +------------------------+------------------------+
                 |                                                 |
                 v                                                 v
      [ Frontend Application ]                           [ Backend API Engine ]
     (Next.js 16 Static/SSR)                             (Go 1.22 REST & WebSockets)
                 |                                                 |
                 +------------------------+------------------------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
                        v                                   v
             [ PostgreSQL Database ]                 [ Redis Memory Store ]
             (Telemetry & Audit Data)                 (Rate Limits & PubSub)
```

## Security & Hardening Features

- **RBAC Engine**: 7 Roles (`SUPER_ADMIN`, `SOC_ADMIN`, `SECURITY_ANALYST`, `THREAT_HUNTER`, `DETECTION_ENGINEER`, `AUDITOR`, `VIEW_ONLY`) mapped to 10 granular permissions.
- **Authentication**: JWT token expiration, refresh tokens, active session management, and instant session revocation.
- **API Protection**: Global 100 req/min rate limiter, payload sanitization, and security headers (`CSP`, `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`).
- **Secrets Management**: 100% environment variable based configuration. No secrets stored in codebase.
- **Audit Logging**: Immutable event audit logging with full-text search and CSV export.

## Deployment Checklist

1. Set `.env` variables (`JWT_SECRET`, `POSTGRES_PASSWORD`, `REDIS_PASSWORD`).
2. Build and launch container stack: `docker-compose -f docker-compose.production.yml up -d --build`.
3. Verify health endpoint: `curl http://localhost:8080/health`.
4. Verify V2 Observability health API: `curl http://localhost:8080/api/v2/health`.
