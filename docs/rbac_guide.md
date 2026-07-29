# Enterprise RBAC & Authorization Guide

## 1. Overview

NetSentinel-X V2 implements an enterprise-grade Role-Based Access Control (RBAC) engine that enforces least privilege access across all platform capabilities. Every API endpoint requires cryptographically verified authentication (Era 17 JWT) followed by strict permission evaluation (Era 18 Authorization Engine).

---

## 2. Platform Roles

1. **`SUPER_ADMIN`**: Full platform access, system configuration, role overrides, session management, and unrestricted API access.
2. **`SOC_ADMIN`**: Operational SOC management, playbooks, incident resolution, detection rules, and threat hunting.
3. **`SECURITY_ANALYST`**: Triage incidents, run threat hunts, execute SOAR containment playbooks, add evidence, export reports.
4. **`THREAT_HUNTER`**: Run historical PCAP/event queries, construct threat hypotheses, search IoCs, export investigation reports.
5. **`DETECTION_ENGINEER`**: Author, test, simulate, and toggle custom Sigma & YARA detection rules.
6. **`AUDITOR`**: Read-only compliance access, executive reports, audit logs, and posture inspection.
7. **`VIEW_ONLY`**: Restrictive read-only dashboard access. All state-mutating actions (CREATE/DELETE/EXECUTE/EXPORT) are blocked.

---

## 3. Administrator Usage & Enforcement

### Adding Permission Middleware to Routes (Go Backend)

```go
// Example: Protect an endpoint requiring CREATE_INCIDENTS permission
v2Group.POST("/incidents/create", middleware.RequirePermission(models.PermCreateIncidents), v2IncidentHandler.CreateIncident)
```

### Checking Permission Programmatically

```go
authz := services.NewAuthorizationService(auditService, privilegeMonitor)
allowed, reason := authz.EvaluateAccess(username, role, "SYSTEM_CONFIGURATION", "/api/v2/security/sessions/revoke")
if !allowed {
    // Access denied & audit log created
}
```

### Inspecting Authorization via API

* `GET /api/v2/authz/me`: Get authenticated user role & permission array
* `POST /api/v2/authz/check`: Perform dry-run permission evaluation
* `GET /api/v2/authz/roles`: Retrieve complete role permission matrix
* `GET /api/v2/authz/violations`: Retrieve logged privilege escalation attempts
