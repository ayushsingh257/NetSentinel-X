# NetSentinel-X — AI-Powered Enterprise Network Detection & Response Platform

[![Enterprise CI/CD Pipeline](https://github.com/ayushsingh257/NetSentinel-X/actions/workflows/ci.yml/badge.svg)](https://github.com/ayushsingh257/NetSentinel-X/actions/workflows/ci.yml)
![Version](https://img.shields.io/badge/version-2.0.0--Enterprise-cyan)
![Go Version](https://img.shields.io/badge/go-1.22-blue)
![Next.js](https://img.shields.io/badge/next.js-16.2-black)
![Compliance](https://img.shields.io/badge/compliance-SOC2%20%7C%20ISO27001%20%7C%20HIPAA-emerald)

## Overview

**NetSentinel-X** is an enterprise-grade AI Security Operations Platform and Network Detection & Response (NDR) engine. Designed for modern SOC environments, NetSentinel-X combines real-time eBPF network telemetry, sub-millisecond Deep Packet Inspection (DPI), autonomous AI threat reasoning, multi-event threat investigations, MITRE ATT&CK matrix correlation, custom Sigma/YARA detection engineering, multi-provider threat intelligence fusion, User & Entity Behaviour Analytics (UEBA), continuous AI Detection Optimization, and an Enterprise AI Incident Management Desk into a unified, high-performance web platform.

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

### Era 5: Enterprise Detection Engineering Studio (Sigma / YARA)
- **Rule Lifecycle Engine (`backend/services/detection_engine_service.go`)**: Create, edit, delete, enable/disable, clone, version, test, and deploy custom detection rules.
- **Simulation Sandbox**: Interactive testing environment evaluating sample telemetry events against custom rule logic with latency benchmarking and confidence scoring.
- **AI Detection Assistant**: Generates Sigma/YARA rules, optimizes thresholds, reduces false positives, and suggests MITRE ATT&CK technique mappings.
- **Detection Studio Panel (`frontend/components/DetectionStudio.tsx`)**: Unified rule management table, rule authoring modal, interactive simulation sandbox, and detection analytics banner.

### Era 6: Enterprise Threat Intelligence Fusion Engine
- **Multi-Provider Aggregation (`backend/services/threat_intelligence_fusion_service.go`)**: Modular connectors for VirusTotal, AlienVault OTX, AbuseIPDB, GreyNoise, Shodan, Censys, IPinfo, and WHOIS.
- **Async IOC Enrichment Engine**: Non-blocking background worker lookups for IP addresses, domains, URLs, hashes, and certificates.
- **Composite Reputation Scoring**: Unified risk score (0-100), risk levels, confidence ratings, and provider breakdown matrix.
- **Threat Intelligence Panel (`frontend/components/ThreatIntelFusion.tsx`)**: Interactive IOC search bar, provider matrix grid, AI intelligence reasoning, and recommended response actions.

### Era 7: Enterprise User & Entity Behaviour Analytics (UEBA)
- **Baseline Profiler & Anomaly Engine (`backend/services/ueba_service.go`)**: Learns baseline connection rates, packet volumes, and protocol maps per host/user. Detects anomalies across Beaconing, Port Scanning, Brute Force, Lateral Movement, Data Exfiltration, and DNS Tunneling.
- **UEBA REST API (`/api/v2/ueba`, `/api/v2/ueba/entities`, `/api/v2/ueba/anomalies`, `/api/v2/ueba/risk/:entity`, `/api/v2/ueba/history`)**: Provides entity profile management, anomaly history logs, and risk scores.
- **UEBA Analytics Dashboard (`frontend/components/UEBAAnalytics.tsx`)**: Entity Risk Leaderboard grid, Behaviour Anomaly Timeline, baseline profile inspector, and AI Behaviour Deviation Reasoning.

### Era 8: Enterprise AI Detection Optimizer & Coverage Studio
- **Performance Analytics & Tuning (`backend/services/detection_optimizer_service.go`)**: Evaluates rule execution counts, true/false positive ratios, severity accuracy, and response latency into a 0-100 Performance Score.
- **AI False Positive Reduction Engine**: Analyzes alert history, entity behavior, threat intelligence, and UEBA scores to produce actionable rule tuning recommendations.
- **ATT&CK Coverage Gap Identification**: Cross-references active detection rules against MITRE ATT&CK 12 tactics and flags unmonitored technique gaps with recommended rule logic templates.
- **Analyst Feedback Loop (`/api/v2/optimizer/feedback`)**: Allows analysts to record True Positive / False Positive verdicts to continuously refine AI recommendation accuracy.
- **Optimizer Dashboard Panel (`frontend/components/AIDetectionOptimizer.tsx`)**: Rule Health Leaderboard, AI Tuning Recommendations cards, ATT&CK Coverage Gaps matrix, and Analyst Feedback Modal.

### Era 9: Enterprise AI Incident Management Desk
- **Incident Lifecycle Management (`backend/services/incident_service.go`)**: Tracks complete incident status transitions (NEW, TRIAGED, INVESTIGATING, CONTAINMENT, ERADICATION, RECOVERY, CLOSED), evidence attachments, analyst assignments, and resolution notes.
- **SLA Tracking Engine (`models/incident.go`)**: Enforces target response and resolution times for P1-P4 severity incidents (15m P1 target vs 60m resolution target).
- **Incident REST API (`/api/v2/incidents/*`)**: Handles case creation, evidence locker attachments, chronological timeline logs, assignment updates, and resolution closure.
- **Incident Desk Interface (`frontend/components/AIIncidentDesk.tsx`)**: Filterable incident work queue, Case Inspector timeline viewer, Evidence Locker, New Incident modal, and Resolution Notes modal.

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
5. **Era 5 (Completed)**: Detection Engineering Studio (Sigma/YARA-inspired custom rules) ✅
6. **Era 6 (Completed)**: Threat Intelligence Fusion (VirusTotal, OTX, AbuseIPDB, GreyNoise, Shodan, Censys, etc.) ✅
7. **Era 7 (Completed)**: UEBA & Behaviour Analytics (Anomaly scoring for host beaconing & lateral movement) ✅
8. **Era 8 (Completed)**: AI Detection Optimizer (False positive reduction, rule tuning & coverage gap analysis) ✅
9. **Era 9 (Completed)**: AI Incident Management Desk (End-to-end incident response lifecycle & SLA tracking) ✅
10. **Era 10 (Next)**: Executive Reporting & Compliance (SOC 2, ISO 27001, HIPAA automated PDF/HTML/MD reports)
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
- **Current Era**: Era 9 Completed ✅
- **CI Status**: GitHub Actions Pipeline Verified 🟢
- **Next Era**: Era 10 — Executive Reporting & Compliance
