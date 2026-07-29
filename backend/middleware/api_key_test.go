package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupAPIKeyRouter() (*gin.Engine, *services.APIKeyService, string) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	service := services.NewAPIKeyService()
	SetGlobalAPIKeyService(service)

	plaintext, _ := service.GenerateAPIKey("Test Middleware Key", "USR-200", []string{"VIEW_INCIDENTS"}, 30)

	protected := r.Group("/api/v2/protected")
	protected.Use(APIKeyMiddleware())
	{
		protected.GET("/resource", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "authenticated_via_key"})
		})
	}

	return r, service, plaintext
}

func TestAPIKeyMiddleware(t *testing.T) {
	r, _, validKey := setupAPIKeyRouter()

	t.Run("Test 1: Missing API Key -> 401 Unauthorized", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v2/protected/resource", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		assert.Contains(t, w.Body.String(), "API_KEY_REQUIRED")
	})

	t.Run("Test 1: Invalid API Key wrong_key -> 401 Unauthorized", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v2/protected/resource", nil)
		req.Header.Set("X-API-Key", "wrong_key")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		assert.Contains(t, w.Body.String(), "INVALID_API_KEY")
	})

	t.Run("Valid API Key nsx_live_valid_key -> 200 OK", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v2/protected/resource", nil)
		req.Header.Set("X-API-Key", validKey)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), "authenticated_via_key")
	})
}
