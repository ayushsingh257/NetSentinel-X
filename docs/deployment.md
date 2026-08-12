# NetSentinel-X V2 — Production Deployment Guide 🚀

## Overview

NetSentinel-X V2 supports deployment across:
1. **Google Kubernetes Engine (GKE) / AWS EKS / Azure AKS** via Helm 3.
2. **Enterprise Docker Compose** for dedicated Linux server environments.
3. **Hybrid Edge CDN & API Cluster** (Vercel Frontend + Cloud Backend).

---

## 1. Kubernetes / GKE Production Deployment (Recommended)

### Step 1: Initialize Namespace & Secrets
```bash
kubectl create namespace netsentinel-system

# Inject production secrets securely via Kubernetes Secrets or GCP Secret Manager
kubectl create secret generic netsentinel-x-secret \
  --namespace netsentinel-system \
  --from-literal=JWT_SECRET="YOUR_ENTERPRISE_SECURE_JWT_SECRET" \
  --from-literal=DB_PASSWORD="YOUR_ENTERPRISE_POSTGRES_PASSWORD"
```

### Step 2: Deploy with Helm 3
```bash
helm install netsentinel-x ./helm/netsentinel-x \
  --namespace netsentinel-system \
  --values ./helm/netsentinel-x/values.yaml \
  --set secrets.jwtSecret="YOUR_ENTERPRISE_SECURE_JWT_SECRET" \
  --set secrets.dbPassword="YOUR_ENTERPRISE_POSTGRES_PASSWORD"
```

### Step 3: Verify HPA & Probes
```bash
kubectl get hpa -n netsentinel-system
kubectl get pods -n netsentinel-system -o wide
```

---

## 2. Docker Compose Production Deployment

```bash
# Clone repository and copy environment configuration
cp .env.production.example .env.production

# Start production stack in detached mode
docker compose -f docker-compose.production.yml --env-file .env.production up -d
```

---

## 3. Environment Variables Reference

| Variable | Description | Required | Example |
| :--- | :--- | :---: | :--- |
| `PORT` | Backend HTTP API listening port | Yes | `8080` |
| `JWT_SECRET` | 256-bit cryptographically random secret | Yes | `hex_or_base64_string` |
| `DB_PASSWORD` | PostgreSQL master password | Yes | `ComplexP@ssword2026!` |
| `NATS_URL` | NATS JetStream cluster connection URI | Yes | `nats://nats:4222` |
| `REDIS_URL` | Redis instance connection host:port | Yes | `redis:6379` |
| `NEXT_PUBLIC_API_URL` | Frontend API gateway target | Yes | `https://api.netsentinel.io` |
| `NEXT_PUBLIC_DEMO_MODE` | Enable dev demo credentials UI | No | `false` |
