package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"netsentinel-x-backend/models"
	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupAuthzRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	auditService := services.NewAuditService()
	secAuditService := services.NewSecurityAuditService()
	privMon := services.NewPrivilegeMonitorService(secAuditService, auditService)
	authz := services.NewAuthorizationService(auditService, privMon)
	SetGlobalAuthorizationService(authz)

	// Mock Auth Middleware to simulate authenticated request context
	r.Use(func(c *gin.Context) {
		role := c.GetHeader("X-Test-Role")
		user := c.GetHeader("X-Test-User")
		if role != "" {
			c.Set("role", role)
		}
		if user != "" {
			c.Set("username", user)
		}
		c.Next()
	})

	r.POST("/protected-incidents", RequirePermission(models.PermCreateIncidents), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	r.POST("/protected-hunts", RequirePermission(models.PermRunThreatHunts), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	r.POST("/protected-system", RequirePermission(models.PermSystemConfiguration), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	return r
}

func TestRequirePermissionMiddleware(t *testing.T) {
	r := setupAuthzRouter()

	t.Run("SuperAdmin Access Allowed", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/protected-system", nil)
		req.Header.Set("X-Test-Role", "SUPER_ADMIN")
		req.Header.Set("X-Test-User", "admin")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("Security Analyst Allowed Threat Hunts", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/protected-hunts", nil)
		req.Header.Set("X-Test-Role", "SECURITY_ANALYST")
		req.Header.Set("X-Test-User", "analyst")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("Security Analyst Denied System Configuration", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/protected-system", nil)
		req.Header.Set("X-Test-Role", "SECURITY_ANALYST")
		req.Header.Set("X-Test-User", "analyst")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusForbidden, w.Code)
	})

	t.Run("View Only Denied Create Incidents", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/protected-incidents", nil)
		req.Header.Set("X-Test-Role", "VIEW_ONLY")
		req.Header.Set("X-Test-User", "viewer")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusForbidden, w.Code)
	})

	t.Run("Unauthenticated Context Denied", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/protected-incidents", nil)
		// No X-Test-Role header set
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}
