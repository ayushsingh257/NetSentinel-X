# NetSentinel-X

## Enterprise Realtime Threat Monitoring & SOC Platform

NetSentinel-X is a next-generation cybersecurity monitoring platform engineered for realtime traffic inspection, packet analysis, threat detection, and Security Operations Center (SOC) visualization.

The platform integrates packet parsing, WebSocket streaming, threat intelligence workflows, PostgreSQL logging, and enterprise-grade dashboarding into a unified monitoring ecosystem designed for cybersecurity analysts, blue teams, and defensive security environments.

Built using Golang, PostgreSQL, Docker, WebSockets, and Next.js, NetSentinel-X simulates the architecture and operational flow of modern enterprise SOC infrastructure.

---

# Motivation

Modern enterprise environments generate enormous amounts of network telemetry, security events, and suspicious traffic indicators. Traditional monitoring solutions often separate packet analysis, visualization, alerting, and infrastructure management into disconnected systems.

NetSentinel-X was developed to consolidate these capabilities into a modular, realtime threat monitoring platform capable of:

- Live traffic inspection
- Realtime threat alerting
- Packet protocol analysis
- Security visualization
- Threat monitoring workflows
- SOC-style operational dashboards

The project emphasizes modular backend architecture, scalable monitoring infrastructure, Dockerized deployment, and enterprise-oriented UI/UX principles.

---

# Technical Overview

NetSentinel-X follows a modular enterprise architecture consisting of:

- Golang Gin backend APIs
- WebSocket realtime infrastructure
- PostgreSQL event logging
- Dockerized multi-container deployment
- Next.js enterprise frontend
- Threat detection & alert pipelines
- Realtime SOC dashboard visualization

The system is designed around scalable monitoring workflows where packet traffic, alerts, analytics, and infrastructure components remain isolated yet interconnected through modular service architecture.

---

# Current Capabilities (As of Phase 23)

## Core Monitoring Features

- Realtime network traffic monitoring
- Packet parsing & protocol analysis
- TCP/UDP traffic filtering
- Live WebSocket event streaming
- Threat detection engine
- Suspicious port detection
- Alert generation system
- Realtime SOC dashboards
- Enterprise UI/UX design
- Dockerized infrastructure deployment

---

# Enterprise Dashboard Features

NetSentinel-X currently includes:

## Live Traffic Monitoring Panel

- Realtime packet monitoring
- Protocol-based filtering
- WebSocket live updates
- Enterprise traffic display

## Threat Alert Dashboard

- Suspicious traffic alerts
- Severity-based threat visualization
- Realtime monitoring status
- Alert card rendering system

## Enterprise SOC Metrics

- Packet monitoring counters
- Threat alert counters
- Live monitoring indicators
- System health status

## Enterprise UI/UX

- Cybersecurity-inspired interface
- Responsive dashboard design
- Glow effects & glassmorphism
- Animated enterprise dashboard styling

---

# Tech Stack

## Backend

- Golang
- Gin Framework
- WebSockets
- GoPacket

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Database

- PostgreSQL

## Infrastructure

- Docker
- Docker Compose

---

# System Architecture

Frontend (Next.js)
↓
Enterprise SOC Dashboard
↓
Gin Backend API
↓
Threat Detection Engine
↓
PostgreSQL Logging System
↓
Dockerized Multi-Service Infrastructure

---

# Docker Deployment

## Build & Run

```bash
docker compose up --build

Stop Containers
docker compose down

Access Services
Service	Port
Frontend	3000
Backend API	8080
PostgreSQL	5432
API Health Check

Backend Health Endpoint:

http://localhost:8080/health

Expected Response:

{"server":"healthy"}

Current Development Status
Completed Phases
Backend & Infrastructure
Gin backend architecture
Modular API routing
PostgreSQL integration
Traffic APIs
Alert APIs
WebSocket infrastructure
Traffic Monitoring Engine
Packet parsing engine
Realtime traffic monitoring
Automatic traffic logging
Threat detection system
Alert generation workflows
Frontend & Dashboarding
Next.js frontend
Realtime traffic dashboard
Threat alert dashboard
Unified SOC dashboard
Enterprise UI polish
Responsive enterprise styling
Security Systems
Authentication system
Role-based access control
Exportable security reports
GeoIP threat intelligence
Deployment
Dockerized frontend
Dockerized backend
PostgreSQL containerization
Docker Compose orchestration
Multi-container networking
Temporary Production Stabilization Notes

During Docker deployment stabilization, the following components are temporarily paused for controlled restoration phases:

Production JWT enforcement
Live host packet sniffing
Full analytics graph rendering

These systems will be restored in dedicated production restoration phases following the final release.

Official Roadmap Status
Completed

✅ Backend Infrastructure
✅ Packet Capture Engine
✅ Traffic Parsing Engine
✅ Threat Detection Engine
✅ WebSocket Infrastructure
✅ Enterprise SOC Dashboard
✅ Authentication & RBAC
✅ Exportable Security Reports
✅ Dockerized Deployment
✅ Enterprise UI/UX Polish

Planned Restoration Phases
Phase 25 — Production JWT Restoration

Restores:

Secure JWT middleware
Protected monitoring APIs
Frontend token handling
Bearer token authentication flow
Phase 26 — Production Packet Capture Restoration

Restores:

Live packet sniffing
Host network monitoring
Production traffic capture workflows
Phase 27 — Enterprise Analytics Restoration

Restores:

Traffic analytics graphs
Historical visualizations
Enterprise SOC metrics
Realtime analytics rendering


Project Structure

backend/
frontend/
docker-compose.yml
README.md


Sample Monitoring Output
Traffic Event

SRC: 192.168.1.5 -> DST: 142.250.183.78 | PROTOCOL: TCP | PORT: 443


Threat Alert

🚨 HIGH ALERT
Message: Suspicious Port Activity Detected
Source: 10.0.0.12
Destination: 172.217.167.110
Protocol: TCP
Port: 4444


Installation
Clone Repository
git clone https://github.com/ayushsingh257/NetSentinel-X.git
cd NetSentinel-X


Backend Setup

cd backend
go mod tidy
go run main.go


Frontend Setup

cd frontend
npm install
npm run dev


Docker Setup

docker compose up --build



Licensing & Ethics

NetSentinel-X is released under the MIT License.

The platform is intended strictly for ethical cybersecurity research, defensive monitoring, educational use, and authorized network analysis.
Unauthorized deployment against third-party infrastructure may violate legal regulations and organizational policies.


Author

Ayush Singh
Cybersecurity Engineer & SOC Platform Developer

GitHub:
https://github.com/ayushsingh257