# Enterprise Web Security Guide

## 1. Overview

NetSentinel-X V2 enforces a hardened Web Application Security layer designed around the OWASP Top 10 framework. The platform provides full defense-in-depth across the frontend UI, API Gateway middleware, sanitization pipelines, and file upload systems.

---

## 2. Key Security Mechanisms

### A. Cross-Site Scripting (XSS) Defense
* **Backend Detection (`XSSProtectionService`)**: Scans parameters, headers, and bodies for stored, reflected, and DOM injection vectors (e.g., `<script>`, `onerror=`, `javascript:`).
* **Frontend Sanitization (`DOMPurify`)**: Cleans user-rendered markdown, analyst notes, and report preview strings via `sanitizeHTML()` in `lib/sanitize.ts`.

### B. Cross-Site Request Forgery (CSRF) Protection
* **Double-Submit Token Enforcer (`middleware/csrf.go`)**: Requires `X-CSRF-Token` header on state-modifying endpoints (`POST`, `PUT`, `PATCH`, `DELETE`).
* **SameSite Strict Cookies**: Returns `csrf_token` cookie with `SameSite=Strict` and HTTP origin verification.
* **Token Endpoint**: `GET /api/v2/security/csrf-token`

### C. Content Security Policy (CSP) & Security Headers
* `Content-Security-Policy`: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws://localhost:8080 http://localhost:8080 ws://localhost:3000 http://localhost:3000; frame-ancestors 'none'; object-src 'none';`
* `X-Frame-Options`: `DENY` (Prevents clickjacking)
* `X-Content-Type-Options`: `nosniff`
* `Strict-Transport-Security`: `max-age=31536000; includeSubDomains; preload`
* `Permissions-Policy`: `camera=(), microphone=(), geolocation=(), payment=()`

### D. Secure File Upload Policy (`FileSecurityService`)
* **Extension Allowlist**: `.pdf`, `.json`, `.csv`, `.txt`
* **Blocked Executables**: `.exe`, `.sh`, `.bat`, `.js`, `.html`, `.php`, `.py`
* **Max File Size**: 10MB limit per request
* **Sanitization**: Non-alphanumeric characters stripped from uploaded filenames.
* **Validation Endpoint**: `POST /api/v2/security/files/validate`

---

## 3. Developer Security Guidelines

1. **Always Parameterize Queries**: Never concatenate raw strings into SQL statements. Use Go `database/sql` positional placeholders (`$1`, `$2`).
2. **Sanitize Rendered Content**: Pass raw external text through `sanitizeHTML()` before displaying in DOM components.
3. **Attach CSRF Tokens**: Frontend API fetch wrappers must include the `X-CSRF-Token` header obtained from `/api/v2/security/csrf-token`.
