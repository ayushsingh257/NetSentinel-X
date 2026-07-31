# NetSentinel-X V2 — Vercel Frontend Deployment Guide

This guide provides step-by-step instructions for deploying the **NetSentinel-X V2** Next.js 16 frontend to **Vercel**.

---

## 1. Required Environment Variables

Configure the following environment variables in your Vercel Project Settings (`Settings -> Environment Variables`):

| Variable Name | Description | Production Example | Required |
| :--- | :--- | :--- | :---: |
| `NEXT_PUBLIC_API_URL` | Public HTTPS URL of the backend API Gateway running on your VPS. | `https://api.netsentinel.io` | **YES** |
| `NEXT_PUBLIC_WS_URL` | Public WSS (WebSocket) URL of the backend streaming telemetry feed. | `wss://api.netsentinel.io/ws` | **YES** |
| `NODE_ENV` | Environment mode for Next.js execution. | `production` | **YES** |

---

## 2. Vercel Build Settings

Configure the build parameters in Vercel UI or rely on `frontend/vercel.json`:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (or `next build`)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install`
- **Node.js Version**: `20.x` or higher

---

## 3. Automated Vercel CLI Deployment

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Authenticate with Vercel
vercel login

# Deploy to Staging Preview
vercel

# Deploy to Production
vercel --prod
```

### Option B: GitHub Repository Integration

1. Connect your GitHub repository to Vercel via the Vercel Dashboard.
2. Select the `frontend` root directory as the **Root Directory** setting.
3. Configure the environment variables (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`).
4. Enable automatic deployments on `main` branch pushes.

---

## 4. Security & Content Security Policy (CSP) Headers

The repository includes `frontend/vercel.json` which automatically sets strict HTTP security headers on all edge responses:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## 5. Troubleshooting & Verification

| Issue / Symptom | Potential Cause | Resolution |
| :--- | :--- | :--- |
| **API Requests Fail (CORS Error)** | Backend `CORS_ALLOWED_ORIGINS` does not match Vercel URL. | Update backend `CORS_ALLOWED_ORIGINS` environment variable on VPS to include `https://*.vercel.app` or your custom domain. |
| **WebSocket Connection Failed** | Insecure `ws://` protocol used on HTTPS site. | Ensure `NEXT_PUBLIC_WS_URL` uses secure `wss://` protocol pointing to Nginx SSL proxy. |
| **Static Build Failure** | Typecheck or ESLint error during build. | Run `npm run lint` and `npx tsc --noEmit` locally to verify clean build before pushing. |
