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

func TestV2DetectionHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewV2DetectionHandler()
	router := gin.New()

	v2 := router.Group("/api/v2/detections")
	{
		v2.GET("/rules", handler.GetRules)
		v2.POST("/rules", handler.CreateRule)
		v2.GET("/rules/:id", handler.GetRuleByID)
		v2.PUT("/rules/:id", handler.UpdateRule)
		v2.DELETE("/rules/:id", handler.DeleteRule)
		v2.POST("/rules/:id/toggle", handler.ToggleRule)
		v2.POST("/test", handler.TestRule)
		v2.POST("/simulate", handler.Simulate)
		v2.GET("/analytics", handler.GetAnalytics)
		v2.POST("/ai-assistant", handler.AIAssistant)
	}

	t.Run("Get Rules Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/detections/rules", nil)
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
			t.Error("Expected total rules >= 1")
		}
	})

	t.Run("Create Rule Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(models.DetectionRule{
			Name:     "Endpoint Test Rule",
			Type:     "SIGMA",
			Severity: "HIGH",
			Logic:    "test: true",
		})

		req := httptest.NewRequest("POST", "/api/v2/detections/rules", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusCreated {
			t.Fatalf("Expected status 201 Created, got %d", resp.Code)
		}
	})

	t.Run("Simulate Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(models.SimulationRequest{
			RuleType:      "SIGMA",
			RuleLogic:     "proto: UDP",
			SamplePayload: "UDP DNS packet sample",
		})

		req := httptest.NewRequest("POST", "/api/v2/detections/simulate", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Get Analytics Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/detections/analytics", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("AI Assistant Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(AIAssistantReq{
			Query: "Create a rule for DNS tunneling",
		})

		req := httptest.NewRequest("POST", "/api/v2/detections/ai-assistant", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})
}
