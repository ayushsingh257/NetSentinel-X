# Zero-Downtime Deployment Strategy & Architecture — NetSentinel-X V2

## Overview

NetSentinel-X V2 implements a zero-downtime rolling blue/green deployment strategy to guarantee continuous 99.999% availability for SOC security analyst workflows during software updates.

---

## 1. Rolling Blue/Green Deployment Flow

```
   Existing Version N (Blue)                 New Version N+1 (Green)
  ┌─────────────────────────┐               ┌─────────────────────────┐
  │ Active Traffic (100%)   │               │ Canary Instance         │
  └────────────┬────────────┘               └────────────┬────────────┘
               │                                         │
               │                                         ▼
               │                            Health Probe Verification
               │                            - Backend /health (HTTP 200)
               │                            - DB Ping (< 5ms)
               │                            - TLS Handshake (TLS 1.3)
               │                                         │
               ▼                                         ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │  Traffic Switch: Load Balancer updates routing to Version N+1   │
  └─────────────────────────────────────────────────────────────────┘
               │                                         │
               ▼                                         ▼
  Graceful Drain (Version N)                  Active Production (Version N+1)
```

---

## 2. Health Probe & Validation Rules

- **Liveness Probe**: `GET /health` must return `200 OK` within 2,000ms.
- **Readiness Probe**: Backend must establish valid connections to PostgreSQL and Redis.
- **Canary Duration**: Traffic is shifted in progressive stages: 5% ➔ 25% ➔ 100% over 5 minutes while monitoring error rates.
- **Automatic Rollback Trigger**: If HTTP 5xx error rate exceeds 0.1% or DB connection latency exceeds 50ms during canary, traffic immediately reverts 100% to Version N.
