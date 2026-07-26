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

func TestV2OptimizerHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewV2OptimizerHandler()
	router := gin.New()

	v2 := router.Group("/api/v2/optimizer")
	{
		v2.GET("", handler.GetOverview)
		v2.GET("/rules", handler.GetRules)
		v2.GET("/recommendations", handler.GetRecommendations)
		v2.GET("/gaps", handler.GetGaps)
		v2.POST("/feedback", handler.SubmitFeedback)
		v2.POST("/analyze", handler.AnalyzeRule)
	}

	t.Run("Get Optimizer Overview Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/optimizer", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Get Rule Performance List Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/optimizer/rules", nil)
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

	t.Run("Get Recommendations Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/optimizer/recommendations", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Get Detection Gaps Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/optimizer/gaps", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Submit Analyst Feedback Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(models.FeedbackRecord{
			AlertID:        "ALT-8001",
			RuleID:         "RULE-SIGMA-001",
			AnalystVerdict: "TRUE_POSITIVE",
			Notes:          "Confirmed C2 beaconing pattern",
		})

		req := httptest.NewRequest("POST", "/api/v2/optimizer/feedback", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusCreated {
			t.Fatalf("Expected status 201 Created, got %d", resp.Code)
		}
	})

	t.Run("Analyze Specific Rule Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(AnalyzeReq{
			RuleID: "RULE-SIGMA-001",
		})

		req := httptest.NewRequest("POST", "/api/v2/optimizer/analyze", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})
}
