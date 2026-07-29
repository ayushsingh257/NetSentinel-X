# Era 26 — Secure Software Development Lifecycle (SSDLC) & CI/CD Security Architecture Review
# NetSentinel-X V2 Enterprise Production Security

## Overview

Era 26 establishes the **Enterprise Secure Software Development Lifecycle (SSDLC) & CI/CD Security Layer** for NetSentinel-X V2. Modern software supply chain attacks target developer workflows, build pipelines, third-party dependencies, and container registries. Era 26 transforms the NetSentinel-X deployment pipeline from a basic build runner into a zero-trust SSDLC security gate where every pull request and commit must pass Static Application Security Testing (SAST), secret scanning, dependency CVE analysis, container vulnerability scanning, and automated Software Bill of Materials (SBOM) generation before reaching production.

---

## 1. SSDLC Security Pipeline Transformation

### Legacy Pipeline (Unprotected Workflow)

```
Developer ──► Git Push ──► Build Application ──► Deploy to Production
                                                    (Risk: Leaked AWS Keys,
                                                     Vulnerable Packages,
                                                     Unscanned Containers)
```

### Era 26 SSDLC Enterprise Security Pipeline

```
              ┌─────────────────────────────────────────┐
              │             Developer Push              │
              └────────────────────┬────────────────────┘
                                   │
                                   ▼
              ┌─────────────────────────────────────────┐
              │          Pull Request Security          │
              │         Checklist Enforcement           │
              └────────────────────┬────────────────────┘
                                   │
   ┌───────────────────────────────┴───────────────────────────────┐
   ▼                               ▼                               ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│  SAST Static Scan     │ │ Gitleaks Secret Scan  │ │ Dependency CVE Scan   │
│  (Semgrep: Go & TS)   │ │ (AWS, JWT, API Keys)  │ │ (govulncheck/npm)     │
└───────────┬───────────┘ └───────────┬───────────┘ └───────────┬───────────┘
            │                         │                         │
            └─────────────────────────┼─────────────────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │    Trivy Container Scan       │
                      │    & Syft SBOM Generation     │
                      └───────────────┬───────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │  Security Quality Gate Check  │
                      │  (0 Critical / High CVEs)     │
                      └───────────────┬───────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │  Production Deployment Gate   │
                      │     (Security Score 98+)      │
                      └───────────────────────────────┘
```

---

## 2. Automated Security Gates & Tools

| SSDLC Gate Phase | Tool / Engine | Scan Scope | Failure Criteria / Action |
|------------------|---------------|------------|---------------------------|
| **SAST (Static Analysis)** | Semgrep | Go backend & TypeScript Next.js code | SQL injection, XSS, insecure crypto, hardcoded secrets ➔ **BUILD FAILED** |
| **Secret Detection** | Gitleaks | Commits & full git history | AWS keys, JWT secrets, private keys, API tokens ➔ **COMMIT BLOCKED** |
| **Dependency Security** | govulncheck & `npm audit` | `go.mod`, `package.json` | CRITICAL or HIGH CVE package vulnerabilities ➔ **PR BLOCKED** |
| **Container Scanning** | Trivy | Docker base & runtime images | OS packages with CRITICAL CVEs ➔ **DEPLOYMENT BLOCKED** |
| **Software Supply Chain** | Syft | Backend & Frontend builds | Generates `backend-sbom.json` and `frontend-sbom.json` (SPDX/CycloneDX) |

---

## 3. Code Quality & Security Quality Gate Criteria

SonarQube & SSDLC policies enforce:
- **Security Rating**: Grade A (0 Critical / High Security Hotspots).
- **Branch Protection Rules**: `main` branch requires PR review, passing CI security checks, and 0 unresolved vulnerability findings.
- **Pull Request Checklist**: PRs require explicit developer sign-off on authentication changes, authorization impacts, secret clearance, DB migrations, and unit test coverage.
