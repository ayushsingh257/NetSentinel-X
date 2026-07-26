package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestV2WorkflowHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewV2WorkflowHandler()
	router := gin.New()

	v2 := router.Group("/api/v2")
	{
		v2.GET("/workflows", handler.GetWorkflows)
		v2.POST("/workflows", handler.CreateWorkflow)
		v2.GET("/workflows/templates", handler.GetTemplates)
		v2.POST("/workflows/execute", handler.ExecuteWorkflow)
		v2.GET("/workflows/history", handler.GetHistory)
		v2.GET("/workflows/status/:id", handler.GetExecutionStatus)
		v2.GET("/workflows/approvals", handler.GetApprovals)
		v2.POST("/workflows/approvals/decide", handler.DecideApproval)
		v2.POST("/workflows/playbooks", handler.GeneratePlaybook)
	}

	t.Run("Get Workflows Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/workflows", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get Templates Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/workflows/templates", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Execute Workflow Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(ExecuteWorkflowReq{WorkflowID: "WF-001"})
		req := httptest.NewRequest("POST", "/api/v2/workflows/execute", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get History Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/workflows/history", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get Approvals Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/workflows/approvals", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Generate Playbook Endpoint", func(t *testing.T) {
		body, _ := json.Marshal(GeneratePlaybookReq{Category: "RANSOMWARE"})
		req := httptest.NewRequest("POST", "/api/v2/workflows/playbooks", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})
}
