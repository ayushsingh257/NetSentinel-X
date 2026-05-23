package routes

import (
	"netsentinel-x-backend/handlers"
	"netsentinel-x-backend/websocket"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.GET("/", handlers.HomeHandler)
	router.GET("/health", handlers.HealthHandler)

	router.POST("/traffic", handlers.CreateTrafficLog)
	router.GET("/traffic", handlers.GetTrafficLogs)

	router.GET("/ws", websocket.HandleWebSocket)
}