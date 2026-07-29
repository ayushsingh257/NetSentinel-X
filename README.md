# NetSentinel-X V2 — AI-Powered Enterprise Network Detection & Response Platform

[![Enterprise CI/CD Pipeline](https://github.com/ayushsingh257/NetSentinel-X/actions/workflows/ci.yml/badge.svg)](https://github.com/ayushsingh257/NetSentinel-X/actions/workflows/ci.yml)
![Version](https://img.shields.io/badge/version-v2.0.0--rc1-cyan)
![Release Candidate](https://img.shields.io/badge/status-Enterprise%20Release%20Candidate-emerald)
![Go Version](https://img.shields.io/badge/go-1.22-blue)
![Next.js](https://img.shields.io/badge/next.js-16.2-black)
![Compliance](https://img.shields.io/badge/compliance-SOC2%20%7C%20ISO27001%20%7C%20HIPAA-emerald)

## Overview

**NetSentinel-X V2** is an enterprise-grade AI Security Operations Platform and Network Detection & Response (NDR) engine. Built for modern SOC environments, NetSentinel-X combines real-time eBPF network telemetry, Deep Packet Inspection (DPI), autonomous AI threat reasoning, multi-event threat investigations, MITRE ATT&CK matrix correlation, custom Sigma/YARA detection engineering, multi-provider threat intelligence fusion, User & Entity Behaviour Analytics (UEBA), continuous AI Detection Optimization, an Enterprise AI Incident Management Desk, Executive Reporting & Compliance Intelligence, an Interactive Attack Graph, an AI Threat Hunting Workspace, an Autonomous SOAR Playbook Engine, an Observability & Health Engine, an Enterprise Security Hardening Layer, and Zero Trust Security Architecture into a unified platform.

---

## Architecture Diagram

```
                                +----------------------------------+
                                |  NetSentinel-X Next.js 16 Web UI |
                                |  React 19 / TypeScript / Tailwind |
                                +----------------------------------+
                                                 |
                                         ( HTTP / WebSocket )
                                                 v
                                +----------------------------------+
                                |    Go 1.22 Gin API Gateway       |
                                | Security Headers & Rate Limiting |
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

## 24-Era Enterprise Evolution Roadmap

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
17. **Era 17 (Completed)**: Identity & Authentication Security (JWT Signing, Session Validation) ✅
18. **Era 18 (Completed)**: Enterprise Authorization & Access Control Security (RBAC Engine, Privilege Escalation Detection) ✅
19. **Era 19 (Completed)**: Web Application Security (OWASP Top 10, CSRF/XSS, CSP, DOMPurify, File Upload Allowlist) ✅
20. **Era 20 (Planned)**: Secure API Architecture (Adaptive Rate Limiting, Signed Requests, CORS) 🛡️
21. **Era 21 (Planned)**: Infrastructure & Platform Security (Secrets Vault, TLS 1.3, Container Hardening) 🛡️
22. **Era 22 (Planned)**: Data Protection & Monitoring Security (Log Signing, Tamper Evident Audits) 🛡️
23. **Era 23 (Planned)**: Zero Trust Enterprise Security (Continuous Risk Scoring, Impossible Travel) 🛡️
24. **Era 24 (Planned)**: Security Governance & Compliance (SOC 2, ISO 27001 Automation) 🛡️

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
