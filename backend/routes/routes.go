package routes

import (
	"netsentinel-x-backend/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.GET("/", handlers.HomeHandler)
	router.GET("/health", handlers.HealthHandler)
}