package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {

	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {

			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header missing",
			})

			c.Abort()
			return
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

		if tokenString == "admin-token" {

			c.Set("role", "admin")

			c.Next()
			return
		}

		if tokenString == "analyst-token" {

			c.Set("role", "analyst")

			c.Next()
			return
		}

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid token",
		})

		c.Abort()
	}
}