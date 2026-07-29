package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"netsentinel-x-backend/middleware"
	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupAuthzHandlerRouter() (*gin.Engine, *services.AuthorizationService) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	auditService := services.NewAuditService()
	secAuditService := services.NewSecurityAuditService()
	privMon := services.NewPrivilegeMonitorService(secAuditService, auditService)
	authz := services.NewAuthorizationService(auditService, privMon)
	middleware.SetGlobalAuthorizationService(authz)

	handler := NewV2AuthorizationHandler(authz, privMon, secAuditService)

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

	r.GET("/api/v2/authz/me", handler.GetMyPermissions)
	r.POST("/api/v2/authz/check", handler.CheckPermission)
	r.GET("/api/v2/authz/roles", handler.GetRoleMatrix)
	r.GET("/api/v2/authz/violations", handler.GetViolations)
	r.GET("/api/v2/authz/events", handler.GetAuthzEvents)

	return r, authz
}

func TestV2AuthorizationHandler_GetMyPermissions(t *testing.T) {
	r, _ := setupAuthzHandlerRouter()

	req, _ := http.NewRequest("GET", "/api/v2/authz/me", nil)
	req.Header.Set("X-Test-Role", "SECURITY_ANALYST")
	req.Header.Set("X-Test-User", "ayush_analyst")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)

	assert.Equal(t, "ayush_analyst", resp["user"])
	assert.Equal(t, "SECURITY_ANALYST", resp["role"])
	perms := resp["permissions"].([]interface{})
	assert.True(t, len(perms) > 0)
}

func TestV2AuthorizationHandler_CheckPermission(t *testing.T) {
	r, _ := setupAuthzHandlerRouter()

	body, _ := json.Marshal(map[string]string{
		"permission": "CREATE_RULES",
	})

	req, _ := http.NewRequest("POST", "/api/v2/authz/check", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Test-Role", "VIEW_ONLY")
	req.Header.Set("X-Test-User", "viewer")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)

	assert.Equal(t, false, resp["allowed"])
}

func TestV2AuthorizationHandler_GetRoleMatrix(t *testing.T) {
	r, _ := setupAuthzHandlerRouter()

	req, _ := http.NewRequest("GET", "/api/v2/authz/roles", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)

	matrix := resp["matrix"].(map[string]interface{})
	assert.True(t, len(matrix) >= 7)
}
