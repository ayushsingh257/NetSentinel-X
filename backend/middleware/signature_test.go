package middleware

import (
	"bytes"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupSignatureRouter(secret string) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	protected := r.Group("/api/v2/signed")
	protected.Use(RequireRequestSignature(secret))
	{
		protected.POST("/action", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "signature_valid"})
		})
	}

	return r
}

func TestSignatureMiddleware(t *testing.T) {
	secret := "test_secret_key_123"
	r := setupSignatureRouter(secret)
	sigService := services.NewRequestSignatureService()

	t.Run("Valid Signature & Timestamp -> 200 OK", func(t *testing.T) {
		body := []byte(`{"action":"TEST"}`)
		timestamp := fmt.Sprintf("%d", time.Now().Unix())
		sig := sigService.ComputeSignature(body, timestamp, secret)

		req, _ := http.NewRequest("POST", "/api/v2/signed/action", bytes.NewBuffer(body))
		req.Header.Set("X-Signature", sig)
		req.Header.Set("X-Timestamp", timestamp)

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("Test 3: Tampered Body -> 403 Forbidden", func(t *testing.T) {
		body := []byte(`{"action":"ORIGINAL"}`)
		tamperedBody := []byte(`{"action":"TAMPERED"}`)
		timestamp := fmt.Sprintf("%d", time.Now().Unix())
		sig := sigService.ComputeSignature(body, timestamp, secret)

		req, _ := http.NewRequest("POST", "/api/v2/signed/action", bytes.NewBuffer(tamperedBody))
		req.Header.Set("X-Signature", sig)
		req.Header.Set("X-Timestamp", timestamp)

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusForbidden, w.Code)
		assert.Contains(t, w.Body.String(), "INVALID_REQUEST_SIGNATURE")
	})

	t.Run("Test 4: Replay Attack Old Timestamp -> 403 Forbidden", func(t *testing.T) {
		body := []byte(`{"action":"TEST"}`)
		oldTimestamp := fmt.Sprintf("%d", time.Now().Add(-10*time.Minute).Unix())
		sig := sigService.ComputeSignature(body, oldTimestamp, secret)

		req, _ := http.NewRequest("POST", "/api/v2/signed/action", bytes.NewBuffer(body))
		req.Header.Set("X-Signature", sig)
		req.Header.Set("X-Timestamp", oldTimestamp)

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusForbidden, w.Code)
		assert.Contains(t, w.Body.String(), "INVALID_REQUEST_SIGNATURE")
	})
}
