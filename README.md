# NetSentinel-X V2 — AI-Powered Enterprise Network Detection & Response Platform

[![Enterprise CI/CD Pipeline](https://github.com/ayushsingh257/NetSentinel-X/actions/workflows/ci.yml/badge.svg)](https://github.com/ayushsingh257/NetSentinel-X/actions/workflows/ci.yml)
![Version](https://img.shields.io/badge/version-v2.0.0--rc1-cyan)
![Release Candidate](https://img.shields.io/badge/status-Enterprise%20Release%20Candidate-emerald)
![Go Version](https://img.shields.io/badge/go-1.22-blue)
![Next.js](https://img.shields.io/badge/next.js-16.2-black)
![Compliance](https://img.shields.io/badge/compliance-SOC2%20%7C%20ISO27001%20%7C%20HIPAA-emerald)

## Overview

**NetSentinel-X V2** is an enterprise-grade AI Security Operations Platform and Network Detection & Response (NDR) engine. Built for modern SOC environments, NetSentinel-X combines real-time eBPF network telemetry, Deep Packet Inspection (DPI), autonomous AI threat reasoning, multi-event threat investigations, MITRE ATT&CK matrix correlation, custom Sigma/YARA detection engineering, multi-provider threat intelligence fusion, User & Entity Behaviour Analytics (UEBA), continuous AI Detection Optimization, an Enterprise AI Incident Management Desk, Executive Reporting & Compliance Intelligence, an Interactive Attack Graph, an AI Threat Hunting Workspace, an Autonomous SOAR Playbook Engine, an Observability & Health Engine, and an Enterprise Security Hardening Layer into a unified platform.

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
         +-------------------+-------------------+-------------------+-------------------+
         |                   |                   |                   |                   |
         v                   v                   v                   v                   v
+-----------------+ +-----------------+ +-----------------+ +-----------------+ +-----------------+
| Packet Telemetry| | Threat Intel    | | UEBA & Anomaly  | | AI Investigation| | SOAR Playbook   |
| Engine (DPI)    | | Fusion Engine   | | Analytics       | | Copilot (RAG)   | | Engine          |
+-----------------+ +-----------------+ +-----------------+ +-----------------+ +-----------------+
```

---

## Platform Features

- **Deep Packet Inspection (DPI)**: High-throughput packet parsing for Ethernet, IP, TCP, UDP, DNS, HTTP, and TLS headers.
- **Real-time Streaming**: Zero-latency WebSocket pipeline streaming live network telemetry directly to the SOC interface.
- **AI Security Copilot (RAG Powered)**: Autonomous AI assistant providing context-aware threat reasoning, natural language packet explanations, evidence collection, and MITRE mapping.
- **AI Threat Investigation Engine**: Automated correlation converting individual alerts into full attack stories, visual timeline sequences, root cause analyses, and evidence records.
- **Enterprise MITRE ATT&CK Intelligence Engine**: Interactive 12-tactic ATT&CK Matrix grid, real-time Threat Heat Map, automatic multi-protocol technique mapping, AI ATT&CK reasoning, and defensive mitigation knowledge base.
- **Detection Engineering Studio**: Complete lifecycle for custom Sigma & YARA inspired detection rules, interactive Simulation Sandbox, rule validation, and AI Rule Assistant.
- **Enterprise Threat Intelligence Fusion Engine**: Multi-provider threat intelligence aggregation across 8 providers (VirusTotal, AlienVault OTX, AbuseIPDB, GreyNoise, Shodan, Censys, IPinfo, WHOIS), composite reputation scoring, and async IOC enrichment.
- **User & Entity Behaviour Analytics (UEBA)**: Statistical baseline profiling per host/user/IP/domain, anomaly scoring across 6 threat vectors (Beaconing, Port Scanning, Brute Force, Lateral Movement, Data Exfiltration, DNS Tunneling), Entity Risk Leaderboard, and AI Behaviour Deviation Reasoning.
- **AI Detection Optimizer & Coverage Studio**: Rule Quality Scoring (0-100), AI False Positive Reduction recommendations, ATT&CK Coverage Gap identification, and Analyst Learning Feedback loop.
- **AI Incident Management Desk**: End-to-end incident lifecycle management (NEW, TRIAGED, INVESTIGATING, CONTAINMENT, ERADICATION, RECOVERY, CLOSED), evidence locker, response SLA tracking (P1-P4), and resolution workflows.
- **Executive Reporting & Compliance Intelligence Engine**: CISO-level security summary generation, business impact analysis, SOC 2 / ISO 27001 / HIPAA audit mapping, and one-click PDF/HTML/Markdown/JSON exports.
- **Interactive Attack Graph & Threat Path Visualization Engine**: Dynamic graph topology correlating External IPs, Internal Hosts, Domains, Detection Rules, MITRE Techniques, and Incidents into visual attack chains with AI-powered path reasoning and containment recommendations.
- **Historical Investigation & AI Threat Hunting Engine**: Proactive threat hunting workspace enabling historical security event search, IOC timeline tracking across 4 types (IP, Domain, Hash, URL), natural language AI hunt queries, hypothesis generation with confidence scoring, and interactive Attack Replay timeline.
- **AI Workflow Automation & Autonomous SOAR Playbook Engine**: Configurable SOAR workflow engine, automated playbook execution, AI-driven playbook generation per threat category, action orchestration, execution audit history, and manual analyst approval queue.
- **Enterprise Observability & System Health Engine**: Self-observing security platform monitoring 8 core services with 0-100 Platform Health Score calculation, centralized immutable Audit Logging across 8 event categories with CSV export, and real-time API latency & security platform metrics tracking.
- **Enterprise Security Hardening & Production Readiness Layer**: 7-Role Granular RBAC (`SUPER_ADMIN`, `SOC_ADMIN`, `SECURITY_ANALYST`, `THREAT_HUNTER`, `DETECTION_ENGINEER`, `AUDITOR`, `VIEW_ONLY`) mapped to 10 strict permission flags, 100 req/min Rate Limiting middleware, security headers (`CSP`, `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`), active session tracking & instant revocation, 0-secrets in source code architecture, and Docker production stack (`docker-compose.production.yml`).
- **Enterprise Demonstration Simulator**: Built-in Attack Scenario Loader injecting realistic multi-vector attack streams (C2 Beaconing, Credential Stuffing, Data Exfiltration) for SOC live demonstration.

---

## 16 Evolution Eras Roadmap (Completed ✅)

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
