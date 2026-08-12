package handlers

import (
	"net/http"
	"strings"

	"netsentinel-x-backend/middleware"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// userStore is an in-memory credential store for Phase 1.
var userStore = map[string]struct {
	Password string
	Role     string
	UserID   string
}{
	"admin":   {Password: "Admin@NetSentinel2026!", Role: "admin", UserID: "usr-001-admin"},
	"analyst": {Password: "Analyst@NetSentinel2026!", Role: "analyst", UserID: "usr-002-analyst"},
}

// LoginHandler authenticates a user, sets HttpOnly auth_token & csrf_token cookies, and returns session metadata.
func LoginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Username and password are required",
			"code":  "VALIDATION_ERROR",
		})
		return
	}

	// Normalize username
	username := strings.ToLower(strings.TrimSpace(req.Username))

	// Credential lookup
	user, exists := userStore[username]
	if !exists || req.Password != user.Password {
		// Generic message to prevent username enumeration
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid credentials",
			"code":  "AUTH_INVALID_CREDENTIALS",
		})
		return
	}

	// Generate signed JWT token
	token, expiry, err := middleware.GenerateToken(user.UserID, username, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate session token",
			"code":  "TOKEN_GENERATION_ERROR",
		})
		return
	}

	// Generate CSRF token
	csrfToken := middleware.GenerateCSRFToken()

	// Set HttpOnly, SameSite=Lax/Strict cookie for JWT authentication
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("auth_token", token, 86400, "/", "", false, true)
	c.SetCookie("csrf_token", csrfToken, 86400, "/", "", false, false)

	c.JSON(http.StatusOK, gin.H{
		"token":      token,
		"csrf_token": csrfToken,
		"role":       user.Role,
		"username":   username,
		"user_id":    user.UserID,
		"expires_in": 86400,
		"expires_at": expiry.Unix(),
	})
}

// LogoutHandler clears authentication and CSRF cookies.
func LogoutHandler(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("auth_token", "", -1, "/", "", false, true)
	c.SetCookie("csrf_token", "", -1, "/", "", false, false)

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully logged out",
		"status":  "LOGGED_OUT",
	})
}
