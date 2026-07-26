package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

func TestV2CopilotHandler_QueryCopilot(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewV2CopilotHandler()

	router := gin.New()
	router.POST("/api/v2/copilot/query", handler.QueryCopilot)
	router.GET("/api/v2/copilot/prompts", handler.GetCopilotPrompts)

	t.Run("Valid Copilot Query", func(t *testing.T) {
		reqPayload := services.CopilotQueryRequest{
			Query: "Explain this packet",
		}
		body, _ := json.Marshal(reqPayload)

		req := httptest.NewRequest("POST", "/api/v2/copilot/query", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status code 200, got %d", resp.Code)
		}

		var copilotResp services.CopilotQueryResponse
		if err := json.Unmarshal(resp.Body.Bytes(), &copilotResp); err != nil {
			t.Fatalf("Failed to parse response body: %v", err)
		}

		if copilotResp.Query != "Explain this packet" {
			t.Errorf("Expected query 'Explain this packet', got %q", copilotResp.Query)
		}

		if len(copilotResp.Reasoning) == 0 {
			t.Error("Expected reasoning steps in response")
		}
	})

	t.Run("Empty Copilot Query Returns 400 Bad Request", func(t *testing.T) {
		reqPayload := services.CopilotQueryRequest{
			Query: "",
		}
		body, _ := json.Marshal(reqPayload)

		req := httptest.NewRequest("POST", "/api/v2/copilot/query", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusBadRequest {
			t.Errorf("Expected status code 400 for empty query, got %d", resp.Code)
		}
	})

	t.Run("Get Copilot Prompts Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v2/copilot/prompts", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Fatalf("Expected status code 200, got %d", resp.Code)
		}

		var result map[string][]map[string]string
		if err := json.Unmarshal(resp.Body.Bytes(), &result); err != nil {
			t.Fatalf("Failed to parse prompts response: %v", err)
		}

		prompts, exists := result["prompts"]
		if !exists || len(prompts) == 0 {
			t.Error("Expected prompts list in response")
		}
	})
}
