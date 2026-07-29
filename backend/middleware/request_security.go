package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// RequestSecurityMiddleware inspects incoming requests for oversized payloads, suspicious User-Agents, and malformed headers.
func RequestSecurityMiddleware() gin.HandlerFunc {
	suspiciousUserAgents := []string{
		"sqlmap", "nikto", "nmap", "masscan", "zgrab", "gobuster", "dirbuster", "w3af", "havij",
	}

	return func(c *gin.Context) {
		// 1. Max Body Size limit (5MB)
		if c.Request.ContentLength > 5*1024*1024 {
			c.JSON(http.StatusRequestEntityTooLarge, gin.H{
				"error": "Request payload exceeds 5MB limit",
				"code":  "PAYLOAD_TOO_LARGE",
			})
			c.Abort()
			return
		}

		// 2. Suspicious User-Agent Scanner
		ua := strings.ToLower(c.GetHeader("User-Agent"))
		for _, tool := range suspiciousUserAgents {
			if strings.Contains(ua, tool) {
				c.JSON(http.StatusForbidden, gin.H{
					"error": "Automated attack scanner or reconnaissance tool blocked",
					"code":  "RECON_TOOL_BLOCKED",
					"tool":  tool,
				})
				c.Abort()
				return
			}
		}

		// 3. Content-Type check for state-mutating requests
		method := c.Request.Method
		if (method == "POST" || method == "PUT" || method == "PATCH") && c.Request.ContentLength > 0 {
			contentType := c.GetHeader("Content-Type")
			if !strings.Contains(contentType, "application/json") &&
				!strings.Contains(contentType, "multipart/form-data") &&
				!strings.Contains(contentType, "application/x-www-form-urlencoded") {
				c.JSON(http.StatusUnsupportedMediaType, gin.H{
					"error": "Unsupported Content-Type header. Expected application/json",
					"code":  "UNSUPPORTED_MEDIA_TYPE",
				})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}
