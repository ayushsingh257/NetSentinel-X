package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func TestSecurityMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Security Headers Set Correctly", func(t *testing.T) {
		router := gin.New()
		router.Use(SecurityHeadersMiddleware())
		router.GET("/test", func(c *gin.Context) {
			c.String(http.StatusOK, "OK")
		})

		req := httptest.NewRequest("GET", "/test", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		if resp.Header().Get("X-Frame-Options") != "DENY" {
			t.Errorf("Expected X-Frame-Options DENY, got %s", resp.Header().Get("X-Frame-Options"))
		}
		if resp.Header().Get("X-Content-Type-Options") != "nosniff" {
			t.Errorf("Expected X-Content-Type-Options nosniff, got %s", resp.Header().Get("X-Content-Type-Options"))
		}
	})

	t.Run("Rate Limiter Allows Under Limit", func(t *testing.T) {
		limiter := NewRateLimiter(5, time.Minute)
		ip := "192.168.1.100"
		for i := 0; i < 5; i++ {
			if !limiter.Allow(ip) {
				t.Fatalf("Expected request %d to be allowed", i+1)
			}
		}
		if limiter.Allow(ip) {
			t.Error("Expected 6th request to be blocked")
		}
	})

	t.Run("Sanitize Input Removes Script Tags", func(t *testing.T) {
		dirty := "<script>alert('xss')</script>Hello"
		clean := SanitizeInput(dirty)
		if clean != "alert('xss')Hello" {
			t.Errorf("Expected sanitized string 'alert('xss')Hello', got '%s'", clean)
		}
	})
}
