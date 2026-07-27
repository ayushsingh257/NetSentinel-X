package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestV2DemoHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewV2DemoHandler()
	router := gin.New()

	v2 := router.Group("/api/v2")
	{
		v2.GET("/demo/scenarios", handler.GetScenarios)
		v2.POST("/demo/load", handler.LoadScenario)
	}

	t.Run("Get Demo Scenarios Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/demo/scenarios", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Load Demo Scenario Endpoint Valid", func(t *testing.T) {
		body, _ := json.Marshal(LoadScenarioReq{ScenarioID: "SCENARIO-C2-BEACON"})
		req := httptest.NewRequest("POST", "/api/v2/demo/load", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Load Demo Scenario Endpoint Invalid ID", func(t *testing.T) {
		body, _ := json.Marshal(LoadScenarioReq{ScenarioID: "INVALID-SCENARIO"})
		req := httptest.NewRequest("POST", "/api/v2/demo/load", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusNotFound {
			t.Fatalf("Expected 404, got %d", resp.Code)
		}
	})
}
