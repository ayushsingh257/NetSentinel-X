package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestV2UEBAHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewV2UEBAHandler()
	router := gin.New()

	v2 := router.Group("/api/v2/ueba")
	{
		v2.GET("", handler.GetOverview)
		v2.GET("/entities", handler.GetEntities)
		v2.GET("/anomalies", handler.GetAnomalies)
		v2.GET("/risk/:entity", handler.GetEntityRisk)
		v2.GET("/history", handler.GetHistory)
	}

	t.Run("Get UEBA Overview Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/ueba", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Get Entities Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/ueba/entities", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}

		var res map[string]interface{}
		if err := json.Unmarshal(resp.Body.Bytes(), &res); err != nil {
			t.Fatalf("Failed to parse JSON: %v", err)
		}

		total, exists := res["total"]
		if !exists || total.(float64) < 1 {
			t.Error("Expected total entities >= 1")
		}
	})

	t.Run("Get Anomalies Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/ueba/anomalies", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Get Entity Risk Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/ueba/risk/192.168.1.105", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}

		var res map[string]interface{}
		if err := json.Unmarshal(resp.Body.Bytes(), &res); err != nil {
			t.Fatalf("Failed to parse JSON: %v", err)
		}

		if _, exists := res["profile"]; !exists {
			t.Error("Expected profile object in risk endpoint response")
		}
	})
}
