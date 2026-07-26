# NetSentinel-X — AI-Powered Enterprise Network Detection & Response Platform

[![Enterprise CI/CD Pipeline](https://github.com/ayushsingh257/NetSentinel-X/actions/workflows/ci.yml/badge.svg)](https://github.com/ayushsingh257/NetSentinel-X/actions/workflows/ci.yml)
![Version](https://img.shields.io/badge/version-2.0.0--Enterprise-cyan)
![Go Version](https://img.shields.io/badge/go-1.22-blue)
![Next.js](https://img.shields.io/badge/next.js-16.2-black)
![Compliance](https://img.shields.io/badge/compliance-SOC2%20%7C%20ISO27001%20%7C%20HIPAA-emerald)

## Overview

**NetSentinel-X** is an enterprise-grade AI Security Operations Platform and Network Detection & Response (NDR) engine. Designed for modern SOC environments, NetSentinel-X combines real-time eBPF network telemetry, sub-millisecond Deep Packet Inspection (DPI), autonomous AI threat reasoning, MITRE ATT&CK mapping, and automated incident response workflows into a unified, high-performance web platform.

---

## Current Capabilities

- **Deep Packet Inspection (DPI)**: High-throughput packet parsing for Ethernet, IP, TCP, UDP, DNS, HTTP, and TLS headers.
- **Real-time Streaming**: Zero-latency WebSocket pipeline streaming live network telemetry directly to the SOC interface.
- **Threat Detection Engine**: Automated rule execution identifying port scans, SYN floods, brute force attempts, and anomalous protocol behavior.
- **GeoIP & Threat Intelligence**: IP geolocational metadata enrichment and IOC correlation scoring.
- **Protocol Inspection**: Deep payload inspection for DNS queries, HTTP headers, and TLS handshake SNI attributes.
- **SOC Operations Center**: Interactive dashboard featuring real-time packet metrics, threat feeds, alert feeds, and timeline logs.

---

## Era 1 Completed Features

### Enterprise UI & Experience Modernization
- **Enterprise Landing Page (`/`)**: Animated hero section, live telemetry ticker, interactive core capability tabs, 5-stage architecture workflow diagram, and onboarding guide.
- **Operational SOC Dashboard (`/dashboard`)**: Preserved existing real-time monitoring interface with 100% backward compatibility.
- **Flickering Enterprise Footer**: Integrated component with compliance badges (**SOC 2 Type II**, **ISO 27001**, **HIPAA Compliant**), live DPI status indicator, and architecture links.
- **Modernized Responsive Navbar**: Header with live telemetry badge, section navigation, mobile drawer, and launch CTA buttons.
- **Error & Loading Boundaries**: Added custom SOC-themed `app/not-found.tsx` (404) and `app/error.tsx` (500) error pages.

---

## System Architecture

```
                                  [ Network Traffic ]
                                           │
                                           ▼
                                [ eBPF Packet Monitor ]
                                           │
                                           ▼
                             [ Go DPI Engine (Gin Server) ]
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
             [ Threat Intel Fusion ]               [ WebSocket Broadcast ]
                        │                                     │
                        ▼                                     ▼
            [ AI Reasoning & RAG ]                 [ Next.js SOC Dashboard ]
                        │                                     │
                        └──────────────────┬──────────────────┘
                                           ▼
                             [ Automated SOC Response ]
```

### Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Radix UI.
- **Backend**: Go 1.22, Gin Web Framework, Gorilla WebSockets, `gopacket/pcap`.
- **Database**: PostgreSQL with GORM.
- **Infrastructure**: Docker, Docker Compose.
- **Security**: JWT Authentication, Role-Based Access Control (RBAC).

---

## AI & Engineering Roadmap

NetSentinel-X V2 evolves through 16 structured production Eras:

1. **Era 1 (Completed)**: Enterprise Experience & UI Modernization ✅
2. **Era 2 (Next)**: AI Security Copilot (RAG-based threat reasoning over live packets & alerts)
3. **Era 3**: AI Threat Investigation Engine & Attack Story Generator
4. **Era 4**: MITRE ATT&CK Mapping & Intelligence Matrix Grid
5. **Era 5**: Detection Engineering Studio (Sigma & YARA Rule Authoring)
6. **Era 6**: Threat Intelligence Fusion (VirusTotal, OTX, AbuseIPDB, GreyNoise, Shodan)
7. **Era 7**: UEBA Behaviour Analytics & Anomaly Scoring
8. **Era 8**: AI Detection Optimizer & False Positive Reduction
9. **Era 9**: AI Incident Response Management Desk
10. **Era 10**: Security Report Generator (Executive, SOC Daily, Incident Reports in PDF/MD/HTML)
11. **Era 11**: Interactive Network Attack Topology Graph
12. **Era 12**: Historical Investigation & Trend Analysis
13. **Era 13**: AI SOC Workflow Playbook Automation
14. **Era 14**: Enterprise Observability (Prometheus, Grafana, Audit Logs)
15. **Era 15**: Production Hardening (Redis Queues, Circuit Breakers, Rate Limiting)
16. **Era 16**: Enterprise Testing & Load Benchmarking

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

### Security Validation
- Dependency vulnerability scans (`npm audit`).
- Secret scanning and role-based access verification.

---

## Current Development Status

- **Current Version**: NetSentinel-X V2.0 Enterprise
- **Current Era**: Era 1 Completed ✅
- **CI Status**: GitHub Actions Pipeline Verified 🟢
- **Next Era**: Era 2 — AI Security Copilot
