package middleware

import (
	"net/http"

	"netsentinel-x-backend/models"
	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

var globalAuthzService *services.AuthorizationService

// SetGlobalAuthorizationService configures the singleton authorization service for middleware evaluation.
func SetGlobalAuthorizationService(authz *services.AuthorizationService) {
	globalAuthzService = authz
}

// GetGlobalAuthorizationService returns the current configured authorization service instance.
func GetGlobalAuthorizationService() *services.AuthorizationService {
	return globalAuthzService
}

// RequirePermission checks if the authenticated user possesses the specified permission.
func RequirePermission(requiredPerm models.Permission) gin.HandlerFunc {
	return func(c *gin.Context) {
		usernameVal, _ := c.Get("username")
		roleVal, _ := c.Get("role")

		username, _ := usernameVal.(string)
		role, _ := roleVal.(string)

		if username == "" {
			username = "ANONYMOUS"
		}

		if role == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authentication required prior to authorization check",
				"code":  "UNAUTHENTICATED",
			})
			c.Abort()
			return
		}

		resource := c.FullPath()
		if resource == "" {
			resource = c.Request.URL.Path
		}

		if globalAuthzService != nil {
			allowed, reason := globalAuthzService.EvaluateAccess(username, role, string(requiredPerm), resource)
			if !allowed {
				c.JSON(http.StatusForbidden, gin.H{
					"error":               "Access denied. Insufficient role permissions.",
					"code":                "INSUFFICIENT_PRIVILEGES",
					"reason":              reason,
					"required_permission": string(requiredPerm),
				})
				c.Abort()
				return
			}
		} else {
			// Standalone fallback if global service not registered
			authz := services.NewAuthorizationService(nil, nil)
			if !authz.HasPermissionForUser(role, string(requiredPerm)) {
				c.JSON(http.StatusForbidden, gin.H{
					"error":               "Access denied. Insufficient role permissions.",
					"code":                "INSUFFICIENT_PRIVILEGES",
					"required_permission": string(requiredPerm),
				})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}
