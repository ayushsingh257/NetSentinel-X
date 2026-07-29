package middleware

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupValidationRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	r.Use(ValidateQueryParams())
	r.Use(ValidateHeaders())
	r.Use(ValidateRequestBody())

	r.POST("/api/v2/test-endpoint", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	return r
}

func TestValidationMiddleware(t *testing.T) {
	r := setupValidationRouter()

	t.Run("Malicious Query Parameter -> 400 Bad Request", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/api/v2/test-endpoint?q=%3Cscript%3Ealert(1)%3C/script%3E", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
		assert.Contains(t, w.Body.String(), "MALICIOUS_INPUT_BLOCKED")
	})

	t.Run("Malicious Request Body -> 400 Bad Request", func(t *testing.T) {
		body := []byte(`{"title":"<script>alert('XSS')</script>"}`)
		req, _ := http.NewRequest("POST", "/api/v2/test-endpoint", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
		assert.Contains(t, w.Body.String(), "MALICIOUS_BODY_BLOCKED")
	})

	t.Run("Clean Request -> 200 OK", func(t *testing.T) {
		body := []byte(`{"title":"Clean Incident Title"}`)
		req, _ := http.NewRequest("POST", "/api/v2/test-endpoint", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})
}
