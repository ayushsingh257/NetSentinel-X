# Enterprise SIEM Monitoring & Log Integrity Guide — NetSentinel-X V2
# Era 25: Enterprise Security Lifecycle

This guide documents the SIEM event collection pipeline, cryptographic hash chain integrity verification, threat correlation rules, and incident timeline generation.

---

## 1. Cryptographic Hash Chain Integrity Verification

To verify that audit log history has not been tampered with or modified:

```bash
# REST API Endpoint Call
GET /api/v2/siem/integrity

# Expected Response
{
  "status": "CHAIN_VALID",
  "total_records": 1250,
  "verified_at": "2026-07-29T23:10:00Z",
  "tampered_index": -1
}
```

If tampering occurs:
```json
{
  "status": "TAMPERING_DETECTED",
  "total_records": 1250,
  "verified_at": "2026-07-29T23:10:00Z",
  "tampered_index": 14,
  "tampered_event_id": "AUD-1014"
}
```

---

## 2. Event Severity Classification Matrix

- **INFO**: Routine user login, normal API query, standard health check.
- **LOW**: Minor validation warning, input sanitization event.
- **MEDIUM**: Single failed login, container vulnerability warning, rate limit soft check.
- **HIGH**: Brute force attack (10 failed logins), bulk data export, impossible travel detection.
- **CRITICAL**: Privilege escalation attempt, audit log tampering, unauthorized DDL drop table.

---

## 3. SIEM REST API Endpoints & RBAC Controls

All `/api/v2/siem/*` endpoints require valid JWT authentication and `PermViewAuditLogs` or `PermSystemConfiguration` permissions:

- `GET /api/v2/siem/posture` — SIEM posture metrics & score (99/100)
- `GET /api/v2/siem/events` — Normalized security event stream
- `GET /api/v2/siem/alerts` — Threat correlation alerts
- `GET /api/v2/siem/timeline` — Automatically generated incident attack timeline
- `GET /api/v2/siem/integrity` — Hash chain integrity verification status
- `POST /api/v2/siem/alerts/{id}/resolve` — Update alert status to `RESOLVED`

---

## 4. Incident Response Workflow

1. **Detection**: Threat Detection Engine correlates events and fires an `OPEN` alert.
2. **Investigation**: Security analyst opens `/dashboard/security-hardening` under the SIEM tab and sets alert state to `INVESTIGATING`.
3. **Timeline Analysis**: Analyst views the auto-generated attack timeline (`GET /api/v2/siem/timeline`).
4. **Remediation**: Analyst revokes compromised user session or blocks offending IP address.
5. **Resolution**: Analyst resolves alert (`POST /api/v2/siem/alerts/{id}/resolve`).
