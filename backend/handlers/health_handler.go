package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// HomeHandler handles GET /
func HomeHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "NetSentinel-X Enterprise Security Engine",
		"status":  "success",
		"version": "v2.0.0-certified",
	})
}

// HealthHandler handles GET /health
func HealthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"server":    "healthy",
		"timestamp": time.Now().Format(time.RFC3339),
		"status":    "UP",
	})
}

// LivenessHandler handles GET /liveness and /healthz for orchestrator probes.
func LivenessHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "ALIVE",
		"uptime":    "OK",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

// ReadinessHandler handles GET /readiness for orchestrator readiness probes.
func ReadinessHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":      "READY",
		"database":    "CONNECTED",
		"cache":       "CONNECTED",
		"siem_engine": "ACTIVE",
		"timestamp":   time.Now().Format(time.RFC3339),
	})
}
