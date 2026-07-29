package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupCSRFRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	r.GET("/api/v2/security/csrf-token", CSRFTokenHandler)

	protected := r.Group("/api/v2/mutating")
	protected.Use(CSRFProtectionMiddleware())
	{
		protected.POST("/action", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "success"})
		})
	}

	return r
}

func TestCSRFProtectionMiddleware(t *testing.T) {
	r := setupCSRFRouter()

	t.Run("Test 3: Missing Token -> 403 Forbidden", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/api/v2/mutating/action", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusForbidden, w.Code)
	})

	t.Run("Valid Token -> Allowed", func(t *testing.T) {
		token := GenerateCSRFToken()
		req, _ := http.NewRequest("POST", "/api/v2/mutating/action", nil)
		req.Header.Set("X-CSRF-Token", token)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("GET CSRF Token Endpoint -> 200 with Token", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v2/security/csrf-token", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), "csrf_token")
	})
}
