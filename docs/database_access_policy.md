# Database Least Privilege Access Policy — NetSentinel-X V2
# Era 23: Enterprise Security Lifecycle

This policy defines the database access control roles, privilege assignments, and query restrictions for NetSentinel-X V2.

---

## 1. Role Hierarchy

```
                      postgres_admin (Superuser)
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
  migration_user        application_user     readonly_audit_user
 (DDL Schema Migrations) (DML App Telemetry) (Read-Only Compliance)
```

---

## 2. Role Permissions Matrix

| Database Role | LOGIN | SELECT | INSERT | UPDATE | DELETE | CREATE / DROP | ALTER TABLE |
|---------------|-------|--------|--------|--------|--------|---------------|-------------|
| `postgres_admin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `migration_user` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (Migrations) | ✅ (Migrations) |
| `application_user` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ DENIED | ❌ DENIED |
| `readonly_audit_user` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ DENIED | ❌ DENIED |

---

## 3. SQL Role Grant Commands

```sql
-- Create Roles
CREATE ROLE migration_user WITH LOGIN PASSWORD '${MIGRATION_DB_PASSWORD}';
CREATE ROLE application_user WITH LOGIN PASSWORD '${APP_DB_PASSWORD}';
CREATE ROLE readonly_audit_user WITH LOGIN PASSWORD '${AUDIT_DB_PASSWORD}';

-- Schema Permissions
GRANT USAGE ON SCHEMA public TO application_user, readonly_audit_user, migration_user;

-- Application User Grants (DML Only)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO application_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO application_user;

-- Audit User Grants (Read-Only)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_audit_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_audit_user;

-- Revoke Hazardous DDL Capabilities from Application User
REVOKE CREATE ON SCHEMA public FROM application_user;
REVOKE ALL ON DATABASE netsentinel FROM application_user;
GRANT CONNECT ON DATABASE netsentinel TO application_user;
```

---

## 4. Operational Controls & Monitoring

1. **Connection String Restrictions**: Application connection string must specify `sslmode=require` and connect via `application_user`.
2. **DDL Execution Gate**: Migrations must only be executed by CI/CD pipeline using temporary `migration_user` credentials.
3. **Query Audit Logging**: `DatabaseAuditService` logs any unexpected DDL commands (`CREATE`, `DROP`, `ALTER`) attempted by `application_user`.
