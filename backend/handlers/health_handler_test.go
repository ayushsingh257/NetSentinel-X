package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestHealthHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.Default()

	router.GET("/health", HealthHandler)
	router.GET("/liveness", LivenessHandler)
	router.GET("/healthz", LivenessHandler)
	router.GET("/readiness", ReadinessHandler)

	endpoints := []string{"/health", "/liveness", "/healthz", "/readiness"}

	for _, ep := range endpoints {
		req, _ := http.NewRequest("GET", ep, nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected status 200 for %s but got %d", ep, resp.Code)
		}
	}
}
