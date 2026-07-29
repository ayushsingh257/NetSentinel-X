# Enterprise Authorization Architecture Review

## 1. Authentication vs. Authorization

In NetSentinel-X V2, platform security is divided into two distinct cryptographic and logical security layers:

* **Authentication (Era 17 - Complete)**: Answers *"Who are you?"*
  * Uses cryptographic HMAC-SHA256 signed JSON Web Tokens (JWT).
  * Validates token format, signature integrity, and expiration (`ExpiresAt`).
  * Attaches user identity claims (`user_id`, `username`, `role`) to the request context.
* **Authorization (Era 18 - Current)**: Answers *"What are you allowed to do?"*
  * Implements Role-Based Access Control (RBAC) and explicit permission checks.
  * Evaluates authenticated user permissions against action-level policy requirements.
  * Prevents privilege escalation and logs unauthorized access attempts.

---

## 2. RBAC Architecture & Role Hierarchy

NetSentinel-X V2 defines a strict 7-tier role hierarchy based on least privilege principles:

```
SUPER_ADMIN (Full Platform Access)
     │
SOC_ADMIN (SOC Management & Operational Administration)
     │
SECURITY_ANALYST (Incident Response & SOAR Execution)
     │
THREAT_HUNTER (Hypothesis Execution & Historical Search)
     │
DETECTION_ENGINEER (Sigma / YARA Rule Authoring & Optimization)
     │
AUDITOR (Compliance & Audit Read-Only Access)
     │
VIEW_ONLY (Read-Only Dashboard View)
```

### Permission Mapping Matrix

| Permission String | Description | Super Admin | SOC Admin | Security Analyst | Threat Hunter | Detection Engineer | Auditor | View Only |
|-------------------|-------------|:-----------:|:---------:|:----------------:|:-------------:|:------------------:|:-------:|:---------:|
| `VIEW_INCIDENTS` | View incidents & details | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `CREATE_INCIDENTS` | Create new incident tickets | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `CLOSE_INCIDENTS` | Close/resolve incidents | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `RUN_THREAT_HUNTS` | Run threat hunting queries | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `CREATE_RULES` | Create detection rules | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `MODIFY_RULES` | Modify/delete detection rules | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `EXECUTE_PLAYBOOKS` | Execute SOAR playbooks | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `EXPORT_REPORTS` | Export compliance & executive reports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `VIEW_AUDIT_LOGS` | View system audit logs & posture | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `SYSTEM_CONFIGURATION` | Modify platform security settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 3. JWT Claims & User Identity Flow

```
1. Client Sends HTTP Request
   Header: Authorization: Bearer <jwt>

2. AuthMiddleware (backend/middleware/jwt.go)
   ├── Validates HS256 signature
   ├── Checks Expiration & Issuer
   └── Injects Context Variables:
       ├── c.Set("user_id", claims.UserID)
       ├── c.Set("username", claims.Username)
       └── c.Set("role", claims.Role)

3. AuthorizationMiddleware (backend/middleware/authorization.go)
   ├── Extracts "role" from context
   ├── Evaluates RequirePermission(targetPerm) via AuthorizationService
   ├── If Authorized ──> Proceed to Handler
   └── If Denied:
       ├── Emits Security Event (PRIVILEGE_ESCALATION / UNAUTHORIZED_ACCESS)
       ├── Logs Audit Event
       └── Returns 403 Forbidden { "error": "Insufficient privileges", "code": "FORBIDDEN" }
```

---

## 4. Security Model & Privilege Escalation Defenses

1. **Explicit Denial by Default**: Endpoints requiring permission check will reject any role not explicitly possessing the permission.
2. **Context-Aware Privilege Escalation Monitoring**: Any attempt by non-admin roles to access `SYSTEM_CONFIGURATION` or modify role assignments automatically flags a `HIGH`/`CRITICAL` security violation event in `SecurityAuditService`.
3. **Immutability of Audit Trails**: All authorization decisions (`ALLOW` / `DENY`) create an immutable audit record containing request details, user metadata, resource endpoint, and decision rationale.
