# NetSentinel-X V2 Enterprise Evolution Roadmap

## Project Vision

**NetSentinel-X V2** is an Enterprise AI-powered Network Detection and Response (NDR), Security Operations Center (SOC), Threat Intelligence Fusion, and AI-assisted Investigation Platform.

---

## Current Project Status

- **Current Version**: NetSentinel-X V2.0 Enterprise
- **Current Era**: Era 11 — Interactive Attack Graph & Threat Path Visualization Engine
- **Era 11 Status**: ✅ Completed & Verified
- **Next Milestone**: Era 12 — Historical Investigation & Threat Hunting
- **Stability Status**: Production Checkpoint Verified. GitHub Actions CI/CD Pipeline 🟢 GREEN.

---

## Complete 16-Era Architecture Roadmap

### Era 1: Enterprise Experience & UI Modernization
- **Status**: ✅ Completed

### Era 2: AI Security Copilot
- **Status**: ✅ Completed

### Era 3: AI Threat Investigation Engine
- **Status**: ✅ Completed

### Era 4: Enterprise MITRE ATT&CK Intelligence Engine
- **Status**: ✅ Completed

### Era 5: Detection Engineering Studio (Sigma / YARA)
- **Status**: ✅ Completed

### Era 6: Enterprise Threat Intelligence Fusion Engine
- **Status**: ✅ Completed

### Era 7: Enterprise User & Entity Behaviour Analytics (UEBA) Engine
- **Status**: ✅ Completed

### Era 8: Enterprise AI Detection Optimizer & Coverage Studio
- **Status**: ✅ Completed

### Era 9: Enterprise AI Incident Management Desk
- **Status**: ✅ Completed

### Era 10: Enterprise Executive Reporting & Compliance Intelligence Engine
- **Status**: ✅ Completed

### Era 11: Interactive Attack Graph & Threat Path Visualization Engine
- **Status**: ✅ Completed
- **Objective**: Create an enterprise-grade visual attack graph engine correlating all NetSentinel-X intelligence sources — Threat Intelligence IOCs, Detection Rule triggers, UEBA anomalies, MITRE ATT&CK mappings, Incidents, and Investigation timelines — into an interactive security investigation graph.
- **Features**:
  - `AttackNode` types: External IP, Internal Host, Domain, Detection Rule, MITRE Technique, Incident, IOC
  - `AttackEdge` relationships: Connected To, Communicated With, Triggered, Detected By, Mapped To, Caused
  - AI Attack Path Reasoning: Root cause, attacker objective, affected assets, containment recommendations
  - Visual Topology Canvas with clickable node inspector
  - Step-by-step attack chain sequence display
  - Critical attack path risk scoring (0-100)
  - REST API group: `/api/v2/attack-graph/*`
- **Testing**: Frontend Jest component tests (`AttackGraph.test.tsx`), Go backend service & handler unit tests (`attack_graph_service_test.go`, `v2_attack_graph_handler_test.go`), ESLint & TypeScript verification.

### Era 12: Historical Investigation & Threat Hunting
- **Status**: ⏳ Scheduled
- **Objective**: Long-term historical threat pattern comparison and proactive threat hunting.
- **Features**: Historical trends (Yesterday vs Last week vs Last month), repeat attack detection, IP/Domain repetition analysis.

### Era 13: AI Workflow Automation
- **Status**: ⏳ Scheduled
- **Objective**: Autonomous SOC incident playbooks.
- **Features**: Automatic alert classification → IOC enrichment → timeline generation → report creation → suggested response.

### Era 14: Enterprise Observability
- **Status**: ⏳ Scheduled
- **Objective**: Full platform telemetry and health monitoring.
- **Features**: Audit logging, API metrics, Prometheus/Grafana endpoints, health dashboard.

### Era 15: Production Hardening & Scalability
- **Status**: ⏳ Scheduled
- **Objective**: Industrial-grade scalability and resilience.
- **Features**: Redis task queues, rate limiting, circuit breaker pattern, structured logging, feature flags.

### Era 16: Enterprise Validation, Performance Benchmarking & Release Candidate
- **Status**: ⏳ Scheduled
- **Objective**: Comprehensive test coverage, load benchmarking, and production release candidate packaging.
- **Features**: Unit/Integration tests, WebSocket stress testing, false positive benchmarks, database migration verification.
