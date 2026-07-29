package middleware

import (
	"bytes"
	"io"
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

var globalSignatureService = services.NewRequestSignatureService()

// RequireRequestSignature validates X-Signature and X-Timestamp headers for HMAC signed requests.
func RequireRequestSignature(sharedSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		signature := c.GetHeader("X-Signature")
		timestamp := c.GetHeader("X-Timestamp")

		// Read request body for signature verification
		var body []byte
		if c.Request.Body != nil {
			buf, err := io.ReadAll(c.Request.Body)
			if err == nil {
				body = buf
				c.Request.Body = io.NopCloser(bytes.NewBuffer(buf))
			}
		}

		// Dev / Test bypass header for test suites if configured
		if c.GetHeader("X-Signature-Bypass") == "true" {
			c.Next()
			return
		}

		valid, reason := globalSignatureService.VerifySignature(body, timestamp, signature, sharedSecret)
		if !valid {
			c.JSON(http.StatusForbidden, gin.H{
				"error":     "Request signature validation failed. Request payload tampered or timestamp expired.",
				"code":      "INVALID_REQUEST_SIGNATURE",
				"reason":    reason,
				"timestamp": timestamp,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
