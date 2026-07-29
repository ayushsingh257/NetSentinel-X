# Enterprise API Security Guide

## 1. Overview

NetSentinel-X V2 implements a zero-trust API security architecture defending system endpoints against automated abuse, credential stuffing, replay attacks, and unauthorized machine-to-machine integrations.

---

## 2. API Key Management Architecture

* **Prefixing**: All API Keys generated begin with `nsx_live_<hex>`.
* **Zero Plaintext Storage**: Only SHA256 hashes of API keys are stored in the system database (`APIKeyService`).
* **Header Format**:
  ```http
  X-API-Key: nsx_live_a82hd72jd82h
  ```
* **Validation Response Codes**:
  - Missing key: `401 Unauthorized` (`API_KEY_REQUIRED`)
  - Invalid key: `401 Unauthorized` (`INVALID_API_KEY`)
  - Expired key: `401 Unauthorized` (`API_KEY_EXPIRED`)
  - Revoked key: `401 Unauthorized` (`API_KEY_REVOKED`)

---

## 3. HMAC Request Signature Protocol

High-value mutating API endpoints require request signatures to guarantee body integrity and block replay attacks.

* **Headers Required**:
  - `X-Signature`: `HMAC-SHA256(request_body + timestamp + secret)`
  - `X-Timestamp`: Unix epoch string (seconds)
* **Replay Protection Window**: Requests with timestamp drift > 300 seconds (5 minutes) are automatically rejected (`TIMESTAMP_EXPIRED_REPLAY_RISK`).

---

## 4. Adaptive Rate Limiting Engine

Dynamic limits automatically adjust based on client IP threat posture:
* **Normal Client**: 100 requests / minute
* **Suspicious Client (repeated 401/403/404 signals)**: 20 requests / minute
* **Blocked Client (repeated credential bursts or scans)**: 0 requests (15-30 minute temporary ban)
* **Response Header**: `Retry-After: 60`
* **Response Body**: `HTTP 429 Too Many Requests` (`RATE_LIMIT_EXCEEDED`)

---

## 5. Webhook Security Framework

Webhook events dispatched to third-party endpoints (e.g. SIEMs, SOAR tools) are signed using HMAC-SHA256 secrets:
* **Header**: `X-Webhook-Signature: sha256=<hex_hmac>`
* **Payload Structure**:
  ```json
  {
    "event": "incident.created",
    "id": "INC-2026-8001",
    "timestamp": "2026-07-29T10:00:00Z",
    "data": { ... }
  }
  ```
