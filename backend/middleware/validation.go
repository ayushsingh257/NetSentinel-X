package middleware

import (
	"bytes"
	"io"
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

var globalValidationService = services.NewInputValidationService()

// ValidateQueryParams inspects URL query parameters for malicious payloads.
func ValidateQueryParams() gin.HandlerFunc {
	return func(c *gin.Context) {
		for key, values := range c.Request.URL.Query() {
			for _, val := range values {
				res := globalValidationService.ValidateInput(val)
				if !res.IsValid {
					c.JSON(http.StatusBadRequest, gin.H{
						"error":       "Malicious query parameter payload detected",
						"code":        "MALICIOUS_INPUT_BLOCKED",
						"attack_type": res.AttackType,
						"parameter":   key,
						"reason":      res.Reason,
					})
					c.Abort()
					return
				}
			}
		}
		c.Next()
	}
}

// ValidateHeaders inspects custom headers for injection attempts.
func ValidateHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		headersToCheck := []string{"User-Agent", "X-Forwarded-For", "Referer", "X-Custom-Header"}
		for _, h := range headersToCheck {
			val := c.GetHeader(h)
			if val != "" {
				res := globalValidationService.ValidateInput(val)
				if !res.IsValid {
					c.JSON(http.StatusBadRequest, gin.H{
						"error":       "Malicious HTTP header payload detected",
						"code":        "MALICIOUS_HEADER_BLOCKED",
						"attack_type": res.AttackType,
						"header":      h,
						"reason":      res.Reason,
					})
					c.Abort()
					return
				}
			}
		}
		c.Next()
	}
}

// ValidateRequestBody inspects string body content for XSS/SQLi injection.
func ValidateRequestBody() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Body == nil || c.Request.ContentLength == 0 {
			c.Next()
			return
		}

		// Limit body inspection size to 1MB
		buf, err := io.ReadAll(io.LimitReader(c.Request.Body, 1024*1024))
		if err != nil {
			c.Next()
			return
		}

		// Restore body for downstream handlers
		c.Request.Body = io.NopCloser(bytes.NewBuffer(buf))

		bodyStr := string(buf)
		res := globalValidationService.ValidateInput(bodyStr)
		if !res.IsValid {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":       "Malicious request body payload detected",
				"code":        "MALICIOUS_BODY_BLOCKED",
				"attack_type": res.AttackType,
				"reason":      res.Reason,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
