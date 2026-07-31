# Enterprise Cloud Deployment Guide
# NetSentinel-X V2 — Era 32 Enterprise Production Operations

**Document Version**: 1.1.0  
**Date**: July 31, 2026  
**Target Platform**: Vercel (Frontend Client) + Docker VPS / Cloud VM (Go Backend API & Nginx Gateway) + Managed PostgreSQL & Managed Redis  

> 📄 **Dedicated Deployment Manuals**:
> - [VERCEL_DEPLOYMENT.md](file:///c:/Users/Ayush/OneDrive/Desktop/NetSentinel-X/VERCEL_DEPLOYMENT.md): Detailed Frontend Vercel deployment guide.
> - [BACKEND_DEPLOYMENT.md](file:///c:/Users/Ayush/OneDrive/Desktop/NetSentinel-X/BACKEND_DEPLOYMENT.md): Detailed Backend Docker VPS deployment guide.
> - [deployment_readiness_report.md](file:///c:/Users/Ayush/OneDrive/Desktop/NetSentinel-X/deployment_readiness_report.md): Production readiness audit & operational checklist.

---

## 1. Executive Summary & Production Topology

NetSentinel-X V2 is architected for decoupled enterprise deployment:
- **Frontend App**: Deployed on **Vercel** serverless CDN (`*.vercel.app` platform URL, no custom domain required).
- **Backend API Gateway & Telemetry Engine**: Deployed on a **Docker VPS** (Ubuntu 22.04 / 24.04 LTS VM) using `docker-compose.production.yml` and an Nginx reverse proxy.
- **Database Layer**: Managed **PostgreSQL** instance (AWS RDS, DigitalOcean Managed DB, or Supabase).
- **Cache Layer**: Managed **Redis** cluster (Upstash Redis, AWS ElastiCache, or Redis Cloud).

```
┌─────────────────────────────────────────┐
│     Vercel Global Edge Network (CDN)    │
│  - Next.js 16.2.6 Web Application       │
│  - Platform URL: netsentinel-x.vercel.app│
└────────────────────┬────────────────────┘
                     │
                     │ HTTPS / WSS TLS 1.3
                     ▼
┌─────────────────────────────────────────┐
│      Docker VPS / Cloud VM Gateway      │
│  ┌───────────────────────────────────┐  │
│  │ Nginx Reverse Proxy (Port 80/443) │  │
│  └─────────────────┬─────────────────┘  │
│                    │                    │
│                    ▼                    │
│  ┌───────────────────────────────────┐  │
│  │ Go 1.26 Backend Engine (Port 8080)│  │
│  │ Probes: /health, /liveness,       │  │
│  │         /readiness                │  │
│  └─────────┬─────────────────┬───────┘  │
└────────────┼─────────────────┼──────────┘
             │                 │
             ▼                 ▼
┌───────────────────┐   ┌───────────────────┐
│Managed PostgreSQL │   │   Managed Redis   │
│(AES-256 Encrypted)│   │  (Auth Protected) │
└───────────────────┘   └───────────────────┘
```

---

## 2. Frontend Deployment (Vercel)

### Step 2.1 — Import Repository to Vercel
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New Project** and import the `NetSentinel-X` GitHub repository.
3. Set **Root Directory** to `frontend`.
4. Vercel automatically detects Next.js framework configuration.

### Step 2.2 — Configure Environment Variables on Vercel
Set the following environment variables in Vercel Project Settings:

| Environment Variable | Value | Explanation |
|----------------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://<YOUR_VPS_IP_OR_HOSTNAME>` | Points to the backend API Gateway |
| `NODE_ENV` | `production` | Enables Next.js production build optimizations |

### Step 2.3 — Deploy & Verify
1. Click **Deploy**. Vercel will build the static and server-rendered pages using `vercel.json`.
2. Upon completion, Vercel provides a generated platform URL (e.g., `https://netsentinel-x.vercel.app`).
3. Verify HTTPS connectivity and security headers.

---

## 3. Backend & Nginx Gateway Deployment (Docker VPS)

### Step 3.1 — VPS Environment Preparation
Execute on your Linux VPS (Ubuntu 22.04 / 24.04 LTS):
```bash
# Update package repositories
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker & Docker Compose
sudo apt-get install -y docker.io docker-compose-plugin git libpcap-dev

# Clone repository
git clone https://github.com/ayushsingh257/NetSentinel-X.git
cd NetSentinel-X
```

### Step 3.2 — Environment Configuration
Copy `.env.production.example` to `.env.production`:
```bash
cp .env.production.example .env.production
```

Edit `.env.production` to insert your credentials:
```env
GIN_MODE=release
PORT=8080
FRONTEND_URL=https://netsentinel-x.vercel.app
CORS_ALLOWED_ORIGINS=https://*.vercel.app,https://netsentinel-x.vercel.app

DB_HOST=<YOUR_MANAGED_POSTGRES_HOST>
DB_PORT=5432
DB_USER=<YOUR_DB_USER>
DB_PASSWORD=<YOUR_DB_PASSWORD>
DB_NAME=netsentinel_production

REDIS_HOST=<YOUR_MANAGED_REDIS_HOST>:6379
REDIS_PASSWORD=<YOUR_REDIS_PASSWORD>

JWT_SECRET=<64_CHARACTER_CRYPTOGRAPHIC_HEX_KEY>
```

### Step 3.3 — Launch Production Stack
```bash
docker compose -f docker-compose.production.yml --env-file .env.production up -d --build
```

### Step 3.4 — Verify Container Probes
Verify container health probes:
```bash
# Check running container health status
docker compose -f docker-compose.production.yml ps

# Test Liveness Probe
curl -i http://localhost/liveness

# Test Readiness Probe
curl -i http://localhost/readiness

# Test Health Endpoint
curl -i http://localhost/health
```

---

## 4. Managed PostgreSQL & Managed Redis Configuration

### Managed PostgreSQL Checklist
1. Enable **SSL/TLS connections** (`sslmode=verify-full`).
2. Create isolated database user `netsentinel_prod` with least-privilege permissions.
3. Configure automated daily snapshots with 30-day point-in-time retention.

### Managed Redis Checklist
1. Enable `AUTH` password authentication.
2. Restrict Redis VPC security groups to allow access only from VPS IP.

---

## 5. Security & Probes Verification Matrix

| Endpoint | Probe Type | Expected HTTP Code | Response Payload |
|----------|------------|--------------------|------------------|
| `GET /health` | System Health | `200 OK` | `{"server":"healthy","status":"UP"}` |
| `GET /liveness` | Orchestrator Liveness | `200 OK` | `{"status":"ALIVE","uptime":"OK"}` |
| `GET /readiness` | Orchestrator Readiness | `200 OK` | `{"status":"READY","database":"CONNECTED"}` |
| `GET /ws` | Telemetry Stream | `101 Switching Protocols` | WebSocket handshake |
