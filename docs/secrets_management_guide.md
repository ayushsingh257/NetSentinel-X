# Secrets Management & Cryptographic Security Guide — NetSentinel-X V2
# Era 22: Enterprise Security Lifecycle

This guide documents secret handling policies, Vault integration, cryptographic standards, and deployment recommendations for NetSentinel-X V2.

---

## 1. Enterprise Secret Handling Rules

1. **Zero Plaintext Secrets**: Plaintext credentials must never be committed to source repositories, written to log files, or embedded in Docker environment variables (`ENV`).
2. **Dynamic Vault Ingestion**: Production environments must inject credentials dynamically from HashiCorp Vault, AWS Secrets Manager, or Azure Key Vault into process environment memory or mounted secret volumes (`/run/secrets/`).
3. **Short-Lived Credentials**: Database and API credentials should utilize auto-expiration (max 90 days) with automated rotation.
4. **Least-Privilege Vault Token**: The Vault token assigned to NetSentinel-X must have `read` permissions restricted to its dedicated path (`secret/data/netsentinel/*`).

---

## 2. HashiCorp Vault Integration Architecture

```hcl
# example vault path policy: netsentinel-policy.hcl
path "secret/data/netsentinel/*" {
  capabilities = ["read", "list"]
}

path "secret/data/netsentinel/db" {
  capabilities = ["read"]
}
```

```bash
# Enable HashiCorp Vault kv-v2 engine
vault secrets enable -path=secret kv-v2

# Write production JWT secret
vault kv put secret/netsentinel/jwt secret="$(openssl rand -hex 32)"
```

---

## 3. Cryptographic Standards Policy

| Function | Standard | Cost / Bit Strength |
|----------|----------|---------------------|
| **Password Storage** | Argon2id / bcrypt | bcrypt cost ≥ 12, Argon2id t=3, m=64MB, p=4 |
| **Telemetry Encryption** | AES-256-GCM | 256-bit symmetric key, 96-bit IV, 128-bit tag |
| **Key Exchange / Signatures** | RSA-4096 / ECDSA P-384 | 4096-bit RSA or P-384 curve |
| **API Signature HMAC** | HMAC-SHA256 | 256-bit secret key |

---

## 4. Production Deployment Checklist

- [ ] All `.env` files removed from production deployment packages
- [ ] HashiCorp Vault / AWS Secrets Manager active and connected
- [ ] JWT secret generated with `openssl rand -hex 32` (>= 32 bytes)
- [ ] `GIN_MODE=release` active
- [ ] Gitleaks CI pre-push scan verified
- [ ] Automated 30-day secret rotation policy active
