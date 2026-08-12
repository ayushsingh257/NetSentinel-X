# NetSentinel-X V2 — REST & WebSocket API Reference 📡

## Base URL
- **Production**: `https://api.netsentinel.io`
- **Development**: `http://localhost:8080`

---

## 1. Authentication Endpoints

### `POST /login`
Authenticates a SOC user and returns signed JWT + CSRF token.
```json
{
  "username": "analyst",
  "password": "Analyst@NetSentinel2026!"
}
```

### `POST /signup`
Registers a new Security Analyst, Engineer, or GRC user.
```json
{
  "firstName": "Alex",
  "lastName": "Rivera",
  "username": "arivera_sec",
  "email": "arivera@enterprise.com",
  "password": "SecurePassword2026!",
  "role": "analyst"
}
```

### `POST /logout`
Clears session cookies and revokes client tokens.

---

## 2. Observability & Health Probes

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Platform system health summary | No |
| `GET` | `/health/live` | Kubernetes container liveness probe (200 OK) | No |
| `GET` | `/health/ready` | Kubernetes cluster readiness probe (200/503) | No |
| `GET` | `/metrics` | Prometheus metrics scrape endpoint | No |
| `GET` | `/analytics` | Real-time packet throughput & threat metrics | No |

---

## 3. Core Enterprise Security APIs (Auth Required)

### SOAR Automation
- `GET /api/v2/soar/playbooks`: List active playbooks.
- `POST /api/v2/soar/playbooks/execute`: Execute automated response playbook.
- `GET /api/v2/soar/approvals`: List pending human-in-the-loop response approval gates.
- `POST /api/v2/soar/approvals/action`: Approve or reject a sensitive remediation action.

### AI Threat Analysis
- `GET /api/v2/ai/analysis/latest`: Fetch recent AI autonomous threat evaluations.
- `POST /api/v2/ai/analysis/analyze`: Trigger ad-hoc AI triage on security alerts.

### Threat Detection & Rules
- `GET /api/v2/threats/detections`: List active Sigma/YARA threat detections.
- `POST /api/v2/threats/rules`: Deploy custom detection rules.

---

## 4. Real-Time WebSocket API
- **Endpoint**: `ws://localhost:8080/ws` or `wss://api.netsentinel.io/ws`
- **Stream Content**: Real-time packet stream, telemetry counters, threat alerts, and SOAR execution progress updates.
