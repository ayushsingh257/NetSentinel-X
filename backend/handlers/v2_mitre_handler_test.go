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

func TestV2MITREHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewV2MITREHandler()
	router := gin.New()

	v2 := router.Group("/api/v2/mitre")
	{
		v2.GET("/matrix", handler.GetMatrix)
		v2.GET("/techniques", handler.GetTechniques)
		v2.GET("/techniques/:id", handler.GetTechniqueByID)
		v2.GET("/statistics", handler.GetStatistics)
		v2.GET("/heatmap", handler.GetHeatMap)
		v2.POST("/explain", handler.ExplainTechnique)
	}

	t.Run("Get Matrix Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/mitre/matrix", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}

		var res map[string]interface{}
		if err := json.Unmarshal(resp.Body.Bytes(), &res); err != nil {
			t.Fatalf("Failed to parse response: %v", err)
		}

		total, exists := res["total_tactics"]
		if !exists || total.(float64) != 12 {
			t.Errorf("Expected total_tactics 12, got %v", total)
		}
	})

	t.Run("Get Specific Technique By ID Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/mitre/techniques/T1071", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}

		var tech models.MITRETechnique
		if err := json.Unmarshal(resp.Body.Bytes(), &tech); err != nil {
			t.Fatalf("Failed to parse response: %v", err)
		}

		if tech.ID != "T1071" {
			t.Errorf("Expected ID T1071, got %s", tech.ID)
		}
	})

	t.Run("Get Statistics Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/mitre/statistics", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}

		var stats models.MITREStatistics
		if err := json.Unmarshal(resp.Body.Bytes(), &stats); err != nil {
			t.Fatalf("Failed to parse response: %v", err)
		}

		if stats.TotalTechniquesMapped == 0 {
			t.Error("Expected TotalTechniquesMapped > 0")
		}
	})

	t.Run("Get Heatmap Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/mitre/heatmap", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Explain Technique Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(ExplainTechniqueReq{
			TechniqueID: "T1048.003",
		})
		req := httptest.NewRequest("POST", "/api/v2/mitre/explain", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})
}
