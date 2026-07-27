package handlers

import (
	"net/http"

	"netsentinel-x-backend/middleware"

	"github.com/gin-gonic/gin"
)

// V2AuthHandler handles session validation and user profile endpoints.
type V2AuthHandler struct{}

func NewV2AuthHandler() *V2AuthHandler {
	return &V2AuthHandler{}
}

// GetMe returns the authenticated user's profile from JWT claims.
// Route: GET /api/auth/me
func (h *V2AuthHandler) GetMe(c *gin.Context) {
	userID, _ := c.Get("user_id")
	username, _ := c.Get("username")
	role, _ := c.Get("role")

	permissions := resolvePermissions(role.(string))

	c.JSON(http.StatusOK, gin.H{
		"user_id":       userID,
		"username":      username,
		"role":          role,
		"permissions":   permissions,
		"session_valid": true,
	})
}

// ValidateSession is a lightweight endpoint that verifies the JWT is valid.
// Route: GET /api/auth/session/validate
// Used by frontend dashboard layout guard to confirm token is legitimate.
func (h *V2AuthHandler) ValidateSession(c *gin.Context) {
	userID, _ := c.Get("user_id")
	username, _ := c.Get("username")
	role, _ := c.Get("role")

	c.JSON(http.StatusOK, gin.H{
		"valid":    true,
		"user_id":  userID,
		"username": username,
		"role":     role,
	})
}

// RefreshToken re-issues a new JWT for a still-valid token (sliding sessions).
// Route: POST /api/auth/refresh
func (h *V2AuthHandler) RefreshToken(c *gin.Context) {
	userID, _ := c.Get("user_id")
	username, _ := c.Get("username")
	role, _ := c.Get("role")

	newToken, expiry, err := middleware.GenerateToken(
		userID.(string),
		username.(string),
		role.(string),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to refresh token",
			"code":  "TOKEN_REFRESH_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":      newToken,
		"expires_in": 86400,
		"expires_at": expiry.Unix(),
	})
}

// Logout invalidates the current session (client removes token).
// Route: POST /api/auth/logout
// In Era 23 (Zero Trust) this will be backed by a server-side token revocation list.
func (h *V2AuthHandler) Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Session terminated successfully. Please remove your local token.",
		"code":    "LOGOUT_SUCCESS",
	})
}

// resolvePermissions returns a permission set for a given role.
func resolvePermissions(role string) []string {
	switch role {
	case "admin":
		return []string{
			"read:all", "write:all", "delete:all",
			"admin:users", "admin:sessions", "admin:rbac",
			"read:audit", "export:audit",
		}
	case "analyst":
		return []string{
			"read:traffic", "read:alerts", "read:incidents",
			"read:intelligence", "read:mitre", "read:ueba",
			"write:incidents", "write:detections",
			"read:reports", "read:audit",
		}
	default:
		return []string{"read:dashboard"}
	}
}
