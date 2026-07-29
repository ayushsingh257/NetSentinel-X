# Database Hardening & Security Guide — NetSentinel-X V2
# Era 23: Enterprise Security Lifecycle

This guide documents PostgreSQL production hardening steps, encryption enforcement, backup security, and SQL injection prevention.

---

## 1. PostgreSQL Configuration Hardening

Edit `/etc/postgresql/16/main/postgresql.conf`:

```ini
# SSL / TLS Hardening
ssl = on
ssl_cert_file = '/etc/ssl/certs/netsentinel-db.crt'
ssl_key_file = '/etc/ssl/private/netsentinel-db.key'
ssl_min_protocol_version = 'TLSv1.3'

# Connection Security
listen_addresses = '127.0.0.1,172.20.0.1'  # Internal bridge only, NO public 0.0.0.0
max_connections = 100

# Logging & Auditing
logging_collector = on
log_statement = 'ddl'                       # Log all schema modification attempts
log_min_messages = warning
log_connections = on
log_disconnections = on
```

Edit `/etc/postgresql/16/main/pg_hba.conf`:

```ini
# TYPE  DATABASE        USER                ADDRESS                 METHOD
# Reject unencrypted connections
hostssl netsentinel     application_user    172.20.0.0/24           scram-sha-256
hostssl netsentinel     readonly_audit_user 172.20.0.0/24           scram-sha-256
host    all             all                 all                     reject
```

---

## 2. Encryption at Rest & In Transit

- **In Transit**: All connections enforce `sslmode=require`. Plaintext connections are rejected by `pg_hba.conf`.
- **At Rest**: Columns containing sensitive PII, API tokens, or secrets are encrypted using `AES-256-GCM` via `DataEncryptionService`.

---

## 3. Encrypted Backup & Restore Workflow

```bash
# Production Encrypted Backup Command
pg_dump -U postgres_admin netsentinel | \
  openssl enc -aes-256-cbc -salt -pbkdf2 -out /backups/netsentinel_$(date +%Y%m%d_%H%M%S).enc \
  -pass file:/run/secrets/backup_key.txt

# Automated Restore Verification Test
openssl enc -d -aes-256-cbc -pbkdf2 -in /backups/latest.enc \
  -pass file:/run/secrets/backup_key.txt | \
  pg_restore --single-transaction --dbname=test_restore_db
```

---

## 4. Query Security & SQL Injection Prevention

All database interactions MUST use prepared statements or ORM queries.

**PROHIBITED (SQL Injection Risk)**:
```go
// NEVER DO THIS
db.Query("SELECT * FROM users WHERE name='" + userInput + "'")
```

**APPROVED (Parameterized Query)**:
```go
// ALWAYS DO THIS
db.Query("SELECT id, username, email FROM users WHERE name=$1", userInput)
```
