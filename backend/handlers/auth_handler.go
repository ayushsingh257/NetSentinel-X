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
// In Era 17 proper implementation this will be replaced by Argon2id-hashed
// credentials stored in the database.
var userStore = map[string]struct {
	Password string
	Role     string
	UserID   string
}{
	"admin":   {Password: "Admin@NetSentinel2026!", Role: "admin", UserID: "usr-001-admin"},
	"analyst": {Password: "Analyst@NetSentinel2026!", Role: "analyst", UserID: "usr-002-analyst"},
}

// LoginHandler authenticates a user and returns a signed JWT token.
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

	// Generate signed JWT
	token, expiry, err := middleware.GenerateToken(user.UserID, username, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate session token",
			"code":  "TOKEN_GENERATION_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":      token,
		"role":       user.Role,
		"username":   username,
		"user_id":    user.UserID,
		"expires_in": 86400,
		"expires_at": expiry.Unix(),
	})
}
