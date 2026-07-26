# NetSentinel-X — AI-Powered Enterprise Network Detection & Response Platform

[![Enterprise CI/CD Pipeline](https://github.com/ayushsingh257/NetSentinel-X/actions/workflows/ci.yml/badge.svg)](https://github.com/ayushsingh257/NetSentinel-X/actions/workflows/ci.yml)
![Version](https://img.shields.io/badge/version-2.0.0--Enterprise-cyan)
![Go Version](https://img.shields.io/badge/go-1.22-blue)
![Next.js](https://img.shields.io/badge/next.js-16.2-black)
![Compliance](https://img.shields.io/badge/compliance-SOC2%20%7C%20ISO27001%20%7C%20HIPAA-emerald)

## Overview

**NetSentinel-X** is an enterprise-grade AI Security Operations Platform and Network Detection & Response (NDR) engine. Designed for modern SOC environments, NetSentinel-X combines real-time eBPF network telemetry, sub-millisecond Deep Packet Inspection (DPI), autonomous AI threat reasoning, multi-event threat investigations, MITRE ATT&CK matrix correlation, and automated incident response workflows into a unified, high-performance web platform.

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

---

## Completed Eras

### Era 1: Enterprise UI & Experience Modernization
- **Enterprise Landing Page (`/`)**: Animated hero section, live telemetry ticker, interactive core capability tabs, 5-stage architecture workflow diagram, and onboarding guide.
- **Operational SOC Dashboard (`/dashboard`)**: Preserved existing real-time monitoring interface with 100% backward compatibility.
- **Flickering Enterprise Footer**: Integrated component with compliance badges (**SOC 2 Type II**, **ISO 27001**, **HIPAA Compliant**), live DPI status indicator, and architecture links.
- **Modernized Responsive Navbar**: Header with live telemetry badge, section navigation, mobile drawer, and launch CTA buttons.
- **Error & Loading Boundaries**: Added custom SOC-themed `app/not-found.tsx` (404) and `app/error.tsx` (500) error pages.

### Era 2: AI Security Copilot & RAG Reasoning
- **AI Copilot Service (`backend/services/ai_copilot_service.go`)**: RAG-based context retrieval engine correlating live packets, threat alerts, GeoIP scores, and MITRE tactics.
- **Copilot V2 REST API (`/api/v2/copilot/query` & `/api/v2/copilot/prompts`)**: Handles natural language queries ("Explain this packet", "Why is this alert suspicious?", "Summarize last 24 hours", "Show affected assets", "Map threat to MITRE").
- **Copilot UI Drawer Component (`frontend/components/AICopilot.tsx`)**: Interactive chat interface with preset prompt shortcuts, confidence scoring, evidence cards, and recommended response steps.

### Era 3: AI Threat Investigation Engine & Story Generator
- **Threat Investigation Model & Service (`backend/models/investigation.go` & `backend/services/threat_investigation_service.go`)**: Multi-event correlation engine aggregating alerts, traffic logs, DNS/TLS metadata, GeoIP scoring, and IOC matches into full incident cases.
- **Investigation REST API (`/api/v2/investigations` & `/api/v2/investigations/generate`)**: Provides case listing, detailed investigation retrieval, and target IP threat story generation.
- **Threat Investigation Interface (`frontend/components/ThreatInvestigation.tsx`)**: Interactive SOC panel rendering automated threat stories, 4-step correlated attack timelines, telemetry evidence records, root cause analyses, and recommended response actions.

### Era 4: Enterprise MITRE ATT&CK Intelligence & Correlation Engine
- **MITRE Knowledge Base & Service (`backend/models/mitre.go` & `backend/services/mitre_service.go`)**: Complete coverage across 12 Enterprise ATT&CK Tactics (Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, Command & Control, Exfiltration, Impact).
- **MITRE V2 REST API (`/api/v2/mitre/matrix`, `/api/v2/mitre/statistics`, `/api/v2/mitre/heatmap`, `/api/v2/mitre/explain`)**: Provides matrix grid payloads, search endpoints, threat heat map data, and AI technique reasoning.
- **Enterprise ATT&CK Intelligence Panel (`frontend/components/MITREIntelligence.tsx`)**: Interactive 12-tactic grid, real-time threat heat map, technique modal with AI explanations, affected host lists, risk scores, and mitigation guidance.

---

## MITRE ATT&CK Architecture & Heat Map

```
  [ Packet Telemetry / Alerts / Threat Stories ] ──► [ Automatic ATT&CK Mapping Engine ]
                                                              │
                 ┌────────────────────────────────────────────┴────────────────────────────────────────────┐
                 ▼                                            ▼                                            ▼
     [ Interactive 12-Tactic Grid ]              [ Real-Time Threat Heat Map ]              [ AI ATT&CK Reasoning & Mitigation KB ]
                 │                                            │                                            │
                 └────────────────────────────────────────────┼────────────────────────────────────────────┘
                                                              ▼
                                          [ SOC Dashboard ATT&CK Panel ]
```

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
2. **Era 2 (Completed)**: AI Security Copilot (RAG-based threat reasoning over live packets & alerts) ✅
3. **Era 3 (Completed)**: AI Threat Investigation Engine & Attack Story Generator ✅
4. **Era 4 (Completed)**: Enterprise MITRE ATT&CK Intelligence Engine ✅
5. **Era 5 (Next)**: Detection Engineering Studio (Sigma/YARA-inspired custom rule authoring & sandbox)
6. **Era 6**: Threat Intelligence Fusion (VirusTotal, OTX, AbuseIPDB, GreyNoise, Shodan, Censys)
7. **Era 7**: UEBA & Behaviour Analytics (Anomaly scoring for host beaconing & lateral movement)
8. **Era 8**: AI Detection Optimizer (False positive reduction & rule tuning)
9. **Era 9**: AI Incident Management Desk (End-to-end incident response lifecycle & SLA tracking)
10. **Era 10**: Executive Reporting & Compliance (SOC 2, ISO 27001, HIPAA automated PDF/HTML/MD reports)
11. **Era 11**: Interactive Attack Graph (Visual topology canvas & attack chain pathing)
12. **Era 12**: Historical Investigation & Threat Hunting (Long-term trend comparison & repeat attack detection)
13. **Era 13**: AI Workflow Automation (Autonomous SOC incident playbooks)
14. **Era 14**: Enterprise Observability (Audit logs, Prometheus/Grafana metrics, health monitoring)
15. **Era 15**: Production Hardening & Scalability (Redis task queues, circuit breakers, rate limiting)
16. **Era 16**: Enterprise Validation, Performance Benchmarking & Release Candidate

---

## Testing & Quality Engineering

NetSentinel-X enforces a strict 9-step production lifecycle verified via **GitHub Actions CI/CD**:

### Frontend CI Validation
- **TypeScript**: `npx tsc --noEmit`
- **Linter**: `npm run lint` (ESLint 9 core web vitals)
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
- **Current Era**: Era 4 Completed ✅
- **CI Status**: GitHub Actions Pipeline Verified 🟢
- **Next Era**: Era 5 — Detection Engineering Studio (Sigma/YARA)
