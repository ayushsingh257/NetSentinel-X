# NetSentinel-X — AI-Powered Enterprise Network Detection & Response Platform

[![Enterprise CI/CD Pipeline](https://github.com/ayushsingh257/NetSentinel-X/actions/workflows/ci.yml/badge.svg)](https://github.com/ayushsingh257/NetSentinel-X/actions/workflows/ci.yml)
![Version](https://img.shields.io/badge/version-2.0.0--Enterprise-cyan)
![Go Version](https://img.shields.io/badge/go-1.22-blue)
![Next.js](https://img.shields.io/badge/next.js-16.2-black)
![Compliance](https://img.shields.io/badge/compliance-SOC2%20%7C%20ISO27001%20%7C%20HIPAA-emerald)

## Overview

**NetSentinel-X** is an enterprise-grade AI Security Operations Platform and Network Detection & Response (NDR) engine. Designed for modern SOC environments, NetSentinel-X combines real-time eBPF network telemetry, sub-millisecond Deep Packet Inspection (DPI), autonomous AI threat reasoning, multi-event threat investigations, MITRE ATT&CK matrix correlation, custom Sigma/YARA detection engineering, multi-provider threat intelligence fusion, User & Entity Behaviour Analytics (UEBA), continuous AI Detection Optimization, an Enterprise AI Incident Management Desk, AI Executive Reporting & Compliance Intelligence, an Interactive Attack Graph & Threat Path Visualization Engine, and an AI Threat Hunting & Historical Investigation Engine into a unified, high-performance web platform.

---

## Current Capabilities

- **Deep Packet Inspection (DPI)**: High-throughput packet parsing for Ethernet, IP, TCP, UDP, DNS, HTTP, and TLS headers.
- **Real-time Streaming**: Zero-latency WebSocket pipeline streaming live network telemetry directly to the SOC interface.
- **Threat Detection Engine**: Automated rule execution identifying port scans, SYN floods, brute force attempts, and anomalous protocol behavior.
- **GeoIP & Threat Intelligence**: IP geolocational metadata enrichment and IOC correlation scoring.
- **Protocol Inspection**: Deep payload inspection for DNS queries, HTTP headers, and TLS handshake SNI attributes.
- **SOC Operations Center**: Interactive dashboard featuring real-time packet metrics, threat feeds, alert feeds, and timeline logs.
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
- **Historical Investigation & AI Threat Hunting Engine**: Proactive threat hunting workspace enabling historical security event search, IOC timeline tracking across 4 types (IP, Domain, Hash, URL), natural language AI hunt queries (e.g., "Find all C2 beaconing events"), hypothesis generation with confidence scoring, and interactive Attack Replay timeline for full incident reconstruction.

---

## Completed Eras

### Era 1: Enterprise UI & Experience Modernization
- Enterprise Landing Page, Flickering Footer with compliance badges, SOC Dashboard, Navbar, error boundaries.

### Era 2: AI Security Copilot & RAG Reasoning
- RAG-based context retrieval over live packets, alerts, GeoIP scores, and MITRE tactics. Natural language query interface.

### Era 3: AI Threat Investigation Engine & Story Generator
- Multi-event correlation engine producing full attack narratives, timelines, root cause analysis, and response actions.

### Era 4: Enterprise MITRE ATT&CK Intelligence & Correlation Engine
- Complete 12-tactic ATT&CK grid, real-time heat map, AI technique reasoning, and defensive mitigation knowledge base.

### Era 5: Detection Engineering Studio (Sigma / YARA)
- Full rule lifecycle management, interactive simulation sandbox, AI Rule Assistant, and detection analytics.

### Era 6: Enterprise Threat Intelligence Fusion Engine
- Async IOC enrichment across 8 providers with composite reputation scoring and AI IOC reasoning.

### Era 7: Enterprise User & Entity Behaviour Analytics (UEBA)
- Baseline profiling, 6-vector anomaly detection, Entity Risk Leaderboard, AI Behaviour Deviation Reasoning.

### Era 8: Enterprise AI Detection Optimizer & Coverage Studio
- Rule health scoring, AI false positive tuning, ATT&CK gap analysis, and analyst feedback loop.

### Era 9: Enterprise AI Incident Management Desk
- Full 7-state incident lifecycle, evidence locker, P1-P4 SLA tracking, and resolution workflows.

### Era 10: Enterprise Executive Reporting & Compliance Intelligence Engine
- CISO executive summaries, SOC 2 / ISO 27001 / HIPAA compliance audit mapping, and one-click exports.

### Era 11: Interactive Attack Graph & Threat Path Visualization Engine
- **Attack Graph Correlation Engine**: Correlates Threat Intelligence IOCs, Detection Rule triggers, UEBA anomalies, MITRE ATT&CK mappings, Incident cases, and Investigation timelines into a unified entity relationship graph.
- **Graph Data Models (`backend/models/attack_graph.go`)**: Defined `AttackNode` (External IP, Internal Host, Domain, Detection Rule, MITRE Technique, Incident), `AttackEdge` (Connected To, Communicated With, Triggered, Detected By, Mapped To, Caused), `AttackPath`, and `AttackGraphPayload`.
- **Attack Graph REST API (`/api/v2/attack-graph/*`)**: Exposes graph nodes, edges, critical attack paths, and AI path reasoning endpoints.
- **Interactive Graph UI (`frontend/components/AttackGraph.tsx`)**: Visual Topology Canvas with clickable node inspector, step-by-step attack chain sequence display, AI root cause analysis, attacker objective reasoning, and recommended containment actions.

### Era 12: Historical Investigation & AI Threat Hunting Engine
- **Historical Event Storage (`backend/models/threat_history.go`)**: Data models for `HistoricalEvent` (6 event types: TRAFFIC, ALERT, IOC_MATCH, UEBA_ANOMALY, DETECTION, INCIDENT), `IOCHistory` (first/last seen, risk trend, related campaigns), `AttackReplayEvent`, and `ThreatHuntResult`.
- **Historical Investigation Service (`backend/services/historical_investigation_service.go`)**: Full-text search across historical events by IP, domain, MITRE technique, protocol, or event type; IOC history tracking with risk trend analysis; 5-step attack replay chain generation; and AI natural language threat hunt query processing with confidence scoring.
- **Historical Investigation REST API (`/api/v2/history/*`, `/api/v2/hunting/*`)**: Endpoints for event search, IOC history lookup, attack replay retrieval, AI hunt query execution, and hypothesis generation.
- **Threat Hunting Workspace UI (`frontend/components/ThreatHuntingWorkspace.tsx`)**: Three-tab workspace — Event History (searchable historical event table), AI Hunt (natural language threat hunting with hypothesis panel, evidence correlation, and investigation steps), and Attack Replay (step-by-step attack chain reconstruction timeline).

---

## API Reference

### Legacy V1 Endpoints
- `GET /health` — System health check
- `GET /analytics` — Real-time telemetry statistics
- `GET /traffic` — Live packet logs
- `GET /alerts` — Security alert feed
- `GET /ws` — WebSocket stream
- `POST /login` — Authentication

### V2 Enterprise Endpoints

**AI Copilot**: `POST /api/v2/copilot/query`  
**Investigations**: `GET/POST /api/v2/investigations`  
**MITRE**: `GET /api/v2/mitre/matrix`, `GET /api/v2/mitre/heatmap`  
**Detections**: `GET/POST /api/v2/detections/rules`, `POST /api/v2/detections/simulate`  
**Intelligence**: `GET /api/v2/intelligence/ioc/:value`, `POST /api/v2/intelligence/enrich`  
**UEBA**: `GET /api/v2/ueba`, `GET /api/v2/ueba/entities`  
**Optimizer**: `GET /api/v2/optimizer`, `POST /api/v2/optimizer/feedback`  
**Incidents**: `GET /api/v2/incidents/list`, `POST /api/v2/incidents/create`  
**Reports**: `POST /api/v2/reports/generate`, `GET /api/v2/compliance`  
**Attack Graph**: `GET /api/v2/attack-graph`, `GET /api/v2/attack-graph/path/:id`  
**History**: `GET /api/v2/history/search`, `GET /api/v2/history/ioc/:value`, `GET /api/v2/history/replay/:id`  
**Hunting**: `POST /api/v2/hunting/query`, `GET /api/v2/hunting/hypothesis`

---

## System Architecture

### Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Radix UI.
- **Backend**: Go 1.22, Gin Web Framework, Gorilla WebSockets, `gopacket/pcap`.
- **Database**: PostgreSQL with standard SQL driver.
- **Infrastructure**: Docker, Docker Compose.
- **Security**: JWT Authentication, Role-Based Access Control (RBAC).

---

## AI & Engineering Roadmap

NetSentinel-X V2 evolves through 16 structured production Eras:

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
13. **Era 13 (Next)**: AI Workflow Automation (Autonomous SOC Playbooks)
14. **Era 14**: Enterprise Observability (Audit logs, Prometheus/Grafana)
15. **Era 15**: Production Hardening & Scalability (Redis, circuit breakers)
16. **Era 16**: Enterprise Validation, Benchmarking & Release Candidate

---

## Testing & Quality Engineering

### Frontend CI Validation
- **TypeScript**: `npx tsc --noEmit`
- **Linter**: `npm run lint`
- **Unit Tests**: `npm test` (Jest + React Testing Library)
- **Production Build**: `npm run build` (Turbopack)

### Backend CI Validation
- **Formatting**: `gofmt -s -l .`
- **Static Analysis**: `go vet ./...`
- **Unit Tests**: `go test -v ./...`
- **Compilation**: `go build -v ./...`

---

## Current Development Status

- **Current Version**: NetSentinel-X V2.0 Enterprise
- **Current Era**: Era 12 Completed ✅
- **CI Status**: GitHub Actions Pipeline Verified 🟢
- **Next Era**: Era 13 — AI Workflow Automation (Autonomous SOC Playbooks)
