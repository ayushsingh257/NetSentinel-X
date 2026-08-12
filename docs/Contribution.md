# NetSentinel-X — Developer & Engineering Contribution Guide 🤝

## Development Setup

### Prerequisites
- **Go**: 1.22+
- **Node.js**: 20+
- **Docker & Docker Compose**: 24+
- **Kubernetes & Helm 3**: 1.28+

---

## Local Development Workflow

### 1. Backend Service
```bash
cd backend
go mod download
go test ./...
go run main.go
```

### 2. Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```

---

## Code Quality & Verification Gates

Before submitting pull requests or committing code, all 4 CI gates must pass:

```bash
# 1. Backend Verification
cd backend
gofmt -w .
go vet ./...
go test ./...
go build ./...

# 2. Frontend Verification
cd frontend
npm run lint
npx tsc --noEmit
npm test
npm run build
```

---

## Pull Request Guidelines
- Follow Conventional Commits format (e.g. `feat(auth): ...`, `fix(helm): ...`, `docs(api): ...`).
- Ensure no secret credentials, API keys, or raw tokens are committed.
- Keep all unit tests passing with 100% test suite success.
