package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestV2EventBusHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	h := NewV2EventBusHandler()
	router := gin.New()

	v2 := router.Group("/api/v2/events")
	{
		v2.GET("/stream", h.GetStream)
		v2.GET("/history", h.GetHistory)
		v2.GET("/workers/status", h.GetWorkerStatus)
		v2.GET("/dlq", h.GetDLQ)
	}

	t.Run("Get Stream Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/events/stream", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get History Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/events/history?type=threat.detected", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get Workers Status Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/events/workers/status", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get DLQ Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/events/dlq", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})
}
