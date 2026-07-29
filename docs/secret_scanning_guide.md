# Secret Leak Scanning Guide — NetSentinel-X V2
# Era 22: Secrets Management & Cryptographic Security

This guide outlines secret leak prevention procedures, Gitleaks CI integration, and remediation workflows for NetSentinel-X V2.

---

## 1. Gitleaks CI Security Gate

NetSentinel-X V2 uses Gitleaks to scan git commits and source repositories for hardcoded credentials.

```
Developer Push ──► Gitleaks Scan ──► Secrets Found?
                                          │
                        ┌─────────────────┴─────────────────┐
                        ▼                                   ▼
                   YES (Block CI)                      NO (Deploy)
```

---

## 2. Monitored Secret Patterns

| Category | Regex / Signature Pattern | Severity |
|----------|---------------------------|----------|
| **AWS Access Keys** | `AKIA[0-9A-Z]{16}` | CRITICAL |
| **RSA / EC Private Keys** | `-----BEGIN (RSA \|EC \|OPENSSH )?PRIVATE KEY-----` | CRITICAL |
| **JWT Secrets** | `(?i)(JWT_SECRET\|SECRET_KEY)\s*=\s*['"]?[a-zA-Z0-9_@#$%-]{4,}['"]?` | CRITICAL |
| **API Keys** | `nsx_live_[a-f0-9]{16,}` | HIGH |
| **Database Credentials** | `(?i)(DATABASE_PASSWORD\|DB_PASS\|POSTGRES_PASSWORD)\s*=\s*...` | HIGH |
| **JWT Bearer Tokens** | `eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+` | MEDIUM |

---

## 3. Pre-Commit Hook Setup

Install Gitleaks as a git pre-commit hook locally:

```bash
# Install gitleaks (macOS/Linux)
brew install gitleaks || sudo apt-get install gitleaks

# Configure pre-commit hook in repo
cat << 'EOF' > .git/hooks/pre-commit
#!/bin/bash
./scripts/security/gitleaks_scan.sh
EOF
chmod +x .git/hooks/pre-commit
```

---

## 4. Remediation Workflow for Leaked Credentials

If Gitleaks or `SecretDetectionService` detects a leaked secret:

1. **Do NOT simply delete the line from code**. The credential remains in Git commit history.
2. **Immediately Revoke the Secret**:
   - For NetSentinel API keys: call `POST /api/v2/secrets/rotate` or `RevokeSecret`
   - For AWS / Cloud keys: deactivate key in Cloud IAM console immediately
3. **Rotate Credential**: Generate a new secret using `SecretsManagementService`.
4. **Purge Git History** (if committed):
   ```bash
   git filter-repo --invert-paths --path <file_with_secret>
   ```
