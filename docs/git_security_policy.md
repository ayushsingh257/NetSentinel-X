# Git Security & Branch Protection Policy — NetSentinel-X V2

## Overview

This policy governs source control access, branch protection rules, and merge requirements for the `NetSentinel-X` repository on GitHub.

---

## 1. Main Branch Protection Rules

The `main` branch is protected. Direct pushes to `main` are restricted to approved releases. All code changes must enter via Pull Requests that satisfy:

1. **Pull Request Requirement**: Minimum 1 peer code review approval from a `SOC_ADMIN` or Security Lead.
2. **Automated CI/CD Passing**: All GitHub Actions workflow checks (`Backend CI`, `Frontend CI`, `SAST`, `Secret Scan`, `Dependency Scan`, `Container Scan`) must return 🟢 **GREEN SUCCESS**.
3. **No Critical / High Vulnerabilities**: Zero CRITICAL or HIGH severity findings in Semgrep SAST, Gitleaks, govulncheck/npm audit, or Trivy container scans.
4. **Signed Commits**: All commits must be GPG signed to verify committer identity.
5. **Linear History**: Require squash merging or rebase merging to maintain a clean linear audit history.

---

## 2. Developer Access & Least Privilege

- **Write Access**: Restricted to authenticated core developers with MFA enabled on GitHub.
- **Admin Access**: Restricted to repository owners (`SUPER_ADMIN` role).
- **Secret Scanning**: GitHub Secret Scanning and Push Protection are enabled repository-wide.
