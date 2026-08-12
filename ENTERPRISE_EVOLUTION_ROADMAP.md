# NetSentinel-X V2 — Enterprise Evolution Roadmap (Phases 1–6)
## From Production-Ready Single-Node Platform to Cloud-Scale NDR/SIEM Platform

### Strategic Vision
NetSentinel-X V2 is currently a **Production-Ready Single-Node NDR Platform** with a rating of **98/100 (Enterprise Secure)**. It possesses complete feature implementations across 36 engineering eras (Sigma/YARA engines, DPI, AI copilot, threat intel fusion, SOAR playbooks, and compliance scoring).

The goal of this **Enterprise Evolution Roadmap** is to scale NetSentinel-X into a **Cloud-Scale Enterprise NDR/SIEM Platform** capable of ingesting **100,000+ events/sec** across distributed global networks while preserving 100% backwards compatibility and user experience continuity across all 18 existing dashboards.

---

## Evolution Roadmap Overview

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │ PHASE 1: Production Stabilization & HttpOnly Auth (Immediate Next Step) │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │
 ┌────────────────────────────────────▼────────────────────────────────────┐
 │ PHASE 2: Enterprise Observability & System Health (Prometheus/Grafana)  │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │
 ┌────────────────────────────────────▼────────────────────────────────────┐
 │ PHASE 3: Event Pipeline Architecture (NATS JetStream Bus)               │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │
 ┌────────────────────────────────────▼────────────────────────────────────┐
 │ PHASE 4: Security Analytics Storage (ClickHouse Columnar Engine)        │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │
 ┌────────────────────────────────────▼────────────────────────────────────┐
 │ PHASE 5: Distributed Edge Sensor Framework (Go Agent & mTLS Gateway)    │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │
 ┌────────────────────────────────────▼────────────────────────────────────┐
 │ PHASE 6: Cloud-Native Orchestration (Kubernetes GKE & Multi-Region HPA) │
 └─────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Phase Specifications

---

### PHASE 1 — Production Stabilization & Security Hardening ✅ (COMPLETED)

#### 1. Why This Upgrade Is Required
To eliminate the single biggest security vulnerability identified in the architectural audit: **Client-Side Storage of JWTs in `localStorage`**. Storing access tokens in `localStorage` exposes them to Cross-Site Scripting (XSS) token theft. Shifting to `HttpOnly`, `SameSite=Strict` HTTP cookies prevents JavaScript access to authorization credentials.

#### 2. Current Limitation
- Frontend stores JWT in `localStorage` and manually attaches `Authorization: Bearer <token>` headers.
- Lack of anti-CSRF token verification on state-changing POST/PUT/DELETE requests.
- Intermittent WebSocket connection drops when network conditions fluctuate without automatic exponential backoff reconnection.

#### 3. Backend Changes Required
- **Auth Handler Update**: Modify `handlers.LoginHandler` to set an `HttpOnly`, `Secure`, `SameSite=Strict` cookie containing the JWT access token.
- **Cookie Auth Middleware**: Update `middleware.AuthMiddleware()` to extract and validate JWT tokens from the HTTP Cookie header as well as fallback `Authorization` headers.
- **Anti-CSRF Middleware**: Implement double-submit anti-CSRF token middleware issuing `X-CSRF-Token` header validation for non-GET requests.
- **Structured JSON Logger**: Integrate `rs/zerolog` or `uber-go/zap` for structured JSON log output with contextual fields (`correlation_id`, `user_id`, `ip`).

#### 4. Frontend Changes Required
- **Fetch Wrapper Utility**: Update API client (`frontend/utils/api.ts`) to set `credentials: "include"` on all HTTP fetch calls.
- **Remove `localStorage` Token Storage**: Deprecate direct token storage in `localStorage`.
- **CSRF Header Injector**: Attach `X-CSRF-Token` header to POST/PUT/DELETE mutation calls.
- **WebSocket Auto-Reconnect Engine**: Enhance `useWebSocket` hook with exponential backoff (1s, 2s, 4s, 8s, 16s, max 30s) and status indicator (`CONNECTING`, `CONNECTED`, `RECONNECTING`).
- **UI State Guards**: Add skeleton loading states and clean error boundary fallbacks across all 18 dashboard views.

#### 5. Database Changes
- No schema alterations required. Existing `Session` and `RefreshToken` tables remain fully compatible.

#### 6. Infrastructure Changes
- Update Nginx proxy (`docker/nginx/nginx.conf`) to ensure `Set-Cookie` headers are passed downstream cleanly without proxy stripping.

#### 7. User Experience Changes
- **Transparent Sign-In**: Login and Signup flow works seamlessly without manual token management.
- **Network Resilience**: If the backend restarts, the dashboard automatically reconnects WebSocket telemetry without requiring a manual browser refresh.

#### 8. Testing Strategy
- **Security Tests**: Verify that `document.cookie` cannot be read via JavaScript (`HttpOnly` flag check).
- **CSRF Tests**: Verify that mutation requests without valid `X-CSRF-Token` are rejected (HTTP 403).
- **Automated Regression**: Run `go test ./...` and Jest frontend test suite (`npm test`).

#### 9. Rollback Strategy
- Feature-flag cookie authentication (`ENABLE_HTTPONLY_COOKIE=true`). If issues arise, fall back to header-based JWT validation without breaking active sessions.

---

### PHASE 2 — Enterprise Observability & System Health ✅ (COMPLETED)

#### 1. Why This Upgrade Is Required
Enterprise security operations teams require real-time visibility into the health, throughput, and performance of the NetSentinel-X platform itself before ingesting production traffic.

#### 2. Current Limitation
- Platform metrics are exposed via `/metrics`, but lack granular operational visualization inside the frontend dashboard.
- System metrics (CPU, RAM, DB connection pool depth, active WebSocket clients) are visible only via raw Prometheus scrape endpoints.

#### 3. Backend Changes Required
- **Prometheus Collector Enhancement**: Register custom Prometheus metrics in `backend/middleware/metrics.go`:
  - `netsentinel_packet_processing_rate_cps`
  - `netsentinel_alert_generation_total`
  - `netsentinel_websocket_active_clients`
  - `netsentinel_db_connection_pool_active`
  - `netsentinel_threat_engine_processing_latency_seconds`
- **System Metrics Handler**: Add `/api/v2/system/health` REST endpoint serving system metrics JSON payload for the UI.

#### 4. Frontend Changes Required
- **New Dashboard Component**: Create `frontend/components/SystemHealthObservabilityDashboard.tsx` under `/dashboard/observability`.
- **Real-Time Gauges & Charts**: Render CPU usage, Memory consumption, Events/sec, Active WebSocket clients, DB pool depth, and Threat Engine P95 latency.

#### 5. Database Changes
- None required.

#### 6. Infrastructure Changes
- Update `docker/prometheus.yml` to scrape backend `/metrics` every 5 seconds.
- Provide optional pre-configured Grafana dashboard template (`docker/grafana/dashboards/netsentinel-overview.json`).

#### 7. User Experience Changes
- Administrators and SOC Managers gain an interactive **System Health Dashboard** showing exact platform load and operational status in real time.

#### 8. Testing Strategy
- Benchmark `/api/v2/system/health` under synthetic CPU/Memory load.
- Verify Jest rendering of `SystemHealthObservabilityDashboard.test.tsx`.

#### 9. Rollback Strategy
- System health endpoints execute read-only metrics queries. Disabling the metric dashboard component has zero impact on core security detection features.

---

### PHASE 3 — Event Pipeline Architecture (NATS JetStream Bus)

#### 1. Why This Upgrade Is Required
To decouple high-frequency network packet capture from threat rule processing. Ingesting 50,000+ packets/sec directly inside the web request lifecycle causes CPU contention and dropped packets. NATS JetStream is selected over Kafka because it is lightweight, Go-native, zero-dependency, ultra-fast (sub-millisecond latency), and ideal for single-node to multi-node transitions.

#### 2. Current Limitation
- Packet capture worker passes ingested packets directly to threat detection functions in-process via Go channels. If threat evaluation slows down, packets are dropped at the network interface layer.

#### 3. Backend Changes Required
- **NATS Producer Module**: Publish captured network packets to NATS subject `telemetry.packets.raw`.
- **NATS Consumer Workers**: Spawn a pool of scalable worker goroutines subscribing to `telemetry.packets.raw` to execute Sigma/YARA threat checks asynchronously.
- **Alert Dispatch Subject**: Workers publish alerts to `alerts.processed` subject which feeds the WebSocket hub and alert persistence service.

#### 4. Frontend Changes Required
- **New Dashboard Component**: Create `frontend/components/EventPipelineMonitorDashboard.tsx` rendered in `/dashboard/monitoring`.
- **Metrics Displayed**: Real-time counters for Events Received, Events Processed, Queue Delay (ms), Worker Utilization %, and Failed Events.

#### 5. Database Changes
- None required for NATS message queue.

#### 6. Infrastructure Changes
- Add `nats` container service to `docker-compose.production.yml`:
  ```yaml
  nats:
    image: nats:2.10-alpine
    command: ["-js", "-sd", "/data"]
    ports:
      - "4222:4222"
      - "8222:8222"
  ```

#### 7. User Experience Changes
- Detection processing latency drops dramatically (< 2ms). SOC analysts view an interactive **Event Pipeline Monitor** showing event ingestion throughput.

#### 8. Testing Strategy
- Inject 100,000 synthetic packet events into NATS JetStream and measure consumer queue drain rate and memory stability.

#### 9. Rollback Strategy
- Provide a configuration toggle (`EVENT_BUS_ENABLED=true/false`). If NATS is offline, the backend gracefully falls back to direct in-process channel processing.

---

### PHASE 4 — Columnar Security Analytics Storage (ClickHouse Analytical Engine)

#### 1. Why This Upgrade Is Required
Relational databases (PostgreSQL) degrade rapidly when running analytical queries over millions of raw log rows. **ClickHouse** is a columnar database designed specifically for sub-second analytical queries across billions of security events.

#### 2. Current Limitation
- Querying historical network packet flows or running complex threat hunting regex searches across large PostgreSQL tables causes high disk I/O and query timeouts.

#### 3. Backend Changes Required
- **Dual Storage Strategy**:
  - **PostgreSQL**: Transactional entities (Users, Roles, Cases, Configuration, Incident Tickets).
  - **ClickHouse**: High-velocity security logs, network packet metadata, flow tuples, and Sigma match records.
- **ClickHouse Driver Service**: Create `backend/services/clickhouse_service.go` using native Go driver (`github.com/ClickHouse/clickhouse-go/v2`).
- **Batch Inserter Worker**: Buffer log events and execute batch block inserts (5,000 rows/batch) into ClickHouse to maximize write efficiency.

#### 4. Frontend Changes Required
- **New Analytics Component**: Create `frontend/components/ThreatHuntingAnalyticsDashboard.tsx` in `/dashboard/threat-hunting`.
- **Sub-Second Query Controls**: High-speed filtering by IP, Domain, Country, MITRE Technique ID, Severity, and Custom Time Ranges over millions of rows.

#### 5. Database Changes
- **ClickHouse Schema Definition**:
  ```sql
  CREATE TABLE security_events_columnar (
      timestamp DateTime64(3),
      event_id UUID,
      source_ip String,
      destination_ip String,
      destination_port UInt16,
      protocol String,
      severity String,
      mitre_technique String,
      payload_snippet String
  ) ENGINE = MergeTree()
  ORDER BY (timestamp, severity, source_ip);
  ```

#### 6. Infrastructure Changes
- Add `clickhouse` service to `docker-compose.production.yml`:
  ```yaml
  clickhouse:
    image: clickhouse/clickhouse-server:24.3-alpine
    ports:
      - "8123:8123"
      - "9000:9000"
    volumes:
      - chdata:/var/lib/clickhouse
  ```

#### 7. User Experience Changes
- Analysts experience **instantaneous, sub-second query responses** when searching billions of historical network events in the Threat Hunting workspace.

#### 8. Testing Strategy
- Populate ClickHouse with 10,000,000 sample log rows and verify that complex filtering queries return in `< 100ms`.

#### 9. Rollback Strategy
- Maintain dual-read capability. If ClickHouse is disabled (`CLICKHOUSE_ENABLED=false`), queries fall back seamlessly to PostgreSQL.

---

### PHASE 5 — Distributed Edge Sensor Agent Framework

#### 1. Why This Upgrade Is Required
To monitor remote enterprise branch offices, cloud VPCs, and edge servers. Capturing traffic only at a single central network interface leaves remote assets unmonitored.

#### 2. Current Limitation
- Traffic capture is restricted to network interfaces physically attached to the server hosting the NetSentinel-X backend.

#### 3. Backend Changes Required
- **Lightweight Sensor Agent (`netsentinel-agent`)**: Standalone, lightweight Go binary that runs on edge Linux/Windows hosts.
- **Sensor Registration API**: Secure endpoint (`POST /api/v2/sensors/register`) issuing mTLS X.509 client certificates.
- **Telemetry Ingestion Gateway**: Stream encrypted packet flow metadata over mTLS to the central NATS event bus.
- **Heartbeat & Health Monitor**: Service tracking active edge sensors and flagging offline agents.

#### 4. Frontend Changes Required
- **New Console Component**: Create `frontend/components/SensorManagementConsole.tsx` rendered in `/dashboard/monitoring`.
- **Sensor Table Controls**: Display Sensor Name, Location, IP Address, Operational Status (`ONLINE`, `DEGRADED`, `OFFLINE`), CPU/RAM %, Last Heartbeat, and Total Events Sent.

#### 5. Database Changes
- Add `sensors` table to PostgreSQL schema:
  - `id`, `name`, `hostname`, `ip_address`, `location`, `status`, `certificate_fingerprint`, `last_seen_at`.

#### 6. Infrastructure Changes
- Expose mTLS ingestion port (Port 8443) on Nginx gateway for edge sensor connections.

#### 7. User Experience Changes
- Security engineers gain centralized management of all remote network sensors across corporate branch offices and multi-cloud environments.

#### 8. Testing Strategy
- Deploy 5 virtual edge sensor agents in Docker containers and test certificate issuance, automatic failover, and local disk buffering during WAN disconnects.

#### 9. Rollback Strategy
- Sensor telemetry is ingested via standard NATS subjects. Deactivating a sensor node revokes its mTLS certificate without disturbing other active sensors or central platform services.

---

### PHASE 6 — Cloud-Native Orchestration & Multi-Region Autoscaling

#### 1. Why This Upgrade Is Required
To deploy NetSentinel-X on Google Cloud Platform (GCP GKE), AWS EKS, or Azure AKS with multi-region high availability, dynamic Horizontal Pod Autoscaling (HPA), and zero-downtime rolling upgrades.

#### 2. Current Limitation
- Application is packaged via Docker Compose, which is optimized for single-node Linux VPS deployment rather than multi-region cloud cluster autoscaling.

#### 3. Backend Changes Required
- **Stateless Pod Execution**: Ensure Go backend pods store zero state locally on disk. All sessions, cache, and queues reside in Redis, NATS, and PostgreSQL/ClickHouse.
- **Graceful Shutdown**: Implement SIGTERM handling allowing pending HTTP requests and NATS messages to complete within 30 seconds before pod shutdown.

#### 4. Frontend Changes Required
- None required. Vercel automatically manages global Edge CDN distribution.

#### 5. Database Changes
- Configure read-replicas for PostgreSQL and ClickHouse distributed cluster tables.

#### 6. Infrastructure Changes
- **Helm Chart Repository**: Create `helm/netsentinel-x/` containing:
  - `values.yaml`
  - `templates/backend-deployment.yaml`
  - `templates/nats-statefulset.yaml`
  - `templates/hpa.yaml` (Autoscaling CPU threshold: 70%, Min Replicas: 3, Max Replicas: 20)
  - `templates/ingress.yaml` (GCP Cloud Load Balancer with TLS)

#### 7. User Experience Changes
- End-users experience 99.99% uptime with zero service interruptions during platform maintenance or traffic spikes.

#### 8. Testing Strategy
- Execute Chaos Engineering tests (pkill pods, node teardown) on a staging GKE cluster to verify sub-5-second pod failover.

#### 9. Rollback Strategy
- Use Helm rollback (`helm rollback netsentinel-x <previous_release>`) for instant zero-downtime infrastructure deployment reversions.

---

## Roadmap Progression Matrix

| Evolution Phase | Target Delivery | Key Tech Added | Target Ingestion Throughput | UI Experience Delivered |
| :--- | :---: | :--- | :---: | :--- |
| **Phase 1** | Immediate | HttpOnly Cookies, Anti-CSRF, Auto-Reconnect WS | 5,000 events/sec | Hardened Auth & Resilient Connection UI |
| **Phase 2** | Next | Prometheus, Grafana | 10,000 events/sec | System Health Observability Dashboard |
| **Phase 3** | Mid-Term | NATS JetStream | 50,000 events/sec | Event Pipeline Monitoring Dashboard |
| **Phase 4** | Mid-Term | ClickHouse Columnar Store | 100,000+ events/sec | Sub-Second Threat Hunting Analytics |
| **Phase 5** | Long-Term | Distributed Go Agent & mTLS | 250,000+ events/sec | Multi-Site Sensor Management Console |
| **Phase 6** | Long-Term | Kubernetes (GKE), Helm, HPA | 1,000,000+ events/sec | Multi-Region 99.99% Cloud Architecture |
