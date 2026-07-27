package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestV2SecurityHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewV2SecurityHandler()
	router := gin.New()

	v2 := router.Group("/api/v2")
	{
		v2.GET("/security/posture", handler.GetPosture)
		v2.GET("/security/rbac", handler.GetRBAC)
		v2.GET("/security/sessions", handler.GetActiveSessions)
		v2.POST("/security/sessions/revoke", handler.RevokeSession)
		v2.GET("/security/events", handler.GetEvents)
	}

	t.Run("Get Security Posture Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/security/posture", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get RBAC Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/security/rbac", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get Active Sessions Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/security/sessions", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Revoke Session Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(RevokeSessionReq{SessionID: "SES-1001"})
		req := httptest.NewRequest("POST", "/api/v2/security/sessions/revoke", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get Security Events Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/security/events", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})
}
