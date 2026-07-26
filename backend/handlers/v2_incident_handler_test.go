package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestV2IncidentHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewV2IncidentHandler()
	router := gin.New()

	v2 := router.Group("/api/v2/incidents")
	{
		v2.GET("", handler.GetOverview)
		v2.GET("/list", handler.GetIncidents)
		v2.GET("/:id", handler.GetIncidentByID)
		v2.POST("/create", handler.CreateIncident)
		v2.POST("/:id/evidence", handler.AddEvidence)
		v2.POST("/:id/assign", handler.AssignAnalyst)
		v2.POST("/:id/close", handler.CloseIncident)
	}

	t.Run("Get Overview Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/incidents", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Get Incident List Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/incidents/list", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Get Incident By ID Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/incidents/INC-2026-8001", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Create Incident Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(CreateIncidentReq{
			Title:          "Data Exfiltration Alert",
			Summary:        "High volume upload",
			Severity:       "HIGH",
			Priority:       "P2",
			Analyst:        "Analyst-X",
			AffectedAssets: []string{"192.168.1.150"},
		})

		req := httptest.NewRequest("POST", "/api/v2/incidents/create", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusCreated {
			t.Fatalf("Expected status 201 Created, got %d", resp.Code)
		}
	})

	t.Run("Assign Analyst Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(AssignReq{
			Analyst: "Lead Engineer",
			Role:    "Incident Commander",
		})

		req := httptest.NewRequest("POST", "/api/v2/incidents/INC-2026-8001/assign", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Close Incident Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(CloseReq{
			ResolutionNotes: "Revoked compromised session keys and restarted network firewall rule.",
		})

		req := httptest.NewRequest("POST", "/api/v2/incidents/INC-2026-8001/close", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})
}
