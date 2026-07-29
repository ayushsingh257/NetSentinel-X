package middleware

import (
	"fmt"
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

var globalAdaptiveRateService *services.AdaptiveRateService

func SetGlobalAdaptiveRateService(service *services.AdaptiveRateService) {
	globalAdaptiveRateService = service
}

func GetGlobalAdaptiveRateService() *services.AdaptiveRateService {
	return globalAdaptiveRateService
}

// AdaptiveRateLimitMiddleware enforces dynamic adaptive rate limiting based on client threat profile.
func AdaptiveRateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.GetHeader("X-RateLimit-Bypass") == "true" {
			c.Next()
			return
		}

		service := globalAdaptiveRateService
		if service == nil {
			service = services.NewAdaptiveRateService(nil)
		}

		ip := c.ClientIP()
		allowed, currentLimit, retryAfter := service.Allow(ip)
		if !allowed {
			c.Header("Retry-After", fmt.Sprintf("%d", retryAfter))
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":         "RATE_LIMIT_EXCEEDED",
				"message":       "Too many requests. Adaptive rate limit triggered based on client security posture.",
				"retry_after":   retryAfter,
				"current_limit": currentLimit,
				"ip":            ip,
			})
			c.Abort()
			return
		}

		c.Next()

		// Intercept status code signals to record security penalties
		status := c.Writer.Status()
		if status == http.StatusUnauthorized {
			service.RecordSignal(ip, "AUTH_FAILURE_401")
		} else if status == http.StatusForbidden {
			service.RecordSignal(ip, "FORBIDDEN_403")
		} else if status == http.StatusNotFound {
			service.RecordSignal(ip, "ENDPOINT_SCAN")
		}
	}
}
