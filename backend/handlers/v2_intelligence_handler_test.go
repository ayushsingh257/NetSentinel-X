package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"netsentinel-x-backend/models"

	"github.com/gin-gonic/gin"
)

func TestV2IntelligenceHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewV2IntelligenceHandler()
	router := gin.New()

	v2 := router.Group("/api/v2/intelligence")
	{
		v2.GET("", handler.GetOverview)
		v2.GET("/ip/:value", handler.LookupIP)
		v2.GET("/domain/:value", handler.LookupDomain)
		v2.GET("/ioc/:value", handler.LookupIOC)
		v2.POST("/enrich", handler.EnrichIOC)
		v2.GET("/history", handler.GetHistory)
	}

	t.Run("Get Intelligence Overview Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/intelligence", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Lookup IP Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/intelligence/ip/192.168.1.105", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}

		var record models.IOCRecord
		if err := json.Unmarshal(resp.Body.Bytes(), &record); err != nil {
			t.Fatalf("Failed to parse JSON: %v", err)
		}

		if record.Value != "192.168.1.105" {
			t.Errorf("Expected value 192.168.1.105, got %s", record.Value)
		}
	})

	t.Run("Lookup Domain Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/intelligence/domain/malicious-c2-beacon.example-tunnel.org", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Enrich IOC Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(models.EnrichmentRequest{
			IOCType:  "IP",
			IOCValue: "10.0.0.1",
		})

		req := httptest.NewRequest("POST", "/api/v2/intelligence/enrich", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Get History Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/intelligence/history", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})
}
