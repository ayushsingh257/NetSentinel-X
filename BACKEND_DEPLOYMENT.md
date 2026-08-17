# NetSentinel-X V2 — Backend VPS & Supabase Managed Database Deployment Guide

This guide provides step-by-step instructions for deploying the **NetSentinel-X V2** Go API engine, connected to **Supabase-Managed PostgreSQL**, Redis in-memory cache, and Nginx reverse proxy to a Linux VPS (Ubuntu/Debian) or containerized platform using Docker Compose.

---

## 1. System Requirements

- **Operating System**: Ubuntu 22.04 LTS / Debian 12 (64-bit)
- **CPU**: 2 vCPUs minimum (4 vCPUs recommended)
- **RAM**: 4 GB minimum (8 GB recommended)
- **Disk Space**: 20 GB SSD storage
- **Docker Engine**: Docker 24.0+ & Docker Compose v2.20+
- **Managed Database**: Supabase PostgreSQL 15+ instance

---

## 2. Supabase Managed Database Configuration

NetSentinel-X connects to **Supabase-managed PostgreSQL** as a persistent Go backend.

### Supabase Connection Modes

1. **Direct Connection (Recommended for Persistent Go Server)**:
   - **Port**: `5432`
   - **Host**: `db.[YOUR-PROJECT-REF].supabase.co`
   - **Protocol**: `postgresql://postgres:[PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require`
   - **Features**: Direct TCP, low latency, full named prepared statement support.

2. **Supavisor Session Pooling (Alternative for IPv4-only networks)**:
   - **Port**: `5432`
   - **Host**: `aws-0-[REGION].pooler.supabase.com`
   - **Protocol**: `postgresql://postgres.[YOUR-PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require`
   - **Features**: Session-level pooling, IPv4 compatibility, full prepared statement support.

> [!WARNING]
> Do **NOT** use Transaction Mode (Port 6543) for the NetSentinel-X persistent server, as transaction-mode pooling does not support named prepared statements issued by Go's `database/sql` / `lib/pq`.

---

## 3. Production Environment Configuration (`.env.production`)

Create a `.env` file from `.env.production.example`:

```env
# ─── Application Settings ──────────────────────────────────────────────────
GIN_MODE=release
PORT=8080
FRONTEND_URL=https://netsentinel-x.vercel.app
CORS_ALLOWED_ORIGINS=https://*.vercel.app,https://netsentinel-x.vercel.app

# ─── Supabase Managed Database ─────────────────────────────────────────────
# Option A: Full Connection String URL (Recommended)
SUPABASE_DATABASE_URL=postgresql://postgres:YOUR_STRONG_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require

# Option B: Discrete Variables
# DB_HOST=db.YOUR_PROJECT_REF.supabase.co
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=YOUR_STRONG_PASSWORD
# DB_NAME=postgres
# DB_SSLMODE=require

# ─── Migration Control ─────────────────────────────────────────────────────
# In production, keep AUTO_MIGRATE=false to prevent unexpected schema mutation on boot.
AUTO_MIGRATE=false

# ─── Connection Pool Tuning ────────────────────────────────────────────────
DB_MAX_OPEN_CONNS=25
DB_MAX_IDLE_CONNS=10
DB_CONN_MAX_LIFETIME=5m
DB_CONN_MAX_IDLE_TIME=2m

# ─── Redis Cache ───────────────────────────────────────────────────────────
REDIS_HOST=redis:6379
REDIS_PASSWORD=YOUR_SECURE_REDIS_PASSWORD_HERE

# ─── Auth & Secrets ────────────────────────────────────────────────────────
JWT_SECRET=SECURE_256BIT_RANDOM_JWT_SECRET_KEY_NETSENTINEL_2026
```

---

## 4. Executing Database Migrations

NetSentinel-X uses deterministic, version-controlled PostgreSQL migrations tracked in `schema_migrations`.

```bash
# 1. Apply all pending migrations to Supabase
cd backend
go run ./cmd/migrate --up

# 2. Check migration status
go run ./cmd/migrate --status

# 3. Verify schema compatibility without modifying database
go run ./cmd/migrate --verify

# 4. Rollback (if necessary)
go run ./cmd/migrate --down
```

---

## 5. Docker Compose Deployment Steps

```bash
# 1. Clone the repository on your VPS
git clone https://github.com/ayushsingh257/NetSentinel-X.git
cd NetSentinel-X

# 2. Copy and customize production environment variables
cp .env.production.example .env
nano .env

# 3. Run database migrations
cd backend && go run ./cmd/migrate --up && cd ..

# 4. Build and launch production services in detached mode
docker compose -f docker-compose.production.yml up -d --build

# 5. Verify container health status
docker compose -f docker-compose.production.yml ps
```

---

## 6. Reverse Proxy & Nginx Routing Architecture

The Nginx proxy container listens on ports 80/443 and routes incoming traffic:

- `http://<vps-ip>/health` -> Backend Liveness / Readiness Probes
- `http://<vps-ip>/api/v2/*` -> Go Backend REST API Engine (`backend:8080`)
- `http://<vps-ip>/ws` -> Real-Time Telemetry WebSocket Stream (`backend:8080/ws`)

---

## 7. Security & Container Hardening Controls

1. **Non-Root Execution**: The backend container runs as dedicated non-root user `netsentinel:netsentinel` (UID 10001).
2. **Network Isolation**: All services communicate over an isolated Docker bridge network (`netsentinel-network`).
3. **Automated Health Probes**: Continuous liveness and readiness monitoring on `/health`.
4. **Transport Encryption**: Enforced TLS 1.3 / SSL connection (`sslmode=require`) to Supabase.
