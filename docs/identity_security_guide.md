# Enterprise Secure Session & Identity Guide — NetSentinel-X V2
# Era 24: Enterprise Security Lifecycle

This guide documents the operation of short-lived JWTs, TOTP MFA, refresh token rotation, session revocation, and adaptive login risk detection.

---

## 1. Token Lifecycles & Refresh Flow

### Access Token Specification
- **Algorithm**: RS256 / HS256
- **Lifetime**: 15 Minutes
- **Header**: `Authorization: Bearer <access_token>`

### Refresh Token Specification
- **Lifetime**: 30 Days (Sliding Window)
- **Storage**: HttpOnly, Secure, SameSite=Strict Cookie or Encrypted Storage
- **Rotation Endpoint**: `POST /api/v2/identity/refresh`

### Refresh Token Request payload:
```json
{
  "refresh_token": "nsx_ref_98a7f23a9b8..."
}
```

---

## 2. Multi-Factor Authentication Setup & Verification

### MFA Setup (`POST /api/v2/identity/mfa/setup`)
1. User requests setup secret.
2. System returns base32 secret and QR code URI (`otpauth://totp/NetSentinel-X:user@org?secret=...`).
3. 8 emergency recovery codes (`NSX-XXXX-XXXX`) are returned and stored as SHA-256 hashes.

### MFA Verification (`POST /api/v2/identity/mfa/verify`)
```json
{
  "passcode": "582910"
}
```

---

## 3. Session Revocation Workflows

Analysts or Admins can terminate active sessions via REST API:

- **Revoke Single Session**: `POST /api/v2/identity/session/revoke` with `{"session_id": "SESS-1002"}`
- **Revoke All User Sessions**: `POST /api/v2/identity/session/revoke-all` with `{"user_id": "USR-001"}`

---

## 4. Adaptive Risk Rules & Emergency Recovery

- **Impossible Travel**: If User logs in from Mumbai at 10:00 PM and from New York at 10:05 PM, velocity exceeds physical flight speeds. Session is BLOCKED and SOC alerted.
- **Recovery Codes**: If an analyst loses their mobile device, an emergency recovery code can be entered once to bypass TOTP and trigger secret regeneration.
