package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestV2AIIntelligenceHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	h := NewV2AIIntelligenceHandler()
	router := gin.New()

	v2 := router.Group("/api/v2")
	{
		v2.GET("/ai/investigation/:incident_id", h.GetInvestigation)
		v2.GET("/threats/:id/mitre", h.GetThreatMITRE)
		v2.GET("/ai/analysis/latest", h.GetLatestAnalysis)
		v2.POST("/ai/copilot/chat", h.CopilotChat)
	}

	t.Run("Get Investigation", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/ai/investigation/INC-2026-9901", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get Threat MITRE Mapping", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/threats/THR-9901/mitre", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get Latest AI Analysis", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/ai/analysis/latest", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Copilot Chat POST", func(t *testing.T) {
		payload, _ := json.Marshal(map[string]string{
			"prompt": "What happened during this incident?",
		})
		req := httptest.NewRequest("POST", "/api/v2/ai/copilot/chat", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})
}
