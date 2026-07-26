package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestV2ReportHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewV2ReportHandler()
	router := gin.New()

	v2 := router.Group("/api/v2")
	{
		v2.GET("/reports", handler.GetReports)
		v2.POST("/reports/generate", handler.GenerateReport)
		v2.GET("/reports/export/:id", handler.ExportReport)
		v2.GET("/compliance", handler.GetCompliance)
		v2.GET("/compliance/status", handler.GetComplianceStatus)
	}

	t.Run("Get Reports List Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/reports", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Generate Report Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(GenerateReportReq{
			Type:  "EXECUTIVE",
			Title: "Monthly CISO Brief",
		})

		req := httptest.NewRequest("POST", "/api/v2/reports/generate", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusCreated {
			t.Fatalf("Expected status 201 Created, got %d", resp.Code)
		}
	})

	t.Run("Export Report Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/reports/export/REP-2026-001", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Get Compliance Frameworks Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/compliance", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Get Compliance Status Summary Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/compliance/status", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})
}
