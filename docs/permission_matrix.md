# Enterprise Permission Matrix

| Role | VIEW_INCIDENTS | CREATE_INCIDENTS | CLOSE_INCIDENTS | RUN_THREAT_HUNTS | CREATE_RULES | MODIFY_RULES | EXECUTE_PLAYBOOKS | EXPORT_REPORTS | VIEW_AUDIT_LOGS | SYSTEM_CONFIGURATION | VIEW_DASHBOARD | VIEW_REPORTS |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `SUPER_ADMIN` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `SOC_ADMIN` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `SECURITY_ANALYST` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `THREAT_HUNTER` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `DETECTION_ENGINEER` | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `AUDITOR` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `VIEW_ONLY` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
