package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestV2SOARHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	h := NewV2SOARHandler()
	router := gin.New()

	v2 := router.Group("/api/v2/soar")
	{
		v2.GET("/playbooks", h.GetPlaybooks)
		v2.POST("/playbooks/:id/execute", h.ExecutePlaybook)
		v2.GET("/executions", h.GetExecutions)
		v2.GET("/approvals", h.GetApprovals)
		v2.POST("/actions/:id/approve", h.ApproveAction)
		v2.POST("/actions/:id/reject", h.RejectAction)
		v2.GET("/audit", h.GetAuditLogs)
	}

	t.Run("Get Playbooks", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/soar/playbooks", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get Executions", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/soar/executions", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Get Approvals", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/soar/approvals", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Execute Playbook", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/v2/soar/playbooks/PB-BRUTE-FORCE-01/execute", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})

	t.Run("Approve Action", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/v2/soar/actions/APR-9901/approve", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		if resp.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", resp.Code)
		}
	})
}
