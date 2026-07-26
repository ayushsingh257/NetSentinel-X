package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestV2HistoricalHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewV2HistoricalHandler()
	router := gin.New()

	v2 := router.Group("/api/v2")
	{
		v2.GET("/history/search", handler.SearchEvents)
		v2.GET("/history/events", handler.GetEvents)
		v2.GET("/history/ioc/:value", handler.GetIOCHistory)
		v2.GET("/history/replay/:id", handler.GetReplayByID)
		v2.POST("/hunting/query", handler.RunHuntQuery)
		v2.GET("/hunting/hypothesis", handler.GetHuntHypothesis)
	}

	t.Run("Search Events Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/history/search?q=alert", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get All Events Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/history/events", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get IOC History Known IOC", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/history/ioc/185.220.101.45", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200 for known IOC, got %d", resp.Code)
		}
	})

	t.Run("Get IOC History Unknown IOC", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/history/ioc/1.2.3.4", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusNotFound {
			t.Fatalf("Expected 404 for unknown IOC, got %d", resp.Code)
		}
	})

	t.Run("Get Replay Sequence Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/history/replay/INC-2026-8001", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Run Hunt Query Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(ThreatHuntQueryReq{Query: "dns tunneling"})
		req := httptest.NewRequest("POST", "/api/v2/hunting/query", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get Hunt Hypothesis Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/hunting/hypothesis?q=c2", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})
}
