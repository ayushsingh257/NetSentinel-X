package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestV2ObservabilityHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewV2ObservabilityHandler()
	router := gin.New()

	v2 := router.Group("/api/v2")
	{
		v2.GET("/audit/logs", handler.GetAuditLogs)
		v2.GET("/audit/search", handler.SearchAuditLogs)
		v2.GET("/audit/export", handler.ExportAuditLogs)
		v2.GET("/health", handler.GetHealth)
		v2.GET("/health/services", handler.GetHealthServices)
		v2.GET("/metrics", handler.GetMetrics)
		v2.GET("/metrics/security", handler.GetSecurityMetrics)
	}

	t.Run("Get Audit Logs Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/audit/logs", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Search Audit Logs Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/audit/search?category=THREAT_HUNT", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Export Audit Logs Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/audit/export", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get Health Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/health", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get Health Services Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/health/services", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get Metrics Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/metrics", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get Security Metrics Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/metrics/security", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})
}
