# Docker Security Guide — NetSentinel-X V2 Production
# Era 21: Infrastructure & Platform Security

This guide documents the container security controls applied to NetSentinel-X V2 production Docker images.

---

## 1. Hardened Image Architecture

### Backend (Go API)
```
Builder stage: golang:1.22-alpine
Runtime stage: gcr.io/distroless/static-debian12:nonroot
```

### Frontend (Next.js)
```
Deps stage:    node:20-alpine
Builder stage: node:20-alpine
Runtime stage: node:20-alpine (non-root user netsentinel:10001)
```

**Why distroless?**
- No shell → attacker cannot run commands
- No package manager → cannot install tools
- No OS utilities → massively reduced attack surface
- Image size ~10MB vs ~200MB Ubuntu

---

## 2. Security Controls Applied

### 2.1 Non-Root User Execution

```dockerfile
# Backend: distroless:nonroot runs as UID 65532 by default
FROM gcr.io/distroless/static-debian12:nonroot

# Frontend: explicit dedicated user
RUN addgroup --system --gid 10001 netsentinel && \
    adduser --system --uid 10001 --ingroup netsentinel netsentinel
USER netsentinel
```

**Threat mitigated**: Container escape via privilege escalation — attacker limited to UID 10001.

### 2.2 Read-Only Root Filesystem

```yaml
# docker-compose.production.yml
services:
  backend:
    read_only: true
    tmpfs:
      - /tmp:size=64m,noexec
```

**Threat mitigated**: Malware persistence — cannot write to filesystem.

### 2.3 Capability Drops

```yaml
services:
  backend:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # Only needed if binding to port < 1024
```

**Capabilities dropped**: CHOWN, DAC_OVERRIDE, FSETID, FOWNER, MKNOD, NET_RAW, SETGID, SETUID, SETFCAP, SETPCAP, NET_BIND_SERVICE, SYS_CHROOT, KILL, AUDIT_WRITE.

### 2.4 No Privileged Mode

```yaml
services:
  backend:
    privileged: false   # NEVER set to true in production
```

**Threat mitigated**: Full host kernel access and device mounting.

### 2.5 No New Privileges

```yaml
services:
  backend:
    security_opt:
      - no-new-privileges:true
```

**Threat mitigated**: SUID/SGID binary abuse within container.

### 2.6 Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512m
          cpus: "1.0"
  frontend:
    deploy:
      resources:
        limits:
          memory: 256m
          cpus: "0.5"
```

**Threat mitigated**: DoS via resource exhaustion — container cannot starve host.

### 2.7 Network Isolation

```yaml
networks:
  netsentinel-internal:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/24
```

Database and Redis are on this internal network only — no external port bindings.

---

## 3. Building Hardened Images

```bash
# Build hardened backend image
docker build \
  -f docker/hardened.Dockerfile.backend \
  -t netsentinel-backend:latest \
  ./backend

# Build hardened frontend image
docker build \
  -f docker/hardened.Dockerfile.frontend \
  -t netsentinel-frontend:latest \
  ./frontend

# Scan for vulnerabilities BEFORE deploying
./docker/scan_images.sh --severity HIGH,CRITICAL
```

---

## 4. Vulnerability Scanning (Trivy)

```bash
# Install Trivy
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Scan backend image
trivy image --severity HIGH,CRITICAL netsentinel-backend:latest

# Scan frontend image
trivy image --severity HIGH,CRITICAL netsentinel-frontend:latest
```

**CI/CD integration**: Trivy scan is included in Era 26 CI/CD security pipeline. Images with CRITICAL vulnerabilities fail the pipeline gate.

---

## 5. Docker Compose Security Reference

```yaml
version: "3.9"

services:
  backend:
    image: netsentinel-backend:latest
    read_only: true
    privileged: false
    user: "65532:65532"        # distroless nonroot
    tmpfs:
      - /tmp:size=64m,noexec
    cap_drop: [ALL]
    cap_add: [NET_BIND_SERVICE]
    security_opt:
      - no-new-privileges:true
    environment:
      - GIN_MODE=release
    deploy:
      resources:
        limits:
          memory: 512m
          cpus: "1.0"
    networks:
      - netsentinel-internal
    restart: unless-stopped

  frontend:
    image: netsentinel-frontend:latest
    read_only: true
    privileged: false
    user: "10001:10001"        # netsentinel user
    tmpfs:
      - /tmp:size=32m,noexec
      - /app/.next/cache:size=128m
    cap_drop: [ALL]
    security_opt:
      - no-new-privileges:true
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    deploy:
      resources:
        limits:
          memory: 256m
          cpus: "0.5"
    networks:
      - netsentinel-internal
    restart: unless-stopped

  # Reverse proxy (exposed port 443 only)
  proxy:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on: [frontend, backend]
    networks:
      - netsentinel-internal
    restart: unless-stopped

  # Internal only — NO ports exposed externally
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: netsentinel
      POSTGRES_USER_FILE: /run/secrets/db_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets: [db_user, db_password]
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - netsentinel-internal
    restart: unless-stopped

secrets:
  db_user:
    file: ./secrets/db_user.txt
  db_password:
    file: ./secrets/db_password.txt

networks:
  netsentinel-internal:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/24

volumes:
  pgdata:
    driver: local
```

---

## 6. Security Audit Commands

```bash
# Verify no containers run as root
docker ps -q | xargs docker inspect --format "{{.Name}}: {{.Config.User}}"

# Verify no privileged containers
docker ps -q | xargs docker inspect --format "{{.Name}}: Privileged={{.HostConfig.Privileged}}"

# Verify network port bindings (backend and db should have NO external ports)
docker ps --format "{{.Names}}: {{.Ports}}"
```
