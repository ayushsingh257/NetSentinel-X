# NetSentinel-X V2 — Backend VPS Docker Deployment Guide

This guide provides step-by-step instructions for deploying the **NetSentinel-X V2** Go API engine, PostgreSQL database, Redis in-memory cache, and Nginx reverse proxy to a Linux VPS (Ubuntu/Debian) using Docker Compose.

---

## 1. System Requirements

- **Operating System**: Ubuntu 22.04 LTS / Debian 12 (64-bit)
- **CPU**: 2 vCPUs minimum (4 vCPUs recommended)
- **RAM**: 4 GB minimum (8 GB recommended)
- **Disk Space**: 20 GB SSD storage
- **Docker Engine**: Docker 24.0+ & Docker Compose v2.20+
- **Host Dependencies**: `libpcap-dev` (if capturing live packets outside container)

---

## 2. Environment Configuration File (`.env.production`)

Create a `.env` file in the project root directory before launching containers:

```env
# Application Settings
GIN_MODE=release
PORT=8080

# PostgreSQL Database Settings
DB_HOST=postgres
DB_PORT=5432
DB_USER=netsentinel_admin
POSTGRES_PASSWORD=SECURE_RANDOM_POSTGRES_PASSWORD_2026
DB_NAME=netsentinel_production_db

# Redis Settings
REDIS_HOST=redis:6379

# Cryptographic & Auth Secrets
JWT_SECRET=SECURE_256BIT_RANDOM_JWT_SECRET_KEY_NETSENTINEL_2026
CORS_ALLOWED_ORIGINS=https://*.vercel.app,https://your-custom-frontend-domain.com

# External AI & Threat Intelligence Keys (Optional)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
ABUSEIPDB_API_KEY=your_abuseipdb_api_key_here
OTX_API_KEY=your_otx_api_key_here
```

---

## 3. Docker Compose Deployment Steps

```bash
# 1. Clone the repository on your VPS
git clone https://github.com/ayushsingh257/NetSentinel-X.git
cd NetSentinel-X

# 2. Copy and customize production environment variables
cp .env.production.example .env
nano .env

# 3. Build and launch production services in detached mode
docker compose -f docker-compose.production.yml up -d --build

# 4. Verify container health status
docker compose -f docker-compose.production.yml ps
```

---

## 4. Reverse Proxy & Nginx Routing Architecture

The Nginx proxy container listens on ports 80/443 and routes incoming traffic:

- `http://<vps-ip>/health` -> Backend Liveness / Readiness Probes
- `http://<vps-ip>/api/v2/*` -> Go Backend REST API Engine (`backend:8080`)
- `http://<vps-ip>/ws` -> Real-Time Telemetry WebSocket Stream (`backend:8080/ws`)

---

## 5. Security & Container Hardening Controls

1. **Non-Root Execution**: The backend container runs as dedicated non-root user `netsentinel:netsentinel` (UID 10001).
2. **Network Isolation**: All services communicate over an isolated Docker bridge network (`netsentinel-network`). Database and Redis ports are not exposed to the public internet.
3. **Health Probes**: Automated health checks continuously monitor container status:
   - Backend: `GET http://localhost:8080/health` (10s interval, 3 retries)
   - PostgreSQL: `pg_isready -U netsentinel -d netsentinel_db`
   - Redis: `redis-cli ping`

---

## 6. Backup & Recovery Operations

```bash
# Manual Database Backup
docker compose -f docker-compose.production.yml exec -T postgres pg_dump -U netsentinel_admin netsentinel_production_db | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Manual Database Restore
gunzip -c backup_YYYYMMDD_HHMMSS.sql.gz | docker compose -f docker-compose.production.yml exec -T postgres psql -U netsentinel_admin -d netsentinel_production_db
```
