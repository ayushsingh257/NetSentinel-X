# SSDLC Security & Vulnerability Remediation Guide — NetSentinel-X V2
# Era 26: Enterprise Security Lifecycle

This guide defines the operational workflow for developers and security engineers under the NetSentinel-X V2 Secure Software Development Lifecycle (SSDLC).

---

## 1. Secure Coding & PR Security Gate Workflow

1. **Local Pre-Commit Check**:
   - Run `gofmt -w .` and `go vet ./...` in `backend/`
   - Run `npm run lint` and `npx tsc --noEmit` in `frontend/`
   - Verify no secrets (AWS AKIA keys, JWT secrets, private keys) are staged.

2. **Pull Request Submission**:
   - Open a PR using `.github/PULL_REQUEST_TEMPLATE.md`.
   - Complete the mandatory security checklist (Authentication, Authorization, Secrets, Database, Unit tests).

3. **Automated Pipeline Execution**:
   - **SAST**: Semgrep scans source code for OWASP Top 10 vulnerabilities.
   - **Secret Scanning**: Gitleaks checks commit history for exposed credentials.
   - **Dependency CVE**: `govulncheck` and `npm audit` verify package dependencies.
   - **Container Scan**: Trivy inspects container base images for OS vulnerabilities.
   - **SBOM**: Syft generates `security/sbom/backend-sbom.json` and `frontend-sbom.json`.

---

## 2. Vulnerability Remediation SLA

| Vulnerability Severity | Remediation SLA | Required Action |
|------------------------|-----------------|-----------------|
| **CRITICAL** | 24 Hours | Immediate hotfix / PR block until resolved |
| **HIGH** | 72 Hours | Fix in current sprint release |
| **MEDIUM** | 14 Days | Remediate in upcoming release |
| **LOW** | 30 Days | Review during dependency update cycle |

---

## 3. CI/CD Security REST APIs

All `/api/v2/cicd-security/*` endpoints require valid JWT authentication and `PermViewAuditLogs` or `PermSystemConfiguration`:

- `GET /api/v2/cicd-security/posture` — aggregate CI/CD security posture score (98/100)
- `GET /api/v2/cicd-security/scans` — status of SAST, secret, dependency, container, and SBOM scans
- `GET /api/v2/cicd-security/vulnerabilities` — detailed list of detected SAST/CVE findings
- `GET /api/v2/cicd-security/sbom` — Software Bill of Materials component inventory
