# NetSentinel-X V2 — Enterprise System Architecture Guide

## Overview

NetSentinel-X V2 is engineered as a modular, high-performance Network Detection & Response (NDR) platform. The system operates on a dual-tier Go/Next.js architecture with live WebSocket telemetry streaming and RAG-augmented AI reasoning.

---

## Service Layer Breakdown

1. **Packet Telemetry & DPI Engine**: Real-time packet parsing (`gopacket/pcap`) extracting IP, TCP, UDP, DNS, HTTP, and TLS SNI headers.
2. **Threat Detection Engine**: Sigma/YARA inspired rule evaluation matching packet headers and payloads against signature database.
3. **AI Security Copilot & RAG Engine**: Retrieval-Augmented Generation retrieving context from active alerts, GeoIP enrichment, and MITRE tactics.
4. **Threat Intelligence Fusion Engine**: Multi-provider async lookup across 8 intel feeds generating composite reputation scores.
5. **User & Entity Behaviour Analytics (UEBA)**: Baseline statistical profiling tracking beaconing, port scanning, brute forcing, lateral movement, exfiltration, and DNS tunneling.
6. **AI Workflow Automation (SOAR)**: Multi-action playbook execution with automated containment, notification, and manual approval workflows.
7. **Enterprise Observability & Health Monitoring**: Continuous uptime, latency, and failure tracking across 8 core microservices.
