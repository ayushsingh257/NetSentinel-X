package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestV2AttackGraphHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewV2AttackGraphHandler()
	router := gin.New()

	v2 := router.Group("/api/v2/attack-graph")
	{
		v2.GET("", handler.GetGraph)
		v2.GET("/nodes", handler.GetNodes)
		v2.GET("/edges", handler.GetEdges)
		v2.GET("/path/:id", handler.GetPathByID)
		v2.POST("/explain", handler.ExplainPath)
	}

	t.Run("Get Graph Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/attack-graph", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Get Nodes Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/attack-graph/nodes", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Get Edges Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/attack-graph/edges", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Get Path By ID Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/attack-graph/path/PATH-2026-001", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})

	t.Run("Explain Path Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(ExplainPathReq{
			PathID: "PATH-2026-001",
		})

		req := httptest.NewRequest("POST", "/api/v2/attack-graph/explain", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.Code)
		}
	})
}
