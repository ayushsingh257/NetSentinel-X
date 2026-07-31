# Multi-stage production build for NetSentinel-X V2 Backend Engine

# STAGE 1: Builder
FROM golang:1.26.3-bookworm AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpcap-dev \
    gcc \
    libc-dev \
 && rm -rf /var/lib/apt/lists/*

# Cache Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and build production binary
COPY . .
RUN CGO_ENABLED=1 GOOS=linux go build -ldflags="-s -w" -o netsentinel .

# STAGE 2: Production Minimal Runtime
FROM debian:bookworm-slim AS runner

WORKDIR /app

# Install runtime dependencies (libpcap, TLS certs, health check tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpcap0.8 \
    ca-certificates \
    wget \
 && rm -rf /var/lib/apt/lists/*

# Create non-root system user & group
RUN groupadd -g 10001 netsentinel && \
    useradd -u 10001 -g netsentinel -s /bin/false netsentinel && \
    chown -R netsentinel:netsentinel /app

# Copy binary from builder
COPY --from=builder --chown=netsentinel:netsentinel /app/netsentinel /app/netsentinel

# Switch to non-root execution context
USER netsentinel:netsentinel

EXPOSE 8080

CMD ["/app/netsentinel"]