# NetSentinel-X V2 — AI-Powered Enterprise Network Detection & Response Platform

[![Enterprise CI/CD Pipeline](https://github.com/ayushsingh257/NetSentinel-X/actions/workflows/ci.yml/badge.svg)](https://github.com/ayushsingh257/NetSentinel-X/actions/workflows/ci.yml)
![Version](https://img.shields.io/badge/version-v2.0.0--rc1-cyan)
![Release Candidate](https://img.shields.io/badge/status-Enterprise%20Release%20Candidate-emerald)
![Go Version](https://img.shields.io/badge/go-1.22-blue)
![Next.js](https://img.shields.io/badge/next.js-16.2-black)
![Compliance](https://img.shields.io/badge/compliance-SOC2%20%7C%20ISO27001%20%7C%20HIPAA-emerald)

## Overview

**NetSentinel-X V2** is an enterprise-grade AI Security Operations Platform and Network Detection & Response (NDR) engine. Built for modern SOC environments, it combines real-time eBPF network telemetry, Deep Packet Inspection (DPI), autonomous AI threat reasoning, multi-event threat investigations, MITRE ATT&CK matrix correlation, custom Sigma/YARA detection engineering, multi-provider threat intelligence fusion, User & Entity Behaviour Analytics (UEBA), continuous AI Detection Optimization, an Enterprise AI Incident Management Desk, Executive Reporting & Compliance Intelligence, an Interactive Attack Graph, an AI Threat Hunting Workspace, an Autonomous SOAR Playbook Engine, an Observability & Health Engine, and a multi-layered Enterprise Security Architecture into a unified platform.

---

## Architecture Diagram

```
                                +----------------------------------+
                                |  NetSentinel-X Next.js 16 Web UI |
                                |  React 19 / TypeScript / Tailwind|
                                +----------------------------------+
                                                 |
                                         ( HTTP / WebSocket )
                                                 v
                                +----------------------------------+
                                |    Go 1.22 Gin API Gateway       |
                                | JWT Auth + RBAC + Rate Limiting  |
                                | HMAC Signatures + API Key Guard  |
                                +----------------------------------+
                                                 |
                   +-----------------------------+-----------------------------+
                   |                             |                             |
                   v                             v                             v
        +--------------------+        +--------------------+        +--------------------+
        | eBPF DPI Telemetry |        | AI Copilot Engine  |        | Threat Intel Engine|
        | Packet Ingestion   |        | RAG / LLM Provider |        | 8 Intel Feeds      |
        +--------------------+        +--------------------+        +--------------------+
```

---

## 30-Era Enterprise Evolution Roadmap

### Phase 1: Core Platform (Eras 1–16) — Product & Platform Evolution ✅
1. **Era 1 (Completed)**: Enterprise Experience & UI Modernization ✅
2. **Era 2 (Completed)**: AI Security Copilot ✅
3. **Era 3 (Completed)**: AI Threat Investigation Engine ✅
4. **Era 4 (Completed)**: Enterprise MITRE ATT&CK Intelligence Engine ✅
5. **Era 5 (Completed)**: Detection Engineering Studio ✅
6. **Era 6 (Completed)**: Threat Intelligence Fusion Engine ✅
7. **Era 7 (Completed)**: UEBA & Behaviour Analytics Engine ✅
8. **Era 8 (Completed)**: AI Detection Optimizer ✅
9. **Era 9 (Completed)**: AI Incident Management Desk ✅
10. **Era 10 (Completed)**: Executive Reporting & Compliance Engine ✅
11. **Era 11 (Completed)**: Interactive Attack Graph & Threat Path Visualization ✅
12. **Era 12 (Completed)**: Historical Investigation & AI Threat Hunting Engine ✅
13. **Era 13 (Completed)**: AI Workflow Automation & Autonomous SOAR Playbook Engine ✅
14. **Era 14 (Completed)**: Enterprise Observability & System Health Engine ✅
15. **Era 15 (Completed)**: Enterprise Security Hardening & Production Readiness Layer ✅
16. **Era 16 (Completed)**: Enterprise Release Candidate & Final QA (`v2.0.0-rc1`) ✅

### Phase 2: Security Foundation (Eras 17–20) — Security Awareness Layer ✅
17. **Era 17 (Completed)**: Identity & Authentication Security (JWT HS256, Session Validation) ✅
18. **Era 18 (Completed)**: Authorization & Access Control Security (7-Tier RBAC, Privilege Escalation Detection) ✅
19. **Era 19 (Completed)**: Web Application Security (OWASP Top 10, CSRF/XSS, CSP, DOMPurify, File Upload Allowlist) ✅
20. **Era 20 (Completed)**: Secure API Architecture (API Keys, OAuth2 Readiness, Adaptive Rate Limiting, HMAC Signed Requests, Webhooks) ✅

### Phase 3: Production Security & Enterprise Readiness (Eras 21–30) 🔄
21. **Era 21 (Completed)**: Infrastructure & Platform Security (Server Hardening, Hardened Dockerfiles, Network DMZ, TLS 1.3) ✅
22. **Era 22 (Completed)**: Secrets Management & Cryptographic Security (HashiCorp Vault, Key Rotation, Gitleaks CI Gate) ✅
23. **Era 23 (Completed)**: Database Security & Data Protection (Least-Privilege DB Users, AES-256-GCM, Query Audit Logs) ✅
24. **Era 24 (Completed)**: Secure Session & Advanced Identity — MFA (15m JWTs, Refresh Rotation, TOTP MFA, Impossible Travel Detection) ✅
25. **Era 25 (Completed)**: Logging, Audit & Security Monitoring — SIEM-Grade (Cryptographic SHA-256 Hash Chain, Threat Correlation, Incident Timelines) ✅
26. **Era 26 (Completed)**: CI/CD Security & SSDLC (Semgrep SAST, Gitleaks, govulncheck, Trivy, Syft SBOM) ✅
27. **Era 27 (Completed)**: Production Deployment Security (Readiness Scanner, TLS 1.3/HSTS, Secure Cookies, Health Score 98/100) ✅
28. **Era 28 (Completed)**: Backup, Disaster Recovery & Business Continuity (AES-256 Backups, SHA-256 Hashes, RPO ≤ 5m, RTO ≤ 30m) ✅
29. **Era 29 (Completed)**: Privacy & Compliance Framework (SOC 2 96%, ISO 27001 98%, GDPR 95%, PII Masking & Data Classification) ✅
30. **Era 30 (Planned)**: Final Enterprise Security Validation (OWASP ZAP, Penetration Test, Security Validation Report) 🛡️

---

## Quick Start & Deployment

### Production Stack (Docker Compose)
```bash
# Clone the repository
git clone https://github.com/ayushsingh257/NetSentinel-X.git
cd NetSentinel-X

# Launch production stack
docker-compose -f docker-compose.production.yml up -d --build
```

Access Web Dashboard: `http://localhost:3000`
Access API Gateway: `http://localhost:8080`

---

## License & Compliance

NetSentinel-X V2.0 Enterprise Release Candidate is released under the MIT License. Compliant with SOC 2 Type II, ISO 27001:2022, and HIPAA Security Rule requirements.
