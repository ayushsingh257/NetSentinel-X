# NetSentinel-X V2 — Enterprise API Reference

## Authentication & Authorization

All endpoints support optional Bearer Token authentication:
`Authorization: Bearer <JWT_TOKEN>`

Rate Limiting: 100 requests per minute per client IP.

---

## Endpoint Catalog

### 1. AI Copilot
- `POST /api/v2/copilot/query`: Submit natural language query to RAG AI Copilot.

### 2. Threat Investigations
- `GET /api/v2/investigations`: Retrieve automated attack stories and timeline sequences.
- `POST /api/v2/investigations/generate`: Trigger AI investigation on target alert.

### 3. MITRE ATT&CK Intelligence
- `GET /api/v2/mitre/matrix`: Full 12-tactic ATT&CK matrix.
- `GET /api/v2/mitre/heatmap`: Real-time threat activity heatmap.

### 4. Detection Engineering Studio
- `GET/POST /api/v2/detections/rules`: Manage custom Sigma/YARA rules.
- `POST /api/v2/detections/simulate`: Run simulation sandbox test.

### 5. Threat Intelligence Fusion
- `GET /api/v2/intelligence/ioc/:value`: Multi-provider IOC lookup.
- `POST /api/v2/intelligence/enrich`: Trigger async multi-provider enrichment.

### 6. User & Entity Behaviour Analytics (UEBA)
- `GET /api/v2/ueba`: Baseline overview & entity risk leaderboard.

### 7. AI Incident Management Desk
- `GET /api/v2/incidents/list`: End-to-end incident lifecycle desk.

### 8. Executive Reporting & Compliance
- `POST /api/v2/reports/generate`: Generate CISO report with SOC 2 / ISO 27001 / HIPAA mapping.

### 9. Interactive Attack Graph
- `GET /api/v2/attack-graph`: Dynamic graph nodes & edges.

### 10. Historical Investigation & Threat Hunting
- `GET /api/v2/history/search`: Full-text event search.
- `POST /api/v2/hunting/query`: Run AI hypothesis threat hunt.

### 11. AI Workflow Automation & SOAR
- `GET /api/v2/workflows`: SOAR playbooks & approvals queue.
- `POST /api/v2/workflows/execute`: Execute SOAR playbook.

### 12. Observability & System Health
- `GET /api/v2/audit/logs`: Immutable audit log explorer.
- `GET /api/v2/health`: Platform health score (0-100).

### 13. Security Hardening & RBAC
- `GET /api/v2/security/posture`: Security score (96/100) & posture status.
- `GET /api/v2/security/rbac`: Granular role-permission assignments.
- `GET /api/v2/security/sessions`: Active sessions list.
- `POST /api/v2/security/sessions/revoke`: Revoke user session.

### 14. Demo Attack Scenarios
- `GET /api/v2/demo/scenarios`: List demonstration attack scenarios.
- `POST /api/v2/demo/load`: Load attack scenario into platform.
