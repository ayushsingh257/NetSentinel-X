package middleware

import (
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

var globalAPIKeyService *services.APIKeyService

func SetGlobalAPIKeyService(service *services.APIKeyService) {
	globalAPIKeyService = service
}

// APIKeyMiddleware checks X-API-Key header and validates against APIKeyService.
func APIKeyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "API_KEY_REQUIRED",
				"code":  "UNAUTHENTICATED",
			})
			c.Abort()
			return
		}

		service := globalAPIKeyService
		if service == nil {
			service = services.NewAPIKeyService()
		}

		valid, errCode, keyObj := service.ValidateAPIKey(apiKey)
		if !valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": errCode,
				"code":  "INVALID_API_KEY",
			})
			c.Abort()
			return
		}

		// Inject API Key identity into gin.Context
		c.Set("user_id", keyObj.OwnerID)
		c.Set("username", keyObj.Name)
		c.Set("role", "API_SERVICE_ACCOUNT")
		c.Set("api_key_id", keyObj.ID)

		c.Next()
	}
}
