package handlers

import (
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"time"

	"netsentinel-x-backend/middleware"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type SignupRequest struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Username  string `json:"username" binding:"required"`
	Email     string `json:"email" binding:"required"`
	Password  string `json:"password" binding:"required"`
	Role      string `json:"role"`
}

type UserRecord struct {
	Password  string
	Role      string
	UserID    string
	Email     string
	FirstName string
	LastName  string
}

var (
	userStoreMutex sync.RWMutex
	userStore      = map[string]UserRecord{
		"admin": {
			Password:  "Admin@NetSentinel2026!",
			Role:      "admin",
			UserID:    "usr-001-admin",
			Email:     "admin@netsentinel.io",
			FirstName: "SOC",
			LastName:  "Admin",
		},
		"analyst": {
			Password:  "Analyst@NetSentinel2026!",
			Role:      "analyst",
			UserID:    "usr-002-analyst",
			Email:     "analyst@netsentinel.io",
			FirstName: "Security",
			LastName:  "Analyst",
		},
	}
	emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
)

// ValidatePasswordStrength checks password meets enterprise SOC security policies:
// Min 8 chars, at least 1 digit, at least 1 uppercase letter, at least 1 lowercase letter, at least 1 special char.
func ValidatePasswordStrength(password string) error {
	if len(password) < 8 {
		return fmt.Errorf("password must be at least 8 characters long")
	}
	var hasUpper, hasLower, hasDigit, hasSpecial bool
	for _, ch := range password {
		switch {
		case ch >= 'A' && ch <= 'Z':
			hasUpper = true
		case ch >= 'a' && ch <= 'z':
			hasLower = true
		case ch >= '0' && ch <= '9':
			hasDigit = true
		case strings.ContainsRune("!@#$%^&*()-_=+[]{}|;:,.<>?/~`", ch):
			hasSpecial = true
		}
	}
	if !hasUpper {
		return fmt.Errorf("password must contain at least one uppercase letter")
	}
	if !hasLower {
		return fmt.Errorf("password must contain at least one lowercase letter")
	}
	if !hasDigit {
		return fmt.Errorf("password must contain at least one number")
	}
	if !hasSpecial {
		return fmt.Errorf("password must contain at least one special character")
	}
	return nil
}

// SignupHandler registers a new SOC analyst, engineer, or GRC user.
// Public signup as Admin is forbidden to prevent privilege escalation.
func SignupHandler(c *gin.Context) {
	var req SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Username, email, and password are required",
			"code":  "VALIDATION_ERROR",
		})
		return
	}

	username := strings.ToLower(strings.TrimSpace(req.Username))
	email := strings.ToLower(strings.TrimSpace(req.Email))

	if len(username) < 3 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Username must be at least 3 characters long",
			"code":  "INVALID_USERNAME",
		})
		return
	}

	if !emailRegex.MatchString(email) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid email address format",
			"code":  "INVALID_EMAIL",
		})
		return
	}

	if err := ValidatePasswordStrength(req.Password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
			"code":  "WEAK_PASSWORD",
		})
		return
	}

	role := strings.ToLower(strings.TrimSpace(req.Role))
	if role == "" {
		role = "analyst"
	}

	// Security check: Admin role forbidden from public registration
	if role == "admin" || role == "administrator" || role == "root" || role == "superuser" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Public registration as Administrator is forbidden. Admin roles must be granted by existing SOC administrators.",
			"code":  "ROLE_FORBIDDEN",
		})
		return
	}

	if role != "analyst" && role != "engineer" && role != "grc" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid role selected. Allowed roles: analyst, engineer, grc",
			"code":  "INVALID_ROLE",
		})
		return
	}

	userStoreMutex.Lock()
	defer userStoreMutex.Unlock()

	// Check for duplicate username
	if _, exists := userStore[username]; exists {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Username is already taken. Please choose another.",
			"code":  "DUPLICATE_USERNAME",
		})
		return
	}

	// Check for duplicate email
	for _, u := range userStore {
		if strings.EqualFold(u.Email, email) {
			c.JSON(http.StatusConflict, gin.H{
				"error": "An account with this email address already exists.",
				"code":  "DUPLICATE_EMAIL",
			})
			return
		}
	}

	userID := fmt.Sprintf("usr-%d-%s", time.Now().Unix(), role)
	userStore[username] = UserRecord{
		Password:  req.Password,
		Role:      role,
		UserID:    userID,
		Email:     email,
		FirstName: req.FirstName,
		LastName:  req.LastName,
	}

	token, expiry, err := middleware.GenerateToken(userID, username, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Account created but failed to generate session token",
			"code":  "TOKEN_GENERATION_ERROR",
		})
		return
	}

	csrfToken := middleware.GenerateCSRFToken()

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("auth_token", token, 86400, "/", "", false, true)
	c.SetCookie("csrf_token", csrfToken, 86400, "/", "", false, false)

	c.JSON(http.StatusCreated, gin.H{
		"message":    "User account created successfully",
		"token":      token,
		"csrf_token": csrfToken,
		"role":       role,
		"username":   username,
		"user_id":    userID,
		"expires_in": 86400,
		"expires_at": expiry.Unix(),
	})
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

	userStoreMutex.RLock()
	user, exists := userStore[username]
	userStoreMutex.RUnlock()

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
