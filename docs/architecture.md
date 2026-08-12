# NetSentinel-X V2 — Enterprise Architecture Reference 🏛️

## System Architecture

NetSentinel-X V2 is an enterprise-grade Network Detection & Response (NDR) and Security Information & Event Management (SIEM) platform designed for autonomous threat analysis, event-driven streaming, and horizontal multi-region cloud scaling.

```
                    Global Cloud Load Balancer (HTTPS/TLS)
                                    │
                                    ▼
                     Kubernetes Ingress Controller
                       (netsentinel.example.com)
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
Backend Pod Replicas (Go Engine)                      Frontend Edge CDN
(HPA Scaled: Min 3, Max 20 Replicas)                   (Next.js Turbopack)
         │
         ├──► NATS JetStream Event Stream Cluster (Pub/Sub & Event Workers)
         ├──► Redis 7 (Session Cache, Deduplication & Sliding Window Rate Limiting)
         ├──► PostgreSQL 16 (Relational Entity Persistence, SOAR, Audit Chains)
         ├──► ClickHouse (High-Throughput Columnar Security Event Analytics)
         ├──► Autonomous AI Security Engine (Provider-Agnostic SOC Analyst)
         └──► Autonomous SOAR Playbook Engine (Approval Gates & Forensic Auditing)
```

## Core Subsystems

### 1. High-Speed Deep Packet Inspection (DPI)
- Ingests raw network traffic via PCAP/eBPF interfaces.
- Extracts Layer 3/4/7 protocol metadata in real time.
- Sigma rule and YARA pattern matching with sub-millisecond evaluation latency.

### 2. Event-Driven Messaging Bus (`backend/services/event_bus.go`)
- Modular NATS JetStream & in-memory ring buffer.
- At-least-once delivery guarantees with Dead Letter Queue (DLQ) retry handlers.
- Worker pool orchestration processing security event streams asynchronously.

### 3. AI Autonomous SOC Analyst (`backend/ai/`)
- Provider-agnostic interface (`AIModelProvider`) supporting OpenAI, Google Gemini, Anthropic Claude, and local Ollama models.
- Deterministic heuristic analysis engine for air-gapped environments.
- Autonomous alert prioritization, false-positive reduction, and threat summarization.

### 4. Autonomous SOAR Engine (`backend/soar/`)
- YAML/JSON playbook execution engine (`playbook_executor.go`).
- Security action dispatcher supporting IP blocking, firewall updates, user isolation, and webhook dispatching.
- Human-in-the-loop approval workflows with cryptographic HMAC-SHA256 signature auditing.

### 5. Multi-Region Kubernetes & Helm Packaging (`helm/netsentinel-x/`)
- Zero-downtime rolling updates with 30-second `SIGTERM` connection draining.
- Dynamic Horizontal Pod Autoscaling (HPA) targeting 70% CPU and 80% Memory utilization.
- Health probes: `/health/live` (Liveness) and `/health/ready` (Readiness).
