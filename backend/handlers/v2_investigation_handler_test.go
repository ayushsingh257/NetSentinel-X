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

func TestV2InvestigationHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewV2InvestigationHandler()
	router := gin.New()

	v2 := router.Group("/api/v2")
	{
		v2.GET("/investigations", handler.GetInvestigations)
		v2.GET("/investigations/:id", handler.GetInvestigationByID)
		v2.POST("/investigations/generate", handler.GenerateInvestigation)
	}

	t.Run("Get All Investigations Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/investigations", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}

		var result map[string]interface{}
		if err := json.Unmarshal(resp.Body.Bytes(), &result); err != nil {
			t.Fatalf("Failed to parse response: %v", err)
		}

		total, exists := result["total"]
		if !exists || total.(float64) < 1 {
			t.Error("Expected total investigations >= 1")
		}
	})

	t.Run("Get Specific Investigation By ID Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/investigations/INV-2026-001", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}

		var inv models.Investigation
		if err := json.Unmarshal(resp.Body.Bytes(), &inv); err != nil {
			t.Fatalf("Failed to parse response: %v", err)
		}

		if inv.ID != "INV-2026-001" {
			t.Errorf("Expected ID INV-2026-001, got %s", inv.ID)
		}
	})

	t.Run("Generate New Investigation Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(GenerateInvestigationReq{
			TargetIP: "192.168.1.200",
		})
		req := httptest.NewRequest("POST", "/api/v2/investigations/generate", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusCreated {
			t.Fatalf("Expected status 201 Created, got %d", resp.Code)
		}

		var inv models.Investigation
		if err := json.Unmarshal(resp.Body.Bytes(), &inv); err != nil {
			t.Fatalf("Failed to parse response: %v", err)
		}

		if inv.ID == "" {
			t.Error("Expected generated investigation ID")
		}
	})
}
