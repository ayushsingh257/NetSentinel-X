# OAuth2 Architecture & Readiness Specification

## 1. Executive Summary

NetSentinel-X V2 incorporates an OAuth2 / OpenID Connect (OIDC) readiness architecture to support enterprise single sign-on (SSO), third-party SIEM/SOAR integrations, and delegated API access.

---

## 2. Supported OAuth2 Grant Types

1. **Authorization Code Flow with PKCE (Proof Key for Code Exchange)**
   * **Use Case**: Single Page Applications (Next.js frontend UI) and native client applications.
   * **Flow**: User login -> Authorization code returned to redirect URI -> Exchange code + `code_verifier` for JWT Access Token.
2. **Client Credentials Flow**
   * **Use Case**: Machine-to-Machine (M2M) backend automation scripts, SIEM ingestion tools, and orchestrators.
   * **Flow**: Send `client_id` + `client_secret` to `/oauth/token` -> Obtain scoped Access Token.
3. **Refresh Token Flow**
   * **Use Case**: Sliding user session extension without requiring repeated credentials re-entry.

---

## 3. Scopes & Permission Mapping

| OAuth2 Scope | Mapped Permission Set | Allowed Actions |
|--------------|-----------------------|-----------------|
| `incidents:read` | `VIEW_INCIDENTS` | View incident tickets & details |
| `incidents:write` | `CREATE_INCIDENTS`, `CLOSE_INCIDENTS` | Create, update, assign, and close incidents |
| `threats:hunt` | `RUN_THREAT_HUNTS` | Execute historical threat hunting queries |
| `rules:manage` | `CREATE_RULES`, `MODIFY_RULES` | Author and edit Sigma/YARA detection rules |
| `soar:execute` | `EXECUTE_PLAYBOOKS` | Trigger autonomous containment workflows |
| `reports:export` | `EXPORT_REPORTS` | Export compliance and audit reports |
| `admin:all` | `ALL_PERMISSIONS` | Full platform administrative access |

---

## 4. OAuth2 Client Model

```go
type OAuthClient struct {
    ID               string   `json:"id"`
    ClientID         string   `json:"client_id"`
    ClientSecretHash string   `json:"-"`
    Scopes           []string `json:"scopes"`
    RedirectURLs     []string `json:"redirect_urls"`
    Status           string   `json:"status"` // ACTIVE, REVOKED
}
```
