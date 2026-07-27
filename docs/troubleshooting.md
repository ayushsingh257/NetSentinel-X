# NetSentinel-X V2 — Troubleshooting & Diagnostic Guide

## Common Issues & Diagnostics

### 1. WebSocket Disconnection (`/ws`)
- **Symptom**: Telemetry live feed displays "Offline" or fails to update.
- **Fix**: Check `process.env.NEXT_PUBLIC_API_URL`. Ensure backend Go API service is running on port 8080. Confirm JWT token parameter `ws://localhost:8080/ws?token=<TOKEN>` is valid.

### 2. Rate Limit Exceeded (HTTP 429)
- **Symptom**: API requests return `429 Too Many Requests`.
- **Fix**: Wait 60 seconds (as specified in `Retry-After` header) or request rate limit quota adjustment from `SUPER_ADMIN`.

### 3. PostgreSQL Database Connection Failure
- **Symptom**: Backend API outputs DB connection timeout error on startup.
- **Fix**: Verify PostgreSQL service in `docker-compose.production.yml` is healthy. Ensure database credentials in `.env` match `POSTGRES_USER` and `POSTGRES_PASSWORD`.
