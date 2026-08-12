# NetSentinel-X V2 — Cloud-Native GCP GKE Deployment & Multi-Region Autoscaling Guide ☁️

This document outlines the step-by-step procedure for deploying NetSentinel-X V2 on Google Kubernetes Engine (GKE), AWS EKS, or Azure AKS using Helm 3 and Horizontal Pod Autoscaler (HPA).

---

## 🏗️ Architecture Overview

```
                      Global Cloud Load Balancer
                      (HTTPS / TLS Termination)
                                  │
                                  ▼
                     Kubernetes NGINX / GCE Ingress
                        (netsentinel.example.com)
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
Backend Pod Replicas (Go Engine)                  Frontend Edge CDN
(HPA Scaled: Min 3, Max 20 Replicas)               (Vercel Platform)
         │
         ├──► NATS JetStream Event Stream Cluster (3 Nodes)
         ├──► Redis Session & State Cache
         ├──► ClickHouse Columnar Log Engine
         └──► PostgreSQL High Availability Cluster
```

---

## 📋 Prerequisites

1. **Google Cloud SDK (`gcloud`)** installed and authenticated.
2. **Kubernetes CLI (`kubectl`)** v1.28+.
3. **Helm CLI (`helm`)** v3.12+.
4. Access to a GCP Project with `container.admin` and `iam.serviceAccountUser` permissions.

---

## 1. GKE Cluster Creation

```bash
# Set GCP Project and Region
gcloud config set project your-gcp-project-id
export REGION="us-central1"
export CLUSTER_NAME="netsentinel-x-production"

# Create Autopilot GKE Cluster
gcloud container clusters create-auto $CLUSTER_NAME \
  --region $REGION \
  --release-channel regular

# Get kubectl Credentials
gcloud container clusters get-credentials $CLUSTER_NAME --region $REGION
```

---

## 2. Helm 3 Chart Installation

```bash
# Create Dedicated Namespace
kubectl create namespace netsentinel-system

# Validate Helm Chart Syntax
helm lint ./helm/netsentinel-x

# Install NetSentinel-X Release
helm install netsentinel-x ./helm/netsentinel-x \
  --namespace netsentinel-system \
  --values ./helm/netsentinel-x/values.yaml

# Verify Pod Status
kubectl get pods -n netsentinel-system -o wide
```

---

## 3. Horizontal Pod Autoscaling (HPA) Verification

NetSentinel-X uses Kubernetes `HorizontalPodAutoscaler` targeting **70% CPU** and **80% Memory** utilization:

```bash
# Check Active HPA Status
kubectl get hpa -n netsentinel-system

# Expected Output:
# NAME                         REFERENCE                                TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
# netsentinel-x-backend-hpa    Deployment/netsentinel-x-backend         12%/70%, 28%/80%  3         20        3          5m
```

---

## 4. Zero-Downtime Rolling Upgrades & Rollbacks

NetSentinel-X handles `SIGTERM` OS signals with a **30-second graceful connection draining window**:

```bash
# Perform Zero-Downtime Upgrade
helm upgrade netsentinel-x ./helm/netsentinel-x \
  --namespace netsentinel-system \
  --set backend.image.tag=v2.1.0-Enterprise

# Monitor Rolling Update Progress
kubectl rollout status deployment/netsentinel-x-backend -n netsentinel-system

# Rollback to Previous Release if Issue Detected
helm rollback netsentinel-x -n netsentinel-system
```

---

## 5. Chaos Testing & Recovery Validation

- **Pod Failure**: Terminate random backend pod: `kubectl delete pod -l app.kubernetes.io/component=backend -n netsentinel-system`. Pod is recreated in `< 3s` without dropping active HTTP sessions or NATS messages.
- **Node Failure**: GKE Autopilot automatically reschedules workloads across healthy availability zones.
