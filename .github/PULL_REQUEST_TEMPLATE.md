## Description
Briefly describe the purpose of this Pull Request, key features added, or security vulnerabilities fixed.

## Security Checklist
Please review and check all items before requesting code review:

- [ ] **Authentication & MFA**: Reviewed changes to login, tokens, or TOTP MFA routines.
- [ ] **Authorization (RBAC)**: Verified role permission guards (`RequirePermission`) on new REST API routes.
- [ ] **Secret Clearance**: Confirmed NO API keys, passwords, private keys, or AWS tokens are committed.
- [ ] **Data Protection & Encryption**: Ensured PII/DB fields use parameterized queries and AES-256-GCM encryption where required.
- [ ] **Input Sanitization**: Verified input validation against OWASP Top 10 (SQLi, XSS, Path Traversal).
- [ ] **Unit & Integration Tests**: Added or updated tests in `backend/services/*_test.go` and `frontend/components/*.test.tsx`.
- [ ] **CI/CD Security Gate**: All automated SAST, secret scanning, dependency, and container scans are passing 🟢.

## Related Issues / Security Advisories
- Fixes # (issue)
- Security Advisory: Era 26 SSDLC Compliance
